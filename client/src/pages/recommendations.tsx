import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Heart, 
  Apple, 
  Activity, 
  Moon,
  Pill,
  Target,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Brain,
  Sparkles,
  TrendingUp,
  Calendar,
  Loader2
} from "lucide-react";

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

export default function Recommendations() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  const { data: recommendations, isLoading, refetch } = useQuery<HealthRecommendations>({
    queryKey: ["/api/recommendations"],
    enabled: true
  });

  const { data: healthProfile } = useQuery({
    queryKey: ["/api/health-profile"],
  });

  const { data: bloodAnalyses } = useQuery({
    queryKey: ["/api/blood-analyses"],
  });

  const hasProfile = healthProfile && ((healthProfile as any)?.profileData || (healthProfile as any)?.completionPercentage > 0);
  const hasAnalyses = bloodAnalyses && Array.isArray(bloodAnalyses) && bloodAnalyses.length > 0;
  const canGenerateRecommendations = hasProfile || hasAnalyses;

  // Remove auto-generation since enabled is now true

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    try {
      await refetch();
    } finally {
      setIsGenerating(false);
    }
  };

  const getIconForSection = (section: string) => {
    switch (section) {
      case "nutrition":
        return <Apple className="w-5 h-5" />;
      case "physicalActivity":
        return <Activity className="w-5 h-5" />;
      case "lifestyle":
        return <Moon className="w-5 h-5" />;
      case "supplements":
        return <Pill className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (index: number) => {
    switch (index) {
      case 0:
        return "text-red-600 bg-red-50";
      case 1:
        return "text-yellow-600 bg-yellow-50";
      case 2:
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Анализ профиля и данных пользователя
  const analyzeUserData = () => {
    const analysis = {
      goodPoints: [] as string[],
      concerningPoints: [] as string[],
      criticalPoints: [] as string[]
    };

    // Анализ профиля здоровья
    if (healthProfile && (healthProfile as any)?.profileData) {
      const profile = (healthProfile as any).profileData;
      
      // Анализ ИМТ
      if (profile.weight && profile.height) {
        const bmi = profile.weight / ((profile.height / 100) * (profile.height / 100));
        if (bmi >= 18.5 && bmi <= 24.9) {
          analysis.goodPoints.push(`ИМТ в норме (${bmi.toFixed(1)})`);
        } else if (bmi < 18.5) {
          analysis.concerningPoints.push(`Недостаточный вес (ИМТ ${bmi.toFixed(1)})`);
        } else if (bmi >= 25 && bmi < 30) {
          analysis.concerningPoints.push(`Избыточный вес (ИМТ ${bmi.toFixed(1)})`);
        } else if (bmi >= 30) {
          analysis.criticalPoints.push(`Ожирение (ИМТ ${bmi.toFixed(1)})`);
        }
      }

      // Анализ активности
      if (profile.activityLevel === 'high' || profile.exerciseFrequency === 'daily') {
        analysis.goodPoints.push('Высокий уровень физической активности');
      } else if (profile.activityLevel === 'low' || profile.exerciseFrequency === 'never') {
        analysis.concerningPoints.push('Низкий уровень физической активности');
      }

      // Анализ сна
      if (profile.sleepHours >= 7 && profile.sleepHours <= 9) {
        analysis.goodPoints.push(`Хорошая продолжительность сна (${profile.sleepHours}ч)`);
      } else if (profile.sleepHours < 6) {
        analysis.criticalPoints.push(`Недостаток сна (${profile.sleepHours}ч)`);
      } else if (profile.sleepHours > 10) {
        analysis.concerningPoints.push(`Избыток сна (${profile.sleepHours}ч)`);
      }

      // Анализ стресса
      if (profile.stressLevel <= 3) {
        analysis.goodPoints.push('Низкий уровень стресса');
      } else if (profile.stressLevel >= 7) {
        analysis.criticalPoints.push('Высокий уровень стресса');
      }

      // Анализ вредных привычек
      if (profile.smokingStatus === 'never') {
        analysis.goodPoints.push('Некурящий');
      } else if (profile.smokingStatus === 'regular') {
        analysis.criticalPoints.push('Регулярное курение');
      }

      if (profile.alcoholConsumption === 'none') {
        analysis.goodPoints.push('Не употребляет алкоголь');
      } else if (profile.alcoholConsumption === 'heavy') {
        analysis.criticalPoints.push('Чрезмерное употребление алкоголя');
      }

      // Анализ хронических заболеваний
      if (profile.chronicConditions && profile.chronicConditions.length > 0) {
        analysis.criticalPoints.push(`Хронические заболевания: ${profile.chronicConditions.join(', ')}`);
      } else {
        analysis.goodPoints.push('Отсутствие хронических заболеваний');
      }
    }

    // Анализ анализов крови
    if (bloodAnalyses && Array.isArray(bloodAnalyses)) {
      bloodAnalyses.forEach((analysis_item: any) => {
        if (analysis_item.status === 'analyzed' && analysis_item.results?.markers) {
          analysis_item.results.markers.forEach((marker: any) => {
            if (marker.status === 'normal') {
              analysis.goodPoints.push(`${marker.name}: в норме`);
            } else if (marker.status === 'critical') {
              analysis.criticalPoints.push(`${marker.name}: критическое отклонение`);
            } else {
              analysis.concerningPoints.push(`${marker.name}: отклонение от нормы`);
            }
          });
        }
      });
    }

    return analysis;
  };

  const userAnalysis = analyzeUserData();

  // Получение детальных рекомендаций для приоритетного направления
  const getPriorityDetails = (priority: string) => {
    const detailsMap: Record<string, { description: string; actions: string[] }> = {
      'Нормализация холестерина': {
        description: 'Снижение уровня холестерина для защиты сердечно-сосудистой системы',
        actions: [
          'Увеличить потребление растворимой клетчатки (овсянка, яблоки, бобовые)',
          'Добавить Омега-3 жирные кислоты 1000-2000 мг в день',
          'Ограничить насыщенные жиры до 10% от калорий',
          'Добавить 30 минут кардио 5 раз в неделю',
          'Рассмотреть прием растительных стеролов 2г в день'
        ]
      },
      'Контроль веса': {
        description: 'Достижение и поддержание здорового веса',
        actions: [
          'Создать дефицит калорий 500-750 ккал в день',
          'Увеличить потребление белка до 1.2-1.6г на кг веса',
          'Добавить силовые тренировки 3 раза в неделю',
          'Контролировать размер порций',
          'Вести дневник питания'
        ]
      },
      'Улучшение сна': {
        description: 'Нормализация качества и продолжительности сна',
        actions: [
          'Соблюдать режим сна: ложиться и вставать в одно время',
          'Исключить экраны за 1 час до сна',
          'Создать прохладную темную обстановку (18-20°C)',
          'Избегать кофеина после 14:00',
          'Рассмотреть прием магния 300-400мг перед сном'
        ]
      },
      'Снижение стресса': {
        description: 'Управление стрессом и улучшение психического здоровья',
        actions: [
          'Практиковать медитацию 10-15 минут ежедневно',
          'Использовать техники глубокого дыхания',
          'Заниматься йогой или тай-чи',
          'Планировать время для отдыха и хобби',
          'Рассмотреть прием адаптогенов (ашвагандха, родиола)'
        ]
      }
    };
    
    return detailsMap[priority] || {
      description: 'Персонализированные рекомендации на основе ваших данных',
      actions: [
        'Следить за основными показателями здоровья',
        'Вести активный образ жизни',
        'Поддерживать сбалансированное питание',
        'Обеспечивать качественный отдых',
        'Регулярно проходить медицинские обследования'
      ]
    };
  };

  if (isLoading || isGenerating) {
    return (
      <div className="eva-page">
        <MobileNav />
        <main className="eva-page-content">
          <div className="eva-page-header">
            <h1 className="eva-page-title">Рекомендации</h1>
            <p className="eva-page-subtitle">Анализируем ваши данные...</p>
          </div>
          
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <Brain className="w-20 h-20 text-primary mb-4 animate-pulse" />
              <Sparkles className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              ИИ анализирует ваш профиль здоровья и результаты анализов...
            </p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!canGenerateRecommendations) {
    return (
      <div className="eva-page">
        <MobileNav />
        <main className="eva-page-content">
          <div className="eva-page-header">
            <h1 className="eva-page-title">Рекомендации</h1>
            <p className="eva-page-subtitle">Персональный план здоровья</p>
          </div>
          
          <Card className="eva-card-elevated p-6 text-center">
            <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Недостаточно данных</h2>
            <p className="text-muted-foreground mb-4">
              Для генерации персональных рекомендаций необходимо заполнить профиль здоровья или загрузить анализы крови
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.href = "/health-profile"}
                className="w-full"
              >
                Заполнить профиль
              </Button>
              <Button 
                onClick={() => window.location.href = "/blood-analysis"}
                variant="outline"
                className="w-full"
              >
                Загрузить анализы
              </Button>
            </div>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="eva-page">
      <MobileNav />
      
      <main className="eva-page-content">
        <div className="eva-page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="eva-page-title">Рекомендации</h1>
              <p className="eva-page-subtitle">Персональный план здоровья</p>
            </div>
            <Brain className="w-8 h-8 text-primary" />
          </div>
        </div>

        {recommendations?.disclaimer && (
          <Alert className="mb-4 border-yellow-200 bg-yellow-50 p-3">
            <AlertCircle className="h-3 w-3 text-yellow-600" />
            <AlertTitle className="text-yellow-800 text-sm">Важная информация</AlertTitle>
            <AlertDescription className="text-yellow-700 text-xs mt-1">
              {recommendations.disclaimer}
            </AlertDescription>
          </Alert>
        )}

        {/* Summary - Mobile Optimized */}
        {recommendations?.summary && (
          <Card className="eva-card-elevated mb-4 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <Heart className="w-4 h-4 mr-1.5 text-primary" />
                Анализ состояния здоровья
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs leading-relaxed">{recommendations.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Priority Areas - Mobile Optimized */}
        {recommendations?.priorityAreas && recommendations.priorityAreas.length > 0 && (
          <div className="mb-4">
            <h2 className="text-base font-semibold mb-2 flex items-center">
              <Target className="w-4 h-4 mr-1.5 text-primary" />
              Приоритетные направления
            </h2>
            <div className="space-y-1.5">
              {recommendations.priorityAreas.map((area, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPriority(selectedPriority === area ? null : area)}
                  className={`eva-card p-3 flex items-center justify-between ${getPriorityColor(index)} w-full text-left transition-all hover:shadow-md`}
                  data-testid={`priority-${index}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-red-200' : index === 1 ? 'bg-yellow-200' : 'bg-blue-200'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{area}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    selectedPriority === area ? 'rotate-90' : ''
                  }`} />
                </button>
              ))}
            </div>
            
            {/* Детали выбранного приоритета */}
            {selectedPriority && (
              <Card className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm flex items-center">
                    <Target className="w-4 h-4 mr-1.5 text-blue-600" />
                    {selectedPriority}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {getPriorityDetails(selectedPriority).description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Конкретные действия:</p>
                    {getPriorityDetails(selectedPriority).actions.map((action, idx) => (
                      <div key={idx} className="flex gap-2">
                        <CheckCircle2 className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Biomarker Recommendations - Mobile Optimized */}
        {recommendations?.biomarkerRecommendations && Object.keys(recommendations.biomarkerRecommendations).length > 0 && (
          <div className="mb-4">
            <h2 className="text-base font-semibold mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1.5 text-primary" />
              Рекомендации по биомаркерам
            </h2>
            <div className="space-y-2">
              {Object.entries(recommendations.biomarkerRecommendations).map(([markerName, rec]) => (
                <Card key={markerName} className="p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-sm">{markerName}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {rec.currentValue}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Цель: {rec.targetValue}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Как улучшить:</p>
                      {rec.howToImprove.map((item, idx) => (
                        <div key={idx} className="flex gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-xs">{item}</span>
                        </div>
                      ))}
                    </div>
                    
                    {rec.supplements && rec.supplements.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Добавки:</p>
                        {rec.supplements.map((supp, idx) => (
                          <div key={idx} className="flex gap-1.5">
                            <Pill className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
                            <span className="text-xs">{supp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Пересдать: {rec.retestFrequency}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tabs for Recommendations - Mobile Optimized */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3 w-full mb-2">
            <TabsTrigger value="overview" className="text-[10px] px-1">Обзор</TabsTrigger>
            <TabsTrigger value="nutrition" className="text-[10px] px-1">Питание</TabsTrigger>
            <TabsTrigger value="activity" className="text-[10px] px-1">Активность</TabsTrigger>
          </TabsList>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="lifestyle" className="text-[10px] px-1">Образ жизни</TabsTrigger>
            <TabsTrigger value="supplements" className="text-[10px] px-1">Добавки</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-3 space-y-3">
            {/* Детальный анализ здоровья */}
            <div className="space-y-3">
              {/* Хорошие показатели */}
              {userAnalysis.goodPoints.length > 0 && (
                <Card className="p-3 bg-green-50 dark:bg-green-900/20 border-green-200">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="flex items-center text-sm">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-600" />
                      Хорошие показатели ({userAnalysis.goodPoints.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1.5">
                      {userAnalysis.goodPoints.map((point, index) => (
                        <div key={index} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-green-800 dark:text-green-200">{point}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Вызывающие беспокойство показатели */}
              {userAnalysis.concerningPoints.length > 0 && (
                <Card className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="flex items-center text-sm">
                      <AlertCircle className="w-4 h-4 mr-1.5 text-yellow-600" />
                      Требуют внимания ({userAnalysis.concerningPoints.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1.5">
                      {userAnalysis.concerningPoints.map((point, index) => (
                        <div key={index} className="flex items-start gap-1.5">
                          <AlertCircle className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">{point}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Критические показатели */}
              {userAnalysis.criticalPoints.length > 0 && (
                <Card className="p-3 bg-red-50 dark:bg-red-900/20 border-red-200">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="flex items-center text-sm">
                      <AlertCircle className="w-4 h-4 mr-1.5 text-red-600" />
                      Критически важно ({userAnalysis.criticalPoints.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1.5">
                      {userAnalysis.criticalPoints.map((point, index) => (
                        <div key={index} className="flex items-start gap-1.5">
                          <AlertCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-red-800 dark:text-red-200">{point}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {recommendations?.actionPlan && recommendations.actionPlan.length > 0 && (
              <Card className="p-3">
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 mr-1.5 text-success" />
                    План действий
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2">
                    {recommendations.actionPlan.map((step, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-primary">{index + 1}</span>
                        </div>
                        <p className="text-xs">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {recommendations?.nextSteps && recommendations.nextSteps.length > 0 && (
              <Card className="p-3">
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-1.5 text-primary" />
                    Следующие шаги
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1.5">
                    {recommendations.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                        <p className="text-xs">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="nutrition" className="mt-3">
            <Card className="p-3">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="flex items-center text-sm">
                  <Apple className="w-4 h-4 mr-1.5 text-green-600" />
                  {recommendations?.nutrition?.title || "Питание"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {recommendations?.nutrition?.items?.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-3">
            <Card className="p-3">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="flex items-center text-sm">
                  <Activity className="w-4 h-4 mr-1.5 text-blue-600" />
                  {recommendations?.physicalActivity?.title || "Физическая активность"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {recommendations?.physicalActivity?.items?.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lifestyle" className="mt-3">
            <Card className="p-3">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="flex items-center text-sm">
                  <Moon className="w-4 h-4 mr-1.5 text-purple-600" />
                  {recommendations?.lifestyle?.title || "Образ жизни"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {recommendations?.lifestyle?.items?.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supplements" className="mt-3">
            <Card className="p-3">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="flex items-center text-sm">
                  <Pill className="w-4 h-4 mr-1.5 text-orange-600" />
                  {recommendations?.supplements?.title || "Витамины и добавки"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {recommendations?.supplements?.items?.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Regenerate Button */}
        <div className="mt-6 pb-4">
          <Button 
            onClick={handleGenerateRecommendations}
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Генерация рекомендаций...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Обновить рекомендации
              </>
            )}
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}