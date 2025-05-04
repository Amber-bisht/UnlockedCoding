import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting database seed...");

    // Check if admin user exists
    const existingAdmin = await db.query.users.findFirst({
      where: eq(schema.users.username, "admin"),
    });

    if (!existingAdmin) {
      console.log("Creating admin user...");
      const adminUser = await db.insert(schema.users).values({
        username: "admin",
        password: await hashPassword("password123"),
        isAdmin: true,
        hasCompletedProfile: true,
      }).returning();

      if (adminUser.length > 0) {
        await db.insert(schema.profiles).values({
          userId: adminUser[0].id,
          fullName: "Admin User",
          bio: "Platform administrator with extensive experience in web development and education.",
          interest: "web-development",
          profileImageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
        });
      }
    } else {
      console.log("Admin user already exists, skipping creation.");
    }

    // Check if categories exist
    const existingCategories = await db.query.categories.findMany();
    
    if (existingCategories.length === 0) {
      console.log("Creating categories...");
      
      // Define categories
      const categoriesToInsert = [
        {
          name: "Web Development",
          slug: "web-development",
          description: "Learn to build modern, responsive websites and web applications.",
          imageUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Data Science",
          slug: "data-science",
          description: "Master data analysis, visualization, and machine learning techniques.",
          imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Mobile Development",
          slug: "mobile-development",
          description: "Build native and cross-platform mobile applications for iOS and Android.",
          imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Game Development",
          slug: "game-development",
          description: "Create engaging games for multiple platforms using modern engines and techniques.",
          imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Machine Learning",
          slug: "machine-learning",
          description: "Learn algorithms and statistical models to perform tasks without explicit instructions.",
          imageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        },
      ];
      
      await db.insert(schema.categories).values(categoriesToInsert);
    } else {
      console.log(`Found ${existingCategories.length} existing categories, skipping creation.`);
    }

    // Check if courses exist
    const existingCourses = await db.query.courses.findMany();

    if (existingCourses.length === 0) {
      console.log("Creating sample courses...");
      
      // Get admin user id
      const adminUser = await db.query.users.findFirst({
        where: eq(schema.users.username, "admin"),
      });
      
      if (!adminUser) {
        throw new Error("Admin user not found");
      }
      
      // Get categories
      const categories = await db.query.categories.findMany();
      
      if (categories.length === 0) {
        throw new Error("Categories not found");
      }
      
      // Create courses for each category
      for (const category of categories) {
        const courseName = `Introduction to ${category.name}`;
        const courseSlug = `intro-to-${category.slug}`;
        
        const course = await db.insert(schema.courses).values({
          title: courseName,
          slug: courseSlug,
          description: `A comprehensive introduction to ${category.name.toLowerCase()}, covering fundamentals and best practices.`,
          longDescription: `This course is designed for beginners who want to learn ${category.name.toLowerCase()} from scratch. You'll start with the basics and progressively build towards more advanced concepts. By the end of this course, you'll have a solid foundation and be ready to create your own projects.`,
          imageUrl: category.imageUrl,
          categoryId: category.id,
          instructorId: adminUser.id,
          price: 49.99,
          originalPrice: 99.99,
          duration: "10 hours",
          lessonCount: 5,
          rating: 4.5,
          reviewCount: 25,
          learningObjectives: [
            `Understand the fundamentals of ${category.name.toLowerCase()}`,
            "Build real-world projects from scratch",
            "Learn industry best practices",
            "Gain skills that employers are looking for",
          ],
          requirements: [
            "No prior knowledge required - we'll start from the basics",
            "A computer with internet access",
            "Enthusiasm and willingness to learn",
          ],
          targetAudience: [
            "Beginners with no prior experience",
            "Students looking to learn new skills",
            "Professionals wanting to change careers",
            "Anyone interested in learning to code",
          ],
        }).returning();
        
        if (course.length > 0) {
          // Create lessons for the course
          const lessonTitles = [
            "Getting Started",
            "Core Concepts",
            "Building Your First Project",
            "Advanced Techniques",
            "Final Project & Next Steps",
          ];
          
          for (let i = 0; i < lessonTitles.length; i++) {
            await db.insert(schema.lessons).values({
              title: lessonTitles[i],
              description: `Learn about ${lessonTitles[i].toLowerCase()} in ${category.name.toLowerCase()}.`,
              content: `This lesson covers everything you need to know about ${lessonTitles[i].toLowerCase()} in ${category.name.toLowerCase()}.`,
              videoUrl: "https://example.com/video.mp4",
              duration: "45 minutes",
              courseId: course[0].id,
              position: i + 1,
            });
          }
          
          // Create sample reviews
          const reviewComments = [
            "Excellent course! I learned so much.",
            "Great introduction to the subject. Highly recommend!",
            "The instructor explains concepts clearly and concisely.",
            "Perfect for beginners. Well-structured content.",
          ];
          
          const reviewTitles = [
            "Really helpful content",
            "Great for beginners",
            "Excellent course",
            "Worth every penny",
          ];
          
          const ratings = [5, 4, 5, 4];
          
          // Only add sample reviews to the first course for each category
          for (let i = 0; i < reviewComments.length; i++) {
            await db.insert(schema.reviews).values({
              userId: adminUser.id,
              courseId: course[0].id,
              title: reviewTitles[i],
              content: reviewComments[i],
              rating: ratings[i],
            });
          }
        }
      }
    } else {
      console.log(`Found ${existingCourses.length} existing courses, skipping creation.`);
    }

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
