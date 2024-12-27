// src\app\action\documentActions.ts
'use server';

import dbConnect from '@/lib/mongodb';
import EditorDocument from '@/models/EditorDocument';
import mongoose from 'mongoose';

export async function saveDocument(userId: string, formData: FormData) {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  try {
    const content = JSON.parse(formData.get('content') as string);
    const title = formData.get('title') as string;
    const projectId = formData.get('projectId') as string;
    const deadline = formData.get('deadline') as string;
    const status = formData.get('status') as string || 'OPEN'; // Dynamically set `status`

    const newDocument = new EditorDocument({
      content,
      userId,
      title: title || 'Untitled Document',
      projectId,
      deadline: deadline || null,
      status, // Save the status field
    });

    await newDocument.save();
    return { success: true, documentId: newDocument._id };
  } catch (error) {
    console.error('Document save error:', error);
    return { success: false, error: 'Failed to save document' };
  }
}

export async function getUserDocuments(userId: string) {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  try {
    return await EditorDocument.find({ userId }).sort({ createdAt: -1 }).lean();
  } catch (error) {
    console.error('Fetch documents error:', error);
    return [];
  }
}

export async function getDocumentById(documentId: string) {
 
  await dbConnect();

  try {
    const document = await EditorDocument.findOne({
      _id: new mongoose.Types.ObjectId(documentId),
    })
    .populate({ path: 'projectId', select: 'name _id' }) // Populate project name and ID
    .lean();

    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  } catch (error) {
    console.error('Fetch document error:', error);
    throw new Error('Failed to fetch document');
  }
}

export async function getOpenOpportunities() {
 

  await dbConnect();

  try {
    // Fetch only documents with `status: "OPEN"` and include project details
    return await EditorDocument.find({ 
      status: "OPEN" // Filter by status
    })
    .populate({
      path: 'projectId', // Populate project details
      select: 'name', // Only include the project name
    })
    .sort({ createdAt: -1 })
    .lean();
  } catch (error) {
    console.error("Fetch open opportunities error:", error);
    return [];
  }
}


export async function assignContractorToOpportunity(
  documentId: string,
  contractorId: string,
) {
  // Assign a contractor to a bid opportunity and mark it as closed
  await dbConnect();

  try {
    const document = await EditorDocument.findById(documentId);

    if (!document) {
      throw new Error('Document not found');
    }

    if (document.status !== 'OPEN') {
      throw new Error('Opportunity is no longer available');
    }

    document.status = 'CLOSED';
    document.assignedContractorId = contractorId;

    await document.save();

    return { success: true, message: 'Contractor assigned successfully' };
  } catch (error) {
    console.error('Assign contractor error:', error);
    return { success: false, error: 'Failed to assign contractor' };
  }
}
