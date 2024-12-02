// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  profileImageUrl: String,
}, { 
  timestamps: true 
});

export default mongoose.models.User || mongoose.model('User', UserSchema);