import { NextResponse } from "next/server";
import { MaterialRequest } from "@/models"; // Adjust path as needed
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const materialRequests = await MaterialRequest.find({ projectId: params.id })
    //   .populate("requestedBy", "username profilePictureUrl") // Populate requestedBy field with user info
      .exec();

    if (!materialRequests.length) {
      return NextResponse.json(
        { message: "No material requests found for this project." },
        { status: 404 }
      );
    }

    return NextResponse.json(materialRequests);
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error fetching material requests: ${error.message}` },
      { status: 500 }
    );
  }
}
