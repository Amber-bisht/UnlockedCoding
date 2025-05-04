# Unlocked Coding Backend Documentation

## Overview

The Unlocked Coding platform backend is built with Node.js, Express, and MongoDB to provide a robust and scalable API for the educational platform. This document outlines the architecture, key components, and main features of the backend application.

## Technology Stack

- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling for Node.js
- **Passport.js**: Authentication middleware
- **Express-session**: Session management
- **Winston**: Logging library
- **Joi/Zod**: Schema validation
- **Typescript**: Type safety and improved developer experience

## Project Structure

```
server/
├── config/            # Configuration files
├── controllers/       # Request handlers
├── docs/              # Documentation
├── middleware/        # Custom middleware functions
├── models/            # Mongoose schema definitions
├── routes/            # API route definitions
├── scripts/           # Utility scripts (seeding, etc.)
├── services/          # Business logic
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── index.ts           # Application entry point
├── auth.ts            # Authentication setup
├── routes.ts          # Routes setup
└── vite.ts            # Vite integration for serving frontend
```

## Database Models

### User Model

```typescript
interface IUser extends Document {
  username: string;
  password: string;
  email?: string;
  isAdmin: boolean;
  hasCompletedProfile: boolean;
  createdAt: Date;
}
```

### Profile Model

```typescript
interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName?: string;
  bio?: string;
  interest?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Category Model

```typescript
interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Course Model

```typescript
interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  price: number;
  duration: number;
  level: string;
  categoryId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  instructorName: string;
  lessonCount: number;
  rating: number;
  enrollmentLink: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Lesson Model

```typescript
interface ILesson extends Document {
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  courseId: mongoose.Types.ObjectId;
  order: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Enrollment Model

```typescript
interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  progress: number;
  isCompleted: boolean;
  completedLessons: mongoose.Types.ObjectId[];
  enrolledAt: Date;
  updatedAt: Date;
}
```

### Review Model

```typescript
interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification Model

```typescript
interface INotification extends Document {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipients: 'all' | mongoose.Types.ObjectId[];
  read: mongoose.Types.ObjectId[];
  createdAt: Date;
  expiresAt?: Date;
}
```

## API Structure

The API follows RESTful conventions and is organized by resource type:

- `/api/auth` - Authentication endpoints
- `/api/categories` - Category management
- `/api/courses` - Course management
- `/api/lessons` - Lesson management
- `/api/profile` - User profile management
- `/api/notifications` - Notification management
- `/api/admin` - Admin-specific endpoints

## Authentication

Authentication is implemented using Passport.js with a local strategy. The server uses session-based authentication with secure, HTTP-only cookies.

```typescript
// Setup authentication
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username });
    if (!user || !(await comparePasswords(password, user.password))) {
      return done(null, false);
    } else {
      return done(null, user);
    }
  }),
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
```

## Middleware

### Authentication Middleware

- `isAuthenticated`: Verifies the user is authenticated
- `isAdmin`: Verifies the user is an admin
- `hasCompletedProfile`: Verifies the user has completed their profile

### Error Handling Middleware

Centralized error handling middleware to catch and format errors consistently:

```typescript
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});
```

### Logging Middleware

Winston logger for recording application events and errors:

```typescript
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

## Controllers

Controllers follow the single responsibility principle and contain the request handling logic for each resource type:

- `auth.controller.ts`: Authentication-related operations
- `category.controller.ts`: Category CRUD operations
- `course.controller.ts`: Course CRUD operations
- `lesson.controller.ts`: Lesson CRUD operations
- `profile.controller.ts`: Profile management
- `notification.controller.ts`: Notification management

Example controller structure:

```typescript
// Get all courses
export const getAllCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find()
      .populate('category')
      .populate('instructor', '-password');
    
    res.status(200).json(courses);
  } catch (error) {
    logger.error(`Get all courses error: ${error.message}`);
    res.status(500).json({ message: 'Error fetching courses' });
  }
};
```

## Data Validation

Request data is validated using schema validation libraries:

```typescript
// Validate course data
const { error, value } = courseSchema.validate(req.body);
if (error) {
  return res.status(400).json({ message: error.details[0].message });
}
```

## Error Handling

The application implements robust error handling at multiple levels:

1. **Controller-level try-catch**: Catches and formats errors in request handlers
2. **Global error middleware**: Processes uncaught errors
3. **Custom error classes**: For specific error types and consistent formatting
4. **Validation errors**: For input validation failures

## Security Measures

The backend implements several security measures:

- **Password hashing**: Using `scrypt` for secure password storage
- **HTTPS**: Secure communication with TLS/SSL
- **CSRF protection**: Token-based protection against cross-site request forgery
- **Rate limiting**: To prevent abuse
- **Input validation**: To prevent injection attacks
- **Secure headers**: HTTP security headers like Content-Security-Policy
- **Session security**: Secure, HTTP-only cookies with proper expiration

## Logging

Comprehensive logging with different log levels:

- **Error**: For application errors
- **Warning**: For potential issues
- **Info**: For general application events
- **Debug**: For detailed debugging information

## Environment Configuration

The application uses environment variables for configuration:

- `NODE_ENV`: Application environment (development, production)
- `PORT`: Server port
- `DATABASE_URL`: MongoDB connection string
- `SESSION_SECRET`: Secret for session encryption
- `SENDGRID_API_KEY`: SendGrid API key for email notifications

## Database Connection

MongoDB connection with error handling and reconnection:

```typescript
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.DATABASE_URL!);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
```

## Scripts

Utility scripts for database management:

- `create-admin-user.ts`: Creates an admin user with predefined credentials
- `seed.ts`: Seeds the database with initial data
- `quick-seed.ts`: Quick database seeding for development
- `add-lessons.ts`: Adds lessons to courses

## API Rate Limiting

Rate limiting to prevent API abuse:

```typescript
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
}));
```

## Testing

The application includes unit tests and integration tests:

- **Unit tests**: For testing individual functions and components
- **Integration tests**: For testing API endpoints
- **Mock services**: For testing with mock data

## Deployment

The application is ready for deployment with:

- **Docker support**: Containerization for consistent environments
- **PM2 configuration**: Process management for production
- **Environment variables**: Configuration for different environments

## Performance Optimization

Several performance optimizations are implemented:

- **Database indexing**: For faster queries
- **Query optimization**: To minimize database load
- **Response compression**: To reduce bandwidth
- **Caching**: For frequently accessed data