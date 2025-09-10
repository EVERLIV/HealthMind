import { supabase, isSupabaseConnected } from './supabase';
import type { 
  User, 
  InsertUser, 
  HealthProfile, 
  InsertHealthProfile,
  BloodAnalysis,
  InsertBloodAnalysis,
  Biomarker,
  BiomarkerResult,
  InsertBiomarkerResult,
  ChatSession,
  InsertChatSession,
  ChatMessage,
  InsertChatMessage,
  HealthMetrics,
  InsertHealthMetrics
} from '@shared/schema';

// User Management
export class UserService {
  static async createUser(userData: InsertUser): Promise<User | null> {
    if (!isSupabaseConnected()) return null;
    
    const { data, error } = await supabase!
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    
    return data;
  }

  static async getUserById(id: string): Promise<User | null> {
    if (!isSupabaseConnected()) return null;
    
    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    if (!isSupabaseConnected()) return null;
    
    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
    
    return data;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    if (!isSupabaseConnected()) return null;
    
    const { data, error } = await supabase!
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    
    return data;
  }
}

// Health Profile Management
export class HealthProfileService {
  static async createProfile(profileData: InsertHealthProfile): Promise<HealthProfile | null> {
    if (!isSupabaseConnected()) return null;
    
    const { data, error } = await supabase!
      .from('health_profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating health profile:', error);
      return null;
    }
    
    return data;
  }

  static async getProfileByUserId(userId: string): Promise<HealthProfile | null> {
    if (!isSupabaseConnected()) return null;
    
    const { data, error } = await supabase!
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching health profile:', error);
      return null;
    }
    
    return data;
  }

  static async updateProfile(userId: string, updates: Partial<HealthProfile>): Promise<HealthProfile | null> {
    if (!isSupabaseConnected()) return null;
    
    const { data, error } = await supabase!
      .from('health_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating health profile:', error);
      return null;
    }
    
    return data;
  }
}

// Blood Analysis Management
export class BloodAnalysisService {
  static async createAnalysis(analysisData: InsertBloodAnalysis): Promise<BloodAnalysis | null> {
    if (!isSupabaseConnected()) return null;
    
    const { data, error } = await supabase!
      .from('blood_analyses')
      .insert(analysisData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating blood analysis:', error);
      return null;
    }
    
    return data;
  }

  static async getAnalysesByUserId(userId: string): Promise<BloodAnalysis[]> {
    if (!isSupabaseConnected()) return [];
    
    const { data, error } = await supabase!
      .from('blood_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching blood analyses:', error);
      return [];
    }
    
    return data || [];
  }

  static async updateAnalysis(id: string, updates: Partial<BloodAnalysis>): Promise<BloodAnalysis | null> {
    if (!isSupabaseConnected()) return null;
    
    const { data, error } = await supabase!
      .from('blood_analyses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating blood analysis:', error);
      return null;
    }
    
    return data;
  }
}

// Biomarker Management
export class BiomarkerService {
  static async getAllBiomarkers(): Promise<Biomarker[]> {
    if (!isSupabaseConnected()) return [];
    
    const { data, error } = await supabase!
      .from('biomarkers')
      .select('*')
      .order('category', { ascending: true });
    
    if (error) {
      console.error('Error fetching biomarkers:', error);
      return [];
    }
    
    return data || [];
  }

  static async getBiomarkersByCategory(category: string): Promise<Biomarker[]> {
    if (!isSupabaseConnected()) return [];
    
    const { data, error } = await supabase!
      .from('biomarkers')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching biomarkers by category:', error);
      return [];
    }
    
    return data || [];
  }

  static async createBiomarkerResult(resultData: InsertBiomarkerResult): Promise<BiomarkerResult | null> {
    if (!isSupabaseConnected()) return null;
    
    const { data, error } = await supabase!
      .from('biomarker_results')
      .insert(resultData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating biomarker result:', error);
      return null;
    }
    
    return data;
  }

  static async getBiomarkerResultsByAnalysisId(analysisId: string): Promise<BiomarkerResult[]> {
    if (!isSupabaseConnected()) return [];
    
    const { data, error } = await supabase!
      .from('biomarker_results')
      .select(`
        *,
        biomarkers (
          name,
          description,
          normal_range,
          category,
          importance,
          recommendations
        )
      `)
      .eq('analysis_id', analysisId);
    
    if (error) {
      console.error('Error fetching biomarker results:', error);
      return [];
    }
    
    return data || [];
  }
}

// Chat Management
export class ChatService {
  static async createSession(sessionData: InsertChatSession): Promise<ChatSession | null> {
    if (!isSupabaseConnected()) return null;
    
    const { data, error } = await supabase!
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating chat session:', error);
      return null;
    }
    
    return data;
  }

  static async getSessionsByUserId(userId: string): Promise<ChatSession[]> {
    if (!isSupabaseConnected()) return [];
    
    const { data, error } = await supabase!
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }
    
    return data || [];
  }

  static async createMessage(messageData: InsertChatMessage): Promise<ChatMessage | null> {
    if (!isSupabaseConnected()) return null;
    
    const { data, error } = await supabase!
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating chat message:', error);
      return null;
    }
    
    return data;
  }

  static async getMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
    if (!isSupabaseConnected()) return [];
    
    const { data, error } = await supabase!
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
    
    return data || [];
  }
}

// Health Metrics Management
export class HealthMetricsService {
  static async createMetrics(metricsData: InsertHealthMetrics): Promise<HealthMetrics | null> {
    if (!isSupabaseConnected()) return null;
    
    const { data, error } = await supabase!
      .from('health_metrics')
      .insert(metricsData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating health metrics:', error);
      return null;
    }
    
    return data;
  }

  static async getMetricsByUserId(userId: string, limit: number = 30): Promise<HealthMetrics[]> {
    if (!isSupabaseConnected()) return [];
    
    const { data, error } = await supabase!
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching health metrics:', error);
      return [];
    }
    
    return data || [];
  }
}
