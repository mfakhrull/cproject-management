import { NextResponse } from "next/server";
import { Project } from "@/models"; // Adjust path as needed
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const project = await Project.findById(params.id)
      .populate("teamMembers", "username profilePictureUrl") // Populate team member usernames and profile pictures
      .populate("attachments.uploadedBy", "username profilePictureUrl") // Populate uploadedBy in attachments
      .populate({
        path: "materialRequests.requestedBy",
        select: "username profilePictureUrl", // Populate `requestedBy` in material requests
      })
      .exec();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error fetching project: ${error.message}` },
      { status: 500 }
    );
  }
}
