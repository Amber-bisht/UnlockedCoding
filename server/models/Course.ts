import mongoose, { Document, Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

// Define course interface
export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  price: number;
  duration: number;
  level: string;
  categoryId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  lessonCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

// Course schema
const courseSchema = new Schema<ICourse>({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters']
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
    minlength: [20, 'Description must be at least 20 characters']
  },
  imageUrl: { 
    type: String,
    required: [true, 'Image URL is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    default: 0
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 hour']
  },
  level: {
    type: String,
    required: [true, 'Level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  lessonCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
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
courseSchema.plugin(uniqueValidator, { message: '{PATH} already exists' });

// Create virtuals for relationships
courseSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

courseSchema.virtual('instructor', {
  ref: 'User',
  localField: 'instructorId',
  foreignField: '_id',
  justOne: true
});

courseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'courseId'
});

courseSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'courseId'
});

export default mongoose.model<ICourse>('Course', courseSchema);