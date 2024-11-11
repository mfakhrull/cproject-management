// src/models/Team.ts
import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: [true, 'Team name is required']
  },
  productOwnerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  projectManagerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  projectTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectTeam'
  }]
});

const Team = mongoose.model('Team', teamSchema);

export default Team;
