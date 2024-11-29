import { NextResponse } from "next/server";
import { BidSubmission } from "@/models/BidSubmission";
import dbConnect from "@/lib/mongodb";
export async function DELETE(req: Request) {
    await dbConnect();
  
    try {
      const { id } = await req.json();
  
      const deletedSubmission = await BidSubmission.findByIdAndDelete(id);
  
      if (!deletedSubmission) {
        return NextResponse.json(
          { message: "Bid submission not found." },
          { status: 404 }
        );
      }
  
      return NextResponse.json({ message: "Bid submission deleted successfully." }, { status: 200 });
    } catch (error: any) {
      console.error("Error deleting bid submission:", error);
      return NextResponse.json(
        { message: `Error deleting bid submission: ${error.message}` },
        { status: 500 }
      );
    }
  }