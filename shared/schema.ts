import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User and profile management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  isAdmin: boolean("is_admin").default(false),
  hasCompletedProfile: boolean("has_completed_profile").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fullName: text("full_name"),
  bio: text("bio"),
  interest: text("interest"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories and courses
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  imageUrl: text("image_url").notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  instructorId: integer("instructor_id").references(() => users.id).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  duration: text("duration").notNull(),
  lessonCount: integer("lesson_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  reviewCount: integer("review_count").default(0),
  learningObjectives: text("learning_objectives").array(),
  requirements: text("requirements").array(),
  targetAudience: text("target_audience").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content"),
  videoUrl: text("video_url"),
  duration: text("duration").notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  instructorCourses: many(courses),
  enrollments: many(enrollments),
  reviews: many(reviews),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(categories, { fields: [courses.categoryId], references: [categories.id] }),
  instructor: one(users, { fields: [courses.instructorId], references: [users.id] }),
  lessons: many(lessons),
  enrollments: many(enrollments),
  reviews: many(reviews),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  course: one(courses, { fields: [lessons.courseId], references: [courses.id] }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  course: one(courses, { fields: [reviews.courseId], references: [courses.id] }),
}));

// Validation schemas
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
});

export const insertProfileSchema = createInsertSchema(profiles, {
  fullName: (schema) => schema.min(2, "Full name must be at least 2 characters"),
});

export const insertCategorySchema = createInsertSchema(categories, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
});

export const insertCourseSchema = createInsertSchema(courses, {
  title: (schema) => schema.min(5, "Title must be at least 5 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
});

export const insertLessonSchema = createInsertSchema(lessons, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
});

export const insertReviewSchema = createInsertSchema(reviews, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  content: (schema) => schema.min(10, "Content must be at least 10 characters"),
  rating: (schema) => schema.min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Course = typeof courses.$inferSelect & {
  category?: Category;
  instructor?: User;
};
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export type Enrollment = typeof enrollments.$inferSelect & {
  course: Course;
  user: User;
};

export type Review = typeof reviews.$inferSelect & {
  user: User;
};
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Contact form
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  telegramUsername: text("telegram_username"),
  purpose: text("purpose").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contactSubmissions, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) => schema.email("Please provide a valid email address"),
  purpose: (schema) => schema.refine(
    (val) => ["become_admin", "share_course", "copyright", "other"].includes(val),
    "Purpose must be one of: become admin, share course, copyright, or other"
  ),
  message: (schema) => schema.min(10, "Message must be at least 10 characters"),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSchema>;
