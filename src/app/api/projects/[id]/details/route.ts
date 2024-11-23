import { NextResponse } from "next/server";
import { Project } from "@/models"; // Adjust path as needed
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request, context: { params: { id: string } }) {
  await dbConnect();

  const { params } = context; // Await the params in an asynchronous block

  try {
    const project = await Project.findById(params.id)
  .populate("teamMembersInfo", "username profilePictureUrl")
  .populate("attachmentsInfo", "username profilePictureUrl")
  .populate("materialRequestsInfo", "username profilePictureUrl")
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
