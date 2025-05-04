import { Request, Response } from 'express';
import { Lesson, Course } from '../models';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// Get lessons by course ID
export const getLessonsByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ message: 'Invalid course ID' });
      return;
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    
    // Get lessons
    const lessons = await Lesson.find({ courseId })
      .sort({ order: 1 });
      
    res.status(200).json(lessons);
  } catch (error) {
    logger.error(`Get lessons by course error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching lessons' });
  }
};

// Get lesson by ID
export const getLessonById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid lesson ID' });
      return;
    }
    
    // Get lesson
    const lesson = await Lesson.findById(id)
      .populate('course');
      
    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }
    
    res.status(200).json(lesson);
  } catch (error) {
    logger.error(`Get lesson by ID error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching lesson' });
  }
};

// Create new lesson (admin only)
export const createLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return;
    }
    
    const { courseId } = req.params;
    const { title, description, content, videoUrl, duration, order } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ message: 'Invalid course ID' });
      return;
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    
    // Create new lesson
    const lesson = new Lesson({
      title,
      description,
      content,
      videoUrl,
      courseId,
      order: order || (await Lesson.countDocuments({ courseId })) + 1,
      duration: duration || 30 // Default duration 30 minutes if not provided
    });
    
    await lesson.save();
    
    res.status(201).json(lesson);
  } catch (error) {
    logger.error(`Create lesson error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error creating lesson' });
  }
};

// Update lesson (admin only)
export const updateLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return;
    }
    
    const { id } = req.params;
    const { title, description, content, videoUrl, duration, order } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid lesson ID' });
      return;
    }
    
    // Find lesson
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }
    
    // Update lesson
    const updatedLesson = await Lesson.findByIdAndUpdate(
      id,
      {
        title: title || lesson.title,
        description: description || lesson.description,
        content: content || lesson.content,
        videoUrl: videoUrl !== undefined ? videoUrl : lesson.videoUrl,
        duration: duration || lesson.duration,
        order: order || lesson.order
      },
      { new: true }
    );
    
    res.status(200).json(updatedLesson);
  } catch (error) {
    logger.error(`Update lesson error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error updating lesson' });
  }
};

// Delete lesson (admin only)
export const deleteLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return;
    }
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid lesson ID' });
      return;
    }
    
    // Delete lesson
    const result = await Lesson.findByIdAndDelete(id);
    
    if (!result) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }
    
    // Reorder remaining lessons
    const lessons = await Lesson.find({ courseId: result.courseId })
      .sort({ order: 1 });
    
    for (let i = 0; i < lessons.length; i++) {
      await Lesson.findByIdAndUpdate(lessons[i]._id, { order: i + 1 });
    }
    
    res.status(200).json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    logger.error(`Delete lesson error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error deleting lesson' });
  }
};