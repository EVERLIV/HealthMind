import { Heart, Zap, Clock, Shield, Brain, Moon, Target, Wind, Apple, Dumbbell } from "lucide-react";
import { iconSizes } from "@/components/ui/icon-container";

export interface Article {
  id: string;
  title: string;
  description: string;
  readTime: string;
  category: string;
  goals: string[];
  relevanceScore: number;
  icon: React.ReactNode;
  imageUrl?: string;
  content?: string;
  sections?: {
    title: string;
    content: string;
  }[];
  tips?: string[];
  warnings?: string[];
  author?: string;
  publishDate?: string;
  trending?: boolean;
  new?: boolean;
  relatedArticles?: string[];
}

export const articlesDatabase: Record<string, Article> = {
  "1": {
    id: "1",
    title: "5 способов снизить холестерин без лекарств",
    description: "Простые изменения в питании для здоровья сердца",
    readTime: "3 мин",
    category: "heart-health",
    goals: ["heart-health", "nutrition"],
    relevanceScore: 95,
    icon: <Heart className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop",
    content: `Высокий уровень холестерина - серьезный фактор риска сердечных заболеваний. Однако существуют эффективные немедикаментозные способы его снижения.

Исследования показывают, что изменение образа жизни может снизить уровень "плохого" холестерина (ЛПНП) на 10-20% за 3 месяца.`,
    sections: [
      {
        title: "1. Увеличьте потребление клетчатки",
        content: `Растворимая клетчатка связывает холестерин в пищеварительной системе и выводит его из организма. 

Рекомендуемая норма - 25-35 граммов клетчатки в день. Лучшие источники:
• Овсянка (4г на порцию)
• Яблоки (4г на среднее яблоко)
• Груши (5г на грушу)
• Бобовые (8г на чашку)`
      },
      {
        title: "2. Омега-3 жирные кислоты",
        content: `Жирная рыба богата омега-3, которые снижают триглицериды и повышают "хороший" холестерин (ЛПВП).

Оптимальная частота употребления:
• Лосось, скумбрия - 2 раза в неделю
• Порция 100-150г
• Альтернатива: льняное семя, грецкие орехи`
      },
      {
        title: "3. Орехи и авокадо",
        content: `Мононенасыщенные жиры улучшают липидный профиль без снижения ЛПВП.

Рекомендации по употреблению:
• 30г орехов в день (горсть)
• Половина авокадо 3-4 раза в неделю
• Миндаль особенно эффективен`
      },
      {
        title: "4. Физическая активность",
        content: `Регулярные упражнения повышают ЛПВП и снижают ЛПНП.

Минимальная программа:
• 150 минут умеренной активности в неделю
• Или 75 минут интенсивной нагрузки
• Ходьба 30 минут 5 дней в неделю`
      },
      {
        title: "5. Зеленый чай",
        content: `Катехины в зеленом чае снижают всасывание холестерина.

Эффективная дозировка:
• 2-3 чашки зеленого чая в день
• Без добавления сахара
• Лучше пить между приемами пищи`
      }
    ],
    tips: [
      "Начинайте день с овсянки с ягодами и орехами",
      "Замените красное мясо на рыбу 2 раза в неделю",
      "Добавляйте льняное семя в йогурт или смузи",
      "Используйте оливковое масло вместо сливочного",
      "Перекусывайте орехами вместо чипсов"
    ],
    warnings: [
      "Проконсультируйтесь с врачом перед изменением диеты при приеме статинов",
      "Резкие изменения могут вызвать дискомфорт в ЖКТ",
      "При наследственной гиперхолестеринемии диета менее эффективна"
    ],
    author: "Д-р Иванова М.А., кардиолог",
    publishDate: "2024-01-15",
    relatedArticles: ["2", "3", "6"],
    trending: true
  },
  "2": {
    id: "2",
    title: "Утренние ритуалы для энергии на весь день",
    description: "Как правильно начать день и сохранить бодрость",
    readTime: "5 мин",
    category: "energy",
    goals: ["energy", "sleep"],
    relevanceScore: 88,
    icon: <Zap className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=400&fit=crop",
    content: `Правильное начало дня определяет уровень энергии на следующие 16 часов. Научно обоснованные ритуалы помогут максимизировать продуктивность.`,
    sections: [
      {
        title: "Просыпайтесь в одно время",
        content: `Стабильный режим сна регулирует циркадные ритмы. Даже в выходные старайтесь вставать в привычное время ± 30 минут.`
      },
      {
        title: "10 минут утреннего солнца",
        content: `Естественный свет блокирует мелатонин и запускает выработку кортизола. Выйдите на балкон или откройте окно сразу после пробуждения.`
      },
      {
        title: "Стакан воды с лимоном",
        content: `За ночь организм теряет до 500мл жидкости. Восполнение водного баланса улучшает когнитивные функции на 14%.`
      }
    ],
    tips: [
      "Установите будильник на одно время каждый день",
      "Держите стакан воды у кровати",
      "Откройте шторы сразу после пробуждения"
    ],
    author: "Команда HealthAI",
    publishDate: "2024-01-20",
    new: true,
    relatedArticles: ["5", "8"]
  },
  "3": {
    id: "3",
    title: "Интервальное голодание: научный подход",
    description: "Все что нужно знать о методе 16:8",
    readTime: "7 мин",
    category: "weight-loss",
    goals: ["weight-loss", "nutrition"],
    relevanceScore: 92,
    icon: <Clock className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1563865436874-9aef32095fad?w=800&h=400&fit=crop",
    content: `Интервальное голодание 16:8 - эффективный метод контроля веса и улучшения метаболического здоровья.`,
    sections: [
      {
        title: "Что такое метод 16:8",
        content: `16 часов голодания и 8 часов для приема пищи. Например, питание с 12:00 до 20:00.`
      },
      {
        title: "Научные преимущества",
        content: `Улучшение инсулиновой чувствительности, активация аутофагии, снижение воспаления.`
      }
    ],
    tips: [
      "Начните с 12:12",
      "Пейте больше воды",
      "Не переедайте в окно питания"
    ],
    trending: true,
    relatedArticles: ["1", "6"]
  },
  "4": {
    id: "4",
    title: "Витамин D и иммунитет",
    description: "Почему это важно особенно зимой",
    readTime: "4 мин",
    category: "immunity",
    goals: ["immunity"],
    relevanceScore: 85,
    icon: <Shield className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1542736667-069246bdbc6d?w=800&h=400&fit=crop",
    content: `Витамин D играет ключевую роль в поддержании иммунной системы, особенно в зимний период.`,
    tips: [
      "15 минут на солнце летом",
      "1000-2000 МЕ зимой",
      "Жирная рыба 2 раза в неделю"
    ],
    new: true,
    relatedArticles: ["7"]
  },
  "5": {
    id: "5",
    title: "Медитация для занятых: 5 минут в день",
    description: "Быстрые техники снижения стресса",
    readTime: "3 мин",
    category: "stress",
    goals: ["stress", "mental"],
    relevanceScore: 83,
    icon: <Brain className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=400&fit=crop",
    content: `Всего 5 минут медитации снижают уровень кортизола на 23% и улучшают концентрацию.`,
    tips: [
      "Медитируйте в одно время",
      "Используйте технику 4-7-8 для дыхания",
      "Начните с 2 минут"
    ],
    relatedArticles: ["2", "8"]
  },
  "6": {
    id: "6",
    title: "План питания для снижения веса",
    description: "Сбалансированный подход без жестких диет",
    readTime: "8 мин",
    category: "weight-loss",
    goals: ["weight-loss", "nutrition"],
    relevanceScore: 90,
    icon: <Target className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&h=400&fit=crop",
    content: `Эффективное снижение веса без голодания и стресса для организма.`,
    trending: true,
    relatedArticles: ["3", "1"]
  },
  "7": {
    id: "7",
    title: "Суперфуды для иммунитета",
    description: "Топ-10 продуктов для защиты организма",
    readTime: "5 мин",
    category: "immunity",
    goals: ["immunity", "nutrition"],
    relevanceScore: 87,
    icon: <Shield className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop",
    content: `Продукты, которые естественным образом укрепляют защитные силы организма.`,
    new: true,
    relatedArticles: ["4"]
  },
  "8": {
    id: "8",
    title: "Секреты крепкого сна",
    description: "Наука о качественном восстановлении",
    readTime: "6 мин",
    category: "sleep",
    goals: ["sleep", "recovery"],
    relevanceScore: 89,
    icon: <Moon className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1515894203077-9cd36032142f?w=800&h=400&fit=crop",
    content: `Качественный сон - основа здоровья и долголетия. Научные методы улучшения сна.`,
    relatedArticles: ["2", "5"]
  },
  "9": {
    id: "9",
    title: "Йога для начинающих",
    description: "15-минутная утренняя практика",
    readTime: "4 мин",
    category: "fitness",
    goals: ["fitness", "mental", "stress"],
    relevanceScore: 82,
    icon: <Wind className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop",
    content: `Простые асаны для улучшения гибкости, силы и ментального здоровья.`,
    tips: [
      "Начните с простых поз",
      "Дышите глубоко и размеренно",
      "Практикуйтесь на голодный желудок"
    ]
  },
  "10": {
    id: "10",
    title: "Антиоксиданты и старение",
    description: "Как замедлить процессы старения питанием",
    readTime: "7 мин",
    category: "nutrition",
    goals: ["nutrition", "immunity"],
    relevanceScore: 86,
    icon: <Apple className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff563d2c?w=800&h=400&fit=crop",
    content: `Роль антиоксидантов в защите клеток от окислительного стресса и преждевременного старения.`
  },
  "11": {
    id: "11",
    title: "HIIT тренировки дома",
    description: "20 минут для максимального результата",
    readTime: "5 мин",
    category: "fitness",
    goals: ["fitness", "weight-loss", "energy"],
    relevanceScore: 91,
    icon: <Dumbbell className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&h=400&fit=crop",
    content: `Высокоинтенсивные интервальные тренировки для быстрого жиросжигания и улучшения выносливости.`,
    trending: true
  },
  "12": {
    id: "12",
    title: "Дыхательные практики для энергии",
    description: "Техники быстрого восстановления сил",
    readTime: "3 мин",
    category: "energy",
    goals: ["energy", "stress"],
    relevanceScore: 84,
    icon: <Wind className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop",
    content: `Простые дыхательные упражнения для мгновенного прилива энергии и снижения стресса.`
  }
};

export const articlesArray = Object.values(articlesDatabase);