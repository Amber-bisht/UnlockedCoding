import mongoose, { Document, Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

// Define category interface
export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category schema
const categorySchema = new Schema<ICategory>({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  slug: { 
    type: String, 
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  description: { 
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters']
  },
  imageUrl: { 
    type: String,
    required: [true, 'Image URL is required']
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add plugin for better error handling on unique fields
categorySchema.plugin(uniqueValidator, { message: '{PATH} already exists' });

// Create virtual for courses
categorySchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'categoryId'
});

export default mongoose.model<ICategory>('Category', categorySchema);