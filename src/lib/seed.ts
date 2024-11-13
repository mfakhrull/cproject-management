// lib/seed.ts
import { 
    User, 
    Team, 
    Project, 
    ProjectTeam, 
    Task, 
    Comment, 
    Attachment 
  } from '../models';
  import dbConnect from './mongodb';
  
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
        Attachment.deleteMany({})
      ]);
  
      // Create users
      const users = await User.create([
        {
          username: 'John Doe',
          clerk_id: 'user_2NNEqL3CZKVt1FJ2KVrDgWiH5ry',
          profilePictureUrl: 'https://example.com/john.jpg'
        },
        {
          username: 'Jane Smith',
          clerk_id: 'user_2NNEqL3CZKVt1FJ2KVrDgWiH5sz',
          profilePictureUrl: 'https://example.com/jane.jpg'
        }
      ]);
  
      // Create teams
      const teams = await Team.create([
        {
          teamName: 'Core Development',
          productOwnerId: users[0]._id,
          projectManagerId: users[1]._id
        },
        {
          teamName: 'Design Team',
          productOwnerId: users[1]._id,
          projectManagerId: users[0]._id
        }
      ]);
  
      // Update users with team assignments
      await Promise.all([
        User.findByIdAndUpdate(users[0]._id, { teamId: teams[0]._id }),
        User.findByIdAndUpdate(users[1]._id, { teamId: teams[1]._id })
      ]);
  
      // Create projects
      const project = await Project.create({
        name: 'Task Management System',
        description: 'Next.js 15 application with MongoDB',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      });
  
      // Create project-team associations
      await ProjectTeam.create([
        {
          projectId: project._id,
          teamId: teams[0]._id
        },
        {
          projectId: project._id,
          teamId: teams[1]._id
        }
      ]);
  
      // Create tasks
      const task = await Task.create({
        title: 'Setup MongoDB Integration',
        description: 'Implement database models and connection',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        tags: ['backend', 'database', 'setup'],
        startDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        points: 5,
        projectId: project._id,
        authorId: users[0]._id,
        assignedUserId: users[1]._id
      });
  
      // Create comments
      await Comment.create({
        text: 'Models implementation completed. Ready for review.',
        taskId: task._id,
        userId: users[1]._id
      });
  
      // Create attachments
      await Attachment.create({
        fileUrl: 'https://example.com/files/schema.pdf',
        fileName: 'database_schema.pdf',
        taskId: task._id,
        uploadedById: users[0]._id
      });
  
      console.log('Database seeded successfully!');
      
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
  
  export default seed;