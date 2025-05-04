import mongoose, { Document, Schema } from 'mongoose';

// Define profile interface
export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName?: string;
  bio?: string;
  interest?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Profile schema
const profileSchema = new Schema<IProfile>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  fullName: { 
    type: String,
    minlength: [2, 'Full name must be at least 2 characters']
  },
  bio: { 
    type: String 
  },
  interest: { 
    type: String 
  },
  profileImageUrl: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true
});

export default mongoose.model<IProfile>('Profile', profileSchema);