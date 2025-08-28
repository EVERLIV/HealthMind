export class DeepSeekVisionService {
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeHealthImage(imageBase64: string, mimeType: string = 'image/jpeg', question: string): Promise<string> {
    try {
      // Validate and normalize MIME type
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      let validatedMimeType = mimeType?.toLowerCase();
      
      if (!validatedMimeType || !validMimeTypes.includes(validatedMimeType)) {
        console.log('Invalid MIME type:', mimeType, 'defaulting to image/jpeg');
        validatedMimeType = 'image/jpeg';
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "deepseek-vl-7b-chat",
          messages: [
            {
              role: "system",
              content: `Вы - опытный врач-дерматолог с 15-летним стажем. 
              Специализируетесь на диагностике кожных заболеваний по фотографиям.
              
              ВАЖНО:
              1. Внимательно изучите изображение на предмет кожных патологий
              2. Определите возможные диагнозы (в порядке вероятности)
              3. Опишите визуальные признаки и симптомы
              4. Дайте подробные медицинские рекомендации
              5. Укажите когда нужно срочно обратиться к врачу
              
              Анализируйте: высыпания, пятна, родинки, покраснения, шелушения, 
              воспаления, новообразования, изменения цвета кожи, текстуры.`
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: question || `Проанализируйте это изображение кожи/кожного заболевания:
                  
                  1. Что вы видите на изображении? (подробное описание)
                  2. Какие возможные диагнозы? (с вероятностью)
                  3. Какие дополнительные симптомы нужно проверить?
                  4. Рекомендации по лечению и уходу
                  5. Когда нужна срочная медицинская помощь?
                  
                  Дайте профессиональный медицинский анализ.`
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
          max_tokens: 1500,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek Vision API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const analysis = data.choices[0]?.message?.content || "Не удалось проанализировать изображение.";
      
      // Добавляем предупреждение о необходимости консультации
      return `${analysis}

⚠️ **ВАЖНО**: Данный анализ носит информационный характер. Для точной диагностики и назначения лечения обязательно обратитесь к врачу-дерматологу очно.`;
    } catch (error) {
      console.error("Error analyzing health image with DeepSeek Vision:", error);
      
      // Предоставляем полезную информацию даже при ошибке
      return `📸 **Изображение получено для анализа**

К сожалению, сервис анализа изображений временно недоступен, но вы можете:

🔍 **Описать проблему текстом:**
- Где именно находится проблема на коже?
- Как долго это наблюдается?
- Есть ли зуд, боль или другие симптомы?
- Изменялся ли внешний вид со временем?

💊 **Общие рекомендации по уходу за кожей:**
- Избегайте расчесывания
- Содержите область в чистоте
- Используйте мягкие средства гигиены
- Избегайте воздействия солнца на проблемную зону

⚠️ **Обратитесь к врачу если:**
- Область быстро увеличивается
- Появилась боль или кровотечение
- Изменился цвет или форма
- Повысилась температура

Попробуйте описать проблему текстом - я смогу дать более конкретные советы!`;
    }
  }
}

export default DeepSeekVisionService;