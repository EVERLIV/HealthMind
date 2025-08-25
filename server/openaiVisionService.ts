import OpenAI from 'openai';

interface BloodMarker {
  name: string;
  value: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  recommendation?: string;
  education?: string;
}

interface AnalysisResult {
  summary: string;
  markers: BloodMarker[];
  recommendations: string[];
  riskFactors: string[];
}

export default class OpenAIVisionService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  async analyzeBloodTestImage(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<AnalysisResult> {
    try {
      // Validate and normalize MIME type
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      let validatedMimeType = mimeType?.toLowerCase();
      
      if (!validatedMimeType || !validMimeTypes.includes(validatedMimeType)) {
        console.log('Invalid MIME type:', mimeType, 'defaulting to image/jpeg');
        validatedMimeType = 'image/jpeg';
      }

      console.log('Using MIME type:', validatedMimeType);
      
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Вы - медицинский ИИ-ассистент, специализирующийся на анализе результатов анализов крови. 
            Ваша задача - извлечь все показатели из изображения анализа крови и предоставить подробную интерпретацию.
            
            Отвечайте ТОЛЬКО в формате JSON со следующей структурой:
            {
              "summary": "Краткое резюме состояния здоровья",
              "markers": [
                {
                  "name": "Название показателя",
                  "value": "Значение с единицами измерения",
                  "status": "normal|low|high|critical",
                  "recommendation": "Рекомендация по этому показателю",
                  "education": "Образовательная информация о показателе"
                }
              ],
              "recommendations": ["Общие рекомендации"],
              "riskFactors": ["Выявленные риски"]
            }`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Проанализируйте это изображение анализа крови. Извлеките ВСЕ видимые показатели и их значения.
                
                Для каждого показателя:
                1. Определите название показателя (на русском или английском)
                2. Извлеките точное значение с единицами измерения
                3. Оцените статус (нормальный, низкий, высокий, критический)
                4. Дайте конкретную рекомендацию
                5. Предоставьте образовательную информацию
                
                Распознайте показатели даже если они написаны от руки или плохо видны.
                Поддерживаемые лаборатории: Invitro, Helix, KDL, CMD, Гемотест и другие российские лаборатории.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${validatedMimeType};base64,${imageBase64}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Не удалось получить ответ от OpenAI");
      }

      // Парсим JSON ответ
      try {
        const result = JSON.parse(content) as AnalysisResult;
        return this.validateAndEnrichResult(result);
      } catch (parseError) {
        console.error("Ошибка парсинга JSON:", content);
        // Возвращаем базовый результат если не удалось распарсить
        return {
          summary: "Анализ изображения выполнен. Требуется ручная проверка результатов.",
          markers: [],
          recommendations: ["Обратитесь к врачу для интерпретации результатов"],
          riskFactors: []
        };
      }
    } catch (error) {
      console.error("Ошибка анализа изображения с OpenAI Vision:", error);
      throw new Error("Не удалось проанализировать изображение");
    }
  }

  private validateAndEnrichResult(result: AnalysisResult): AnalysisResult {
    // Обогащаем результат дополнительной информацией о нормальных диапазонах
    const enrichedMarkers = result.markers.map(marker => {
      const enrichedMarker = { ...marker };
      
      // Добавляем информацию о нормальных диапазонах для основных показателей
      const lowerName = marker.name.toLowerCase();
      
      if (lowerName.includes('гемоглобин') || lowerName.includes('hemoglobin')) {
        enrichedMarker.education = enrichedMarker.education || 
          "Гемоглобин - белок в эритроцитах, переносящий кислород. Норма: мужчины 130-160 г/л, женщины 120-140 г/л.";
      }
      
      if (lowerName.includes('глюкоза') || lowerName.includes('glucose')) {
        enrichedMarker.education = enrichedMarker.education || 
          "Глюкоза - основной источник энергии для клеток. Норма натощак: 3.3-5.5 ммоль/л.";
      }
      
      if (lowerName.includes('холестерин') || lowerName.includes('cholesterol')) {
        enrichedMarker.education = enrichedMarker.education || 
          "Холестерин - липид, необходимый для построения клеточных мембран. Норма общего холестерина: < 5.2 ммоль/л.";
      }
      
      if (lowerName.includes('креатинин') || lowerName.includes('creatinine')) {
        enrichedMarker.education = enrichedMarker.education || 
          "Креатинин - продукт распада креатина в мышцах, показатель функции почек. Норма: мужчины 74-110 мкмоль/л, женщины 60-100 мкмоль/л.";
      }

      if (lowerName.includes('эритроцит') || lowerName.includes('rbc') || lowerName.includes('red blood')) {
        enrichedMarker.education = enrichedMarker.education || 
          "Эритроциты - красные кровяные клетки, переносящие кислород. Норма: мужчины 4.0-5.5×10¹²/л, женщины 3.5-5.0×10¹²/л.";
      }

      if (lowerName.includes('лейкоцит') || lowerName.includes('wbc') || lowerName.includes('white blood')) {
        enrichedMarker.education = enrichedMarker.education || 
          "Лейкоциты - белые кровяные клетки, защищающие организм от инфекций. Норма: 4.0-9.0×10⁹/л.";
      }

      if (lowerName.includes('тромбоцит') || lowerName.includes('platelet') || lowerName.includes('plt')) {
        enrichedMarker.education = enrichedMarker.education || 
          "Тромбоциты - клетки крови, участвующие в свертывании. Норма: 150-400×10⁹/л.";
      }

      return enrichedMarker;
    });

    // Добавляем общие рекомендации если их нет
    if (result.recommendations.length === 0) {
      result.recommendations = [
        "Обсудите результаты анализа с вашим лечащим врачом",
        "Следите за динамикой показателей в течение времени"
      ];
    }

    return {
      ...result,
      markers: enrichedMarkers
    };
  }

  async analyzeBloodTestText(text: string): Promise<AnalysisResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Вы - медицинский ИИ-ассистент, специализирующийся на анализе результатов анализов крови.
            
            Отвечайте ТОЛЬКО в формате JSON со следующей структурой:
            {
              "summary": "Краткое резюме состояния здоровья",
              "markers": [
                {
                  "name": "Название показателя",
                  "value": "Значение с единицами измерения",
                  "status": "normal|low|high|critical",
                  "recommendation": "Рекомендация по этому показателю",
                  "education": "Образовательная информация о показателе"
                }
              ],
              "recommendations": ["Общие рекомендации"],
              "riskFactors": ["Выявленные риски"]
            }`
          },
          {
            role: "user",
            content: `Проанализируйте следующие результаты анализа крови и предоставьте детальную интерпретацию:

${text}

Для каждого показателя определите:
1. Точное название показателя
2. Значение с единицами измерения
3. Статус относительно нормы
4. Конкретную рекомендацию
5. Образовательную информацию о показателе

Предоставьте также общие рекомендации и выявленные факторы риска.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.2
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Не удалось получить ответ от OpenAI");
      }

      const result = JSON.parse(content) as AnalysisResult;
      return this.validateAndEnrichResult(result);
    } catch (error) {
      console.error("Ошибка анализа текста с OpenAI:", error);
      throw new Error("Не удалось проанализировать текст");
    }
  }
}