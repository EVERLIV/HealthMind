import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconContainer, iconSizes } from "@/components/ui/icon-container";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Heart,
  Brain,
  Moon,
  Dumbbell,
  Apple,
  Shield,
  Smile,
  Clock,
  TrendingUp,
  Bookmark,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
  Eye,
  Activity,
  Wind,
  X,
  Share2,
  CheckCircle,
  AlertCircle,
  ChevronLeft
} from "lucide-react";

interface Article {
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
  tips?: string[];
  warnings?: string[];
  author?: string;
  publishDate?: string;
  new?: boolean;
  trending?: boolean;
}

interface SmartHealthGuideProps {
  userGoals?: string[];
  userBiomarkers?: any[];
}

const categoryIcons = {
  "weight-loss": <Target className={iconSizes.sm} />,
  "heart-health": <Heart className={iconSizes.sm} />,
  "energy": <Zap className={iconSizes.sm} />,
  "immunity": <Shield className={iconSizes.sm} />,
  "sleep": <Moon className={iconSizes.sm} />,
  "stress": <Brain className={iconSizes.sm} />,
  "nutrition": <Apple className={iconSizes.sm} />,
  "fitness": <Dumbbell className={iconSizes.sm} />,
  "mental": <Smile className={iconSizes.sm} />,
  "recovery": <Wind className={iconSizes.sm} />
};

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

// База статей - в реальном приложении берется из API
const articlesDatabase: Article[] = [
  {
    id: "1",
    title: "5 способов снизить холестерин без лекарств",
    description: "Простые изменения в питании для здоровья сердца",
    readTime: "3 мин",
    category: "heart-health",
    goals: ["heart-health", "nutrition"],
    relevanceScore: 95,
    icon: <Heart className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop",
    content: `Высокий уровень холестерина - серьезный фактор риска сердечных заболеваний. Однако существуют эффективные немедикаментозные способы его снижения.\n\n## 1. Увеличьте потребление клетчатки\nРастворимая клетчатка связывает холестерин в пищеварительной системе. Добавьте овсянку, яблоки, груши и бобовые.\n\n## 2. Омега-3 жирные кислоты\nЖирная рыба (лосось, скумбрия) 2-3 раза в неделю снижает ЛПНП и повышает ЛПВП холестерин.\n\n## 3. Орехи и авокадо\nМононенасыщенные жиры улучшают липидный профиль. 30г орехов или половина авокадо в день.\n\n## 4. Физическая активность\n150 минут умеренной активности в неделю повышает ЛПВП на 5-10%.\n\n## 5. Зеленый чай\nКатехины в зеленом чае снижают всасывание холестерина. 2-3 чашки в день.`,
    tips: [
      "Начинайте день с овсянки с ягодами",
      "Замените красное мясо на рыбу 2 раза в неделю",
      "Добавляйте льняное семя в йогурт или смузи",
      "Используйте оливковое масло вместо сливочного"
    ],
    warnings: [
      "Проконсультируйтесь с врачом перед изменением диеты при приеме статинов",
      "Резкие изменения могут вызвать дискомфорт в ЖКТ"
    ],
    author: "Д-р Иванова М.А., кардиолог",
    publishDate: "2024-01-15",
    trending: true
  },
  {
    id: "2", 
    title: "Утренние ритуалы для энергии на весь день",
    description: "Как правильно начать день и сохранить бодрость",
    readTime: "5 мин",
    category: "energy",
    goals: ["energy", "sleep"],
    relevanceScore: 88,
    icon: <Zap className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=200&fit=crop",
    content: `Правильное начало дня определяет уровень энергии на следующие 16 часов. Научно обоснованные ритуалы помогут максимизировать продуктивность.`,
    tips: ["Просыпайтесь в одно время", "10 минут утреннего солнца", "Стакан воды с лимоном"],
    author: "Команда HealthAI",
    new: true
  },
  {
    id: "3",
    title: "Интервальное голодание: научный подход",
    description: "Все что нужно знать о методе 16:8",
    readTime: "7 мин",
    category: "weight-loss",
    goals: ["weight-loss", "nutrition"],
    relevanceScore: 92,
    icon: <Clock className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1563865436874-9aef32095fad?w=400&h=200&fit=crop",
    content: `Интервальное голодание 16:8 - эффективный метод контроля веса и улучшения метаболического здоровья.`,
    tips: ["Начните с 12:12", "Пейте больше воды", "Не переедайте в окно питания"],
    trending: true
  },
  {
    id: "4",
    title: "Витамин D и иммунитет",
    description: "Почему это важно особенно зимой",
    readTime: "4 мин",
    category: "immunity",
    goals: ["immunity"],
    relevanceScore: 85,
    icon: <Shield className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1542736667-069246bdbc6d?w=400&h=200&fit=crop",
    content: `Витамин D играет ключевую роль в поддержании иммунной системы, особенно в зимний период.`,
    tips: ["15 минут на солнце летом", "1000-2000 МЕ зимой", "Жирная рыба 2 раза в неделю"],
    new: true
  },
  {
    id: "5",
    title: "Медитация для занятых: 5 минут в день",
    description: "Быстрые техники снижения стресса",
    readTime: "3 мин",
    category: "stress",
    goals: ["stress", "mental"],
    relevanceScore: 82,
    icon: <Brain className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=200&fit=crop",
    content: `Даже 5 минут медитации снижают кортизол и улучшают фокус. Простые техники для начинающих.`,
    tips: ["Дыхание 4-7-8", "Сканирование тела", "Фокус на одной точке"]
  },
  {
    id: "6",
    title: "Белок: сколько нужно для ваших целей",
    description: "Расчет нормы и лучшие источники",
    readTime: "6 мин",
    category: "nutrition",
    goals: ["nutrition", "fitness", "weight-loss"],
    relevanceScore: 90,
    icon: <Apple className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=200&fit=crop",
    content: `Оптимальное потребление белка зависит от активности: 0.8-2.2 г/кг массы тела.`,
    tips: ["25-30г белка за прием", "Комбинируйте источники", "Белок в каждом приеме пищи"]
  },
  {
    id: "7",
    title: "Качественный сон: 7 научных методов",
    description: "Как улучшить сон без снотворного",
    readTime: "8 мин",
    category: "sleep",
    goals: ["sleep", "recovery"],
    relevanceScore: 87,
    icon: <Moon className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=400&h=200&fit=crop",
    content: `Качественный сон - основа здоровья. 7 проверенных методов для глубокого восстановительного сна.`,
    tips: ["Температура 18-20°C", "Никаких экранов за час до сна", "Одинаковое время отхода ко сну"],
    trending: true
  },
  {
    id: "8",
    title: "HIIT тренировки дома: 15 минут в день",
    description: "Эффективные упражнения без оборудования",
    readTime: "5 мин",
    category: "fitness",
    goals: ["fitness", "weight-loss", "energy"],
    relevanceScore: 89,
    icon: <Dumbbell className={iconSizes.sm} />,
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=200&fit=crop",
    content: `HIIT максимизирует сжигание калорий за минимальное время. Идеально для занятых людей.`,
    tips: ["20 сек работа / 10 сек отдых", "Разминка обязательна", "3-4 раза в неделю"]
  }
];

export default function SmartHealthGuide({ userGoals = [], userBiomarkers = [] }: SmartHealthGuideProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // Умный подбор статей на основе целей пользователя и состояния биомаркеров
  const smartArticles = useMemo(() => {
    let articles = [...articlesDatabase];
    
    // Сортировка по релевантности для пользователя
    articles.sort((a, b) => {
      // Приоритет статьям соответствующим целям пользователя
      const aGoalMatch = a.goals.some(g => userGoals.includes(g)) ? 20 : 0;
      const bGoalMatch = b.goals.some(g => userGoals.includes(g)) ? 20 : 0;
      
      // Учет проблемных биомаркеров
      const aRelevance = a.relevanceScore + aGoalMatch;
      const bRelevance = b.relevanceScore + bGoalMatch;
      
      return bRelevance - aRelevance;
    });
    
    // Фильтрация по категории
    if (selectedCategory !== "all") {
      articles = articles.filter(a => a.category === selectedCategory);
    }
    
    return articles;
  }, [userGoals, userBiomarkers, selectedCategory]);
  
  // Умные категории на основе целей пользователя
  const smartCategories = useMemo(() => {
    const categories = ["all", ...Object.keys(categoryNames)];
    
    // Сортировка категорий по релевантности
    if (userGoals.length > 0) {
      return categories.sort((a, b) => {
        if (a === "all") return -1;
        if (b === "all") return 1;
        
        const aRelevant = userGoals.includes(a) ? 1 : 0;
        const bRelevant = userGoals.includes(b) ? 1 : 0;
        
        return bRelevant - aRelevant;
      });
    }
    
    return categories;
  }, [userGoals]);

  return (
    <div className="mb-6">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <IconContainer size="sm" variant="soft-primary">
            <BookOpen className={iconSizes.sm} />
          </IconContainer>
          Справочник здоровья
        </h2>
        <Badge className="bg-gradient-to-r from-medical-blue/10 to-trust-green/10 text-medical-blue border-medical-blue/20 text-xs">
          <Sparkles className="w-3 h-3 mr-1" />
          Персональная подборка
        </Badge>
      </div>

      {/* Категории в сетке для мобильных */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-2">
          {smartCategories.slice(0, showAllCategories ? undefined : 6).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1
                ${selectedCategory === cat 
                  ? 'bg-medical-blue text-white shadow-lg' 
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}
              `}
            >
              {cat === "all" ? (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span>Все</span>
                </>
              ) : (
                <>
                  {categoryIcons[cat as keyof typeof categoryIcons]}
                  <span className="text-[10px] leading-tight text-center">
                    {categoryNames[cat as keyof typeof categoryNames]}
                  </span>
                  {userGoals.includes(cat) && (
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full absolute top-1 right-1" />
                  )}
                </>
              )}
            </button>
          ))}
        </div>
        {smartCategories.length > 6 && (
          <button 
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="w-full mt-2 py-2 text-xs text-medical-blue font-medium"
          >
            {showAllCategories ? 'Свернуть' : `Еще ${smartCategories.length - 6} категорий`}
          </button>
        )}
      </div>

      {/* Список статей с картинками */}
      <div className="space-y-4">
        {smartArticles.slice(0, 4).map((article) => (
          <Card 
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="border-0 shadow-lg bg-white dark:bg-slate-800 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="relative">
              {/* Картинка превью */}
              {article.imageUrl && (
                <div 
                  className="h-32 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url(${article.imageUrl})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Бейджи на картинке */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {article.trending && (
                      <Badge className="bg-orange-500 text-white border-0 text-xs px-2 py-0.5">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        В тренде
                      </Badge>
                    )}
                    {article.new && (
                      <Badge className="bg-green-500 text-white border-0 text-xs px-2 py-0.5">
                        Новое
                      </Badge>
                    )}
                  </div>
                  
                  {/* Время чтения на картинке */}
                  <div className="absolute bottom-2 right-2">
                    <Badge className="bg-black/50 text-white backdrop-blur-sm border-0 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}
                    </Badge>
                  </div>
                </div>
              )}
              
              {/* Контент статьи */}
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <IconContainer 
                    size="sm" 
                    variant={categoryColors[article.category as keyof typeof categoryColors]}
                    className="flex-shrink-0"
                  >
                    {article.icon}
                  </IconContainer>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm mb-1 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {article.description}
                    </p>
                    
                    {/* Мета информация */}
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {categoryNames[article.category as keyof typeof categoryNames]}
                      </Badge>
                      
                      {userGoals.some(g => article.goals.includes(g)) && (
                        <Badge className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-0.5">
                          <Target className="w-3 h-3 mr-1" />
                          Для вас
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* Кнопка "Показать все" */}
      {smartArticles.length > 4 && (
        <div className="mt-4">
          <button className="w-full py-3 bg-gradient-to-r from-medical-blue/5 to-trust-green/5 hover:from-medical-blue/10 hover:to-trust-green/10 rounded-xl text-medical-blue font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            Показать еще {smartArticles.length - 4} статей
          </button>
        </div>
      )}
      
      {/* Модальное окно детального просмотра статьи */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-md mx-auto h-[90vh] p-0 overflow-hidden">
          {selectedArticle && (
            <div className="flex flex-col h-full">
              {/* Шапка с картинкой */}
              <div className="relative flex-shrink-0">
                {selectedArticle.imageUrl && (
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${selectedArticle.imageUrl})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  </div>
                )}
                
                {/* Кнопки управления */}
                <div className="absolute top-4 left-4 right-4 flex justify-between">
                  <button 
                    onClick={() => setSelectedArticle(null)}
                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex gap-2">
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <Bookmark className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Заголовок на картинке */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-white font-bold text-lg mb-2" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                    {selectedArticle.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                      {categoryNames[selectedArticle.category as keyof typeof categoryNames]}
                    </Badge>
                    <span className="text-white/80 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedArticle.readTime}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Контент статьи с прокруткой */}
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  {/* Описание */}
                  <div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedArticle.description}
                    </p>
                  </div>
                  
                  {/* Основной контент */}
                  {selectedArticle.content && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {selectedArticle.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="text-sm leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {/* Советы */}
                  {selectedArticle.tips && selectedArticle.tips.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4">
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Полезные советы
                      </h3>
                      <ul className="space-y-2">
                        {selectedArticle.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0" />
                            <span className="text-xs leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Предупреждения */}
                  {selectedArticle.warnings && selectedArticle.warnings.length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-4">
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        Важно знать
                      </h3>
                      <ul className="space-y-2">
                        {selectedArticle.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-1.5 flex-shrink-0" />
                            <span className="text-xs leading-relaxed">{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Автор и дата */}
                  {(selectedArticle.author || selectedArticle.publishDate) && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {selectedArticle.author && (
                          <span>Автор: {selectedArticle.author}</span>
                        )}
                        {selectedArticle.publishDate && (
                          <span>{new Date(selectedArticle.publishDate).toLocaleDateString('ru-RU')}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Кнопка действия внизу */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
                <Button 
                  className="w-full bg-medical-blue hover:bg-medical-blue/90 text-white"
                  onClick={() => setSelectedArticle(null)}
                >
                  Понятно, спасибо!
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}