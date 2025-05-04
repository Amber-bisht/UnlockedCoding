import { connectDB } from '../config/database';
import { Course, Lesson } from '../models';
import { logger } from '../utils/logger';

async function addLessons() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('Connected to MongoDB');
    
    // Get the JavaScript Advanced Concepts course
    const course = await Course.findOne({ slug: 'javascript-advanced-concepts' });
    
    if (!course) {
      logger.error('Course not found');
      process.exit(1);
    }
    
    // Define lessons to add
    const lessons = [
      {
        title: 'Understanding Closures',
        description: 'Learn how closures work in JavaScript',
        content: 'Closures are a fundamental JavaScript concept that allows functions to access variables from their parent scope even after the parent function has executed.',
        courseId: course._id,
        order: 1,
        duration: 30
      },
      {
        title: 'Prototypal Inheritance',
        description: 'Master JavaScript object prototypes',
        content: 'JavaScript uses prototype-based inheritance instead of class-based inheritance. Understanding how the prototype chain works is essential for advanced JavaScript development.',
        courseId: course._id,
        order: 2,
        duration: 45
      },
      {
        title: 'Async JavaScript',
        description: 'Learn promises, async/await, and more',
        content: 'Asynchronous programming in JavaScript has evolved from callbacks to promises to async/await syntax. This lesson covers modern approaches to handling async operations.',
        courseId: course._id,
        order: 3,
        duration: 40
      },
      {
        title: 'ES6+ Features',
        description: 'Explore modern JavaScript features',
        content: 'ECMAScript 6 and beyond introduced many powerful features to JavaScript including arrow functions, destructuring, spread operators, and more that make your code more concise and expressive.',
        courseId: course._id,
        order: 4,
        duration: 35
      }
    ];
    
    // Add lessons
    const savedLessons = [];
    for (const lessonData of lessons) {
      const lesson = new Lesson(lessonData);
      const savedLesson = await lesson.save();
      savedLessons.push(savedLesson);
      logger.info(`Lesson created: ${savedLesson.title}`);
    }
    
    // Update lesson count on course
    course.lessonCount = savedLessons.length;
    await course.save();
    logger.info(`Updated course lesson count to ${savedLessons.length}`);
    
    logger.info('Added lessons successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Error adding lessons: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

addLessons();