import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService } from "./objectStorage";
import DeepSeekService, { DeepSeekAnalysisService } from "./deepseekService";
import OpenAI from "openai";
import OpenAIVisionService from "./openaiVisionService";
import { insertBloodAnalysisSchema, insertChatSessionSchema, insertChatMessageSchema, insertHealthMetricsSchema, insertHealthProfileSchema } from "@shared/schema";
import { authenticate, AuthenticatedRequest, logActivity } from "./auth";
import { registerAuthRoutes } from "./authRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register authentication routes
  registerAuthRoutes(app);

  // Health Profile routes (protected)
  app.get("/api/health-profile", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const profile = await storage.getHealthProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching health profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/health-profile", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const validatedData = insertHealthProfileSchema.parse(req.body);
      const profile = await storage.updateHealthProfile(req.user.id, validatedData);
      await logActivity(req.user.id, "health_profile_updated");
      res.json(profile);
    } catch (error) {
      console.error("Error updating health profile:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  // Health Metrics routes (protected)
  app.get("/api/health-metrics/latest", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const metrics = await storage.getLatestHealthMetrics(req.user.id);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching health metrics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/health-metrics", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const metrics = await storage.getHealthMetrics(req.user.id);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching health metrics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/health-metrics", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const validatedData = insertHealthMetricsSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const metrics = await storage.createHealthMetrics(validatedData);
      await logActivity(req.user.id, "health_metrics_created");
      res.json(metrics);
    } catch (error) {
      console.error("Error creating health metrics:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  // Blood Analysis routes (protected)
  app.get("/api/blood-analyses", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const analyses = await storage.getBloodAnalysesByUser(req.user.id);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching blood analyses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/blood-analyses/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const analysis = await storage.getBloodAnalysis(req.params.id);
      if (!analysis) {
        return res.status(404).json({ error: "Blood analysis not found" });
      }
      // Ensure user can only access their own analyses
      if (analysis.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching blood analysis:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/blood-analyses", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const validatedData = insertBloodAnalysisSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const analysis = await storage.createBloodAnalysis(validatedData);
      await logActivity(req.user.id, "blood_analysis_created", { analysisId: analysis.id });
      res.json(analysis);
    } catch (error) {
      console.error("Error creating blood analysis:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  // Object storage for blood test images (protected)
  app.get("/objects/:objectPath(*)", authenticate, async (req: AuthenticatedRequest, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      return res.status(404).json({ error: "File not found" });
    }
  });

  app.post("/api/objects/upload", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/blood-analyses/:id/image", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      // Check if analysis belongs to user
      const analysis = await storage.getBloodAnalysis(req.params.id);
      if (!analysis || analysis.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const { imageURL } = req.body;
      if (!imageURL) {
        return res.status(400).json({ error: "imageURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(imageURL);
      
      // Update blood analysis with image URL
      const updatedAnalysis = await storage.updateBloodAnalysis(req.params.id, {
        imageUrl: objectPath,
        status: "analyzing",
      });

      await logActivity(req.user.id, "blood_analysis_image_uploaded", { analysisId: req.params.id });
      res.json({ objectPath, analysis: updatedAnalysis });
    } catch (error) {
      console.error("Error updating blood analysis image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DeepSeek Analysis routes (protected)
  app.post("/api/blood-analyses/:id/analyze-text", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      // Check if analysis belongs to user
      const analysis = await storage.getBloodAnalysis(req.params.id);
      if (!analysis || analysis.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
      if (!deepSeekApiKey) {
        return res.status(500).json({ error: "DeepSeek API key not configured" });
      }

      const deepSeekService = new DeepSeekAnalysisService(deepSeekApiKey);
      const analysisResults = await deepSeekService.analyzeBloodTestText(text);

      // Update blood analysis with results
      const updatedAnalysis = await storage.updateBloodAnalysis(req.params.id, {
        status: "analyzed",
        analyzedAt: new Date(),
        results: analysisResults,
      });

      // Create biomarker results from DeepSeek analysis
      if (analysisResults.markers && analysisResults.markers.length > 0) {
        console.log('Сохраняем биомаркеры:', analysisResults.markers.length);
        
        for (const marker of analysisResults.markers) {
          try {
            // Find existing biomarker or create a new one
            const existingBiomarkers = await storage.getAllBiomarkers();
            let biomarker = existingBiomarkers.find(b => 
              b.name.toLowerCase() === marker.name.toLowerCase()
            );
            
            if (!biomarker) {
              // Determine category based on marker name
              let category: 'cardiovascular' | 'metabolic' | 'immune' | 'liver' | 'kidney' | 'general' = 'general';
              const markerName = marker.name.toLowerCase();
              
              if (['гемоглобин', 'эритроциты', 'гематокрит'].some(term => markerName.includes(term))) {
                category = 'cardiovascular';
              } else if (['лейкоциты', 'нейтрофилы', 'лимфоциты', 'моноциты'].some(term => markerName.includes(term))) {
                category = 'immune';
              } else if (['глюкоза', 'холестерин', 'триглицериды'].some(term => markerName.includes(term))) {
                category = 'metabolic';
              } else if (['креатинин', 'мочевина'].some(term => markerName.includes(term))) {
                category = 'kidney';
              }
              
              // Create new biomarker if it doesn't exist
              const newBiomarker = {
                name: marker.name,
                description: marker.education || `${marker.name} - важный показатель здоровья`,
                normalRange: {
                  min: 0,
                  max: 0,
                  unit: marker.unit || "" 
                },
                category: category,
                importance: "medium" as const,
                recommendations: marker.recommendation ? [marker.recommendation] : [],
              };
              biomarker = await storage.createBiomarker(newBiomarker);
              console.log('Создан новый биомаркер:', biomarker.name);
            }

            // Create biomarker result with proper value parsing
            const numericValue = parseFloat(marker.value.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
            
            const biomarkerResult = await storage.createBiomarkerResult({
              analysisId: req.params.id,
              biomarkerId: biomarker.id,
              value: numericValue.toString(),
              unit: marker.unit || marker.value.match(/[а-яА-Яa-zA-Z/]+/)?.[0] || "",
              status: marker.status || 'normal',
            });
            
            console.log('Создан результат биомаркера:', biomarker.name, '=', numericValue, marker.unit);
          } catch (markerError) {
            console.error('Ошибка сохранения биомаркера:', marker.name, markerError);
          }
        }
        
        console.log('Все биомаркеры обработаны');
      }

      res.json({ analysis: updatedAnalysis, results: analysisResults });
    } catch (error) {
      console.error("Error analyzing text with DeepSeek:", error);
      res.status(500).json({ error: "Analysis failed" });
    }
  });

  // Extract text from image using OpenAI Vision (OCR step) - protected
  app.post("/api/blood-analyses/:id/extract-text", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      // Check if analysis belongs to user
      const analysis = await storage.getBloodAnalysis(req.params.id);
      if (!analysis || analysis.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Image data is required" });
      }

      console.log('Extracting text from image, MIME type:', mimeType);
      console.log('Image data length:', imageBase64?.length);

      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return res.status(500).json({ 
          error: "OpenAI API key not configured",
          fallback: "configuration_error"
        });
      }

      // Validate that we received an image
      if (!mimeType?.startsWith('image/') || !imageBase64 || imageBase64.length < 1000) {
        return res.status(400).json({ 
          error: "Invalid image data. Please upload a valid image file (PNG, JPG, GIF, WEBP)" 
        });
      }

      // Use OpenAI Vision to extract text from the image
      const openaiService = new OpenAIVisionService(openaiApiKey);
      const extractedText = await openaiService.extractTextFromImage(imageBase64, mimeType);
      
      console.log('Extracted text length:', extractedText?.length);
      console.log('Extracted text preview:', extractedText?.substring(0, 200));
      
      res.json({ extractedText });
    } catch (error) {
      console.error("Error extracting text with OpenAI Vision:", error);
      res.status(500).json({ error: "Text extraction failed" });
    }
  });

  // This endpoint is no longer used for image analysis, keeping for compatibility
  app.post("/api/blood-analyses/:id/analyze-image", async (req, res) => {
    return res.status(400).json({ 
      error: "Please use the two-step process: extract text first, then analyze",
      fallback: "deprecated_endpoint"
    });
  });

  // Simple in-memory cache for recommendations
  const recommendationsCache = new Map();
  const CACHE_TTL = 10 * 60 * 1000; // 10 минут

  // Recommendations route (protected)
  app.get("/api/recommendations", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
      if (!deepSeekApiKey) {
        return res.status(500).json({ error: "DeepSeek API key not configured" });
      }

      // Get user's health profile
      const healthProfile = await storage.getHealthProfile(req.user.id);
      
      // Get user's latest blood analyses
      const bloodAnalyses = await storage.getBloodAnalysesByUser(req.user.id);
      
      // Create cache key based on profile and analyses data
      const cacheKey = `recommendations_${req.user.id}_${JSON.stringify({
        profile: healthProfile?.createdAt,
        analyses: bloodAnalyses.map(a => ({ id: a.id, analyzedAt: a.analyzedAt }))
      })}`;

      // Check cache first
      const cached = recommendationsCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log("Returning cached recommendations");
        return res.json(cached.data);
      }
      
      // Extract markers from the latest analyzed blood tests
      const bloodMarkers: any[] = [];
      for (const analysis of bloodAnalyses) {
        if (analysis.status === 'analyzed' && analysis.results) {
          const results = analysis.results as any;
          if (results.markers && Array.isArray(results.markers)) {
            // Map markers to include all necessary fields
            const mappedMarkers = results.markers.map((marker: any) => ({
              name: marker.name,
              value: marker.value,
              unit: marker.unit || '',
              normalRange: marker.normalRange || marker.referenceRange || '',
              status: marker.isOutOfRange ? 
                (marker.value > marker.normalRange ? 'high' : 'low') : 
                'normal',
              education: marker.education,
              recommendation: marker.recommendation
            }));
            bloodMarkers.push(...mappedMarkers);
          }
        }
      }

      // Prepare profile data
      let profile = null;
      if (healthProfile && healthProfile.profileData) {
        const profileData = healthProfile.profileData as any;
        const height = profileData.height || 170;
        const weight = profileData.weight || 70;
        const bmi = weight / ((height / 100) * (height / 100));
        
        profile = {
          age: profileData.age || 30,
          gender: profileData.gender || 'неизвестен',
          height: height,
          weight: weight,
          bmi: bmi,
          activityLevel: profileData.activityLevel || 'умеренный',
          goals: profileData.goals || [],
          chronicConditions: profileData.chronicConditions || [],
          allergies: profileData.allergies || [],
          medications: profileData.medications || [],
          supplements: profileData.supplements || []
        };
      }

      console.log("Генерируем новые рекомендации через DeepSeek...");
      
      // Generate recommendations using DeepSeek
      const deepSeekService = new DeepSeekService(deepSeekApiKey);
      const recommendations = await deepSeekService.generateHealthRecommendations(
        profile,
        bloodMarkers
      );

      // Cache the result
      recommendationsCache.set(cacheKey, {
        data: recommendations,
        timestamp: Date.now()
      });

      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Biomarkers routes (protected)
  app.get("/api/biomarkers", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const biomarkers = await storage.getAllBiomarkers();
      res.json(biomarkers);
    } catch (error) {
      console.error("Error fetching biomarkers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/biomarkers/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const biomarker = await storage.getBiomarker(req.params.id);
      if (!biomarker) {
        return res.status(404).json({ error: "Biomarker not found" });
      }
      res.json(biomarker);
    } catch (error) {
      console.error("Error fetching biomarker:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/blood-analyses/:id/biomarker-results", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      // Check if analysis belongs to user
      const analysis = await storage.getBloodAnalysis(req.params.id);
      if (!analysis || analysis.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const results = await storage.getBiomarkerResults(req.params.id);
      const resultsWithBiomarkers = await Promise.all(
        results.map(async (result) => {
          const biomarker = await storage.getBiomarker(result.biomarkerId);
          return { ...result, biomarker };
        })
      );
      res.json(resultsWithBiomarkers);
    } catch (error) {
      console.error("Error fetching biomarker results:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get biomarker history across all analyses (protected)
  app.get("/api/biomarkers/:id/history", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const biomarkerId = req.params.id;
      const analyses = await storage.getBloodAnalysesByUser(req.user.id);
      const history: any[] = [];

      for (const analysis of analyses) {
        const results = await storage.getBiomarkerResults(analysis.id);
        const biomarkerResult = results.find(r => r.biomarkerId === biomarkerId);
        
        if (biomarkerResult) {
          history.push({
            date: analysis.createdAt,
            analysisId: analysis.id,
            value: parseFloat(biomarkerResult.value),
            unit: biomarkerResult.unit,
            status: biomarkerResult.status,
            analysisName: `Анализ от ${new Date(analysis.createdAt!).toLocaleDateString('ru-RU')}`
          });
        }
      }

      // Sort by date descending
      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json(history);
    } catch (error) {
      console.error("Error fetching biomarker history:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Chat routes (protected)
  app.get("/api/chat-sessions", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const sessions = await storage.getChatSessionsByUser(req.user.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Internal server error" });
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
      await logActivity(req.user.id, "chat_session_created", { sessionId: session.id });
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.get("/api/chat-sessions/:id/messages", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      // Check if session belongs to user
      const session = await storage.getChatSession(req.params.id);
      if (!session || session.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const messages = await storage.getChatMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Upload image for chat analysis
  app.post("/api/chat-sessions/:id/analyze-image", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      // Check if session belongs to user
      const session = await storage.getChatSession(req.params.id);
      if (!session || session.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

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

      // Try to use OpenAI Vision to analyze the image
      let imageAnalysis;
      try {
        const openaiService = new OpenAIVisionService(openaiApiKey);
        const analysisPrompt = question || "Проанализируйте это изображение на предмет кожных проблем, симптомов или других медицинских вопросов. Дайте профессиональные рекомендации.";
        imageAnalysis = await openaiService.analyzeHealthImage(imageBase64, mimeType, analysisPrompt);
      } catch (openaiError: any) {
        console.log('OpenAI Vision failed, using fallback analysis');
        if (openaiError.status === 429) {
          imageAnalysis = "📋 **Анализ изображения (базовый режим)**\n\nВ данный момент ИИ анализ изображений недоступен, но я могу помочь на основе описания!\n\n**📝 Опишите проблему подробно:**\n• Что именно беспокоит?\n• Где расположено?\n• Когда появилось?\n• Какие ощущения (зуд, боль, жжение)?\n• Размер, цвет, форма?\n• Принимаете ли лекарства?\n\n**🩺 Общие рекомендации при кожных проблемах:**\n• Не расчесывайте и не трогайте руками\n• Соблюдайте гигиену области\n• При воспалении - холодный компресс\n• Избегайте агрессивной косметики\n\n⚠️ **ВАЖНО**: При любых подозрительных изменениях кожи, особенно родинок, обязательно обратитесь к дерматологу для очного осмотра!";
        } else {
          imageAnalysis = "🔧 **Временные технические проблемы**\n\nСистема анализа изображений сейчас недоступна. Но не переживайте - я помогу на основе описания!\n\n**💭 Расскажите подробнее:**\n• Что именно на фото?\n• Какие симптомы или проблемы?\n• Как давно это беспокоит?\n• Есть ли изменения со временем?\n\n**🎯 Я смогу дать рекомендации** на основе вашего описания, учитывая ваш профиль здоровья и анализы!\n\n⚠️ При серьезных симптомах - не откладывайте визит к врачу.";
        }
      }
      
      // Get user's health context for personalized advice
      const healthProfile = await storage.getHealthProfile(req.user.id);
      const bloodAnalyses = await storage.getBloodAnalysesByUser(req.user.id);
      
      let contextualAdvice = imageAnalysis;
      
      // Add personalized context if OpenAI is available
      const openaiPersonalizationKey = process.env.OPENAI_API_KEY;
      if (openaiPersonalizationKey && healthProfile) {
        try {
          const openai = new OpenAI({ apiKey: openaiPersonalizationKey });
          const profileData = healthProfile.profileData as any;
          
          const contextPrompt = `Персонализируй медицинские рекомендации для пользователя:
          
АНАЛИЗ ИЗОБРАЖЕНИЯ: ${imageAnalysis}

ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
- Возраст: ${profileData?.age || 'не указан'}
- Пол: ${profileData?.gender || 'не указан'} 
- Активность: ${profileData?.activityLevel || 'не указана'}
- Хронические заболевания: ${profileData?.chronicConditions?.join(', ') || 'не указаны'}
- Аллергии: ${profileData?.allergies?.join(', ') || 'не указаны'}

Дай персонализированные рекомендации, учитывая профиль пользователя. Отвечай на русском языке как опытный врач-консультант.`;

          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "Ты опытный медицинский консультант. Персонализируй рекомендации для пользователя."
              },
              {
                role: "user",
                content: contextPrompt
              }
            ],
            max_tokens: 800,
            temperature: 0.7
          });

          contextualAdvice = completion.choices[0].message.content || imageAnalysis;
        } catch (error) {
          console.error("Error getting personalized advice:", error);
        }
      }
      
      res.json({ analysis: contextualAdvice });
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

  // Complete health profile (protected)
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

  const httpServer = createServer(app);
  return httpServer;
}

async function generateAIResponse(userMessage: string, userId: string): Promise<string> {
  try {

    // Get user's health data for personalization
    const healthProfile = await storage.getHealthProfile(userId);
    const bloodAnalyses = await storage.getBloodAnalysesByUser(userId);
    const healthMetrics = await storage.getHealthMetrics(userId);

    // Prepare context data
    let userContext = "Пользователь: ";
    if (healthProfile) {
      const profileData = healthProfile.profileData as any;
      userContext += `Возраст: ${profileData?.age || 'не указан'}, `;
      userContext += `Пол: ${profileData?.gender || 'не указан'}, `;
      userContext += `Активность: ${profileData?.activityLevel || 'не указана'}. `;
    }

    // Add latest biomarkers if available
    let biomarkersContext = "";
    for (const analysis of bloodAnalyses) {
      if (analysis.status === 'analyzed' && analysis.results) {
        const results = analysis.results as any;
        if (results.markers && Array.isArray(results.markers)) {
          biomarkersContext += "Последние анализы: ";
          results.markers.slice(0, 5).forEach((marker: any) => {
            biomarkersContext += `${marker.name}: ${marker.value}${marker.unit || ''} `;
            if (marker.isOutOfRange) {
              biomarkersContext += "(вне нормы), ";
            } else {
              biomarkersContext += "(норма), ";
            }
          });
          break;
        }
      }
    }

    // Check if message contains image attachment
    const hasImageAttachment = userMessage.includes("📎") && userMessage.includes("jpg") || 
                               userMessage.includes("png") || userMessage.includes("jpeg");

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.log("OpenAI API key not available, using fallback response");
      return generateFallbackResponse(userMessage);
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });
    
    const prompt = `Ты EVERLIV Помощник - персональный ИИ-консультант по здоровью. 
    
КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ:
${userContext}
${biomarkersContext}

ВОЗМОЖНОСТИ:
- Анализ результатов анализов крови и лабораторных исследований
- Интерпретация биомаркеров и отклонений от нормы
- Персональные рекомендации по питанию, физической активности и образу жизни
- Анализ фотографий кожных проблем, родинок, высыпаний
- Общие медицинские консультации и рекомендации

${hasImageAttachment ? "ВНИМАНИЕ: Пользователь прикрепил изображение. Это может быть фото кожной проблемы, результатов анализов или симптомов. Проанализируй описание и дай рекомендации." : ""}

ВАЖНЫЕ ПРАВИЛА:
1. Всегда указывай, что ты ИИ-консультант, а не замена врачу
2. При серьезных симптомах рекомендуй обратиться к врачу
3. Используй персональные данные пользователя для более точных рекомендаций
4. Отвечай на русском языке, дружелюбно и профессионально
5. Используй эмодзи для улучшения восприятия
6. Если есть данные анализов - ссылайся на конкретные показатели

Вопрос пользователя: ${userMessage}

Ответь как опытный медицинский консультант, учитывая персональные данные пользователя.`;

    // Use OpenAI GPT for chat responses
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o for better medical knowledge
      messages: [
        {
          role: "system",
          content: "Ты опытный медицинский консультант и ИИ-помощник по здоровью. Отвечай профессионально, но доступно, всегда напоминая что ты не заменяешь врача."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    
    return response || generateFallbackResponse(userMessage);
  } catch (error) {
    console.error("Error generating AI response:", error);
    // Use intelligent fallback instead of generic error message  
    return generateIntelligentFallback(userMessage, healthProfile || null, bloodAnalyses || []);
  }
}

function generateIntelligentFallback(userMessage: string, healthProfile: any, bloodAnalyses: any[]): string {
  const message = userMessage.toLowerCase();
  
  // Analyze user context
  let userContext = "";
  if (healthProfile?.profileData) {
    const profileData = healthProfile.profileData as any;
    userContext = `Возраст: ${profileData?.age || 'не указан'}, Пол: ${profileData?.gender || 'не указан'}`;
  }
  
  // Check for medical keywords and provide specific guidance
  if (message.includes("боль") || message.includes("болит")) {
    return `💊 **EVERLIV Помощник - Консультация по боли**\n\n🩺 **О боли важно знать:**\n• Локализация и характер боли помогают определить причину\n• Острая внезапная боль требует немедленного внимания\n• Хроническая боль нуждается в комплексном подходе\n\n⚠️ **СРОЧНО к врачу при:**\n• Острой боли в груди\n• Сильной головной боли с температурой\n• Боли в животе с тошнотой\n• Боли, которая усиливается\n\n📋 **Опишите подробнее:**\n• Где болит?\n• Какой характер боли?\n• Когда началось?\n• Что провоцирует?\n\n${userContext ? `👤 Ваш профиль: ${userContext}` : ""}\n\n🎯 После описания дам персональные рекомендации!`;
  }
  
  if (message.includes("температура") || message.includes("жар") || message.includes("лихорадка")) {
    return `🌡️ **EVERLIV Помощник - Консультация по температуре**\n\n🩺 **Важная информация:**\n• Нормальная температура: 36.1-37.2°C\n• Субфебрильная: 37.3-38.0°C\n• Умеренная лихорадка: 38.1-39.0°C\n• Высокая лихорадка: выше 39°C\n\n⚠️ **СРОЧНО к врачу при:**\n• Температуре выше 39.5°C\n• Температуре с сильной головной болью\n• Температуре более 3 дней\n• Затрудненном дыхании\n\n💡 **Общие рекомендации:**\n• Обильное питье\n• Постельный режим\n• Легкая одежда\n• Проветривание помещения\n\n${userContext ? `👤 Ваш профиль: ${userContext}` : ""}\n\n📞 При ухудшении - немедленно к врачу!`;
  }
  
  if (message.includes("головная боль") || message.includes("мигрень") || message.includes("голова")) {
    return `🧠 **EVERLIV Помощник - Головная боль**\n\n🩺 **Типы головной боли:**\n• Напряжения (тупая, сдавливающая)\n• Мигрень (пульсирующая, односторонняя)\n• Кластерная (острая, в области глаза)\n• Вторичная (симптом другого заболевания)\n\n⚠️ **СРОЧНО к врачу при:**\n• Внезапной сильнейшей головной боли\n• Головной боли с температурой и ригидностью шеи\n• Головной боли с нарушением зрения/речи\n• Постоянном усилении боли\n\n💡 **Помощь при головной боли:**\n• Покой в темном помещении\n• Холодный компресс на лоб\n• Массаж висков\n• Избегание триггеров\n\n${userContext ? `👤 Ваш профиль: ${userContext}` : ""}\n\n📝 Ведите дневник головной боли для врача!`;
  }
  
  if (message.includes("кожа") || message.includes("сыпь") || message.includes("зуд") || message.includes("пятно")) {
    return `🩺 **EVERLIV Помощник - Кожные проблемы**\n\n📋 **Важные вопросы:**\n• Где именно расположено?\n• Когда появилось?\n• Есть ли зуд, боль, жжение?\n• Размер и форма изменений?\n• Принимаете ли новые лекарства?\n\n⚠️ **СРОЧНО к дерматологу при:**\n• Быстром росте образований\n• Изменении цвета родинок\n• Кровоточивости\n• Асимметрии пятен\n\n💡 **Общие рекомендации:**\n• Не расчесывать\n• Гигиена без агрессивных средств\n• Холодные компрессы при воспалении\n• Избегать аллергенов\n\n${userContext ? `👤 Ваш профиль: ${userContext}` : ""}\n\n🔍 Опишите подробнее для точных рекомендаций!`;
  }
  
  if (message.includes("анализ") || message.includes("результат") || message.includes("кровь")) {
    let analysisContext = "";
    if (bloodAnalyses.length > 0) {
      const latestAnalysis = bloodAnalyses.find(a => a.status === 'analyzed' && a.results);
      if (latestAnalysis) {
        analysisContext = "\n📊 **У вас есть результаты анализов** - могу помочь с их интерпретацией!";
      }
    }
    
    return `🔬 **EVERLIV Помощник - Анализы крови**\n\n📋 **Основные показатели:**\n• **Гемоглобин** - транспорт кислорода\n• **Лейкоциты** - иммунная система\n• **Тромбоциты** - свертываемость\n• **Глюкоза** - углеводный обмен\n• **Холестерин** - липидный обмен\n\n💡 **Что влияет на результаты:**\n• Время суток\n• Последний прием пищи\n• Физическая активность\n• Стресс и лекарства\n\n🎯 **Как я могу помочь:**\n• Объяснить значения показателей\n• Рассказать о норме и отклонениях\n• Дать рекомендации по питанию\n• Подсказать вопросы для врача\n\n${userContext ? `👤 Ваш профиль: ${userContext}` : ""}${analysisContext}\n\n📝 Назовите конкретный показатель для детального разбора!`;
  }
  
  if (message.includes("фото") || message.includes("изображение") || message.includes("📎")) {
    return `📸 **EVERLIV Помощник - Анализ изображений**

🎯 **Чем могу помочь:**
• Анализ кожных проблем
• Оценка симптомов
• Расшифровка анализов
• Медицинские рекомендации

📋 **Для точного анализа опишите:**
• Что именно на фото?
• Когда появилось?
• Беспокоящие симптомы?
• Сопутствующие жалобы?

**Примеры описаний:**
'красная сыпь на руке 3 дня, зудит'
'темное пятно на спине, изменилось'
'результаты анализов, что означают?'

${userContext ? `👤 Учту ваш профиль: ${userContext}` : ""}

⚠️ При серьезных изменениях - к врачу!`;
  }
  
  // Default personalized response
  return `👋 **Здравствуйте! Я EVERLIV Помощник**\n\n${userContext ? `👤 Ваш профиль: ${userContext}\n\n` : ""}🩺 **Готов помочь с:**\n• Интерпретацией анализов крови\n• Консультациями по симптомам\n• Анализом медицинских фото\n• Персональными рекомендациями\n• Вопросами о здоровье\n\n💡 **Популярные темы:**\n• "объясни мой анализ крови"\n• "что означает боль в ...?"\n• "как улучшить показатель ...?"\n• "стоит ли обращаться к врачу?"\n\n🎯 **Просто опишите что беспокоит** - я дам персональные рекомендации!\n\n⚠️ Помните: я консультант, но не заменяю врача при серьезных симптомах.`;
}

function generateFallbackResponse(userMessage: string): string {
  return generateIntelligentFallback(userMessage, null, []);
}
