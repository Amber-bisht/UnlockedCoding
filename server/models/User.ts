import mongoose, { Document, Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

// Define user interface
export interface IUser extends Document {
  username: string;
  password: string;
  email?: string;
  isAdmin: boolean;
  hasCompletedProfile: boolean;
  createdAt: Date;
}

// User schema
const userSchema = new Schema<IUser>({
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'] 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  email: { 
    type: String,
    trim: true 
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  hasCompletedProfile: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add plugin for better error handling on unique fields
userSchema.plugin(uniqueValidator, { message: '{PATH} already exists' });

// Create virtual for profile
userSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

export default mongoose.model<IUser>('User', userSchema);