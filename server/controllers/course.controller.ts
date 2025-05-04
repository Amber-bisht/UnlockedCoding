import { Request, Response } from 'express';
import { Course, Category } from '../models';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// Get all courses
export const getAllCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find()
      .populate('category')
      .populate('instructor', '-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json(courses);
  } catch (error) {
    logger.error(`Get all courses error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

// Get course by ID
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid course ID' });
      return;
    }
    
    const course = await Course.findById(id)
      .populate('category')
      .populate('instructor', '-password')
      .populate('lessons');
    
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    
    res.status(200).json(course);
  } catch (error) {
    logger.error(`Get course by ID error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching course' });
  }
};

// Get course by slug
export const getCourseBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    
    const course = await Course.findOne({ slug })
      .populate('category')
      .populate('instructor', '-password')
      .populate('lessons');
    
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    
    res.status(200).json(course);
  } catch (error) {
    logger.error(`Get course by slug error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching course' });
  }
};

// Get courses by category slug
export const getCoursesByCategorySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    
    // Find category by slug
    const category = await Category.findOne({ slug });
    
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    
    // Find courses by category ID
    const courses = await Course.find({ categoryId: category._id })
      .populate('instructor', '-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json(courses);
  } catch (error) {
    logger.error(`Get courses by category slug error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching courses by category' });
  }
};

// Create new course (admin only)
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return;
    }
    
    const { title, description, imageUrl, price, duration, level, categoryId, enrollmentLink } = req.body;
    
    // Create slug from title
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    // Check if course with slug already exists
    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      res.status(400).json({ message: 'Course with this title already exists' });
      return;
    }
    
    // Check if category exists
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({ message: 'Invalid category ID' });
      return;
    }
    
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    
    // Create new course
    const course = new Course({
      title,
      slug,
      description,
      imageUrl,
      price,
      duration,
      level,
      categoryId,
      instructorId: req.user._id,
      lessonCount: 0,
      rating: 0,
      enrollmentLink: enrollmentLink || ''
    });
    
    await course.save();
    
    const populatedCourse = await Course.findById(course._id)
      .populate('category')
      .populate('instructor', '-password');
    
    res.status(201).json(populatedCourse);
  } catch (error) {
    logger.error(`Create course error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error creating course' });
  }
};

// Update course (admin only)
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return;
    }
    
    const { id } = req.params;
    const { title, description, imageUrl, price, duration, level, categoryId, enrollmentLink } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid course ID' });
      return;
    }
    
    // Find course
    const course = await Course.findById(id);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    
    // Create new slug if title changes
    let slug = course.slug;
    if (title && title !== course.title) {
      slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      
      // Check if new slug already exists
      const existingCourse = await Course.findOne({ 
        slug, 
        _id: { $ne: id } 
      });
      
      if (existingCourse) {
        res.status(400).json({ message: 'Course with this title already exists' });
        return;
      }
    }
    
    // Check if category exists if categoryId is provided
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({ message: 'Invalid category ID' });
      return;
    }
    
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
    }
    
    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        title: title || course.title,
        slug,
        description: description || course.description,
        imageUrl: imageUrl || course.imageUrl,
        price: price || course.price,
        duration: duration || course.duration,
        level: level || course.level,
        categoryId: categoryId || course.categoryId,
        enrollmentLink: enrollmentLink !== undefined ? enrollmentLink : course.enrollmentLink,
      },
      { new: true }
    )
    .populate('category')
    .populate('instructor', '-password');
    
    res.status(200).json(updatedCourse);
  } catch (error) {
    logger.error(`Update course error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error updating course' });
  }
};

// Delete course (admin only)
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return;
    }
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid course ID' });
      return;
    }
    
    // Delete course
    const result = await Course.findByIdAndDelete(id);
    
    if (!result) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    logger.error(`Delete course error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error deleting course' });
  }
};