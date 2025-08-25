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
  private client: OpenAI;

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
      const systemPrompt = `## 1. Роль и цель

Ты — ИИ-ассистент по здоровью. Твоя цель — анализировать данные о здоровье пользователя и предоставлять персонализированные рекомендации с учетом ЦЕЛЕЙ пользователя. Ты не являешься врачом, и твои рекомендации не заменяют медицинскую консультацию.

## 2. Ключевые принципы

1. **Учитывай цели пользователя:** ВСЕ рекомендации должны помогать достичь заявленных целей (похудение, набор массы, выносливость, здоровье сердца и т.д.)
2. **Детализация по биомаркерам:** Для КАЖДОГО отклоненного биомаркера дай конкретные способы улучшения и точные дозировки добавок
3. **Безопасность:** При критических отклонениях — немедленно рекомендуй обратиться к врачу
4. **Научная обоснованность:** Все рекомендации основаны на современных клинических рекомендациях
5. **Персонализация:** Учитывай возраст, пол, хронические заболевания, аллергии, принимаемые лекарства

## 3. Структура ответа

Отвечай ТОЛЬКО в формате JSON:
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
    "items": ["6-8 рекомендаций с учетом ЦЕЛЕЙ и биомаркеров"]
  },
  "physicalActivity": {
    "title": "Физическая активность",
    "items": ["5-6 рекомендаций для достижения ЦЕЛЕЙ"]
  },
  "lifestyle": {
    "title": "Образ жизни",
    "items": ["4-5 рекомендаций по режиму и привычкам"]
  },
  "supplements": {
    "title": "Витамины и добавки",
    "items": ["5-7 добавок с ТОЧНЫМИ дозировками и временем приема"]
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
        max_tokens: 3000,
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Не удалось получить ответ от DeepSeek");
      }

      try {
        const result = JSON.parse(content) as HealthRecommendations;
        return this.validateAndEnrichRecommendations(result);
      } catch (parseError) {
        console.error("Ошибка парсинга JSON от DeepSeek:", content);
        return this.getDefaultRecommendations();
      }
    } catch (error) {
      console.error("Ошибка при генерации рекомендаций с DeepSeek:", error);
      throw new Error("Не удалось сгенерировать рекомендации");
    }
  }

  private buildUserPrompt(profile: HealthProfile | null, bloodMarkers: BloodMarker[]): string {
    let prompt = "Проанализируй следующие данные о здоровье пользователя и дай рекомендации для достижения его ЦЕЛЕЙ:\n\n";

    if (profile) {
      prompt += "**ПРОФИЛЬ ЗДОРОВЬЯ:**\n";
      prompt += `- Возраст: ${profile.age} лет\n`;
      prompt += `- Пол: ${profile.gender}\n`;
      prompt += `- Рост: ${profile.height} см\n`;
      prompt += `- Вес: ${profile.weight} кг\n`;
      prompt += `- ИМТ: ${profile.bmi.toFixed(1)}\n`;
      prompt += `- Уровень активности: ${profile.activityLevel}\n`;
      
      if (profile.goals && profile.goals.length > 0) {
        prompt += `\n🎯 **ЦЕЛИ ПОЛЬЗОВАТЕЛЯ (ОБЯЗАТЕЛЬНО УЧТИ!):**\n`;
        profile.goals.forEach(goal => {
          prompt += `- ${goal}\n`;
        });
      }
      
      if (profile.chronicConditions && profile.chronicConditions.length > 0) {
        prompt += `\n⚠️ Хронические заболевания: ${profile.chronicConditions.join(', ')}\n`;
      }
      
      if (profile.allergies && profile.allergies.length > 0) {
        prompt += `🚫 Аллергии (НЕ рекомендуй эти продукты!): ${profile.allergies.join(', ')}\n`;
      }
      
      if (profile.medications && profile.medications.length > 0) {
        prompt += `💊 Принимаемые лекарства: ${profile.medications.join(', ')}\n`;
      }
      
      if (profile.supplements && profile.supplements.length > 0) {
        prompt += `🌿 Уже принимает добавки: ${profile.supplements.join(', ')}\n`;
      }
      
      prompt += "\n";
    }

    if (bloodMarkers && bloodMarkers.length > 0) {
      prompt += "**РЕЗУЛЬТАТЫ АНАЛИЗОВ КРОВИ:**\n";
      
      // Группируем маркеры по статусу
      const criticalMarkers = bloodMarkers.filter(m => m.status === 'critical');
      const abnormalMarkers = bloodMarkers.filter(m => m.status === 'high' || m.status === 'low');
      const normalMarkers = bloodMarkers.filter(m => m.status === 'normal');

      if (criticalMarkers.length > 0) {
        prompt += "\n⚠️ КРИТИЧЕСКИЕ ОТКЛОНЕНИЯ (требуют срочного внимания!):\n";
        criticalMarkers.forEach(marker => {
          prompt += `- ${marker.name}: ${marker.value} ${marker.unit || ''} (норма: ${marker.normalRange || 'н/д'}) - КРИТИЧНО!\n`;
        });
      }

      if (abnormalMarkers.length > 0) {
        prompt += "\n❗ ОТКЛОНЕНИЯ ОТ НОРМЫ (создай biomarkerRecommendations для КАЖДОГО!):\n";
        abnormalMarkers.forEach(marker => {
          const status = marker.status === 'high' ? 'ПОВЫШЕН' : 'ПОНИЖЕН';
          prompt += `- ${marker.name}: ${marker.value} ${marker.unit || ''} (норма: ${marker.normalRange || 'н/д'}) - ${status}\n`;
        });
      }

      if (normalMarkers.length > 0) {
        prompt += "\n✅ В ПРЕДЕЛАХ НОРМЫ:\n";
        normalMarkers.forEach(marker => {
          prompt += `- ${marker.name}: ${marker.value} ${marker.unit || ''}\n`;
        });
      }
    }

    prompt += "\n\n**ВАЖНЫЕ ТРЕБОВАНИЯ:**\n";
    prompt += "1. ВСЕ рекомендации должны помогать достичь ЦЕЛЕЙ пользователя\n";
    prompt += "2. Для КАЖДОГО биомаркера вне нормы создай детальный раздел в biomarkerRecommendations\n";
    prompt += "3. Указывай ТОЧНЫЕ дозировки витаминов (мг, МЕ, мкг) и время приема\n";
    prompt += "4. Учитывай противопоказания при хронических заболеваниях и аллергиях\n";
    prompt += "5. ПИТАНИЕ: Дай конкретные продукты, размеры порций и частоту приема\n";
    prompt += "6. АКТИВНОСТЬ: Указывай тип упражнений, продолжительность, интенсивность и частоту\n";
    prompt += "7. ПРИОРИТЕТЫ: Основывай на отклонениях в анализах и целях пользователя\n";
    prompt += "8. ОБЯЗАТЕЛЬНО: Отвечай только в формате JSON, без лишнего текста!\n";
    prompt += "5. Если цель - похудение, все рекомендации должны способствовать снижению веса\n";
    prompt += "6. Если цель - набор массы, рекомендации должны помогать набору мышечной массы\n";

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
    if (!result.nutrition || !result.nutrition.items) {
      result.nutrition = {
        title: "Питание",
        items: ["Сбалансируйте рацион", "Увеличьте потребление овощей и фруктов"]
      };
    }

    if (!result.physicalActivity || !result.physicalActivity.items) {
      result.physicalActivity = {
        title: "Физическая активность",
        items: ["Минимум 30 минут умеренной активности в день", "Регулярные прогулки на свежем воздухе"]
      };
    }

    if (!result.lifestyle || !result.lifestyle.items) {
      result.lifestyle = {
        title: "Образ жизни",
        items: ["Соблюдайте режим сна (7-9 часов)", "Управляйте стрессом"]
      };
    }

    if (!result.supplements || !result.supplements.items) {
      result.supplements = {
        title: "Витамины и добавки",
        items: ["Проконсультируйтесь с врачом перед приемом любых добавок"]
      };
    }

    if (!result.actionPlan || result.actionPlan.length === 0) {
      result.actionPlan = ["Начните с небольших изменений в питании", "Добавьте физическую активность"];
    }

    if (!result.nextSteps || result.nextSteps.length === 0) {
      result.nextSteps = ["Контролируйте показатели здоровья", "Обратитесь к врачу для детальной консультации"];
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
          "Сдайте анализы на основные витамины и минералы",
          "Проконсультируйтесь с врачом перед приемом любых добавок",
          "Не превышайте рекомендуемые дозировки",
          "Отдавайте предпочтение получению витаминов из пищи"
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
        "Запишитесь на консультацию к терапевту",
        "Сдайте общий анализ крови и биохимию",
        "Начните вести дневник питания",
        "Установите регулярные напоминания о физической активности",
        "Повторите анализы через 3 месяца для оценки динамики"
      ]
    };
  }
}

// Legacy DeepSeekAnalysisService for blood test analysis
export class DeepSeekAnalysisService extends DeepSeekService {
  constructor(apiKey: string) {
    super(apiKey);
  }
  
  async analyzeBloodTestText(text: string): Promise<any> {
    // Legacy method for backward compatibility
    const profile = null;
    const bloodMarkers: any[] = [];
    const recommendations = await this.generateHealthRecommendations(profile, bloodMarkers);
    return {
      markers: [],
      supplements: [],
      generalRecommendation: recommendations.summary,
      riskFactors: [],
      followUpTests: recommendations.nextSteps,
      urgencyLevel: "low",
      nextCheckup: "Через 3 месяца"
    };
  }
}

export default DeepSeekService;