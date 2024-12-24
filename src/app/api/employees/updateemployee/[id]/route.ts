import { NextResponse } from "next/server";
import Employee from "@/models/Employee";
import { User } from "@/models"; // Import the IUser interface
import { IUser } from "@/types"; // Import the IUser interface
import dbConnect from "@/lib/mongodb";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  await dbConnect();

  try {
    const employeeData = await req.json();

    // Find the existing employee
    const existingEmployee = await Employee.findById(params.id);
    if (!existingEmployee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }

    // Update the employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      params.id,
      employeeData,
      {
        new: true,
      },
    );

    if (!updatedEmployee) {
      return NextResponse.json(
        { error: "Failed to update employee" },
        { status: 500 },
      );
    }

    // Check if we need to update the User collection
    const { name, role, rolePermissions } = employeeData;

    if (name || role || rolePermissions) {
      // Find the user linked to this employee
      const linkedUser = await User.findOne({
        employeeId: existingEmployee.employeeId,
      });

      if (linkedUser) {
        // Prepare the updated fields for the user
        const userUpdate: Partial<IUser> = {}; // Explicitly use Partial<IUser>

        if (name) userUpdate.username = name; // Update the username
        if (role) userUpdate.role = role; // Update the role
        if (rolePermissions) userUpdate.rolePermissions = rolePermissions; // Update rolePermissions

        // Update the user record
        await User.findByIdAndUpdate(linkedUser._id, userUpdate, { new: true });
      }
    }

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 },
    );
  }
}
