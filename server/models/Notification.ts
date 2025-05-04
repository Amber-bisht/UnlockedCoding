import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipients: 'all' | mongoose.Types.ObjectId[];
  read: mongoose.Types.ObjectId[];
  createdAt: Date;
  expiresAt?: Date;
}

const NotificationSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
  },
  recipients: {
    type: Schema.Types.Mixed,
    required: true,
    default: 'all', // 'all' for all users or array of user IDs
  },
  read: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30); // Default expiry of 30 days
      return date;
    },
  },
});

// Index for faster queries and automatic cleanup
NotificationSchema.index({ createdAt: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<INotification>('Notification', NotificationSchema);