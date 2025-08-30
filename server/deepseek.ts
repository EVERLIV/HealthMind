interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    logprobs: null;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  system_fingerprint: string;
}

interface BiomarkerAnalysisRequest {
  biomarkerName: string;
  currentValue: number;
  unit: string;
  normalRange: {
    min: number;
    max: number;
  };
  status: 'normal' | 'high' | 'low' | 'critical';
  patientAge?: number;
  patientGender?: string;
  patientWeight?: number;
  existingConditions?: string[];
}

interface BiomarkerRecommendations {
  analysisText: string;
  symptomsToWatch: string;
  supplementsWithDosages: string;
  foodRecommendations: string;
  lifestyleChanges: string;
  followUpAdvice: string;
}

export class DeepSeekService {
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1';

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY!;
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY environment variable is required');
    }
  }

  async generateBiomarkerRecommendations(
    request: BiomarkerAnalysisRequest
  ): Promise<BiomarkerRecommendations> {
    const { biomarkerName, currentValue, unit, normalRange, status, patientAge, patientGender } = request;

    const prompt = `Ты - опытный врач-лабораторный диагност и нутрициолог. Проанализируй следующий результат биомаркера и дай детальные рекомендации.

ДАННЫЕ ПАЦИЕНТА:
- Биомаркер: ${biomarkerName}
- Текущее значение: ${currentValue} ${unit}
- Нормальный диапазон: ${normalRange.min}-${normalRange.max} ${unit}
- Статус: ${status}
${patientAge ? `- Возраст: ${patientAge} лет` : ''}
${patientGender ? `- Пол: ${patientGender}` : ''}

ТРЕБОВАНИЯ К ОТВЕТУ:
Верни ответ в формате JSON с полями:
1. analysisText - анализ текущего состояния показателя (2-3 предложения)
2. symptomsToWatch - конкретные симптомы и признаки, на которые стоит обратить внимание
3. supplementsWithDosages - точные названия добавок с конкретными дозировками в мг/мкг/г
4. foodRecommendations - конкретные продукты питания, которые помогут улучшить показатель
5. lifestyleChanges - изменения образа жизни для нормализации показателя
6. followUpAdvice - рекомендации по контролю и мониторингу

ВАЖНО: 
- Используй только научно обоснованные рекомендации
- Указывай точные дозировки для добавок
- Называй конкретные продукты, а не общие категории
- Учитывай текущий статус показателя (${status})
- Пиши на русском языке
- Не используй markdown разметку, только обычный текст`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error:', response.status, errorText);
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data: DeepSeekResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from DeepSeek API');
      }

      try {
        const recommendations: BiomarkerRecommendations = JSON.parse(content);
        return recommendations;
      } catch (parseError) {
        console.error('Error parsing DeepSeek response:', parseError);
        console.error('Raw content:', content);
        // Fallback to structured response
        return this.createFallbackRecommendations(request);
      }
    } catch (error) {
      console.error('DeepSeek API call failed:', error);
      // Return fallback recommendations
      return this.createFallbackRecommendations(request);
    }
  }

  private createFallbackRecommendations(request: BiomarkerAnalysisRequest): BiomarkerRecommendations {
    const { biomarkerName, status } = request;
    
    const fallbackData: Record<string, Record<string, BiomarkerRecommendations>> = {
      'Гемоглобин': {
        'low': {
          analysisText: 'Пониженный уровень гемоглобина может указывать на железодефицитную анемию или другие нарушения кроветворения.',
          symptomsToWatch: 'Слабость, быстрая утомляемость, одышка при нагрузке, бледность кожи, ломкость ногтей, странные пищевые пристрастия (лед, крахмал)',
          supplementsWithDosages: 'Железо (сульфат железа 325мг 1-2 раза в день), Витамин C (1000мг для усвоения железа), Фолиевая кислота (400мкг), Витамин B12 (1000мкг)',
          foodRecommendations: 'Говядина, печень теленка, моллюски (устрицы, мидии), тунец, темная фасоль, шпинат, тыквенные семечки, темный шоколад, гранат',
          lifestyleChanges: 'Регулярные прогулки на свежем воздухе, дыхательные упражнения, избегание чрезмерных физических нагрузок до нормализации уровня',
          followUpAdvice: 'Контроль гемоглобина через 4-6 недель приема препаратов железа, консультация гематолога при отсутствии улучшений'
        },
        'high': {
          analysisText: 'Повышенный уровень гемоглобина может указывать на обезвоживание, заболевания легких или нарушения кроветворения.',
          symptomsToWatch: 'Головные боли, головокружение, нарушения зрения, покраснение кожи, повышенный риск тромбозов',
          supplementsWithDosages: 'Избегать препараты железа, Омега-3 (2г EPA/DHA для разжижения крови), Витамин E (400 МЕ)',
          foodRecommendations: 'Увеличить потребление воды, ограничить красное мясо, увеличить овощи и фрукты, зеленый чай',
          lifestyleChanges: 'Регулярная сдача крови (по назначению врача), избегание курения, контроль артериального давления',
          followUpAdvice: 'Обследование у гематолога, исключение полицитемии, контроль показателей через 2-4 недели'
        },
        'normal': {
          analysisText: 'Уровень гемоглобина находится в пределах нормы, что указывает на эффективный транспорт кислорода в организме.',
          symptomsToWatch: 'Поддерживайте текущее состояние, следите за общим самочувствием',
          supplementsWithDosages: 'Профилактические дозы: Витамин C (500мг), Фолиевая кислота (200мкг), Витамин B12 (250мкг)',
          foodRecommendations: 'Сбалансированная диета с достаточным количеством железа: нежирное мясо, рыба, бобовые, зеленые овощи',
          lifestyleChanges: 'Регулярная физическая активность, полноценный сон, управление стрессом',
          followUpAdvice: 'Плановый контроль гемоглобина раз в год при профилактических осмотрах'
        }
      },
      'Общий холестерин': {
        'high': {
          analysisText: 'Повышенный уровень общего холестерина увеличивает риск сердечно-сосудистых заболеваний и требует коррекции.',
          symptomsToWatch: 'Ксантомы (желтые пятна вокруг глаз), боли в ногах при ходьбе, стенокардия, повышенное артериальное давление',
          supplementsWithDosages: 'Омега-3 (2-3г EPA/DHA), Красный дрожжевой рис (600мг), Коэнзим Q10 (100мг), Берберин (500мг 3 раза в день), Растворимая клетчатка (10г)',
          foodRecommendations: 'Овсянка, ячмень, бобовые (чечевица, нут), яблоки, авокадо, жирная рыба (лосось, скумбрия), грецкие орехи, оливковое масло',
          lifestyleChanges: 'Кардиотренировки 150 минут в неделю, контроль веса, отказ от курения, снижение стресса',
          followUpAdvice: 'Контроль липидного профиля через 6-8 недель диеты, консультация кардиолога при необходимости статинов'
        },
        'normal': {
          analysisText: 'Уровень общего холестерина в норме, что соответствует низкому риску сердечно-сосудистых заболеваний.',
          symptomsToWatch: 'Поддерживайте здоровый образ жизни для сохранения оптимального уровня',
          supplementsWithDosages: 'Профилактически: Омега-3 (1г EPA/DHA), Витамин D3 (2000 МЕ), Магний (300мг)',
          foodRecommendations: 'Средиземноморская диета: рыба, овощи, фрукты, орехи, оливковое масло, цельные злаки',
          lifestyleChanges: 'Регулярная физическая активность, поддержание здорового веса, ограничение алкоголя',
          followUpAdvice: 'Контроль липидного профиля раз в 1-2 года при отсутствии факторов риска'
        }
      }
    };

    const biomarkerData = fallbackData[biomarkerName];
    if (biomarkerData && biomarkerData[status]) {
      return biomarkerData[status];
    }

    // Generic fallback
    return {
      analysisText: `Показатель ${biomarkerName} требует индивидуальной интерпретации врача с учетом общего состояния здоровья.`,
      symptomsToWatch: 'Следите за общим самочувствием, обратитесь к врачу при появлении новых симптомов.',
      supplementsWithDosages: 'Консультация с врачом по поводу необходимых добавок и их дозировок.',
      foodRecommendations: 'Сбалансированная диета с достаточным количеством белков, жиров, углеводов, витаминов и минералов.',
      lifestyleChanges: 'Регулярная физическая активность, полноценный сон, управление стрессом, отказ от вредных привычек.',
      followUpAdvice: 'Регулярный контроль показателя согласно рекомендациям лечащего врача.'
    };
  }
}