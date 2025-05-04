import { db, pool } from "@db";
import * as schema from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { Pool } from "@neondatabase/serverless";
import { InsertUser, User, InsertProfile } from "@shared/schema";

export interface IStorage {
  // User management
  createUser(userData: InsertUser): Promise<User>;
  getUser(id: number): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Profile management
  createOrUpdateProfile(userId: number, profileData: InsertProfile): Promise<void>;
  
  // Categories
  getCategories(): Promise<schema.Category[]>;
  getCategoryBySlug(slug: string): Promise<schema.Category | undefined>;
  createCategory(categoryData: schema.InsertCategory): Promise<schema.Category>;
  updateCategory(id: number, categoryData: Partial<schema.Category>): Promise<schema.Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Courses
  getCourses(): Promise<schema.Course[]>;
  getCourseById(id: number): Promise<schema.Course | undefined>;
  getCoursesByCategory(categoryId: number): Promise<schema.Course[]>;
  getCoursesByCategorySlug(slug: string): Promise<schema.Course[]>;
  createCourse(courseData: schema.InsertCourse): Promise<schema.Course>;
  updateCourse(id: number, courseData: Partial<schema.Course>): Promise<schema.Course>;
  deleteCourse(id: number): Promise<void>;
  
  // Lessons
  getLessonsByCourse(courseId: number): Promise<schema.Lesson[]>;
  getLessonById(id: number): Promise<schema.Lesson | undefined>;
  createLesson(lessonData: schema.InsertLesson): Promise<schema.Lesson>;
  updateLesson(id: number, lessonData: Partial<schema.Lesson>): Promise<schema.Lesson>;
  deleteLesson(id: number): Promise<void>;
  
  // Enrollments
  enrollUserInCourse(userId: number, courseId: number): Promise<schema.Enrollment>;
  getUserEnrollments(userId: number): Promise<schema.Enrollment[]>;
  checkUserEnrollment(userId: number, courseId: number): Promise<boolean>;
  updateEnrollmentProgress(userId: number, courseId: number, progress: number): Promise<void>;
  
  // Reviews
  getCourseReviews(courseId: number): Promise<schema.Review[]>;
  createReview(reviewData: schema.InsertReview): Promise<schema.Review>;
  updateReview(id: number, reviewData: Partial<schema.Review>): Promise<schema.Review>;
  deleteReview(id: number): Promise<void>;
  
  // Contact submissions
  createContactSubmission(data: schema.InsertContactSubmission): Promise<schema.ContactSubmission>;
  getContactSubmissions(): Promise<schema.ContactSubmission[]>;
  getContactSubmissionById(id: number): Promise<schema.ContactSubmission | undefined>;
  markContactSubmissionAsRead(id: number): Promise<void>;
  deleteContactSubmission(id: number): Promise<void>;
  
  // Session store
  sessionStore: session.SessionStore;
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    // Create a session store using the existing pool from db/index.ts
    this.sessionStore = new PostgresSessionStore({ 
      pool: pool,
      createTableIfMissing: true,
    });
  }
  
  // User management
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(schema.users).values(userData).returning();
    return user;
  }
  
  async getUser(id: number): Promise<User> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
      with: {
        profile: true,
      },
    });
    
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    // Merge profile data with user data
    if (user.profile) {
      return {
        ...user,
        ...user.profile,
      } as User;
    }
    
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.username, username),
      with: {
        profile: true,
      },
    });
    
    if (!user) {
      return undefined;
    }
    
    // Merge profile data with user data
    if (user.profile) {
      return {
        ...user,
        ...user.profile,
      } as User;
    }
    
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, id))
      .returning();
      
    return user;
  }
  
  // Profile management
  async createOrUpdateProfile(userId: number, profileData: InsertProfile): Promise<void> {
    // Check if profile exists
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(schema.profiles.userId, userId),
    });
    
    if (existingProfile) {
      // Update existing profile
      await db
        .update(schema.profiles)
        .set({
          fullName: profileData.fullName,
          bio: profileData.bio,
          interest: profileData.interest,
          profileImageUrl: profileData.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(schema.profiles.userId, userId));
    } else {
      // Create new profile
      await db.insert(schema.profiles).values(profileData);
    }
  }
  
  // Categories
  async getCategories(): Promise<schema.Category[]> {
    return db.query.categories.findMany({
      orderBy: asc(schema.categories.name),
    });
  }
  
  async getCategoryBySlug(slug: string): Promise<schema.Category | undefined> {
    return db.query.categories.findFirst({
      where: eq(schema.categories.slug, slug),
    });
  }
  
  async createCategory(categoryData: schema.InsertCategory): Promise<schema.Category> {
    const [category] = await db
      .insert(schema.categories)
      .values(categoryData)
      .returning();
      
    return category;
  }
  
  async updateCategory(id: number, categoryData: Partial<schema.Category>): Promise<schema.Category> {
    const [category] = await db
      .update(schema.categories)
      .set({
        ...categoryData,
        updatedAt: new Date(),
      })
      .where(eq(schema.categories.id, id))
      .returning();
      
    return category;
  }
  
  async deleteCategory(id: number): Promise<void> {
    await db.delete(schema.categories).where(eq(schema.categories.id, id));
  }
  
  // Courses
  async getCourses(): Promise<schema.Course[]> {
    return db.query.courses.findMany({
      with: {
        category: true,
        instructor: true,
      },
      orderBy: desc(schema.courses.createdAt),
    });
  }
  
  async getCourseById(id: number): Promise<schema.Course | undefined> {
    return db.query.courses.findFirst({
      where: eq(schema.courses.id, id),
      with: {
        category: true,
        instructor: {
          with: {
            profile: true,
          },
        },
      },
    });
  }
  
  async getCoursesByCategory(categoryId: number): Promise<schema.Course[]> {
    return db.query.courses.findMany({
      where: eq(schema.courses.categoryId, categoryId),
      with: {
        category: true,
        instructor: true,
      },
      orderBy: desc(schema.courses.createdAt),
    });
  }
  
  async getCoursesByCategorySlug(slug: string): Promise<schema.Course[]> {
    const category = await this.getCategoryBySlug(slug);
    
    if (!category) {
      return [];
    }
    
    return this.getCoursesByCategory(category.id);
  }
  
  async createCourse(courseData: schema.InsertCourse): Promise<schema.Course> {
    const [course] = await db
      .insert(schema.courses)
      .values(courseData)
      .returning();
      
    return course;
  }
  
  async updateCourse(id: number, courseData: Partial<schema.Course>): Promise<schema.Course> {
    const [course] = await db
      .update(schema.courses)
      .set({
        ...courseData,
        updatedAt: new Date(),
      })
      .where(eq(schema.courses.id, id))
      .returning();
      
    return course;
  }
  
  async deleteCourse(id: number): Promise<void> {
    await db.delete(schema.courses).where(eq(schema.courses.id, id));
  }
  
  // Lessons
  async getLessonsByCourse(courseId: number): Promise<schema.Lesson[]> {
    return db.query.lessons.findMany({
      where: eq(schema.lessons.courseId, courseId),
      orderBy: asc(schema.lessons.position),
    });
  }
  
  async getLessonById(id: number): Promise<schema.Lesson | undefined> {
    return db.query.lessons.findFirst({
      where: eq(schema.lessons.id, id),
    });
  }
  
  async createLesson(lessonData: schema.InsertLesson): Promise<schema.Lesson> {
    const [lesson] = await db
      .insert(schema.lessons)
      .values(lessonData)
      .returning();
      
    // Update course lesson count
    await this.updateCourseLessonCount(lessonData.courseId);
      
    return lesson;
  }
  
  async updateLesson(id: number, lessonData: Partial<schema.Lesson>): Promise<schema.Lesson> {
    const [lesson] = await db
      .update(schema.lessons)
      .set({
        ...lessonData,
        updatedAt: new Date(),
      })
      .where(eq(schema.lessons.id, id))
      .returning();
      
    return lesson;
  }
  
  async deleteLesson(id: number): Promise<void> {
    const lesson = await this.getLessonById(id);
    
    if (!lesson) {
      throw new Error(`Lesson with ID ${id} not found`);
    }
    
    await db.delete(schema.lessons).where(eq(schema.lessons.id, id));
    
    // Update course lesson count
    await this.updateCourseLessonCount(lesson.courseId);
  }
  
  private async updateCourseLessonCount(courseId: number): Promise<void> {
    // Count lessons for this course
    const lessons = await this.getLessonsByCourse(courseId);
    
    // Update course with lesson count
    await db
      .update(schema.courses)
      .set({
        lessonCount: lessons.length,
        updatedAt: new Date(),
      })
      .where(eq(schema.courses.id, courseId));
  }
  
  // Enrollments
  async enrollUserInCourse(userId: number, courseId: number): Promise<schema.Enrollment> {
    // Check if already enrolled
    const existingEnrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(schema.enrollments.userId, userId),
        eq(schema.enrollments.courseId, courseId)
      ),
    });
    
    if (existingEnrollment) {
      return existingEnrollment;
    }
    
    // Create new enrollment
    const [enrollment] = await db
      .insert(schema.enrollments)
      .values({
        userId,
        courseId,
      })
      .returning();
      
    return enrollment;
  }
  
  async getUserEnrollments(userId: number): Promise<schema.Enrollment[]> {
    return db.query.enrollments.findMany({
      where: eq(schema.enrollments.userId, userId),
      with: {
        course: {
          with: {
            category: true,
          },
        },
        user: true,
      },
      orderBy: desc(schema.enrollments.createdAt),
    });
  }
  
  async checkUserEnrollment(userId: number, courseId: number): Promise<boolean> {
    const enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(schema.enrollments.userId, userId),
        eq(schema.enrollments.courseId, courseId)
      ),
    });
    
    return !!enrollment;
  }
  
  async updateEnrollmentProgress(userId: number, courseId: number, progress: number): Promise<void> {
    await db
      .update(schema.enrollments)
      .set({
        progress,
        completed: progress === 100,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.enrollments.userId, userId),
          eq(schema.enrollments.courseId, courseId)
        )
      );
  }
  
  // Reviews
  async getCourseReviews(courseId: number): Promise<schema.Review[]> {
    return db.query.reviews.findMany({
      where: eq(schema.reviews.courseId, courseId),
      with: {
        user: {
          with: {
            profile: true,
          },
        },
      },
      orderBy: desc(schema.reviews.createdAt),
    });
  }
  
  async createReview(reviewData: schema.InsertReview): Promise<schema.Review> {
    const [review] = await db
      .insert(schema.reviews)
      .values(reviewData)
      .returning();
      
    // Update course rating and review count
    await this.updateCourseRating(reviewData.courseId);
      
    return review;
  }
  
  async updateReview(id: number, reviewData: Partial<schema.Review>): Promise<schema.Review> {
    const [review] = await db
      .update(schema.reviews)
      .set({
        ...reviewData,
        updatedAt: new Date(),
      })
      .where(eq(schema.reviews.id, id))
      .returning();
      
    // Update course rating
    await this.updateCourseRating(review.courseId);
      
    return review;
  }
  
  async deleteReview(id: number): Promise<void> {
    const review = await db.query.reviews.findFirst({
      where: eq(schema.reviews.id, id),
    });
    
    if (!review) {
      throw new Error(`Review with ID ${id} not found`);
    }
    
    await db.delete(schema.reviews).where(eq(schema.reviews.id, id));
    
    // Update course rating and review count
    await this.updateCourseRating(review.courseId);
  }
  
  private async updateCourseRating(courseId: number): Promise<void> {
    // Get all reviews for the course
    const reviews = await this.getCourseReviews(courseId);
    
    if (reviews.length === 0) {
      // No reviews, set rating to null and count to 0
      await db
        .update(schema.courses)
        .set({
          rating: null,
          reviewCount: 0,
          updatedAt: new Date(),
        })
        .where(eq(schema.courses.id, courseId));
      return;
    }
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Update course with new rating and count
    await db
      .update(schema.courses)
      .set({
        rating: parseFloat(averageRating.toFixed(1)),
        reviewCount: reviews.length,
        updatedAt: new Date(),
      })
      .where(eq(schema.courses.id, courseId));
  }
  
  // Contact submissions
  async createContactSubmission(data: schema.InsertContactSubmission): Promise<schema.ContactSubmission> {
    const [submission] = await db
      .insert(schema.contactSubmissions)
      .values(data)
      .returning();
      
    return submission;
  }
  
  async getContactSubmissions(): Promise<schema.ContactSubmission[]> {
    return db.query.contactSubmissions.findMany({
      orderBy: desc(schema.contactSubmissions.createdAt),
    });
  }
  
  async getContactSubmissionById(id: number): Promise<schema.ContactSubmission | undefined> {
    return db.query.contactSubmissions.findFirst({
      where: eq(schema.contactSubmissions.id, id),
    });
  }
  
  async markContactSubmissionAsRead(id: number): Promise<void> {
    await db
      .update(schema.contactSubmissions)
      .set({
        isRead: true,
      })
      .where(eq(schema.contactSubmissions.id, id));
  }
  
  async deleteContactSubmission(id: number): Promise<void> {
    await db.delete(schema.contactSubmissions).where(eq(schema.contactSubmissions.id, id));
  }
}

// Create and export storage instance
export const storage = new DatabaseStorage();
