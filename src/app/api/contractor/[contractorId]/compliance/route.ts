import { NextResponse } from "next/server";
import cloudinary from "@/utils/cloudinary";
import ContractorModel, { ContractorDocument } from "@/models/contractor";
import dbConnect from "@/lib/mongodb";

export async function POST(req: Request, { params }: { params: { contractorId: string } }) {
  await dbConnect();

  const { contractorId } = params;
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const uploadedBy = formData.get("uploadedBy") as string;

  if (!file || !uploadedBy) {
    return NextResponse.json({ message: "File and uploadedBy are required." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64File = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString("base64")}`;

  try {
    const uploadResult = await cloudinary.uploader.upload(base64File, {
      folder: `contractors/${contractorId}/compliance-docs`,
      resource_type: "auto",
    });

    const { secure_url: fileUrl } = uploadResult;

    const updatedContractor = await ContractorModel.findByIdAndUpdate(
      contractorId,
      {
        $push: {
          complianceDocs: {
            fileName: file.name,
            fileUrl,
            uploadedBy,
          },
        },
      },
      { new: true }
    );

    return NextResponse.json(updatedContractor, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ message: "Failed to upload file." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { contractorId: string } }) {
  await dbConnect();

  const { contractorId } = params;
  const { docId } = await req.json();

  if (!contractorId || !docId) {
    return NextResponse.json(
      { message: "Contractor ID and Document ID are required." },
      { status: 400 }
    );
  }

  try {
    const contractor = await ContractorModel.findById(contractorId) as ContractorDocument;

    if (!contractor || !contractor.complianceDocs) {
      return NextResponse.json({ message: "Contractor not found." }, { status: 404 });
    }

    // TypeScript will now infer the correct type for `d`
    const doc = contractor.complianceDocs.find((d) => d._id.toString() === docId);

    if (!doc) {
      return NextResponse.json(
        { message: "Document not found in the contractor's compliance documents." },
        { status: 404 }
      );
    }

    // Cloudinary deletion and MongoDB `$pull` logic remains the same
    if (doc.fileUrl) {
      const urlParts = doc.fileUrl.split("/");
      const fileNameWithExtension = urlParts[urlParts.length - 1].split("?")[0];
      const publicId = fileNameWithExtension.split(".")[0];

      try {
        await cloudinary.uploader.destroy(`contractors/${contractorId}/compliance-docs/${publicId}`);
      } catch (cloudinaryError) {
        console.error("Error removing compliance document from Cloudinary:", cloudinaryError);
      }
    }

    const updatedContractor = await ContractorModel.findByIdAndUpdate(
      contractorId,
      { $pull: { complianceDocs: { _id: docId } } },
      { new: true }
    );

    if (!updatedContractor) {
      return NextResponse.json(
        { message: "Failed to update contractor after deleting the document." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Document deleted successfully.", contractor: updatedContractor }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting compliance document:", error);
    return NextResponse.json(
      { message: `Error deleting document: ${error.message}` },
      { status: 500 }
    );
  }
}
