// src/lib/seed.ts
import {
  User,
  Team,
  Project,
  ProjectTeam,
  Task,
  Comment,
  Attachment,
} from "../models";
import dbConnect from "./mongodb";

async function seed() {
  try {
    await dbConnect();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Project.deleteMany({}),
      ProjectTeam.deleteMany({}),
      Task.deleteMany({}),
      Comment.deleteMany({}),
      Attachment.deleteMany({}),
    ]);

    console.log("Cleared existing data.");

    // Create users
    const users = await User.create([
      {
        username: "John Doe",
        clerk_id: "user_2NNEqL3CZKVt1FJ2KVrDgWiH5ry",
        profilePictureUrl: "https://example.com/john.jpg",
      },
      {
        username: "Jane Smith",
        clerk_id: "user_2NNEqL3CZKVt1FJ2KVrDgWiH5sz",
        profilePictureUrl: "https://example.com/jane.jpg",
      },
      {
        username: "Test User",
        clerk_id: "user_2oq8S5WL0yHscznIVivdImxwUNX",
        profilePictureUrl: "https://example.com/test.jpg",
      },
    ]);

    console.log("Users created:", users);

    // Create teams
    const teams = await Team.create([
      {
        teamName: "Development Team",
        productOwnerId: users[0]._id,
        projectManagerId: users[1]._id,
      },
      {
        teamName: "QA Team",
        productOwnerId: users[1]._id,
        projectManagerId: users[2]._id,
      },
    ]);

    console.log("Teams created:", teams);

    // Assign teams to users
    await Promise.all([
      User.findByIdAndUpdate(users[0]._id, { teamId: teams[0]._id }),
      User.findByIdAndUpdate(users[1]._id, { teamId: teams[1]._id }),
    ]);

    console.log("Assigned teams to users.");

    // Create a project
    const project = await Project.create({
      name: "Task Management System",
      description: "Next.js 15 application with MongoDB",
      startDate: new Date("2024-11-10T00:00:00.000Z"),
      endDate: new Date("2024-12-10T00:00:00.000Z"),
    });

    console.log("Project created:", project);

    // Link teams to the project
    const projectTeams = await ProjectTeam.create([
      { projectId: project._id, teamId: teams[0]._id },
      { projectId: project._id, teamId: teams[1]._id },
    ]);

    console.log("Project teams created:", projectTeams);

    // Create tasks
    const tasks = await Task.create([
      {
        title: "Setup MongoDB Integration",
        description: "Integrate MongoDB with the application and test the connection.",
        status: "TODO",
        priority: "HIGH",
        tags: ["backend", "database", "setup"],
        startDate: new Date("2024-11-13T00:00:00.000Z"),
        dueDate: new Date("2024-11-20T00:00:00.000Z"),
        points: 5,
        projectId: project._id,
        authorId: users[2]._id,
        assignedUserId: users[0]._id,
      },
      {
        title: "Create API Endpoints",
        description: "Develop CRUD operations for tasks and projects.",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        tags: ["backend", "api", "crud"],
        startDate: new Date("2024-11-14T00:00:00.000Z"),
        dueDate: new Date("2024-11-22T00:00:00.000Z"),
        points: 8,
        projectId: project._id,
        authorId: users[0]._id,
        assignedUserId: users[2]._id,
      },
      {
        title: "Frontend UI Design",
        description: "Design the dashboard and task management UI.",
        status: "COMPLETED",
        priority: "LOW",
        tags: ["frontend", "ui", "design"],
        startDate: new Date("2024-11-10T00:00:00.000Z"),
        dueDate: new Date("2024-11-15T00:00:00.000Z"),
        points: 10,
        projectId: project._id,
        authorId: users[0]._id,
        assignedUserId: users[2]._id,
      },
      {
        title: "Write Unit Tests",
        description: "Add unit tests for the backend services.",
        status: "TODO",
        priority: "HIGH",
        tags: ["testing", "backend", "unit-tests"],
        startDate: new Date("2024-11-16T00:00:00.000Z"),
        dueDate: new Date("2024-11-25T00:00:00.000Z"),
        points: 6,
        projectId: project._id,
        authorId: users[2]._id,
        assignedUserId: null,
      },
    ]);

    console.log("Tasks created:", tasks);

    // Add comments to tasks
    const comments = await Comment.create([
      {
        text: "Initial setup looks good. Proceeding with integration.",
        taskId: tasks[0]._id,
        userId: users[1]._id,
      },
      {
        text: "API endpoints for tasks are ready for testing.",
        taskId: tasks[1]._id,
        userId: users[0]._id,
      },
    ]);

    console.log("Comments created:", comments);

    // Add attachments to tasks
    const attachments = await Attachment.create([
      {
        fileUrl: "https://example.com/files/design.pdf",
        fileName: "UI_Design.pdf",
        taskId: tasks[2]._id,
        uploadedById: users[0]._id,
      },
      {
        fileUrl: "https://example.com/files/unit-tests.docx",
        fileName: "Unit_Tests.docx",
        taskId: tasks[3]._id,
        uploadedById: users[2]._id,
      },
    ]);

    console.log("Attachments created:", attachments);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

export default seed;
