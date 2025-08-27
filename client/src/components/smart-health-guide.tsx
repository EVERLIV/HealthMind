import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconContainer, iconSizes } from "@/components/ui/icon-container";
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
  Wind
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
    icon: <Brain className={iconSizes.sm} />
  },
  {
    id: "6",
    title: "Белок: сколько нужно для ваших целей",
    description: "Расчет нормы и лучшие источники",
    readTime: "6 мин",
    category: "nutrition",
    goals: ["nutrition", "fitness", "weight-loss"],
    relevanceScore: 90,
    icon: <Apple className={iconSizes.sm} />
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
    icon: <Dumbbell className={iconSizes.sm} />
  }
];

export default function SmartHealthGuide({ userGoals = [], userBiomarkers = [] }: SmartHealthGuideProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
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

      {/* Категории с горизонтальным скроллом */}
      <div className="mb-4 -mx-3 px-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {smartCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all
                ${selectedCategory === cat 
                  ? 'bg-medical-blue text-white shadow-md' 
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}
              `}
            >
              {cat === "all" ? (
                <>Все статьи</>
              ) : (
                <div className="flex items-center gap-1.5">
                  {categoryIcons[cat as keyof typeof categoryIcons]}
                  <span>{categoryNames[cat as keyof typeof categoryNames]}</span>
                  {userGoals.includes(cat) && (
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full ml-1" />
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Список статей */}
      <div className="space-y-3">
        {smartArticles.slice(0, 5).map((article) => (
          <Card 
            key={article.id}
            className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Иконка категории */}
                <IconContainer 
                  size="sm" 
                  variant={categoryColors[article.category as keyof typeof categoryColors]}
                  className="flex-shrink-0"
                >
                  {article.icon}
                </IconContainer>

                {/* Контент статьи */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm leading-tight">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {article.new && (
                        <Badge className="bg-green-100 text-green-700 text-xs px-1.5 py-0">
                          NEW
                        </Badge>
                      )}
                      {article.trending && (
                        <Badge className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0">
                          <TrendingUp className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        {categoryNames[article.category as keyof typeof categoryNames]}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Bookmark className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Релевантность для целей пользователя */}
              {userGoals.some(g => article.goals.includes(g)) && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                      <Target className="w-3 h-3 mr-1" />
                      Соответствует вашим целям
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Кнопка "Показать все" */}
      {smartArticles.length > 5 && (
        <div className="mt-4">
          <button className="w-full py-3 bg-gradient-to-r from-medical-blue/5 to-trust-green/5 hover:from-medical-blue/10 hover:to-trust-green/10 rounded-xl text-medical-blue font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            Показать еще {smartArticles.length - 5} статей
          </button>
        </div>
      )}
    </div>
  );
}