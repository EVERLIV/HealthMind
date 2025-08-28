import OpenAI from 'openai';

interface HealthProfile {
  age: number;
  gender: string;
  height: number;
  weight: number;
  bmi: number;
  activityLevel: string;
  goals: string[];
  chronicConditions: string[];
  allergies: string[];
  medications: string[];
  supplements: string[];
}

interface BloodMarker {
  name: string;
  value: string;
  unit?: string;
  normalRange?: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  education?: string;
  recommendation?: string;
}

interface RecommendationSection {
  title: string;
  items: string[];
}

interface BiomarkerRecommendation {
  currentValue: string;
  targetValue: string;
  howToImprove: string[];
  supplements: string[];
  retestFrequency: string;
}

interface HealthRecommendations {
  disclaimer: string;
  summary: string;
  priorityAreas: string[];
  biomarkerRecommendations?: Record<string, BiomarkerRecommendation>;
  nutrition: RecommendationSection;
  physicalActivity: RecommendationSection;
  lifestyle: RecommendationSection;
  supplements: RecommendationSection;
  actionPlan: string[];
  nextSteps: string[];
}

export class DeepSeekService {
  protected client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.deepseek.com/v1'
    });
  }

  async generateHealthRecommendations(
    profile: HealthProfile | null,
    bloodMarkers: BloodMarker[]
  ): Promise<HealthRecommendations> {
    try {
      const systemPrompt = `Ты — ИИ-ассистент по здоровью. Анализируй данные пользователя и давай персонализированные рекомендации в JSON-формате. 

Принципы: учитывай цели, фокусируйся на отклонениях в биомаркерах, при критических показателях рекомендуй врача.

JSON структура:
{
  "disclaimer": "❗ Важно: Я — ваш ИИ-ассистент. Эти рекомендации носят информационный характер. Обязательно проконсультируйтесь с врачом перед началом приема добавок или изменением образа жизни.",
  "summary": "Детальное резюме с учетом ЦЕЛЕЙ пользователя и всех показателей",
  "priorityAreas": ["3-4 приоритета с учетом ЦЕЛЕЙ и отклонений"],
  "biomarkerRecommendations": {
    "Название_биомаркера": {
      "currentValue": "текущее значение с единицами",
      "targetValue": "целевое значение",
      "howToImprove": ["способ 1", "способ 2", "способ 3"],
      "supplements": ["Витамин D3 2000 МЕ утром", "Омега-3 1000мг 2 раза в день"],
      "retestFrequency": "через 2-3 месяца"
    }
  },
  "nutrition": {
    "title": "Питание для ваших целей",
    "items": ["6-8 рекомендаций в формате: 'Продукт/действие - для вашего уровня X это поможет снизить/улучшить Y'"]
  },
  "physicalActivity": {
    "title": "Физическая активность",
    "items": ["5-6 рекомендаций в формате: 'Упражнение время/частота - для вашего уровня активности это снизит риски на X%'"]
  },
  "lifestyle": {
    "title": "Образ жизни",
    "items": ["4-5 рекомендаций в формате: 'Изменение - при вашем уровне стресса/сна это улучшит показатель Y'"]
  },
  "supplements": {
    "title": "Витамины и добавки",
    "items": ["Перечисли КОНКРЕТНЫЕ добавки в формате: 'Название доза время - для вашего показателя X это снизит/улучшит Y на Z%'. Например: 'Омега-3 2000мг/день во время еды - для вашего холестерина 6.2 снизит триглицериды на 20-30%'"]
  },
  "actionPlan": ["5-6 шагов для достижения ЦЕЛЕЙ пользователя"],
  "nextSteps": ["4-5 конкретных шагов с указанием сроков"]
}`;

      const userPrompt = this.buildUserPrompt(profile, bloodMarkers);

      const response = await this.client.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens: 2000,    // Уменьшаем для более быстрого ответа
        temperature: 0.2     // Делаем более детерминированным
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Не удалось получить ответ от DeepSeek");
      }

      try {
        // Очищаем ответ от возможных маркеров кода
        let cleanContent = content;
        // Удаляем возможные маркеры кода ```json и ```
        if (cleanContent.includes('```json')) {
          cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        } else if (cleanContent.includes('```')) {
          cleanContent = cleanContent.replace(/```\s*/g, '');
        }
        
        // Удаляем лишние пробелы в начале и конце
        cleanContent = cleanContent.trim();
        
        console.log("Ответ от DeepSeek (первые 500 символов):", cleanContent.substring(0, 500));
        
        const result = JSON.parse(cleanContent) as HealthRecommendations;
        console.log("Парсинг успешен, получены рекомендации с ", result.nutrition?.items?.length || 0, "пунктами питания");
        return this.validateAndEnrichRecommendations(result);
      } catch (parseError) {
        console.error("Ошибка парсинга JSON от DeepSeek:", parseError);
        console.error("Полный ответ:", content);
        return this.getDefaultRecommendations();
      }
    } catch (error) {
      console.error("Ошибка при генерации рекомендаций с DeepSeek:", error);
      throw new Error("Не удалось сгенерировать рекомендации");
    }
  }

  private buildUserPrompt(profile: HealthProfile | null, bloodMarkers: BloodMarker[]): string {
    let prompt = "Данные пользователя:\n";

    if (profile) {
      prompt += `Возраст: ${profile.age}, пол: ${profile.gender}, ИМТ: ${profile.bmi.toFixed(1)}\n`;
      if (profile.goals && profile.goals.length > 0) {
        prompt += `ЦЕЛИ: ${profile.goals.join(', ')}\n`;
      }
      if (profile.chronicConditions && profile.chronicConditions.length > 0) {
        prompt += `Заболевания: ${profile.chronicConditions.join(', ')}\n`;
      }
      if (profile.allergies && profile.allergies.length > 0) {
        prompt += `Аллергии: ${profile.allergies.join(', ')}\n`;
      }
    }

    if (bloodMarkers && bloodMarkers.length > 0) {
      const abnormalMarkers = bloodMarkers.filter(m => m.status === 'high' || m.status === 'low');
      const normalMarkers = bloodMarkers.filter(m => m.status === 'normal');

      if (abnormalMarkers.length > 0) {
        prompt += "\nОтклонения:\n";
        abnormalMarkers.forEach(marker => {
          const status = marker.status === 'high' ? '↑' : '↓';
          prompt += `${marker.name}: ${marker.value} ${status}\n`;
        });
      }

      if (normalMarkers.length > 0) {
        prompt += "\nВ норме: " + normalMarkers.map(m => m.name).join(', ') + "\n";
      }
    }

    prompt += "\nДай JSON с персональными рекомендациями, учитывая цели и отклонения.";

    return prompt;
  }

  private validateAndEnrichRecommendations(result: HealthRecommendations): HealthRecommendations {
    // Убеждаемся, что все обязательные поля присутствуют
    if (!result.disclaimer) {
      result.disclaimer = "❗ Важно: Я — ваш ИИ-ассистент по здоровью. Мои рекомендации основаны на анализе предоставленных данных и не являются диагнозом или заменой консультации с врачом. Перед применением любых рекомендаций, особенно при наличии хронических заболеваний, проконсультируйтесь со специалистом.";
    }

    if (!result.summary) {
      result.summary = "На основе анализа ваших данных подготовлены персонализированные рекомендации для улучшения здоровья.";
    }

    if (!result.priorityAreas || result.priorityAreas.length === 0) {
      result.priorityAreas = ["Общее укрепление здоровья", "Профилактика заболеваний"];
    }

    // Убеждаемся, что все секции рекомендаций присутствуют
    if (!result.nutrition || !result.nutrition.items || !Array.isArray(result.nutrition.items) || result.nutrition.items.length === 0) {
      result.nutrition = {
        title: "Питание",
        items: ["Сбалансируйте рацион", "Увеличьте потребление овощей и фруктов"]
      };
    }

    if (!result.physicalActivity || !result.physicalActivity.items || !Array.isArray(result.physicalActivity.items) || result.physicalActivity.items.length === 0) {
      result.physicalActivity = {
        title: "Физическая активность",
        items: ["Минимум 30 минут умеренной активности в день", "Регулярные прогулки на свежем воздухе"]
      };
    }

    if (!result.lifestyle || !result.lifestyle.items || !Array.isArray(result.lifestyle.items) || result.lifestyle.items.length === 0) {
      result.lifestyle = {
        title: "Образ жизни",
        items: ["Соблюдайте режим сна (7-9 часов)", "Управляйте стрессом"]
      };
    }

    if (!result.supplements || !result.supplements.items || !Array.isArray(result.supplements.items) || result.supplements.items.length === 0) {
      result.supplements = {
        title: "Витамины и добавки",
        items: [
          "Витамин D3 2000 МЕ утром с едой",
          "Омега-3 1000 мг во время еды",
          "Магний цитрат 400 мг перед сном"
        ]
      };
    }

    if (!result.actionPlan || !Array.isArray(result.actionPlan) || result.actionPlan.length === 0) {
      result.actionPlan = ["Начните с небольших изменений в питании", "Добавьте физическую активность"];
    }

    if (!result.nextSteps || !Array.isArray(result.nextSteps) || result.nextSteps.length === 0) {
      result.nextSteps = [
        "Контролируйте показатели здоровья",
        "Начните с минимальных изменений",
        "Отслеживайте прогресс регулярно"
      ];
    }

    return result;
  }

  private getDefaultRecommendations(): HealthRecommendations {
    return {
      disclaimer: "❗ Важно: Я — ваш ИИ-ассистент по здоровью. Мои рекомендации основаны на анализе предоставленных данных и не являются диагнозом или заменой консультации с врачом. Перед применением любых рекомендаций проконсультируйтесь со специалистом.",
      summary: "Для получения персонализированных рекомендаций необходимо проанализировать ваши данные о здоровье. Пожалуйста, загрузите результаты анализов и заполните профиль здоровья.",
      priorityAreas: [
        "Общее укрепление здоровья",
        "Профилактика заболеваний",
        "Улучшение качества жизни"
      ],
      nutrition: {
        title: "Питание",
        items: [
          "Сбалансируйте рацион питания",
          "Увеличьте потребление овощей и фруктов",
          "Ограничьте потребление сахара и соли",
          "Пейте достаточное количество воды (30 мл на кг веса)"
        ]
      },
      physicalActivity: {
        title: "Физическая активность",
        items: [
          "Минимум 150 минут умеренной активности в неделю",
          "Добавьте силовые упражнения 2 раза в неделю",
          "Делайте перерывы каждый час при сидячей работе",
          "Начните с простых упражнений и постепенно увеличивайте нагрузку"
        ]
      },
      lifestyle: {
        title: "Образ жизни",
        items: [
          "Соблюдайте режим сна (7-9 часов в сутки)",
          "Управляйте стрессом через медитацию или дыхательные практики",
          "Откажитесь от вредных привычек",
          "Проводите больше времени на свежем воздухе"
        ]
      },
      supplements: {
        title: "Витамины и добавки",
        items: [
          "Поливитаминный комплекс - 1 таблетка в день утром",
          "Омега-3 (EPA/DHA) 1000 мг во время еды",
          "Витамин D3 2000 МЕ утром с жирной пищей",
          "Магний цитрат 400 мг перед сном",
          "Витамин C 500 мг в день для иммунитета",
          "Пробиотики 10-20 млрд КОЕ в день"
        ]
      },
      actionPlan: [
        "Шаг 1: Пройдите полное медицинское обследование",
        "Шаг 2: Заполните профиль здоровья в приложении",
        "Шаг 3: Загрузите результаты анализов",
        "Шаг 4: Начните с простых изменений в образе жизни",
        "Шаг 5: Отслеживайте прогресс и корректируйте план"
      ],
      nextSteps: [
        "Начните с сбалансированного питания",
        "Добавьте физическую активность",
        "Начните вести дневник здоровья",
        "Установите цели на ближайшие 3 месяца",
        "Отслеживайте прогресс еженедельно",
        "Повторите анализы через 3 месяца"
      ]
    };
  }
}

// Legacy DeepSeekAnalysisService for blood test analysis
class DeepSeekAnalysisService extends DeepSeekService {
  constructor(apiKey: string) {
    super(apiKey);
  }
  
  async analyzeBloodTestText(text: string): Promise<any> {
    try {
      console.log('Анализируем текст с DeepSeek:', text.substring(0, 200));
      
      // Parse text into structured biomarkers using AI
      const parsePrompt = `Ты — эксперт по анализу крови. Разбери следующий текст анализа крови и извлеки все биомаркеры в структурированном формате JSON.

ВАЖНО: Определи статус каждого показателя на основе нормальных значений:
- normal: значение в пределах нормы
- high: значение выше нормы  
- low: значение ниже нормы

Верни ТОЛЬКО валидный JSON массив биомаркеров в формате:
[
  {
    "name": "Название показателя",
    "value": "123.4",
    "unit": "г/л",
    "status": "normal|high|low",
    "education": "Краткое объяснение что это такое",
    "recommendation": "Рекомендация при отклонении"
  }
]

Текст анализа:
${text}`;

      const parseResponse = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: parsePrompt }
        ],
        temperature: 0.1,
        max_tokens: 4000
      });

      const parseResult = parseResponse.choices[0]?.message?.content;
      console.log('Ответ от DeepSeek (первые 500 символов):', parseResult?.substring(0, 500));

      let markers: BloodMarker[] = [];
      try {
        // Try to parse JSON from the response
        const jsonMatch = parseResult?.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          markers = JSON.parse(jsonMatch[0]);
          console.log('Парсинг успешен, получены маркеры:', markers.length);
        }
      } catch (parseError) {
        console.error('Ошибка парсинга JSON:', parseError);
        // Fallback: parse manually
        markers = this.parseTextManually(text);
      }

      // Generate recommendations based on parsed markers
      const profile = null;
      const recommendations = await this.generateHealthRecommendations(profile, markers);
      
      return {
        markers: markers,
        generalRecommendation: recommendations.summary,
        riskFactors: recommendations.priorityAreas || [],
        followUpTests: recommendations.nextSteps,
        urgencyLevel: "low",
        nextCheckup: "Через 3 месяца",
        ...recommendations
      };
    } catch (error) {
      console.error('Ошибка анализа текста:', error);
      // Fallback to manual parsing
      const markers = this.parseTextManually(text);
      const profile = null;
      const recommendations = await this.generateHealthRecommendations(profile, markers);
      
      return {
        markers: markers,
        generalRecommendation: recommendations.summary,
        riskFactors: recommendations.priorityAreas || [],
        followUpTests: recommendations.nextSteps,
        urgencyLevel: "low",
        nextCheckup: "Через 3 месяца",
        ...recommendations
      };
    }
  }

  private parseTextManually(text: string): BloodMarker[] {
    const lines = text.split('\n').filter(line => line.trim());
    const markers: BloodMarker[] = [];
    
    lines.forEach(line => {
      // Pattern: "Name: value unit (reference: min-max)"
      const match = line.match(/^([^:]+):\s*([0-9.,]+)\s*([^(]*?)(?:\s*\(референс:\s*([^)]+)\))?/i);
      
      if (match) {
        const [, name, value, unit, reference] = match;
        const cleanName = name.trim();
        const cleanValue = value.trim();
        const cleanUnit = unit.trim();
        
        // Determine status based on common normal ranges
        let status: 'normal' | 'high' | 'low' = 'normal';
        const numValue = parseFloat(cleanValue.replace(',', '.'));
        
        // Basic normal range checks
        if (cleanName.toLowerCase().includes('гемоглобин')) {
          if (numValue < 110) status = 'low';
          else if (numValue > 190) status = 'high';
        } else if (cleanName.toLowerCase().includes('эритроциты')) {
          if (numValue < 4.0) status = 'low';
          else if (numValue > 5.5) status = 'high';
        } else if (cleanName.toLowerCase().includes('лейкоциты')) {
          if (numValue < 4.0) status = 'low';
          else if (numValue > 11.0) status = 'high';
        } else if (cleanName.toLowerCase().includes('тромбоциты')) {
          if (numValue < 150) status = 'low';
          else if (numValue > 450) status = 'high';
        }
        
        markers.push({
          name: cleanName,
          value: cleanValue,
          unit: cleanUnit,
          status: status,
          education: `${cleanName} - важный показатель здоровья`,
          recommendation: status !== 'normal' ? `Обратитесь к врачу для консультации по показателю ${cleanName}` : ''
        });
      }
    });
    
    return markers;
  }

  async generateChatResponse(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Не удалось получить ответ от DeepSeek");
      }

      return content.trim();
    } catch (error) {
      console.error("Ошибка генерации ответа DeepSeek:", error);
      throw new Error("Не удалось сгенерировать ответ");
    }
  }
}

export { DeepSeekAnalysisService };
export default DeepSeekService;