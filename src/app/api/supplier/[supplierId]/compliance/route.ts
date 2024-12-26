import { NextResponse } from "next/server";
import cloudinary from "@/utils/cloudinary";
import SupplierModel, { SupplierDocument } from "@/models/supplier";
import dbConnect from "@/lib/mongodb";

export async function POST(req: Request, { params }: { params: { supplierId: string } }) {
  await dbConnect();

  const { supplierId } = params;
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
      folder: `suppliers/${supplierId}/compliance-docs`,
      resource_type: "auto",
    });

    const { secure_url: fileUrl } = uploadResult;

    const updatedSupplier = await SupplierModel.findByIdAndUpdate(
      supplierId,
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

    return NextResponse.json(updatedSupplier, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ message: "Failed to upload file." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { supplierId: string } }) {
    await dbConnect();
  
    const { supplierId } = params;
    const { docId } = await req.json();
  
    if (!supplierId || !docId) {
      return NextResponse.json(
        { message: "Supplier ID and Document ID are required." },
        { status: 400 }
      );
    }
  
    try {
      const supplier = await SupplierModel.findById(supplierId) as SupplierDocument;
  
      if (!supplier || !supplier.complianceDocs) {
        return NextResponse.json({ message: "Supplier not found." }, { status: 404 });
      }
  
      // TypeScript will now infer the correct type for `d`
      const doc = supplier.complianceDocs.find((d) => d._id.toString() === docId);
  
      if (!doc) {
        return NextResponse.json(
          { message: "Document not found in the supplier's compliance documents." },
          { status: 404 }
        );
      }
  
      // Cloudinary deletion and MongoDB `$pull` logic remains the same
      if (doc.fileUrl) {
        const urlParts = doc.fileUrl.split("/");
        const fileNameWithExtension = urlParts[urlParts.length - 1].split("?")[0];
        const publicId = fileNameWithExtension.split(".")[0];
  
        try {
          await cloudinary.uploader.destroy(`suppliers/${supplierId}/compliance-docs/${publicId}`);
        } catch (cloudinaryError) {
          console.error("Error removing compliance document from Cloudinary:", cloudinaryError);
        }
      }
  
      const updatedSupplier = await SupplierModel.findByIdAndUpdate(
        supplierId,
        { $pull: { complianceDocs: { _id: docId } } },
        { new: true }
      );
  
      if (!updatedSupplier) {
        return NextResponse.json(
          { message: "Failed to update supplier after deleting the document." },
          { status: 500 }
        );
      }
  
      return NextResponse.json({ message: "Document deleted successfully.", supplier: updatedSupplier }, { status: 200 });
    } catch (error: any) {
      console.error("Error deleting compliance document:", error);
      return NextResponse.json(
        { message: `Error deleting document: ${error.message}` },
        { status: 500 }
      );
    }
  }
  