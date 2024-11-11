// src/models/Project.ts
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required']
  },
  description: String,
  startDate: Date,
  endDate: Date,
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }]
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
