import { NextResponse } from "next/server";
import { MaterialRequest } from "@/models";
import dbConnect from "@/lib/mongodb";

export async function PUT(req: Request, context: { params: { id: string } }) {
  await dbConnect();

  const { params } = context; // Await params destructuring

  try {
    const { items, status, notes } = await req.json();

    const updatedRequest = await MaterialRequest.findByIdAndUpdate(
      params.id,
      { items, status, notes },
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { message: "Material request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedRequest);
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error updating material request: ${error.message}` },
      { status: 500 }
    );
  }
}
