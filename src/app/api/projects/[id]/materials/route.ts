import { NextResponse } from "next/server";
import { MaterialRequest } from "@/models"; // Adjust path as needed
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request, context: { params: { id: string } }) {
  await dbConnect();

  const { params } = context; // Properly await context to access params safely

  try {
    const materialRequests = await MaterialRequest.find({ projectId: params.id })
      // Uncomment if requestedBy population is needed
      // .populate("requestedBy", "username profilePictureUrl") 
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

export const revalidate = 0;
