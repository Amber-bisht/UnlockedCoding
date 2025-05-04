import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { User, Category, Course, Lesson } from '../models';
import { authController } from '../controllers';
import { logger } from '../utils/logger';

// Admin user data
const adminUser = {
  username: 'admin',
  password: 'Admin123!',
  email: 'admin@unlockedcoding.com',
  isAdmin: true,
  hasCompletedProfile: true
};

// Categories data
const categories = [
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Learn front-end and back-end web development technologies and frameworks',
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&auto=format'
  },
  {
    name: 'Data Science',
    slug: 'data-science',
    description: 'Master data analysis, visualization, and machine learning techniques',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format'
  },
  {
    name: 'Mobile Development',
    slug: 'mobile-development',
    description: 'Build mobile applications for iOS and Android platforms',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format'
  },
  {
    name: 'DevOps',
    slug: 'devops',
    description: 'Learn continuous integration, deployment, and cloud infrastructure',
    imageUrl: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=500&auto=format'
  }
];

// Sample course data
const courses = [
  {
    title: 'React.js Fundamentals',
    description: 'Learn the basics of React.js, from components to state management',
    slug: 'react-js-fundamentals',
    imageUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=500&auto=format',
    price: 49.99,
    duration: 20,
    level: 'Beginner',
    categorySlug: 'web-development'
  },
  {
    title: 'Python for Data Science',
    description: 'Master Python libraries like Pandas, NumPy, and Matplotlib for data analysis',
    slug: 'python-for-data-science',
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format',
    price: 59.99,
    duration: 25,
    level: 'Intermediate',
    categorySlug: 'data-science'
  },
  {
    title: 'Flutter App Development',
    description: 'Build beautiful cross-platform mobile apps with Flutter and Dart',
    slug: 'flutter-app-development',
    imageUrl: 'https://images.unsplash.com/photo-1575089976121-8ed7b2a54265?w=500&auto=format',
    price: 64.99,
    duration: 30,
    level: 'Intermediate',
    categorySlug: 'mobile-development'
  },
  {
    title: 'Docker and Kubernetes',
    description: 'Learn container orchestration with Docker and Kubernetes',
    slug: 'docker-and-kubernetes',
    imageUrl: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=500&auto=format',
    price: 79.99,
    duration: 35,
    level: 'Advanced',
    categorySlug: 'devops'
  }
];

// Sample lessons
const lessons = [
  {
    courseSlug: 'react-js-fundamentals',
    title: 'Introduction to React',
    description: 'Learn about React and its core concepts',
    content: 'React is a JavaScript library for building user interfaces, particularly single-page applications where you need a fast, interactive user experience.',
    duration: 30,
    order: 1
  },
  {
    courseSlug: 'react-js-fundamentals',
    title: 'Creating Components',
    description: 'Learn how to create and compose React components',
    content: 'React components are the building blocks of React applications. They allow you to split the UI into independent, reusable pieces.',
    duration: 45,
    order: 2
  },
  {
    courseSlug: 'python-for-data-science',
    title: 'Introduction to NumPy',
    description: 'Learn about NumPy arrays and operations',
    content: 'NumPy is a fundamental package for scientific computing with Python. It provides support for large, multi-dimensional arrays and matrices.',
    duration: 40,
    order: 1
  },
  {
    courseSlug: 'python-for-data-science',
    title: 'Pandas DataFrames',
    description: 'Work with tabular data using Pandas',
    content: 'Pandas is a powerful data manipulation tool built on NumPy. The DataFrame is the primary data structure in pandas.',
    duration: 50,
    order: 2
  }
];

// Seed function
async function seed() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('Connected to MongoDB');

    // Clear existing data
    logger.info('Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});

    // Create admin user
    logger.info('Creating admin user...');
    const hashedPassword = await authController.hashPassword(adminUser.password);
    const user = new User({
      ...adminUser,
      password: hashedPassword
    });
    const savedUser = await user.save();
    logger.info(`Admin user created: ${savedUser.username}`);

    // Create categories
    logger.info('Creating categories...');
    const savedCategories = [];
    for (const category of categories) {
      const newCategory = new Category(category);
      const savedCategory = await newCategory.save();
      savedCategories.push(savedCategory);
      logger.info(`Category created: ${savedCategory.name}`);
    }

    // Create courses
    logger.info('Creating courses...');
    const savedCourses = [];
    for (const course of courses) {
      // Find category by slug
      const category = await Category.findOne({ slug: course.categorySlug });
      if (!category) {
        logger.error(`Category not found for slug: ${course.categorySlug}`);
        continue;
      }

      const newCourse = new Course({
        title: course.title,
        slug: course.slug,
        description: course.description,
        imageUrl: course.imageUrl,
        price: course.price,
        duration: course.duration,
        level: course.level,
        categoryId: category._id,
        instructorId: savedUser._id,
        lessonCount: 0,
        rating: 0
      });
      
      const savedCourse = await newCourse.save();
      savedCourses.push(savedCourse);
      logger.info(`Course created: ${savedCourse.title}`);
    }

    // Create lessons
    logger.info('Creating lessons...');
    for (const lesson of lessons) {
      // Find course by slug
      const course = await Course.findOne({ slug: lesson.courseSlug });
      if (!course) {
        logger.error(`Course not found for slug: ${lesson.courseSlug}`);
        continue;
      }

      const newLesson = new Lesson({
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        courseId: course._id,
        order: lesson.order,
        duration: lesson.duration
      });
      
      const savedLesson = await newLesson.save();
      logger.info(`Lesson created: ${savedLesson.title}`);
    }

    logger.info('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Seed error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

// Run seed function
seed();