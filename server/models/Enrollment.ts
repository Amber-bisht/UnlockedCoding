import mongoose, { Document, Schema } from 'mongoose';

// Define enrollment interface
export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  progress: number;
  isCompleted: boolean;
  completedLessons: mongoose.Types.ObjectId[];
  enrolledAt: Date;
  updatedAt: Date;
}

// Enrollment schema
const enrollmentSchema = new Schema<IEnrollment>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  courseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course',
    required: true
  },
  progress: { 
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCompleted: { 
    type: Boolean,
    default: false
  },
  completedLessons: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Lesson'
  }],
  enrolledAt: { 
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

// Create compound index to prevent duplicate enrollments
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Create virtuals for relationships
enrollmentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

enrollmentSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true
});

export default mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);