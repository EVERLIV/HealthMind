import { Express } from "express";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { 
  hashPassword, 
  verifyPassword, 
  createSession, 
  destroySession, 
  authenticate,
  AuthenticatedRequest,
  logActivity
} from "./auth";
import { z } from "zod";

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(100),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(50).optional(),
});

const changeEmailSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function registerAuthRoutes(app: Express) {
  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);

      // Check if email or username already exists
      const existingUser = await db.select().from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const existingUsername = await db.select().from(users)
        .where(eq(users.username, data.username))
        .limit(1);

      if (existingUsername.length > 0) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(data.password);
      
      const [newUser] = await db.insert(users).values({
        email: data.email,
        username: data.username,
        passwordHash,
        name: data.name,
        role: "user",
        subscriptionType: "basic",
      }).returning();

      // Create session
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];
      const { token } = await createSession(newUser.id, ipAddress, userAgent);

      // Return user data and token
      res.json({
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role,
          subscriptionType: newUser.subscriptionType,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      // Find user by email
      const [user] = await db.select().from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Verify password
      const isValid = await verifyPassword(data.password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Create session
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];
      const { token } = await createSession(user.id, ipAddress, userAgent);

      // Return user data and token
      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          subscriptionType: user.subscriptionType,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.sessionToken) {
        await destroySession(req.sessionToken);
      }
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const [fullUser] = await db.select().from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      if (!fullUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: fullUser.id,
        email: fullUser.email,
        username: fullUser.username,
        name: fullUser.name,
        role: fullUser.role,
        subscriptionType: fullUser.subscriptionType,
        subscriptionExpiresAt: fullUser.subscriptionExpiresAt,
        isEmailVerified: fullUser.isEmailVerified === 1,
        createdAt: fullUser.createdAt,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user data" });
    }
  });

  // Update profile
  app.patch("/api/auth/profile", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const data = updateProfileSchema.parse(req.body);

      // Check username uniqueness if changing
      if (data.username) {
        const [existing] = await db.select().from(users)
          .where(eq(users.username, data.username))
          .limit(1);

        if (existing && existing.id !== req.user.id) {
          return res.status(400).json({ error: "Username already taken" });
        }
      }

      // Update user
      const [updatedUser] = await db.update(users)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(users.id, req.user.id))
        .returning();

      // Log activity
      await logActivity(req.user.id, "profile_updated", { changes: Object.keys(data) });

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role,
        subscriptionType: updatedUser.subscriptionType,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Change password
  app.post("/api/auth/change-password", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const data = changePasswordSchema.parse(req.body);

      // Get current user
      const [user] = await db.select().from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isValid = await verifyPassword(data.currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Hash new password and update
      const passwordHash = await hashPassword(data.newPassword);
      await db.update(users)
        .set({
          passwordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, req.user.id));

      // Log activity
      await logActivity(req.user.id, "password_changed");

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Change password error:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // Change email
  app.post("/api/auth/change-email", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const data = changeEmailSchema.parse(req.body);

      // Find user
      const [user] = await db.select().from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify password
      const isValid = await verifyPassword(data.password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Password is incorrect" });
      }

      // Check if email is already taken
      const existingUser = await db.select().from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== req.user.id) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Update email
      await db.update(users)
        .set({
          email: data.email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, req.user.id));

      // Log activity
      await logActivity(req.user.id, "email_changed");

      res.json({ message: "Email changed successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Change email error:", error);
      res.status(500).json({ error: "Failed to change email" });
    }
  });

  // Get user activity history
  app.get("/api/auth/activity", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const activities = await db.query.userActivityLogs.findMany({
        where: eq(users.id, req.user.id),
        orderBy: (logs, { desc }) => [desc(logs.createdAt)],
        limit: 50,
      });

      res.json(activities);
    } catch (error) {
      console.error("Get activity error:", error);
      res.status(500).json({ error: "Failed to get activity history" });
    }
  });
}