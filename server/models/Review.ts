import mongoose, { Document, Schema } from 'mongoose';

// Define review interface
export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// Review schema
const reviewSchema = new Schema<IReview>({
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
  rating: { 
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: { 
    type: String,
    required: [true, 'Comment is required'],
    minlength: [5, 'Comment must be at least 5 characters']
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

// Create compound index to prevent duplicate reviews
reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Create virtuals for relationships
reviewSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

reviewSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true
});

// Add post-save hook to update course rating
reviewSchema.post('save', async function(doc) {
  try {
    const Course = mongoose.model('Course');
    const reviews = await mongoose.model('Review').find({ courseId: doc.courseId });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / reviews.length;
      await Course.findByIdAndUpdate(doc.courseId, { rating: avgRating });
    }
  } catch (error) {
    console.error('Error updating course rating:', error);
  }
});

// Add post-remove hook to update course rating
reviewSchema.post('remove', async function(doc) {
  try {
    const Course = mongoose.model('Course');
    const reviews = await mongoose.model('Review').find({ courseId: doc.courseId });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / reviews.length;
      await Course.findByIdAndUpdate(doc.courseId, { rating: avgRating });
    } else {
      await Course.findByIdAndUpdate(doc.courseId, { rating: 0 });
    }
  } catch (error) {
    console.error('Error updating course rating:', error);
  }
});

export default mongoose.model<IReview>('Review', reviewSchema);