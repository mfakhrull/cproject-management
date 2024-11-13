import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ProjectTeam from '../../../models/ProjectTeam';
import dbConnect from '../../../lib/mongodb'; // Import dbConnect function

// Handle POST request to create a new ProjectTeam
export async function POST(request: Request) {
    try {
      // Ensure the database connection is established
      await dbConnect();

      const data = await request.json();
      const newProjectTeam = await ProjectTeam.create(data);
      return NextResponse.json(newProjectTeam, { status: 201 });
    } catch (error: any) { // Cast 'error' to 'any' type to access 'message' property
      console.error('Error during ProjectTeam creation:', error); // Log error details
      return NextResponse.json({ error: `Failed to create ProjectTeam: ${error.message}` }, { status: 500 });
    }
  }
  

// Handle GET request to retrieve all ProjectTeams
export async function GET() {
  try {
    // Ensure the database connection is established
    await dbConnect();

    const projectTeams = await ProjectTeam.find({});
    return NextResponse.json(projectTeams, { status: 200 });
  } catch (error: any) { // Cast 'error' to 'any' type to access 'message' property
    console.error('Error during fetching ProjectTeams:', error); // Log error details
    return NextResponse.json({ error: `Failed to fetch ProjectTeams: ${error.message}` }, { status: 500 });
  }
}


export async function PATCH(request: Request) {
    try {
      await dbConnect();
      const data = await request.json();
      const { id, ...updateFields } = data; // Extract id and fields to be updated
  
      const updatedProjectTeam = await ProjectTeam.findByIdAndUpdate(id, updateFields, { new: true });
      if (!updatedProjectTeam) {
        return NextResponse.json({ error: 'ProjectTeam not found' }, { status: 404 });
      }
      return NextResponse.json(updatedProjectTeam, { status: 200 });
    } catch (error: any) {
      console.error('Error during ProjectTeam update:', error);
      return NextResponse.json({ error: `Failed to update ProjectTeam: ${error.message}` }, { status: 500 });
    }
  }

  
  export async function DELETE(request: Request) {
    try {
      await dbConnect();
      const { id } = await request.json(); // Expect the ID in the request body
  
      const deletedProjectTeam = await ProjectTeam.findByIdAndDelete(id);
      if (!deletedProjectTeam) {
        return NextResponse.json({ error: 'ProjectTeam not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'ProjectTeam deleted successfully' }, { status: 200 });
    } catch (error: any) {
      console.error('Error during ProjectTeam deletion:', error);
      return NextResponse.json({ error: `Failed to delete ProjectTeam: ${error.message}` }, { status: 500 });
    }
  }
  