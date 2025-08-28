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

  async extractTextFromImage(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<string> {
    try {
      // Validate and normalize MIME type
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      let validatedMimeType = mimeType?.toLowerCase();
      
      if (!validatedMimeType || !validMimeTypes.includes(validatedMimeType)) {
        console.log('Invalid MIME type:', mimeType, 'defaulting to image/jpeg');
        validatedMimeType = 'image/jpeg';
      }

      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Вы - эксперт по распознаванию медицинских документов. Ваша задача - точно извлечь весь текст из изображения анализа крови.
            
            ВАЖНО:
            - Извлеките ВСЕ текстовые данные: названия показателей, значения, единицы измерения, референсные диапазоны
            - Сохраните структуру: каждый показатель на новой строке
            - Включите даже рукописные заметки врача
            - Формат вывода: простой текст, БЕЗ JSON`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Извлеките ВЕСЬ текст из этого изображения анализа крови. Формат вывода:
                
Название показателя: значение единицы_измерения (референс: мин-макс)

Например:
Гемоглобин: 135 г/л (референс: 130-160)
Эритроциты: 4.5 x10^12/л (референс: 4.0-5.5)

Извлеките ВСЕ показатели, включая рукописные пометки.`
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
        temperature: 0.1,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Не удалось извлечь текст из изображения");
      }

      return content;
    } catch (error) {
      console.error("Ошибка извлечения текста с OpenAI Vision:", error);
      throw new Error("Не удалось извлечь текст из изображения");
    }
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
            content: `Вы - высококвалифицированный врач-гематолог и лаборант с 20-летним опытом интерпретации анализов крови.
            Специализируетесь на российских лабораториях (Инвитро, Гемотест, CMD, KDL, Helix) и международных стандартах.
            
            КРИТИЧЕСКИ ВАЖНО:
            1. Извлеките АБСОЛЮТНО ВСЕ показатели из изображения (даже рукописные пометки)
            2. Для КАЖДОГО показателя дайте ПЕРСОНАЛИЗИРОВАННУЮ рекомендацию
            3. Учитывайте взаимосвязи между показателями
            4. Рекомендации должны быть КОНКРЕТНЫМИ и ВЫПОЛНИМЫМИ
            
            Отвечайте СТРОГО в формате JSON:
            {
              "summary": "Детальное резюме с указанием главных находок и их клинической значимости",
              "markers": [
                {
                  "name": "Точное название показателя как в анализе",
                  "value": "Точное значение с единицами",
                  "status": "normal|low|high|critical",
                  "recommendation": "КОНКРЕТНАЯ персонализированная рекомендация: что делать, какие продукты есть/избегать, какие витамины принимать, режим",
                  "education": "Детальное объяснение: за что отвечает, как влияет на организм, симптомы отклонений"
                }
              ],
              "recommendations": ["Минимум 5 детальных пошаговых рекомендаций с конкретными действиями"],
              "riskFactors": ["Конкретные риски с вероятностями и сроками развития"]
            }`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `ЗАДАЧА: Полный анализ ВСЕХ показателей на изображении анализа крови.

                ОБЯЗАТЕЛЬНО ИЗВЛЕКИТЕ ВСЕ ПОКАЗАТЕЛИ, включая:
                
                ОБЩИЙ АНАЛИЗ КРОВИ:
                - Эритроциты (RBC) и все эритроцитарные индексы (MCV, MCH, MCHC, RDW-CV, RDW-SD)
                - Гемоглобин (HGB) и гематокрит (HCT)
                - Лейкоциты (WBC) и ВСЮ лейкоцитарную формулу:
                  * Нейтрофилы (сегментоядерные, палочкоядерные, юные)
                  * Лимфоциты (абсолютные и %)
                  * Моноциты (абсолютные и %)
                  * Эозинофилы (абсолютные и %)
                  * Базофилы (абсолютные и %)
                - Тромбоциты (PLT) и тромбоцитарные индексы (MPV, PDW, PCT)
                - СОЭ/ESR
                - Ретикулоциты если есть
                
                БИОХИМИЯ (если есть):
                - Белковый обмен: общий белок, альбумин, глобулины, фракции
                - Углеводный обмен: глюкоза, гликированный гемоглобин
                - Липидный профиль: холестерин общий, ЛПНП, ЛПВП, триглицериды, коэффициент атерогенности
                - Печеночные пробы: АЛТ, АСТ, билирубин (общий, прямой, непрямой), ГГТ, ЩФ
                - Почечные маркеры: креатинин, мочевина, мочевая кислота, СКФ
                - Электролиты: натрий, калий, хлор, кальций, магний, фосфор
                - Железо: сывороточное железо, ферритин, трансферрин, ОЖСС
                - Воспаление: СРБ, ревматоидный фактор, АСЛ-О
                - Ферменты: ЛДГ, КФК, амилаза, липаза
                
                ДЛЯ КАЖДОГО ПОКАЗАТЕЛЯ:
                1. Точное название как в бланке (русское и латинское если есть)
                2. Точное числовое значение с единицами измерения
                3. Референсные значения из бланка
                4. Оценка отклонения в процентах от нормы
                5. ПЕРСОНАЛЬНАЯ рекомендация с учетом других показателей:
                   - Конкретные продукты питания (с граммовками)
                   - Конкретные препараты/витамины (с дозировками)
                   - Режим дня и физической активности
                   - Что исключить из рациона
                6. Детальное медицинское объяснение значимости
                
                ПРОАНАЛИЗИРУЙТЕ ВЗАИМОСВЯЗИ:
                - Анемические синдромы (железо + В12 + фолиевая)
                - Воспалительные процессы (лейкоциты + СОЭ + СРБ)
                - Метаболический синдром (глюкоза + липиды + печень)
                - Почечная функция (креатинин + мочевина + электролиты)
                
                Даже если показатель написан от руки или плохо видно - попытайтесь распознать!`
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
        max_tokens: 4000,
        temperature: 0.1,
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
            content: `Вы - высококвалифицированный врач-гематолог с 20-летним опытом интерпретации анализов крови.
            
            КРИТИЧЕСКИ ВАЖНО:
            1. Обработайте ВСЕ показатели из текста
            2. Дайте ПЕРСОНАЛИЗИРОВАННУЮ рекомендацию для каждого
            3. Учитывайте взаимосвязи между показателями
            
            Отвечайте ТОЛЬКО в формате JSON:
            {
              "summary": "Детальное резюме с клинической значимостью",
              "markers": [
                {
                  "name": "Название показателя",
                  "value": "Значение с единицами измерения",
                  "status": "normal|low|high|critical",
                  "recommendation": "КОНКРЕТНАЯ персонализированная рекомендация с дозировками и продуктами",
                  "education": "Детальное объяснение роли в организме"
                }
              ],
              "recommendations": ["Минимум 5 детальных пошаговых рекомендаций"],
              "riskFactors": ["Конкретные риски с вероятностями"]
            }`
          },
          {
            role: "user",
            content: `Проанализируйте следующие результаты анализа крови:

${text}

ОБЯЗАТЕЛЬНО для КАЖДОГО показателя:
1. Точное название (как в тексте)
2. Значение с единицами измерения
3. Статус: критически оцените отклонения
4. ПЕРСОНАЛЬНАЯ рекомендация:
   - Конкретные продукты (с граммовками)
   - Препараты/витамины (с дозировками)
   - Режим дня и активности
   - Что исключить из рациона
5. Детальное объяснение:
   - За что отвечает показатель
   - Симптомы отклонений
   - Влияние на другие системы

ПРОАНАЛИЗИРУЙТЕ ВЗАИМОСВЯЗИ между показателями.
Дайте минимум 5 КОНКРЕТНЫХ пошаговых рекомендаций.
Укажите риски с вероятностями и сроками.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
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

  async analyzeHealthImage(imageBase64: string, mimeType: string = 'image/jpeg', analysisPrompt: string): Promise<string> {
    try {
      // Validate and normalize MIME type
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      let validatedMimeType = mimeType?.toLowerCase();
      
      if (!validatedMimeType || !validMimeTypes.includes(validatedMimeType)) {
        console.log('Invalid MIME type:', mimeType, 'defaulting to image/jpeg');
        validatedMimeType = 'image/jpeg';
      }

      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Вы - опытный врач-дерматолог и диагност с 20-летним стажем. Специализируетесь на визуальной диагностике кожных заболеваний, анализе симптомов и медицинской консультации по изображениям.

ВАЖНЫЕ ПРИНЦИПЫ:
1. Анализируйте изображение детально и объективно
2. Указывайте на возможные диагнозы, но ВСЕГДА подчеркивайте необходимость очной консультации
3. Давайте практические рекомендации по уходу и первой помощи
4. Предупреждайте о "красных флагах" - симптомах, требующих немедленного обращения к врачу
5. Используйте понятный язык для пациента

СТРУКТУРА ОТВЕТА:
- Описание того, что видно на изображении
- Возможные диагнозы (в порядке вероятности)  
- Рекомендации по домашнему уходу
- Когда срочно обратиться к врачу
- Профилактические меры

Отвечайте на русском языке, профессионально, но доступно.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: analysisPrompt
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
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Не удалось получить анализ изображения");
      }

      return content;
    } catch (error) {
      console.error("Ошибка анализа медицинского изображения с OpenAI Vision:", error);
      throw new Error("Не удалось проанализировать изображение. Попробуйте описать проблему текстом.");
    }
  }
}