import { useParams, Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IconContainer, iconSizes } from "@/components/ui/icon-container";
import BottomNav from "@/components/layout/bottom-nav";
import { articlesDatabase } from "@/data/articles";
import {
  ChevronLeft,
  Clock,
  Share2,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Heart,
  Brain,
  Moon,
  Dumbbell,
  Apple,
  Shield,
  Zap,
  Target,
  Wind,
  BookOpen,
  Eye,
  MessageCircle,
  ThumbsUp
} from "lucide-react";

const categoryNames = {
  "weight-loss": "Снижение веса",
  "heart-health": "Здоровье сердца",
  "energy": "Энергия",
  "immunity": "Иммунитет",
  "sleep": "Сон",
  "stress": "Антистресс",
  "nutrition": "Питание",
  "fitness": "Фитнес",
  "mental": "Ментальное",
  "recovery": "Восстановление"
};

const categoryIcons = {
  "weight-loss": <Target className={iconSizes.sm} />,
  "heart-health": <Heart className={iconSizes.sm} />,
  "energy": <Zap className={iconSizes.sm} />,
  "immunity": <Shield className={iconSizes.sm} />,
  "sleep": <Moon className={iconSizes.sm} />,
  "stress": <Brain className={iconSizes.sm} />,
  "nutrition": <Apple className={iconSizes.sm} />,
  "fitness": <Dumbbell className={iconSizes.sm} />,
  "mental": <Brain className={iconSizes.sm} />,
  "recovery": <Wind className={iconSizes.sm} />
};

const categoryColors = {
  "weight-loss": "soft-warning",
  "heart-health": "soft-danger",
  "energy": "warning",
  "immunity": "soft-success",
  "sleep": "soft-info",
  "stress": "soft-primary",
  "nutrition": "soft-success",
  "fitness": "warning",
  "mental": "soft-info",
  "recovery": "soft-primary"
} as const;

// Статьи импортируются из общей базы данных
/* const articlesDatabase: Record<string, Article> = {
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
    relatedArticles: ["2", "3", "6"]
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
    publishDate: "2024-01-20"
  }
};
*/

export default function ArticleDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const articleId = params.id;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  
  const article = articleId ? articlesDatabase[articleId] : null;
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / scrollHeight) * 100;
      setReadProgress(Math.min(100, Math.max(0, progress)));
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Статья не найдена</h2>
            <Link href="/dashboard">
              <Button variant="outline">Вернуться на главную</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Прогресс-бар чтения */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-800">
        <div 
          className="h-full bg-medical-blue transition-all duration-300"
          style={{ width: `${readProgress}%` }}
        />
      </div>
      
      {/* Навигационная панель */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </Link>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-medical-blue text-medical-blue' : ''}`} />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <main className="pb-24">
        {/* Героическое изображение */}
        {article.imageUrl && (
          <div 
            className="h-64 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${article.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                  {categoryNames[article.category as keyof typeof categoryNames]}
                </Badge>
                <span className="text-white/80 text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.readTime}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Контент статьи */}
        <div className="px-4 py-6 max-w-3xl mx-auto">
          {/* Заголовок и мета-информация */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-3 leading-tight">
              {article.title}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              {article.description}
            </p>
            
            {/* Автор и дата */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pb-4 border-b border-gray-200 dark:border-gray-700">
              {article.author && (
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  {article.author}
                </span>
              )}
              {article.publishDate && (
                <span>{new Date(article.publishDate).toLocaleDateString('ru-RU', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              )}
            </div>
          </div>
          
          {/* Основной контент */}
          {article.content && (
            <div className="prose prose-base dark:prose-invert max-w-none mb-8">
              {article.content.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="text-base leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
                    {paragraph}
                  </p>
                )
              ))}
            </div>
          )}
          
          {/* Секции с подзаголовками */}
          {article.sections && article.sections.map((section, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {section.title}
              </h2>
              <div className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
          
          {/* Полезные советы */}
          {article.tips && article.tips.length > 0 && (
            <Card className="border-0 shadow-lg bg-green-50 dark:bg-green-950/20 mb-6">
              <CardContent className="p-5">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <IconContainer size="sm" variant="soft-success">
                    <CheckCircle className={iconSizes.sm} />
                  </IconContainer>
                  Полезные советы
                </h3>
                <ul className="space-y-3">
                  {article.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {/* Важные предупреждения */}
          {article.warnings && article.warnings.length > 0 && (
            <Card className="border-0 shadow-lg bg-orange-50 dark:bg-orange-950/20 mb-6">
              <CardContent className="p-5">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <IconContainer size="sm" variant="soft-warning">
                    <AlertCircle className={iconSizes.sm} />
                  </IconContainer>
                  Важно знать
                </h3>
                <ul className="space-y-3">
                  {article.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{warning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {/* Взаимодействие со статьей */}
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 mb-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-medical-blue transition-colors">
                    <ThumbsUp className="w-5 h-5" />
                    <span>Полезно</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-medical-blue transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span>Комментарии</span>
                  </button>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  Прочитано {Math.round(readProgress)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* Похожие статьи */}
          {article.relatedArticles && article.relatedArticles.length > 0 && (
            <div className="mt-8">
              <h3 className="font-bold text-lg mb-4">Читайте также</h3>
              <div className="space-y-3">
                {article.relatedArticles.map(relatedId => {
                  const related = articlesDatabase[relatedId];
                  if (!related) return null;
                  
                  return (
                    <Link key={relatedId} href={`/article/${relatedId}`}>
                      <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <IconContainer 
                              size="sm" 
                              variant={categoryColors[related.category as keyof typeof categoryColors]}
                            >
                              {categoryIcons[related.category as keyof typeof categoryIcons]}
                            </IconContainer>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1">{related.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{categoryNames[related.category as keyof typeof categoryNames]}</span>
                                <span>•</span>
                                <span>{related.readTime}</span>
                              </div>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}