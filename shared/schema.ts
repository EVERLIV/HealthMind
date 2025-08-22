import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
  analyzedAt: timestamp("analyzed_at"),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
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
