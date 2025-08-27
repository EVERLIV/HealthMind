import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconContainer, iconSizes } from "@/components/ui/icon-container";
import { articlesArray } from "@/data/articles";
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

// Статьи импортируются из общей базы данных
/*
const articlesDatabase = [
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
*/

export default function SmartHealthGuide({ userGoals = [], userBiomarkers = [] }: SmartHealthGuideProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // Умный подбор статей на основе целей пользователя и состояния биомаркеров
  const smartArticles = useMemo(() => {
    let articles = [...articlesArray];
    
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
      {/* Заголовок секции с правильным контрастом */}
      <div className="bg-gradient-to-r from-medical-blue/5 to-trust-green/5 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-medical-blue rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Справочник здоровья
            </h2>
          </div>
          {userGoals.length > 0 && (
            <Badge className="bg-gradient-to-r from-medical-blue to-trust-green text-white border-0 px-3 py-1 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1.5 animate-pulse" />
              Для вас
            </Badge>
          )}
        </div>
        {userGoals.length > 0 && (
          <div className="flex items-center gap-2 pl-13">
            <div className="w-2 h-2 bg-trust-green rounded-full animate-pulse" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {smartArticles.filter(a => userGoals.some(g => a.goals.includes(g))).length} персональных рекомендаций
            </p>
          </div>
        )}
      </div>

      {/* Компактные категории */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-3">
          {smartCategories.slice(0, showAllCategories ? undefined : 6).map((cat, index) => {
            const isSelected = selectedCategory === cat;
            const gradients = [
              'from-rose-400 to-pink-600',
              'from-violet-400 to-purple-600', 
              'from-sky-400 to-blue-600',
              'from-emerald-400 to-green-600',
              'from-amber-400 to-orange-600',
              'from-indigo-400 to-blue-600'
            ];
            const gradient = gradients[index % gradients.length];
            
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  relative h-16 overflow-hidden rounded-xl transition-all duration-300 transform
                  ${isSelected 
                    ? 'scale-105 shadow-xl ring-2 ring-white ring-opacity-60' 
                    : 'hover:scale-105 hover:shadow-lg shadow-md'}
                `}
              >
                {/* Фоновый градиент */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${isSelected ? 'from-medical-blue to-trust-green' : gradient} 
                  ${isSelected ? 'opacity-100' : 'opacity-95'}
                `} />
                
                {/* Декоративный элемент */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                
                {/* Контент категории */}
                <div className="relative h-full px-3 py-2 flex items-center gap-2">
                  {/* Иконка */}
                  <div className="w-8 h-8 bg-white/25 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    {cat === "all" ? (
                      <BookOpen className="w-4 h-4 text-white" />
                    ) : (
                      <div className="text-white">
                        {categoryIcons[cat as keyof typeof categoryIcons]}
                      </div>
                    )}
                  </div>
                  
                  {/* Название */}
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-white font-semibold text-xs leading-tight truncate">
                      {cat === "all" ? "Все" : categoryNames[cat as keyof typeof categoryNames]}
                    </p>
                  </div>
                  
                  {/* Метка для целей */}
                  {userGoals.includes(cat) && (
                    <div className="w-4 h-4 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
                      <Sparkles className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  
                  {/* Индикатор выбора */}
                  {isSelected && (
                    <div className="w-1 h-6 bg-white/50 rounded-full flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
        
        {smartCategories.length > 6 && (
          <button 
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="w-full mt-3 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium text-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showAllCategories ? 'Свернуть' : `Показать еще ${smartCategories.length - 6} категорий`}
          </button>
        )}
      </div>

      {/* Качественные карточки статей с фото */}
      <div className="space-y-6">
        {smartArticles.slice(0, 4).map((article) => (
          <Link key={article.id} href={`/article/${article.id}`}>
            <Card 
              className="border-0 shadow-xl bg-white dark:bg-slate-800 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
            >
              <div className="relative">
                {/* Качественное фото превью */}
                {article.imageUrl && (
                  <div className="relative overflow-hidden">
                    <div 
                      className="h-52 bg-cover bg-center relative group-hover:scale-105 transition-transform duration-500"
                      style={{
                        backgroundImage: `url(${article.imageUrl})`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>
                    
                    {/* Оверлей с информацией */}
                    <div className="absolute inset-0">
                      {/* Бейджи сверху */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {article.trending && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs px-3 py-1 shadow-lg backdrop-blur-sm">
                            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                            Тренд
                          </Badge>
                        )}
                        {article.new && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs px-3 py-1 shadow-lg backdrop-blur-sm">
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                            Новое
                          </Badge>
                        )}
                      </div>
                      
                      {/* Информация внизу картинки */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-3 text-white">
                          <Badge className="bg-white/20 backdrop-blur-md text-white border-0 text-xs px-3 py-1">
                            {categoryNames[article.category as keyof typeof categoryNames]}
                          </Badge>
                          <span className="text-xs flex items-center gap-1 text-white/90">
                            <Clock className="w-3.5 h-3.5" />
                            {article.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Контент статьи */}
                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-medical-blue transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {article.description}
                      </p>
                    </div>
                    
                    {/* Нижняя часть карточки */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        {userGoals.some(g => article.goals.includes(g)) && (
                          <Badge className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 text-xs px-3 py-1">
                            <Target className="w-3.5 h-3.5 mr-1.5" />
                            Рекомендуем
                          </Badge>
                        )}
                        {article.author && (
                          <span className="text-xs text-muted-foreground">
                            {article.author}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-medical-blue font-medium">
                        <span>Читать</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
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
    </div>
  );
}