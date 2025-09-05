import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // user, admin
  subscriptionType: text("subscription_type").notNull().default("basic"), // basic, premium, enterprise
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  isEmailVerified: integer("is_email_verified").default(0), // 0 = false, 1 = true
  emailVerificationToken: text("email_verification_token"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const healthProfiles = pgTable("health_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  age: integer("age"),
  weight: text("weight"),
  height: text("height"),
  medicalConditions: json("medical_conditions").$type<string[]>(),
  medications: json("medications").$type<string[]>(),
  profileData: json("profile_data"), // Complete profile data
  completionPercentage: integer("completion_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bloodAnalyses = pgTable("blood_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  imageUrl: text("image_url"),
  results: json("results"),
  status: text("status").notNull().default("pending"), // pending, analyzed, error
  analysisDate: timestamp("analysis_date"), // User-specified date of the analysis
  analyzedAt: timestamp("analyzed_at"), // System timestamp when analysis was completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const biomarkers = pgTable("biomarkers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  normalRange: json("normal_range").$type<{ min: number; max: number; unit: string }>(),
  category: text("category").notNull(), // blood, cardiovascular, metabolic, etc.
  importance: text("importance").notNull(), // high, medium, low
  recommendations: json("recommendations").$type<string[]>(),
});

export const biomarkerResults = pgTable("biomarker_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analysisId: varchar("analysis_id").references(() => bloodAnalyses.id).notNull(),
  biomarkerId: varchar("biomarker_id").references(() => biomarkers.id).notNull(),
  value: decimal("value", { precision: 10, scale: 3 }).notNull(),
  unit: text("unit").notNull(),
  status: text("status").notNull(), // normal, high, low, critical
  education: text("education"), // AI-generated educational content for this specific result
  recommendation: text("recommendation"), // AI-generated recommendation for this specific result
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => chatSessions.id).notNull(),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthMetrics = pgTable("health_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  heartRate: integer("heart_rate"),
  bloodPressureSystolic: integer("blood_pressure_systolic"),
  bloodPressureDiastolic: integer("blood_pressure_diastolic"),
  temperature: text("temperature"),
  recordedAt: timestamp("recorded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sessions table for auth
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User activity logs
export const userActivityLogs = pgTable("user_activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // login, logout, view_analysis, create_chat, etc.
  metadata: json("metadata"), // Additional context data
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
export const insertUserActivityLogSchema = createInsertSchema(userActivityLogs).omit({ id: true, createdAt: true });
export const insertHealthProfileSchema = createInsertSchema(healthProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBloodAnalysisSchema = createInsertSchema(bloodAnalyses).omit({ id: true, createdAt: true });
export const insertBiomarkerSchema = createInsertSchema(biomarkers).omit({ id: true });
export const insertBiomarkerResultSchema = createInsertSchema(biomarkerResults).omit({ id: true, createdAt: true });
export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertHealthMetricsSchema = createInsertSchema(healthMetrics).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type UserActivityLog = typeof userActivityLogs.$inferSelect;
export type InsertUserActivityLog = z.infer<typeof insertUserActivityLogSchema>;
export type HealthProfile = typeof healthProfiles.$inferSelect;
export type InsertHealthProfile = z.infer<typeof insertHealthProfileSchema>;
export type BloodAnalysis = typeof bloodAnalyses.$inferSelect;
export type InsertBloodAnalysis = z.infer<typeof insertBloodAnalysisSchema>;
export type Biomarker = typeof biomarkers.$inferSelect;
export type InsertBiomarker = z.infer<typeof insertBiomarkerSchema>;
export type BiomarkerResult = typeof biomarkerResults.$inferSelect;
export type InsertBiomarkerResult = z.infer<typeof insertBiomarkerResultSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type HealthMetrics = typeof healthMetrics.$inferSelect;
export type InsertHealthMetrics = z.infer<typeof insertHealthMetricsSchema>;
