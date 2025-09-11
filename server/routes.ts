import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import OpenAI from "openai";
import OpenAIVisionService from "./openaiVisionService";
import DeepSeekVisionService from "./deepSeekVisionService";
import { authenticate, createSession, type AuthenticatedRequest, hashPassword, verifyPassword } from "./auth";
import {
  insertChatSessionSchema,
  insertChatMessageSchema,
  insertHealthProfileSchema,
  users,
} from "@shared/schema";
import { db } from "./db";

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

      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Неверный email или пароль" });
      }

      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];
      const { token } = await createSession(user.id, ipAddress, userAgent);

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

      // Check if username exists (we need to add this method to storage)
      // For now, we'll skip this check since getUserByUsername doesn't exist

      const passwordHash = await hashPassword(password);

      const newUser = await storage.createUser({
        email,
        username,
        name,
        passwordHash,
        role: 'user',
        subscriptionType: 'basic'
      });

      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];
      const { token } = await createSession(newUser.id, ipAddress, userAgent);

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

      const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(400).json({ error: "Неверный текущий пароль" });
      }

      const newPasswordHash = await hashPassword(newPassword);
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

  // Database health check endpoint
  app.get("/api/health/database", async (req, res) => {
    try {
      if (!db) {
        return res.status(500).json({ 
          status: "error", 
          message: "Database not configured - DATABASE_URL not set",
          database: "not_configured"
        });
      }

      // Try to query the database
      const result = await db.select().from(users).limit(1);
      
      res.json({ 
        status: "ok", 
        message: "Database connection successful",
        database: "connected",
        userCount: result.length
      });
    } catch (error) {
      console.error("Database health check error:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Database connection failed",
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Debug environment variables endpoint
  app.get("/api/debug/env", async (req, res) => {
    res.json({
      NODE_ENV: process.env.NODE_ENV,
      HAS_DATABASE_URL: !!process.env.DATABASE_URL,
      HAS_JWT_SECRET: !!process.env.JWT_SECRET,
      HAS_SUPABASE_URL: !!process.env.SUPABASE_URL,
      HAS_SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20) + "...",
      timestamp: new Date().toISOString()
    });
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