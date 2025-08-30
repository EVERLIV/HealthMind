import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import OpenAI from "openai";
import OpenAIVisionService from "./openaiVisionService";
import { DeepSeekVisionService } from "./deepSeekVisionService";
import { authenticate, createSession, type AuthenticatedRequest } from "./auth";
import { ObjectStorageService } from "./objectStorage";
import {
  insertChatSessionSchema,
  insertChatMessageSchema,
  insertHealthProfileSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email и пароль обязательны" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Неверный email или пароль" });
      }

      const bcrypt = await import('bcrypt');
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Неверный email или пароль" });
      }

      const { token } = await createSession(user.id);

      const userResponse = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        subscriptionType: user.subscriptionType
      };

      res.json({ user: userResponse, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, username, password, name } = req.body;
      
      if (!email || !username || !password || !name) {
        return res.status(400).json({ error: "Все поля обязательны" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Пользователь с таким email уже существует" });
      }

      const bcrypt = await import('bcrypt');
      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = await storage.createUser({
        email,
        username,
        name,
        passwordHash,
        role: 'user',
        subscriptionType: 'free'
      });

      const { token } = await createSession(newUser.id);

      const userResponse = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        subscriptionType: newUser.subscriptionType
      };

      res.json({ user: userResponse, token });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  app.get("/api/auth/me", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      const userResponse = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        subscriptionType: user.subscriptionType
      };

      res.json(userResponse);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  app.post("/api/auth/logout", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      // In a real app, you might want to blacklist the token
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  app.patch("/api/auth/profile", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const { email, username, name } = req.body;
      
      const updatedUser = await storage.updateUser(req.user.id, {
        email,
        username,
        name
      });

      const userResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role,
        subscriptionType: updatedUser.subscriptionType
      };

      res.json(userResponse);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  app.post("/api/auth/change-password", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Все поля обязательны" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      const bcrypt = await import('bcrypt');
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(400).json({ error: "Неверный текущий пароль" });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      await storage.updateUser(req.user.id, { passwordHash: newPasswordHash });

      res.json({ message: "Пароль успешно изменен" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Chat sessions
  app.get("/api/chat-sessions", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const sessions = await storage.getChatSessions(req.user.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat-sessions", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const validatedData = insertChatSessionSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const session = await storage.createChatSession(validatedData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.get("/api/chat-sessions/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const session = await storage.getChatSession(req.params.id);
      if (!session || session.userId !== req.user.id) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.get("/api/chat-sessions/:id/messages", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const session = await storage.getChatSession(req.params.id);
      if (!session || session.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const messages = await storage.getChatMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat-sessions/:id/analyze-image", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const { imageBase64, mimeType, question } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Image data is required" });
      }

      console.log('Chat image analysis - MIME type:', mimeType);

      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return res.status(500).json({ 
          error: "OpenAI API key not configured for image analysis",
        });
      }

      // Try to use DeepSeek Vision to analyze the image
      let imageAnalysis;
      const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
      
      if (deepSeekApiKey) {
        try {
          const deepSeekService = new DeepSeekVisionService(deepSeekApiKey);
          const analysisPrompt = question || "Проанализируйте это изображение на предмет кожных заболеваний, проблем кожи, симптомов или других медицинских вопросов. Дайте профессиональные медицинские рекомендации и возможный диагноз.";
          imageAnalysis = await deepSeekService.analyzeHealthImage(imageBase64, mimeType, analysisPrompt);
        } catch (deepSeekError: any) {
          console.log('DeepSeek Vision failed, trying OpenAI fallback');
          
          // Fallback to OpenAI if DeepSeek fails
          try {
            const openaiService = new OpenAIVisionService(openaiApiKey);
            const analysisPrompt = question || "Проанализируйте это изображение на предмет кожных заболеваний, проблем кожи, симптомов или других медицинских вопросов. Дайте профессиональные медицинские рекомендации и возможный диагноз.";
            imageAnalysis = await openaiService.analyzeHealthImage(imageBase64, mimeType, analysisPrompt);
          } catch (openaiError: any) {
            console.log('Both DeepSeek and OpenAI Vision failed, using intelligent fallback');
            
            if (deepSeekError.message?.includes('quota') || openaiError.status === 429) {
              imageAnalysis = `📸 **Изображение получено! Анализ временно недоступен**

🤖 **Я готов помочь с анализом! Опишите подробно:**

**📋 Что именно на фотографии?**
• Кожная проблема (родинка, высыпание, пятно)?
• Медицинские документы или анализы?
• Симптомы или внешние изменения?
• Что именно вас беспокоит?

**🩺 Для более точного анализа укажите:**
• Расположение проблемы на теле
• Когда впервые заметили изменения
• Есть ли симптомы (зуд, боль, жжение)
• Размер, цвет, форма (если это кожная проблема)
• Принимаете ли какие-то лекарства

**💡 После вашего описания я смогу дать:**
• Предварительную медицинскую оценку
• Рекомендации по уходу
• Информацию о том, нужно ли обратиться к врачу
• Объяснение возможных причин

⚠️ **Важно**: При серьезных симптомах не откладывайте визит к врачу!

💬 **Опишите что на фото, и я помогу!**`;
            } else {
              imageAnalysis = `🔧 **Фото получено! Временные технические сложности**

**💭 Что на изображении? Опишите:**
• Кожная проблема или симптомы?
• Медицинские результаты?
• Что именно вас беспокоит?

🎯 **Я помогу на основе описания!**

⚠️ При серьезных симптомах обратитесь к врачу.`;
            }
          }
        }
      } else {
        // No DeepSeek API key available, use OpenAI fallback
        try {
          const openaiService = new OpenAIVisionService(openaiApiKey);
          const analysisPrompt = question || "Проанализируйте это изображение на предмет кожных заболеваний, проблем кожи, симптомов или других медицинских вопросов. Дайте профессиональные медицинские рекомендации и возможный диагноз.";
          imageAnalysis = await openaiService.analyzeHealthImage(imageBase64, mimeType, analysisPrompt);
        } catch (error: any) {
          console.log('OpenAI Vision fallback failed');
          imageAnalysis = `📸 **Фото получено! Сервис анализа недоступен**
          
🤖 Опишите что на изображении, и я помогу с анализом текстом!`;
        }
      }
      
      // Send the analysis result directly without additional processing
      res.json({ analysis: imageAnalysis });
    } catch (error) {
      console.error("Error analyzing chat image:", error);
      res.status(500).json({ error: "Image analysis failed" });
    }
  });

  app.post("/api/chat-sessions/:id/messages", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      // Check if session belongs to user
      const session = await storage.getChatSession(req.params.id);
      if (!session || session.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const validatedData = insertChatMessageSchema.parse({
        ...req.body,
        sessionId: req.params.id,
      });
      const message = await storage.createChatMessage(validatedData);

      // Generate AI response if the message is from user
      if (validatedData.role === "user") {
        const aiResponse = await generateAIResponse(validatedData.content, req.user.id);
        const aiMessage = await storage.createChatMessage({
          sessionId: req.params.id,
          role: "assistant",
          content: aiResponse,
        });
        res.json([message, aiMessage]);
      } else {
        res.json([message]);
      }
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  // Health profiles
  app.get("/api/health-profile", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const profile = await storage.getHealthProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch health profile" });
    }
  });

  app.put("/api/health-profile", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const userId = req.user.id;
      const profileData = req.body;
      
      // Check if profile exists
      const existingProfile = await storage.getHealthProfile(userId);
      
      if (existingProfile) {
        // Update existing profile
        const updated = await storage.updateHealthProfile(userId, profileData);
        res.json(updated);
      } else {
        // Create new profile
        const profile = await storage.createHealthProfile({
          userId,
          ...profileData,
        });
        res.json(profile);
      }
    } catch (error) {
      console.error("Error saving health profile:", error);
      res.status(500).json({ error: "Failed to save health profile" });
    }
  });

  app.post("/api/health-profile/complete", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const userId = req.user.id;
      const profileData = req.body;
      
      // Check if profile exists
      const existingProfile = await storage.getHealthProfile(userId);
      
      if (existingProfile) {
        // Update existing profile
        const updated = await storage.updateHealthProfile(userId, {
          profileData,
          completionPercentage: 100,
          age: profileData.age,
          weight: profileData.weight?.toString(),
          height: profileData.height?.toString(),
          medicalConditions: profileData.chronicConditions,
          medications: profileData.currentMedications?.map((m: any) => m.name),
        });
        res.json(updated);
      } else {
        // Create new profile
        const profile = await storage.createHealthProfile({
          userId,
          profileData,
          completionPercentage: 100,
          age: profileData.age,
          weight: profileData.weight?.toString(),
          height: profileData.height?.toString(),
          medicalConditions: profileData.chronicConditions,
          medications: profileData.currentMedications?.map((m: any) => m.name),
        });
        res.json(profile);
      }
    } catch (error) {
      console.error("Error saving health profile:", error);
      res.status(500).json({ error: "Failed to save health profile" });
    }
  });

  // AI Consultation endpoint
  app.post("/api/ai-consultation", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const { question, healthProfile, bloodAnalyses } = req.body;
      
      if (!question || !question.trim()) {
        return res.status(400).json({ error: "Вопрос обязателен" });
      }

      // Prepare detailed user context for consultation
      let userContext = "";
      
      if (healthProfile?.profileData) {
        const pd = healthProfile.profileData;
        userContext += `\nДанные профиля пользователя:`;
        if (pd.age) userContext += `\n- Возраст: ${pd.age} лет`;
        if (pd.gender) userContext += `\n- Пол: ${pd.gender}`;
        if (pd.height && pd.weight) {
          const bmi = pd.weight / ((pd.height/100) ** 2);
          userContext += `\n- Рост: ${pd.height} см, Вес: ${pd.weight} кг (ИМТ: ${bmi.toFixed(1)})`;
        }
        if (pd.activityLevel) userContext += `\n- Уровень активности: ${pd.activityLevel}`;
        if (pd.smokingStatus) userContext += `\n- Курение: ${pd.smokingStatus}`;
        if (pd.alcoholConsumption) userContext += `\n- Алкоголь: ${pd.alcoholConsumption}`;
        if (pd.sleepHours) userContext += `\n- Сон: ${pd.sleepHours} часов`;
        if (pd.stressLevel) userContext += `\n- Уровень стресса: ${pd.stressLevel}`;
        if (pd.healthGoals?.length > 0) userContext += `\n- Цели здоровья: ${pd.healthGoals.join(', ')}`;
        if (pd.chronicConditions?.length > 0) userContext += `\n- Хронические заболевания: ${pd.chronicConditions.join(', ')}`;
        if (pd.allergies?.length > 0) userContext += `\n- Аллергии: ${pd.allergies.join(', ')}`;
        if (pd.currentMedications?.length > 0) {
          userContext += `\n- Текущие лекарства: ${pd.currentMedications.map((m: any) => `${m.name} ${m.dosage} ${m.frequency}`).join(', ')}`;
        }
      }

      if (bloodAnalyses && Array.isArray(bloodAnalyses) && bloodAnalyses.length > 0) {
        const latestAnalysis = bloodAnalyses[0];
        if (latestAnalysis?.biomarkers?.length > 0) {
          userContext += `\n\nПоследние анализы крови:`;
          latestAnalysis.biomarkers.forEach((biomarker: any) => {
            userContext += `\n- ${biomarker.name}: ${biomarker.value} ${biomarker.unit || ''} (норма: ${biomarker.referenceRange || 'не указана'})`;
          });
        }
      }

      // Generate comprehensive consultation using DeepSeek
      const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
      if (!deepSeekApiKey) {
        return res.json({ 
          analysis: "ИИ-консультант временно недоступен. Обратитесь позже.",
          recommendations: ["Проконсультируйтесь с врачом"],
          priority: "medium",
          followUp: ["Повторите запрос позже"],
          disclaimer: "Данная консультация недоступна из-за технических проблем."
        });
      }

      try {
        const systemPrompt = `Ты - эксперт по превентивной медицине, нутрициологии и биохакингу. Твоя специализация - персонализированные рекомендации по здоровью и долголетию на основе биомаркеров и научных данных.

ВАЖНО: Всегда подчеркивай, что твои рекомендации носят информационный характер и не заменяют консультацию врача.

ПРИНЦИПЫ РЕКОМЕНДАЦИЙ:
- Основывайся только на evidence-based подходах
- Указывай конкретные дозировки и бренды БАДов (если уместно)
- Учитывай возможные взаимодействия добавок
- Рекомендуй последовательность внедрения (что сначала, что потом)
- Указывай временные рамки для оценки эффекта
- Фокусируйся на безопасности превыше всего

ОБЯЗАТЕЛЬНЫЙ ФОРМАТ ОТВЕТА (JSON):
{
  "analysis": "1. АНАЛИЗ БИОМАРКЕРОВ: [анализ предоставленных показателей крови с расшифровкой отклонений] 2. ОЦЕНКА ТЕКУЩЕГО СОСТОЯНИЯ: [общая оценка здоровья на основе данных профиля] 3. РИСКИ И ВОЗМОЖНОСТИ: [выявленные риски и потенциал для улучшения]",
  "recommendations": [
    "🎯 ПРИОРИТЕТ 1: [конкретное действие с дозировкой/частотой]",
    "💊 БАД-ПРОТОКОЛ: [название добавки, дозировка, время приема, длительность курса]",
    "🏃 ФИЗИЧЕСКАЯ АКТИВНОСТЬ: [тип, интенсивность, частота, прогрессия]",
    "🥗 ПИТАНИЕ: [конкретные продукты, исключения, время приема]",
    "😴 СОН И ВОССТАНОВЛЕНИЕ: [режим, продолжительность, условия]",
    "📊 МОНИТОРИНГ: [какие анализы сдать через сколько недель/месяцев]",
    "⏰ ПОСЛЕДОВАТЕЛЬНОСТЬ: [что внедрять в первую очередь, что через 2-4 недели]"
  ],
  "priority": "high|medium|low",
  "followUp": [
    "📋 Анализы через [срок]: [перечень конкретных маркеров]",
    "🔄 Повторная оценка через [срок]: [что отслеживать]",
    "👨‍⚕️ Консультация специалиста: [когда и к какому врачу]",
    "📈 Контрольные точки: [конкретные показатели для мониторинга]"
  ],
  "disclaimer": "⚠️ ВАЖНО: Данные рекомендации носят информационный характер и основаны на научных исследованиях. Обязательно проконсультируйтесь с квалифицированным врачом перед началом приема БАДов или изменением образа жизни, особенно при наличии хронических заболеваний или приеме лекарственных препаратов."
}

КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ:
${userContext}

ДЕВИЗ: "Get Your Health in order - научно, безопасно, персонально"`;

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${deepSeekApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: question }
            ],
            max_tokens: 1200,
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
        });

        if (!response.ok) {
          throw new Error(`DeepSeek API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content;
        
        if (!aiResponse) {
          throw new Error("Empty response from DeepSeek");
        }

        // Parse and validate JSON response
        const consultation = JSON.parse(aiResponse);
        
        // Ensure required fields exist
        const validatedConsultation = {
          analysis: consultation.analysis || "Не удалось проанализировать ваш запрос.",
          recommendations: Array.isArray(consultation.recommendations) ? consultation.recommendations : ["Обратитесь к врачу для консультации"],
          priority: ["high", "medium", "low"].includes(consultation.priority) ? consultation.priority : "medium",
          followUp: Array.isArray(consultation.followUp) ? consultation.followUp : ["Проконсультируйтесь с врачом"],
          disclaimer: consultation.disclaimer || "Данные рекомендации не заменяют консультацию врача."
        };

        res.json(validatedConsultation);

      } catch (error: any) {
        console.error("Error in DeepSeek consultation:", error);
        
        // Fallback consultation response
        res.json({
          analysis: `Я готов помочь с вашим вопросом: "${question.substring(0, 100)}..."\n\nК сожалению, сейчас ИИ-анализ недоступен, но могу дать общие рекомендации. ${userContext ? 'Учитывая ваш профиль здоровья, ' : ''}рекомендую обратиться к врачу для персональной консультации.`,
          recommendations: [
            "Обратитесь к врачу для профессиональной консультации",
            "Ведите дневник симптомов и изменений",
            "Соблюдайте здоровый образ жизни",
            "Следите за показателями здоровья"
          ],
          priority: "medium",
          followUp: [
            "Запишитесь на прием к врачу",
            "Подготовьте список вопросов для консультации",
            "Возвращайтесь за консультацией позже"
          ],
          disclaimer: "⚠️ Важно: Данные рекомендации носят общий характер и не заменяют медицинскую консультацию. При серьезных симптомах немедленно обращайтесь к врачу!"
        });
      }
    } catch (error) {
      console.error("Consultation endpoint error:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Object storage endpoints
  app.post("/api/objects/upload", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Blood analysis endpoints
  
  // Get all blood analyses for a user
  app.get("/api/blood-analyses", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const analyses = await storage.getBloodAnalyses(req.user.id);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching blood analyses:", error);
      res.status(500).json({ error: "Failed to fetch blood analyses" });
    }
  });

  // Create a new blood analysis
  app.post("/api/blood-analyses", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const analysisData = {
        id: randomUUID(),
        userId: req.user.id,
        status: req.body.status || "pending",
        aiAnalysis: req.body.aiAnalysis,
        imageUrl: req.body.imageUrl,
      };
      
      const analysis = await storage.createBloodAnalysis(analysisData);
      res.json(analysis);
    } catch (error) {
      console.error("Error creating blood analysis:", error);
      res.status(500).json({ error: "Failed to create blood analysis" });
    }
  });
  
  // Get a specific blood analysis
  app.get("/api/blood-analyses/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const analysis = await storage.getBloodAnalysis(req.params.id);
      
      if (!analysis || analysis.userId !== req.user.id) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching blood analysis:", error);
      res.status(500).json({ error: "Failed to fetch blood analysis" });
    }
  });
  
  // Update a blood analysis
  app.put("/api/blood-analyses/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const analysis = await storage.getBloodAnalysis(req.params.id);
      if (!analysis || analysis.userId !== req.user.id) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      
      const updated = await storage.updateBloodAnalysis(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating blood analysis:", error);
      res.status(500).json({ error: "Failed to update blood analysis" });
    }
  });

  app.post("/api/blood-analyses/:id/extract-text", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Image data is required" });
      }

      console.log('Blood analysis text extraction - MIME type:', mimeType);

      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return res.status(500).json({ 
          error: "OpenAI API key not configured for text extraction",
        });
      }

      try {
        const openaiService = new OpenAIVisionService(openaiApiKey);
        const extractedText = await openaiService.extractTextFromImage(imageBase64, mimeType);
        
        console.log('Text extracted successfully, length:', extractedText.length);
        res.json({ extractedText });
      } catch (error: any) {
        console.error('OpenAI text extraction failed:', error);
        res.status(500).json({ 
          error: "Failed to extract text from image",
          details: error.message 
        });
      }
    } catch (error) {
      console.error("Error extracting text from blood analysis:", error);
      res.status(500).json({ error: "Text extraction failed" });
    }
  });

  app.post("/api/blood-analyses/:id/analyze-text", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Text data is required" });
      }

      console.log('Blood analysis text analysis - text length:', text.length);

      const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
      if (!deepSeekApiKey) {
        return res.status(500).json({ 
          error: "DeepSeek API key not configured for text analysis",
        });
      }

      try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${deepSeekApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: `Вы - эксперт по интерпретации лабораторных анализов крови. Проанализируйте предоставленные данные и выделите биомаркеры.

ВАЖНО: Верните ответ СТРОГО в JSON формате:
{
  "biomarkers": [
    {
      "name": "Название показателя",
      "value": "Значение",
      "unit": "Единица измерения",
      "referenceRange": "Референсные значения",
      "status": "normal|high|low|critical",
      "category": "Общий анализ крови|Биохимия|Гормоны|Другие показатели"
    }
  ],
  "summary": "Краткое резюме состояния здоровья",
  "recommendations": ["Список рекомендаций"]
}

Статусы определяйте сравнивая значение с референсными диапазонами.
Категории: "Общий анализ крови", "Биохимия", "Гормоны", "Другие показатели"`
              },
              {
                role: "user",
                content: `Проанализируйте результаты анализа крови и выделите все биомаркеры:

${text}`
              }
            ],
            max_tokens: 2000,
            temperature: 0.3,
            response_format: { type: "json_object" }
          }),
        });

        if (!response.ok) {
          throw new Error(`DeepSeek API error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const analysisResult = data.choices[0]?.message?.content;
        
        console.log('DeepSeek analysis completed');
        
        // Parse and validate the JSON response
        let parsedResult;
        try {
          parsedResult = JSON.parse(analysisResult);
        } catch (parseError) {
          console.error('Failed to parse DeepSeek response:', parseError);
          return res.status(500).json({ 
            error: "Failed to parse analysis result",
            details: "Invalid JSON response from AI service"
          });
        }

        // Ensure biomarkers array exists
        if (!parsedResult.biomarkers || !Array.isArray(parsedResult.biomarkers)) {
          parsedResult.biomarkers = [];
        }

        // Save the analysis results to database
        const analysisId = req.params.id;
        
        // Update blood analysis with AI results
        await storage.updateBloodAnalysis(analysisId, {
          status: 'analyzed',
          results: {
            summary: parsedResult.summary || 'Анализ завершен',
            recommendations: parsedResult.recommendations || [],
            markers: parsedResult.biomarkers, // UI expects "markers" not "biomarkers"
            biomarkers: parsedResult.biomarkers
          },
          analyzedAt: new Date()
        });

        // Save each biomarker result
        for (const biomarker of parsedResult.biomarkers) {
          // First, create or get the biomarker definition
          let biomarkerDef = (await storage.getBiomarkers()).find(b => b.name === biomarker.name);
          if (!biomarkerDef) {
            biomarkerDef = await storage.createBiomarker({
              name: biomarker.name,
              description: `${biomarker.name} - показатель анализа крови`,
              category: biomarker.category || 'Другие показатели',
              importance: 'medium',
              normalRange: biomarker.referenceRange ? {
                min: parseFloat(biomarker.referenceRange.split('-')[0]) || 0,
                max: parseFloat(biomarker.referenceRange.split('-')[1]) || 100,
                unit: biomarker.unit
              } : null,
              recommendations: []
            });
          }

          // Save the biomarker result linked to this analysis
          await storage.createBiomarkerResult({
            analysisId: analysisId,
            biomarkerId: biomarkerDef.id,
            value: biomarker.value,
            unit: biomarker.unit,
            status: biomarker.status || 'normal'
          });
        }

        res.json({
          biomarkers: parsedResult.biomarkers,
          summary: parsedResult.summary || 'Анализ завершен',
          recommendations: parsedResult.recommendations || []
        });
      } catch (error: any) {
        console.error('DeepSeek text analysis failed:', error);
        res.status(500).json({ 
          error: "Failed to analyze text",
          details: error.message 
        });
      }
    } catch (error) {
      console.error("Error analyzing blood analysis text:", error);
      res.status(500).json({ error: "Text analysis failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function generateAIResponse(
  userMessage: string, 
  userId: string
): Promise<string> {
  try {
    // Get basic user context only when relevant
    const healthProfile = await storage.getHealthProfile(userId);
    
    // Prepare minimal context data
    let userContext = "";
    if (healthProfile?.profileData) {
      const profileData = healthProfile.profileData as any;
      userContext = `Пользователь: Возраст ${profileData?.age || 'не указан'}, Пол ${profileData?.gender || 'не указан'}. `;
    }

    // Use DeepSeek API for AI responses
    const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepSeekApiKey) {
      return "Извините, сервис ИИ временно недоступен. Попробуйте позже или опишите свой вопрос подробнее.";
    }

    try {
      const systemPrompt = `Ты - EVERLIV Помощник, опытный медицинский консультант и ИИ-ассистент по здоровью.
      
      ТВОЯ РОЛЬ:
      - Помогаешь пользователям понимать их здоровье
      - Анализируешь медицинские данные и анализы
      - Даешь персонализированные рекомендации
      - Объясняешь медицинские термины простым языком
      - Всегда напоминаешь о необходимости консультации с врачом
      
      ПРИНЦИПЫ:
      - Будь дружелюбным и заботливым
      - Говори на русском языке
      - Давай конкретные и полезные советы
      - Не ставь диагнозы, только информируй
      - При серьезных симптомах - рекомендуй врача
      
      ${userContext}
      
      ДЕВИЗ: "Get Your Health in order"`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepSeekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "Извините, не смог обработать ваш запрос.";
      
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      
      // Smart fallback responses based on message content
      if (userMessage.toLowerCase().includes("здоров") || 
          userMessage.toLowerCase().includes("симптом") ||
          userMessage.toLowerCase().includes("боль")) {
        return `🤖 **EVERLIV Помощник (офлайн режим)**

Я готов помочь с вашим вопросом о здоровье! 

${userContext}

📝 **Расскажите подробнее:**
• Какие симптомы вас беспокоят?
• Как давно это началось?
• Что уже пробовали для решения?

💡 **Общие рекомендации:**
• При острых симптомах - обращайтесь к врачу
• Ведите здоровый образ жизни
• Следите за питанием и сном
• Регулярно проходите медосмотры

⚠️ **Важно**: Мои советы не заменяют консультацию врача!`;
      }
      
      if (userMessage.toLowerCase().includes("анализ") || 
          userMessage.toLowerCase().includes("кровь")) {
        return `🩺 **Помощь с анализами (офлайн режим)**

Готов помочь разобраться с медицинскими анализами!

📋 **Для консультации опишите:**
• Какие показатели вас интересуют?
• Есть ли отклонения от нормы?
• Какие симптомы беспокоят?

💡 **Я помогу:**
• Объяснить значения показателей
• Дать общие рекомендации
• Рассказать когда нужен врач

⚠️ **Помните**: Точную интерпретацию анализов даст только врач!`;
      }
      
      return `🤖 **EVERLIV Помощник**

Готов ответить на ваш вопрос! ${userContext}

💬 Опишите подробнее что вас интересует, и я постараюсь помочь.

⚠️ При серьезных медицинских вопросах обращайтесь к врачу.`;
    }
  } catch (error) {
    console.error("Error in generateAIResponse:", error);
    return "Извините, произошла ошибка. Попробуйте еще раз.";
  }
}