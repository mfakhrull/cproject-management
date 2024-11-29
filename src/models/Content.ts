import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true }, // For serialized HTML content
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Content || mongoose.model('Content', ContentSchema);
