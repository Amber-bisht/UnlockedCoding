import { IUser } from '../models/User';

// Extend Express namespace to include user in Request
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

// Add declaration for mongoose-unique-validator
declare module 'mongoose-unique-validator' {
  import mongoose from 'mongoose';
  function uniqueValidator(schema: mongoose.Schema, options?: { message: string }): void;
  export = uniqueValidator;
}