import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertCategorySchema, insertCourseSchema, insertLessonSchema, insertReviewSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // API prefix
  const apiPrefix = "/api";
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };
  
  // Middleware to check if user is admin
  const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
    return res.status(403).json({ message: "Forbidden" });
  };
  
  // Categories
  app.get(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get(`${apiPrefix}/categories/:slug`, async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post(`${apiPrefix}/categories`, isAdmin, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put(`${apiPrefix}/categories/:id`, isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(categoryId, validatedData);
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete(`${apiPrefix}/categories/:id`, isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      await storage.deleteCategory(categoryId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Courses
  app.get(`${apiPrefix}/courses`, async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get(`${apiPrefix}/courses/:id`, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourseById(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get(`${apiPrefix}/categories/:slug/courses`, async (req, res) => {
    try {
      const courses = await storage.getCoursesByCategorySlug(req.params.slug);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses by category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post(`${apiPrefix}/courses`, isAdmin, async (req, res) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse({
        ...validatedData,
        instructorId: req.user.id,
      });
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put(`${apiPrefix}/courses/:id`, isAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const validatedData = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(courseId, validatedData);
      res.json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete(`${apiPrefix}/courses/:id`, isAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      await storage.deleteCourse(courseId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Lessons
  app.get(`${apiPrefix}/courses/:courseId/lessons`, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const lessons = await storage.getLessonsByCourse(courseId);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get(`${apiPrefix}/lessons/:id`, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLessonById(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      res.json(lesson);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post(`${apiPrefix}/courses/:courseId/lessons`, isAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const validatedData = insertLessonSchema.parse({
        ...req.body,
        courseId,
      });
      
      const lesson = await storage.createLesson(validatedData);
      res.status(201).json(lesson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating lesson:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put(`${apiPrefix}/lessons/:id`, isAdmin, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const validatedData = insertLessonSchema.partial().parse(req.body);
      const lesson = await storage.updateLesson(lessonId, validatedData);
      res.json(lesson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating lesson:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete(`${apiPrefix}/lessons/:id`, isAdmin, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      await storage.deleteLesson(lessonId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Enrollments
  app.get(`${apiPrefix}/user/enrollments`, isAuthenticated, async (req, res) => {
    try {
      const enrollments = await storage.getUserEnrollments(req.user.id);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get(`${apiPrefix}/courses/:courseId/enrollment`, isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const enrolled = await storage.checkUserEnrollment(req.user.id, courseId);
      res.json({ enrolled });
    } catch (error) {
      console.error("Error checking enrollment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post(`${apiPrefix}/courses/:courseId/enroll`, isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const enrollment = await storage.enrollUserInCourse(req.user.id, courseId);
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put(`${apiPrefix}/courses/:courseId/progress`, isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const { progress } = req.body;
      
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Progress must be a number between 0 and 100" });
      }
      
      await storage.updateEnrollmentProgress(req.user.id, courseId, progress);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Reviews
  app.get(`${apiPrefix}/courses/:courseId/reviews`, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const reviews = await storage.getCourseReviews(courseId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post(`${apiPrefix}/courses/:courseId/reviews`, isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      
      // Check if user is enrolled in the course
      const enrolled = await storage.checkUserEnrollment(req.user.id, courseId);
      
      if (!enrolled) {
        return res.status(403).json({ message: "You must be enrolled in the course to leave a review" });
      }
      
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id,
        courseId,
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  const httpServer = createServer(app);
  
  return httpServer;
}
