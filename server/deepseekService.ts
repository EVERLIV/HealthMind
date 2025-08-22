interface EnhancedBloodAnalysisResults {
  markers: Array<{
    name: string;
    value: string;
    normalRange: string;
    status: 'normal' | 'high' | 'low';
    recommendation: string;
    education: string;
    lifestyle: string;
  }>;
  supplements: Array<{
    name: string;
    reason: string;
    dosage: string;
    duration: string;
  }>;
  generalRecommendation: string;
  riskFactors: string[];
  followUpTests: string[];
  urgencyLevel: 'low' | 'medium' | 'high';
  nextCheckup: string;
}

const systemPrompt = `Вы - высококвалифицированный медицинский лаборант и ИИ-помощник, специализирующийся на анализе результатов лабораторных исследований крови с расширенными возможностями OCR и интерпретации биомаркеров.

РАСШИРЕННЫЕ OCR ВОЗМОЖНОСТИ:
- Распознавание различных форматов лабораторий (Инвитро, Гемотест, CMD, KDL, местные лаборатории)
- Обработка рукописных записей врачей
- Распознавание таблиц, списков и различных макетов
- Извлечение данных из PDF-сканов и фотографий низкого качества
- Обработка многостраничных результатов

РАСШИРЕННАЯ БАЗА БИОМАРКЕРОВ:
Основные показатели:
- Гемоглобин: мужчины 130-170 г/л, женщины 120-150 г/л
- Эритроциты: мужчины 4.0-5.5×10¹²/л, женщины 3.5-5.0×10¹²/л
- Лейкоциты: 4.0-9.0×10⁹/л
- Тромбоциты: 150-400×10⁹/л
- Холестерин общий: <5.2 ммоль/л
- Холестерин ЛПНП: <3.0 ммоль/л
- Холестерин ЛПВП: мужчины >1.0, женщины >1.2 ммоль/л
- Триглицериды: <1.7 ммоль/л
- Глюкоза: 3.9-6.1 ммоль/л
- Креатинин: мужчины 62-115, женщины 53-97 мкмоль/л
- Мочевина: 2.5-8.3 ммоль/л
- Билирубин общий: 8.5-20.5 мкмоль/л
- АЛТ: мужчины <41, женщины <31 Ед/л
- АСТ: мужчины <37, женщины <31 Ед/л

ОБРАЗОВАТЕЛЬНЫЙ КОНТЕНТ:
Для каждого биомаркера включайте:
- Краткое объяснение функции в организме
- Причины повышения/понижения
- Связь с другими показателями
- Рекомендации по питанию и образу жизни
- Когда нужна консультация врача

ВАЖНО: Всегда подчеркивайте, что результаты носят информационный характер и не заменяют консультацию врача.`;

export class DeepSeekAnalysisService {
  private apiKey: string;
  private baseUrl: string = 'https://api.deepseek.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeBloodTestText(text: string): Promise<EnhancedBloodAnalysisResults> {
    const prompt = `Проанализируйте следующие результаты анализа крови:
${text}

Обратите особое внимание на:
1. Все числовые значения и их единицы измерения
2. Возможные опечатки или нестандартные обозначения
3. Взаимосвязи между показателями
4. Образовательную ценность для пациента

Верните результат в формате JSON согласно интерфейсу EnhancedBloodAnalysisResults.`;

    return this.callDeepSeekAPI(prompt);
  }

  async analyzeBloodTestImage(imageBase64: string): Promise<EnhancedBloodAnalysisResults> {
    const prompt = `Проанализируйте это изображение анализа крови с расширенными возможностями OCR:

ИНСТРУКЦИИ ПО OCR:
1. Внимательно изучите весь документ, включая заголовки, таблицы, примечания
2. Распознайте все числовые значения, даже если они написаны от руки
3. Обратите внимание на единицы измерения (г/л, ×10⁹/л, ммоль/л и т.д.)
4. Извлеките информацию о лаборатории и дате анализа
5. Найдите референтные значения, если они указаны

Верните результат в формате JSON согласно интерфейсу EnhancedBloodAnalysisResults.`;

    return this.callDeepSeekAPI(prompt, imageBase64);
  }

  private async callDeepSeekAPI(prompt: string, imageBase64?: string): Promise<EnhancedBloodAnalysisResults> {
    try {
      const messages = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: imageBase64 ? [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ] : prompt
        }
      ];

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: messages,
          temperature: 0.2,
          max_tokens: 4000,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Не получен ответ от DeepSeek API');
      }

      try {
        const parsedResults = JSON.parse(content) as EnhancedBloodAnalysisResults;
        return this.validateAndFormatResults(parsedResults);
      } catch (parseError) {
        console.error('Ошибка парсинга ответа DeepSeek:', parseError);
        return this.createFallbackResults();
      }

    } catch (error) {
      console.error('Ошибка вызова DeepSeek API:', error);
      return this.createFallbackResults();
    }
  }

  private validateAndFormatResults(results: EnhancedBloodAnalysisResults): EnhancedBloodAnalysisResults {
    // Валидация и очистка результатов
    return {
      markers: results.markers?.map(marker => ({
        name: marker.name || 'Неизвестный показатель',
        value: marker.value || 'Не указано',
        normalRange: marker.normalRange || 'Не указано',
        status: ['normal', 'high', 'low'].includes(marker.status) ? marker.status : 'normal',
        recommendation: marker.recommendation || 'Нет рекомендаций',
        education: marker.education || 'Дополнительная информация отсутствует',
        lifestyle: marker.lifestyle || 'Общие рекомендации по здоровому образу жизни'
      })) || [],
      supplements: results.supplements?.map(supplement => ({
        name: supplement.name || 'Добавка',
        reason: supplement.reason || 'Для поддержания здоровья',
        dosage: supplement.dosage || 'Согласно инструкции',
        duration: supplement.duration || 'Уточните у врача'
      })) || [],
      generalRecommendation: results.generalRecommendation || 'Проконсультируйтесь с врачом для детальной интерпретации результатов.',
      riskFactors: results.riskFactors || [],
      followUpTests: results.followUpTests || [],
      urgencyLevel: ['low', 'medium', 'high'].includes(results.urgencyLevel) ? results.urgencyLevel : 'low',
      nextCheckup: results.nextCheckup || 'Через 3-6 месяцев'
    };
  }

  private createFallbackResults(): EnhancedBloodAnalysisResults {
    return {
      markers: [
        {
          name: 'Анализ не распознан',
          value: 'Не удалось обработать',
          normalRange: 'Не определено',
          status: 'normal',
          recommendation: 'Загрузите более качественное изображение или введите данные вручную',
          education: 'Для точного анализа необходимо четкое изображение результатов',
          lifestyle: 'Соблюдайте здоровый образ жизни'
        }
      ],
      supplements: [],
      generalRecommendation: 'Не удалось проанализировать результаты. Пожалуйста, проконсультируйтесь с врачом.',
      riskFactors: ['Неполная информация'],
      followUpTests: [],
      urgencyLevel: 'medium',
      nextCheckup: 'Обратитесь к врачу для консультации'
    };
  }
}

export default DeepSeekAnalysisService;