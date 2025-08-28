import { type User, type InsertUser, type HealthProfile, type InsertHealthProfile, type BloodAnalysis, type InsertBloodAnalysis, type Biomarker, type InsertBiomarker, type BiomarkerResult, type InsertBiomarkerResult, type ChatSession, type InsertChatSession, type ChatMessage, type InsertChatMessage, type HealthMetrics, type InsertHealthMetrics } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  
  // Health Profiles
  getHealthProfile(userId: string): Promise<HealthProfile | undefined>;
  createHealthProfile(profile: InsertHealthProfile): Promise<HealthProfile>;
  updateHealthProfile(userId: string, profile: Partial<InsertHealthProfile>): Promise<HealthProfile>;
  
  // Blood Analyses
  getBloodAnalysis(id: string): Promise<BloodAnalysis | undefined>;
  getBloodAnalysesByUser(userId: string): Promise<BloodAnalysis[]>;
  createBloodAnalysis(analysis: InsertBloodAnalysis): Promise<BloodAnalysis>;
  updateBloodAnalysis(id: string, analysis: Partial<InsertBloodAnalysis>): Promise<BloodAnalysis>;
  
  // Biomarkers
  getAllBiomarkers(): Promise<Biomarker[]>;
  getBiomarker(id: string): Promise<Biomarker | undefined>;
  createBiomarker(biomarker: InsertBiomarker): Promise<Biomarker>;
  
  // Biomarker Results
  getBiomarkerResults(analysisId: string): Promise<BiomarkerResult[]>;
  createBiomarkerResult(result: InsertBiomarkerResult): Promise<BiomarkerResult>;
  
  // Chat Sessions
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getChatSessionsByUser(userId: string): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  
  // Chat Messages
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Health Metrics
  getLatestHealthMetrics(userId: string): Promise<HealthMetrics | undefined>;
  getHealthMetrics(userId: string): Promise<HealthMetrics[]>;
  createHealthMetrics(metrics: InsertHealthMetrics): Promise<HealthMetrics>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private healthProfiles: Map<string, HealthProfile>;
  private bloodAnalyses: Map<string, BloodAnalysis>;
  private biomarkers: Map<string, Biomarker>;
  private biomarkerResults: Map<string, BiomarkerResult>;
  private chatSessions: Map<string, ChatSession>;
  private chatMessages: Map<string, ChatMessage>;
  private healthMetrics: Map<string, HealthMetrics>;

  constructor() {
    this.users = new Map();
    this.healthProfiles = new Map();
    this.bloodAnalyses = new Map();
    this.biomarkers = new Map();
    this.biomarkerResults = new Map();
    this.chatSessions = new Map();
    this.chatMessages = new Map();
    this.healthMetrics = new Map();
    
    this.seedData();
  }

  private seedData() {
    // Create default user
    const defaultUser: User = {
      id: "user-1",
      username: "anna_user",
      email: "anna@example.com",
      name: "Анна",
      passwordHash: "$2b$12$Wq0sk.Th.nhoN5NDXbKBxOMLsaod9aWz5f4AyjmOEfTTTzCyV9/Ui", // password: "password123"
      role: "user",
      subscriptionType: "premium",
      subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isEmailVerified: 1,
      emailVerificationToken: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Note: Health profile will be created when user completes the wizard

    // Create sample biomarkers
    const sampleBiomarkers: Biomarker[] = [
      {
        id: "bio-1",
        name: "Гемоглобин",
        description: "Белок в красных кровяных клетках, переносящий кислород",
        normalRange: { min: 120, max: 150, unit: "г/л" },
        category: "blood",
        importance: "high",
        recommendations: ["Увеличить потребление железа", "Проконсультироваться с врачом при отклонениях"] as string[],
      },
      {
        id: "bio-2",
        name: "Холестерин общий",
        description: "Жироподобное вещество, важное для клеточных мембран",
        normalRange: { min: 0, max: 5.2, unit: "ммоль/л" },
        category: "cardiovascular",
        importance: "high",
        recommendations: ["Ограничить насыщенные жиры", "Увеличить физическую активность"] as string[],
      },
      {
        id: "bio-3",
        name: "Глюкоза",
        description: "Основной источник энергии для клеток организма",
        normalRange: { min: 3.9, max: 6.1, unit: "ммоль/л" },
        category: "metabolic",
        importance: "high",
        recommendations: ["Контролировать потребление углеводов", "Регулярные физические нагрузки"] as string[],
      },
      {
        id: "bio-4",
        name: "Креатинин",
        description: "Продукт распада креатина, показатель функции почек",
        normalRange: { min: 44, max: 97, unit: "мкмоль/л" },
        category: "kidney",
        importance: "medium",
        recommendations: ["Поддерживать адекватную гидратацию", "Избегать чрезмерных физических нагрузок"] as string[],
      },
    ];

    sampleBiomarkers.forEach(biomarker => {
      this.biomarkers.set(biomarker.id, biomarker);
    });

    // Create sample health metrics
    const healthMetrics: HealthMetrics = {
      id: "metrics-1",
      userId: defaultUser.id,
      heartRate: 72,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      temperature: "36.6",
      recordedAt: new Date(),
      createdAt: new Date(),
    };
    this.healthMetrics.set(healthMetrics.id, healthMetrics);

    // Create sample blood analysis
    const bloodAnalysis: BloodAnalysis = {
      id: "analysis-1",
      userId: defaultUser.id,
      imageUrl: "/objects/uploads/sample-blood-test.jpg",
      results: {
        summary: "Общий анализ крови показывает хорошие результаты. Большинство показателей в пределах нормы, обнаружен повышенный уровень холестерина.",
        markers: [
          { name: "Гемоглобин", value: "138 г/л", status: "normal", recommendation: "Поддерживать текущий уровень", education: "Гемоглобин переносит кислород в крови" },
          { name: "Холестерин", value: "6.2 ммоль/л", status: "high", recommendation: "Снизить потребление жирной пищи", education: "Холестерин важен для здоровья сосудов" },
          { name: "Глюкоза", value: "5.1 ммоль/л", status: "normal", recommendation: "Поддерживать здоровый образ жизни", education: "Глюкоза - основной источник энергии" },
          { name: "Креатинин", value: "82 мкмоль/л", status: "normal", recommendation: "Пить достаточно воды", education: "Креатинин показывает работу почек" },
        ],
        recommendations: ["Снизить потребление насыщенных жиров", "Увеличить физическую активность"],
        riskFactors: ["Повышенный холестерин может привести к сердечно-сосудистым заболеваниям"],
      },
      status: "analyzed",
      analyzedAt: new Date("2024-12-15"),
      createdAt: new Date("2024-12-15"),
    };
    this.bloodAnalyses.set(bloodAnalysis.id, bloodAnalysis);

    // Create sample biomarker results
    const biomarkerResults: BiomarkerResult[] = [
      { id: "result-1", analysisId: bloodAnalysis.id, biomarkerId: "bio-1", value: "138", unit: "г/л", status: "normal", createdAt: new Date() },
      { id: "result-2", analysisId: bloodAnalysis.id, biomarkerId: "bio-2", value: "6.2", unit: "ммоль/л", status: "high", createdAt: new Date() },
      { id: "result-3", analysisId: bloodAnalysis.id, biomarkerId: "bio-3", value: "5.1", unit: "ммоль/л", status: "normal", createdAt: new Date() },
      { id: "result-4", analysisId: bloodAnalysis.id, biomarkerId: "bio-4", value: "82", unit: "мкмоль/л", status: "normal", createdAt: new Date() },
    ];

    biomarkerResults.forEach(result => {
      this.biomarkerResults.set(result.id, result);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date(),
      role: insertUser.role || 'user',
      subscriptionType: insertUser.subscriptionType || 'free',
      subscriptionExpiresAt: null,
      isEmailVerified: 0,
      emailVerificationToken: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      lastLoginAt: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Health Profiles
  async getHealthProfile(userId: string): Promise<HealthProfile | undefined> {
    return Array.from(this.healthProfiles.values()).find(profile => profile.userId === userId);
  }

  async createHealthProfile(insertProfile: InsertHealthProfile): Promise<HealthProfile> {
    const id = randomUUID();
    const profile = { 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date(),
      userId: insertProfile.userId,
      age: insertProfile.age ?? null,
      weight: insertProfile.weight ?? null,
      height: insertProfile.height ?? null,
      medicalConditions: Array.isArray(insertProfile.medicalConditions) ? insertProfile.medicalConditions : null,
      medications: Array.isArray(insertProfile.medications) ? insertProfile.medications : null,
      profileData: (insertProfile as any).profileData ?? null,
      completionPercentage: insertProfile.completionPercentage ?? 0,
    } as HealthProfile;
    this.healthProfiles.set(id, profile);
    return profile;
  }

  async updateHealthProfile(userId: string, updates: Partial<InsertHealthProfile>): Promise<HealthProfile> {
    const existing = await this.getHealthProfile(userId);
    if (!existing) {
      throw new Error("Health profile not found");
    }
    const updated = { 
      ...existing,
      age: updates.age !== undefined ? updates.age : existing.age,
      weight: updates.weight !== undefined ? updates.weight : existing.weight,
      height: updates.height !== undefined ? updates.height : existing.height,
      medicalConditions: updates.medicalConditions !== undefined ? (Array.isArray(updates.medicalConditions) ? updates.medicalConditions : null) : existing.medicalConditions,
      medications: updates.medications !== undefined ? (Array.isArray(updates.medications) ? updates.medications : null) : existing.medications,
      profileData: updates.profileData !== undefined ? updates.profileData : (existing as any).profileData,
      completionPercentage: updates.completionPercentage !== undefined ? updates.completionPercentage : existing.completionPercentage,
      updatedAt: new Date() 
    } as HealthProfile;
    this.healthProfiles.set(existing.id, updated);
    return updated;
  }

  // Blood Analyses
  async getBloodAnalysis(id: string): Promise<BloodAnalysis | undefined> {
    return this.bloodAnalyses.get(id);
  }

  async getBloodAnalysesByUser(userId: string): Promise<BloodAnalysis[]> {
    return Array.from(this.bloodAnalyses.values()).filter(analysis => analysis.userId === userId);
  }

  async createBloodAnalysis(insertAnalysis: InsertBloodAnalysis): Promise<BloodAnalysis> {
    const id = randomUUID();
    const analysis: BloodAnalysis = { 
      id, 
      createdAt: new Date(),
      userId: insertAnalysis.userId,
      imageUrl: insertAnalysis.imageUrl ?? null,
      results: insertAnalysis.results ?? null,
      status: insertAnalysis.status ?? "pending",
      analyzedAt: insertAnalysis.analyzedAt ?? null,
    };
    this.bloodAnalyses.set(id, analysis);
    return analysis;
  }

  async updateBloodAnalysis(id: string, updates: Partial<InsertBloodAnalysis>): Promise<BloodAnalysis> {
    const existing = this.bloodAnalyses.get(id);
    if (!existing) {
      throw new Error("Blood analysis not found");
    }
    const updated: BloodAnalysis = { ...existing, ...updates };
    this.bloodAnalyses.set(id, updated);
    return updated;
  }

  // Biomarkers
  async getAllBiomarkers(): Promise<Biomarker[]> {
    return Array.from(this.biomarkers.values());
  }

  async getBiomarker(id: string): Promise<Biomarker | undefined> {
    return this.biomarkers.get(id);
  }

  async createBiomarker(insertBiomarker: InsertBiomarker): Promise<Biomarker> {
    const id = randomUUID();
    const biomarker: Biomarker = { 
      id,
      name: insertBiomarker.name,
      description: insertBiomarker.description,
      category: insertBiomarker.category,
      importance: insertBiomarker.importance,
      normalRange: insertBiomarker.normalRange ?? null,
      recommendations: Array.isArray(insertBiomarker.recommendations) ? insertBiomarker.recommendations as string[] : null,
    };
    this.biomarkers.set(id, biomarker);
    return biomarker;
  }

  // Biomarker Results
  async getBiomarkerResults(analysisId: string): Promise<BiomarkerResult[]> {
    return Array.from(this.biomarkerResults.values()).filter(result => result.analysisId === analysisId);
  }

  async createBiomarkerResult(insertResult: InsertBiomarkerResult): Promise<BiomarkerResult> {
    const id = randomUUID();
    const result: BiomarkerResult = { 
      ...insertResult, 
      id, 
      createdAt: new Date() 
    };
    this.biomarkerResults.set(id, result);
    return result;
  }

  // Chat Sessions
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getChatSessionsByUser(userId: string): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values()).filter(session => session.userId === userId);
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = { 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date(),
      userId: insertSession.userId,
      title: insertSession.title ?? null,
    };
    this.chatSessions.set(id, session);
    return session;
  }

  // Chat Messages
  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      createdAt: new Date() 
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Health Metrics
  async getLatestHealthMetrics(userId: string): Promise<HealthMetrics | undefined> {
    const userMetrics = Array.from(this.healthMetrics.values())
      .filter(metrics => metrics.userId === userId)
      .sort((a, b) => (b.recordedAt?.getTime() ?? 0) - (a.recordedAt?.getTime() ?? 0));
    return userMetrics[0];
  }

  async getHealthMetrics(userId: string): Promise<HealthMetrics[]> {
    return Array.from(this.healthMetrics.values())
      .filter(metrics => metrics.userId === userId)
      .sort((a, b) => (b.recordedAt?.getTime() ?? 0) - (a.recordedAt?.getTime() ?? 0));
  }

  async createHealthMetrics(insertMetrics: InsertHealthMetrics): Promise<HealthMetrics> {
    const id = randomUUID();
    const metrics: HealthMetrics = { 
      id, 
      createdAt: new Date(),
      userId: insertMetrics.userId,
      heartRate: insertMetrics.heartRate ?? null,
      bloodPressureSystolic: insertMetrics.bloodPressureSystolic ?? null,
      bloodPressureDiastolic: insertMetrics.bloodPressureDiastolic ?? null,
      temperature: insertMetrics.temperature ?? null,
      recordedAt: insertMetrics.recordedAt ?? null,
    };
    this.healthMetrics.set(id, metrics);
    return metrics;
  }
}

export const storage = new MemStorage();
