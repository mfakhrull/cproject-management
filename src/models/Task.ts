// src/models/Task.ts
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required']
  },
  description: String,
  status: String,
  priority: String,
  tags: [String],
  startDate: Date,
  dueDate: Date,
  points: Number,
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Reflects that a task may not always have an assignee
  }
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
