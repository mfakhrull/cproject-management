// src/models/UserDetail.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUserDetail extends Document {
  userId: string;  // Link to the Clerk user ID
  fullName: string;  // Example additional field
  email: string;  // You could sync this with Clerk's email if needed for local queries
  preferences: {
    theme: string;  // Just an example of a customizable preference
  };
  role: string;  // Example role for access control
}

const UserDetailSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  preferences: {
    theme: { type: String, required: true, default: 'light' },
  },
  role: { type: String, required: true, default: 'user' },
});

const UserDetail: Model<IUserDetail> = mongoose.models.UserDetail || mongoose.model<IUserDetail>('UserDetail', UserDetailSchema);

export default UserDetail;
