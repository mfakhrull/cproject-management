// src/models/User.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: [true, 'Username is required'],
    trim: true,
    lowercase: true
  },
  profilePictureUrl: {
    type: String,
    trim: true
  },
  // Reference to Team model if teams are used similarly to the previous setup
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  // Arrays of ObjectIds referencing other collections
  authoredTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  assignedTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  taskAssignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskAssignment'
  }],
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, { timestamps: true }); // Mongoose automatically manages createdAt and updatedAt properties

const User = mongoose.model('User', userSchema);

export default User;
