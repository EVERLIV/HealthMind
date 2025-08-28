import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { users, sessions, userActivityLogs } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "everliv-health-secret-2024";
const SALT_ROUNDS = 10;
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    name: string;
    role: string;
    subscriptionType: string;
  };
  sessionToken?: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

// Verify JWT token
export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// Create session
export async function createSession(userId: string, ipAddress?: string, userAgent?: string) {
  const token = generateToken(userId);
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  // Create session in database
  const [session] = await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  }).returning();

  // Log activity
  await db.insert(userActivityLogs).values({
    userId,
    action: "login",
    ipAddress,
    userAgent,
  });

  // Update last login time
  await db.update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, userId));

  return { session, token };
}

// Destroy session
export async function destroySession(token: string) {
  const session = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  
  if (session.length > 0) {
    // Log activity
    await db.insert(userActivityLogs).values({
      userId: session[0].userId,
      action: "logout",
    });

    // Delete session
    await db.delete(sessions).where(eq(sessions.token, token));
  }
}

// Authentication middleware
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Get token from header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('Token verification failed');
      return res.status(401).json({ error: "Invalid token" });
    }

    // Check if session exists and is valid
    const [session] = await db.select().from(sessions)
      .where(and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date())
      ))
      .limit(1);

    if (!session) {
      return res.status(401).json({ error: "Session expired" });
    }

    // Get user data
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      subscriptionType: user.subscriptionType,
    };
    req.sessionToken = token;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Role-based authorization middleware
export function authorize(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
}

// Subscription check middleware
export function requireSubscription(...allowedTypes: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedTypes.includes(req.user.subscriptionType)) {
      return res.status(403).json({ error: "Subscription required" });
    }

    next();
  };
}

// Log user activity
export async function logActivity(userId: string, action: string, metadata?: any, ipAddress?: string, userAgent?: string) {
  await db.insert(userActivityLogs).values({
    userId,
    action,
    metadata,
    ipAddress,
    userAgent,
  });
}