import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bid from '@/models/Bid';
import cloudinary from '@/utils/cloudinary';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse form data
    const formData = await request.formData();
    const projectId = formData.get('projectId')?.toString().trim();
    const contractorId = formData.get('contractorId')?.toString().trim(); // From the form data
    const price = parseFloat(formData.get('price')?.toString() ?? '');
    const timeline = formData.get('timeline')?.toString().trim();
    const files = formData.getAll('file') as File[];

    // Validate input
    if (!projectId || !contractorId || isNaN(price) || !timeline) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    // Validate project ID
    const isValidObjectId = mongoose.Types.ObjectId.isValid(projectId);
    if (!isValidObjectId) {
      return NextResponse.json(
        { success: false, message: `Invalid projectId: ${projectId}` },
        { status: 400 }
      );
    }
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    // Upload files to Cloudinary
    const uploadedAttachments = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const base64File = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString('base64')}`;

      const uploadResult = await cloudinary.uploader.upload(base64File, {
        folder: `bid_attachments/projects/${projectId}/bids`,
        resource_type: 'auto',
      });

      uploadedAttachments.push({
        fileName: uploadResult.original_filename || file.name,
        fileUrl: uploadResult.secure_url,
        uploadedBy: contractorId, // Traceability
      });
    }

    // Prepare bid data
    const bidData = {
      projectId: projectObjectId,
      contractorId,
      price,
      timeline,
      attachments: uploadedAttachments,
      status: 'PENDING',
    };

    // Save bid
    const newBid = new Bid(bidData);
    const savedBid = await newBid.save();

    return NextResponse.json({ success: true, bidId: savedBid._id }, { status: 201 });
  } catch (error) {
    console.error('Bid Submission Error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to submit bid' },
      { status: 500 }
    );
  }
}
