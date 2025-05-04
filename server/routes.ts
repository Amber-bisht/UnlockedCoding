import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import session from "express-session";
import { Strategy as LocalStrategy } from "passport-local";
import { logger } from "./utils/logger";
import { connectDB } from "./config/database";
import config from "./config/config";
import { User } from "./models";
import { authController } from "./controllers";
import apiRoutes from "./routes/index";

// Setup passport authentication
const setupPassport = (app: Express) => {
  // Configure session
  app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.NODE_ENV === 'production',
      maxAge: config.SESSION_EXPIRY * 1000
    }
  }));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isValid = await authController.comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id).populate('profile');
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('MongoDB connected');

    // Setup passport
    setupPassport(app);
    logger.info('Passport initialized');

    // Register API routes
    app.use(apiRoutes);
    logger.info('API routes registered');

    // Create HTTP server
    const httpServer = createServer(app);
    return httpServer;
  } catch (error) {
    logger.error(`Error setting up server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}
