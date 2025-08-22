import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService } from "./objectStorage";
import DeepSeekAnalysisService from "./deepseekService";
import { insertBloodAnalysisSchema, insertChatSessionSchema, insertChatMessageSchema, insertHealthMetricsSchema, insertHealthProfileSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_USER_ID = "user-1"; // For demo purposes

  // Health Profile routes
  app.get("/api/health-profile", async (req, res) => {
    try {
      const profile = await storage.getHealthProfile(DEFAULT_USER_ID);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching health profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/health-profile", async (req, res) => {
    try {
      const validatedData = insertHealthProfileSchema.parse(req.body);
      const profile = await storage.updateHealthProfile(DEFAULT_USER_ID, validatedData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating health profile:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  // Health Metrics routes
  app.get("/api/health-metrics/latest", async (req, res) => {
    try {
      const metrics = await storage.getLatestHealthMetrics(DEFAULT_USER_ID);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching health metrics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/health-metrics", async (req, res) => {
    try {
      const metrics = await storage.getHealthMetrics(DEFAULT_USER_ID);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching health metrics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/health-metrics", async (req, res) => {
    try {
      const validatedData = insertHealthMetricsSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      const metrics = await storage.createHealthMetrics(validatedData);
      res.json(metrics);
    } catch (error) {
      console.error("Error creating health metrics:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  // Blood Analysis routes
  app.get("/api/blood-analyses", async (req, res) => {
    try {
      const analyses = await storage.getBloodAnalysesByUser(DEFAULT_USER_ID);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching blood analyses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/blood-analyses/:id", async (req, res) => {
    try {
      const analysis = await storage.getBloodAnalysis(req.params.id);
      if (!analysis) {
        return res.status(404).json({ error: "Blood analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching blood analysis:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/blood-analyses", async (req, res) => {
    try {
      const validatedData = insertBloodAnalysisSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      const analysis = await storage.createBloodAnalysis(validatedData);
      res.json(analysis);
    } catch (error) {
      console.error("Error creating blood analysis:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  // Object storage for blood test images
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      return res.status(404).json({ error: "File not found" });
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/blood-analyses/:id/image", async (req, res) => {
    try {
      const { imageURL } = req.body;
      if (!imageURL) {
        return res.status(400).json({ error: "imageURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(imageURL);
      
      // Update blood analysis with image URL
      const analysis = await storage.updateBloodAnalysis(req.params.id, {
        imageUrl: objectPath,
        status: "analyzing",
      });

      res.json({ objectPath, analysis });
    } catch (error) {
      console.error("Error updating blood analysis image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DeepSeek Analysis routes
  app.post("/api/blood-analyses/:id/analyze-text", async (req, res) => {
    try {
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
        for (const marker of analysisResults.markers) {
          // Find existing biomarker or create a new one
          const existingBiomarkers = await storage.getAllBiomarkers();
          let biomarker = existingBiomarkers.find(b => 
            b.name.toLowerCase() === marker.name.toLowerCase()
          );
          
          if (!biomarker) {
            // Create new biomarker if it doesn't exist
            const newBiomarker = {
              name: marker.name,
              description: marker.education || "Biomarker information",
              normalRange: {
                min: 0,
                max: 0,
                unit: "" 
              },
              category: "general" as const,
              importance: "medium" as const,
              recommendations: marker.recommendation ? [marker.recommendation] : [],
            };
            biomarker = await storage.createBiomarker(newBiomarker);
          }

          // Create biomarker result
          const numericValue = parseFloat(marker.value.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
          await storage.createBiomarkerResult({
            analysisId: req.params.id,
            biomarkerId: biomarker.id,
            value: numericValue.toString(),
            unit: marker.value.match(/[а-яА-Яa-zA-Z/]+/)?.[0] || "",
            status: marker.status,
          });
        }
      }

      res.json({ analysis: updatedAnalysis, results: analysisResults });
    } catch (error) {
      console.error("Error analyzing text with DeepSeek:", error);
      res.status(500).json({ error: "Analysis failed" });
    }
  });

  app.post("/api/blood-analyses/:id/analyze-image", async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Image data is required" });
      }

      const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
      if (!deepSeekApiKey) {
        return res.status(500).json({ error: "DeepSeek API key not configured" });
      }

      const deepSeekService = new DeepSeekAnalysisService(deepSeekApiKey);
      const analysisResults = await deepSeekService.analyzeBloodTestImage(imageBase64);

      // Update blood analysis with results
      const updatedAnalysis = await storage.updateBloodAnalysis(req.params.id, {
        status: "analyzed",
        analyzedAt: new Date(),
        results: analysisResults,
      });

      // Create biomarker results from DeepSeek analysis
      if (analysisResults.markers && analysisResults.markers.length > 0) {
        for (const marker of analysisResults.markers) {
          // Find existing biomarker or create a new one
          const existingBiomarkers = await storage.getAllBiomarkers();
          let biomarker = existingBiomarkers.find(b => 
            b.name.toLowerCase() === marker.name.toLowerCase()
          );
          
          if (!biomarker) {
            // Create new biomarker if it doesn't exist
            const newBiomarker = {
              name: marker.name,
              description: marker.education || "Biomarker information",
              normalRange: {
                min: 0,
                max: 0,
                unit: "" 
              },
              category: "general" as const,
              importance: "medium" as const,
              recommendations: marker.recommendation ? [marker.recommendation] : [],
            };
            biomarker = await storage.createBiomarker(newBiomarker);
          }

          // Create biomarker result
          const numericValue = parseFloat(marker.value.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
          await storage.createBiomarkerResult({
            analysisId: req.params.id,
            biomarkerId: biomarker.id,
            value: numericValue.toString(),
            unit: marker.value.match(/[а-яА-Яa-zA-Z/]+/)?.[0] || "",
            status: marker.status,
          });
        }
      }

      res.json({ analysis: updatedAnalysis, results: analysisResults });
    } catch (error) {
      console.error("Error analyzing image with DeepSeek:", error);
      res.status(500).json({ error: "Analysis failed" });
    }
  });

  // Biomarkers routes
  app.get("/api/biomarkers", async (req, res) => {
    try {
      const biomarkers = await storage.getAllBiomarkers();
      res.json(biomarkers);
    } catch (error) {
      console.error("Error fetching biomarkers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/biomarkers/:id", async (req, res) => {
    try {
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

  app.get("/api/blood-analyses/:id/biomarker-results", async (req, res) => {
    try {
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

  // Chat routes
  app.get("/api/chat-sessions", async (req, res) => {
    try {
      const sessions = await storage.getChatSessionsByUser(DEFAULT_USER_ID);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chat-sessions", async (req, res) => {
    try {
      const validatedData = insertChatSessionSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      const session = await storage.createChatSession(validatedData);
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.get("/api/chat-sessions/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chat-sessions/:id/messages", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse({
        ...req.body,
        sessionId: req.params.id,
      });
      const message = await storage.createChatMessage(validatedData);

      // Generate AI response if the message is from user
      if (validatedData.role === "user") {
        const aiResponse = generateAIResponse(validatedData.content);
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

  const httpServer = createServer(app);
  return httpServer;
}

function generateAIResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes("холестерин")) {
    return "Понимаю вашу обеспокоенность. Повышенный холестерин - это серьезно, но управляемо. Рекомендую:\n\n• Увеличить физическую активность\n• Ограничить насыщенные жиры\n• Употреблять больше овощей и фруктов\n• Обратиться к кардиологу\n\nХотите узнать больше о диетических рекомендациях?";
  }
  
  if (message.includes("анализ") || message.includes("результат")) {
    return "Я могу помочь интерпретировать результаты ваших анализов. По вашим последним данным:\n\n✅ Гемоглобин в норме\n⚠️ Холестерин повышен\n✅ Глюкоза в норме\n✅ Креатинин в норме\n\nОсновное внимание стоит обратить на холестерин. Нужна ли подробная консультация?";
  }
  
  if (message.includes("давление") || message.includes("сердце")) {
    return "Ваши показатели артериального давления 120/80 находятся в оптимальных пределах. Пульс 72 уд/мин также в норме.\n\nДля поддержания здоровья сердца рекомендую:\n• Регулярную физическую активность\n• Ограничение соли\n• Контроль стресса\n• Отказ от курения";
  }
  
  if (message.includes("температура")) {
    return "Ваша температура 36.6°C находится в пределах нормы. Это оптимальная температура тела для большинства людей.\n\nЕсли у вас есть симптомы недомогания при нормальной температуре, это может указывать на другие состояния. Есть ли дополнительные симптомы?";
  }
  
  if (message.includes("диета") || message.includes("питание")) {
    return "Учитывая повышенный холестерин, рекомендую следующую диету:\n\n🥬 Больше клетчатки: овощи, фрукты, цельнозерновые\n🐟 Омега-3: рыба 2-3 раза в неделю\n🥜 Орехи и семена в умеренном количестве\n❌ Ограничить: жирное мясо, трансжиры, сладости\n\nХотите персональный план питания?";
  }
  
  if (message.includes("спорт") || message.includes("упражнения") || message.includes("активность")) {
    return "Отличный вопрос! Физическая активность поможет снизить холестерин:\n\n🚶‍♀️ Ходьба: 30-40 минут ежедневно\n🏃‍♀️ Кардио: 150 минут умеренной активности в неделю\n💪 Силовые упражнения: 2-3 раза в неделю\n🧘‍♀️ Йога или растяжка для гибкости\n\nНачните постепенно и увеличивайте нагрузку. Есть ли ограничения по здоровью?";
  }
  
  return "Спасибо за ваш вопрос! Как ваш ИИ-доктор, я готов помочь с интерпретацией анализов, рекомендациями по здоровому образу жизни и общими медицинскими вопросами.\n\nМогу проконсультировать по:\n• Результатам анализов крови\n• Рекомендациям по питанию\n• Физической активности\n• Профилактике заболеваний\n\nО чем бы вы хотели узнать подробнее?";
}
