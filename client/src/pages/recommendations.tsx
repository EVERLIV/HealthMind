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

interface HealthRecommendations {
  disclaimer: string;
  summary: string;
  priorityAreas: string[];
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

  const { data: recommendations, isLoading, refetch } = useQuery<HealthRecommendations>({
    queryKey: ["/api/recommendations"],
    enabled: false
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

  useEffect(() => {
    if (canGenerateRecommendations && !recommendations && !isLoading) {
      handleGenerateRecommendations();
    }
  }, [canGenerateRecommendations]);

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
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Важная информация</AlertTitle>
            <AlertDescription className="text-yellow-700 text-sm">
              {recommendations.disclaimer}
            </AlertDescription>
          </Alert>
        )}

        {/* Summary */}
        {recommendations?.summary && (
          <Card className="eva-card-elevated mb-6 border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Heart className="w-5 h-5 mr-2 text-primary" />
                Анализ состояния здоровья
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{recommendations.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Priority Areas */}
        {recommendations?.priorityAreas && recommendations.priorityAreas.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Приоритетные направления
            </h2>
            <div className="space-y-2">
              {recommendations.priorityAreas.map((area, index) => (
                <div
                  key={index}
                  className={`eva-card p-4 flex items-center justify-between ${getPriorityColor(index)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-red-200' : index === 1 ? 'bg-yellow-200' : 'bg-blue-200'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{area}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs for Recommendations */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview" className="text-xs">Обзор</TabsTrigger>
            <TabsTrigger value="nutrition" className="text-xs">Питание</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">Активность</TabsTrigger>
            <TabsTrigger value="lifestyle" className="text-xs">Образ жизни</TabsTrigger>
            <TabsTrigger value="supplements" className="text-xs">Добавки</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {recommendations?.actionPlan && recommendations.actionPlan.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="w-5 h-5 mr-2 text-success" />
                    План действий
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.actionPlan.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <p className="text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {recommendations?.nextSteps && recommendations.nextSteps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                    Следующие шаги
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recommendations.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="nutrition" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Apple className="w-5 h-5 mr-2 text-green-600" />
                  {recommendations?.nutrition?.title || "Питание"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations?.nutrition?.items?.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  {recommendations?.physicalActivity?.title || "Физическая активность"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations?.physicalActivity?.items?.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lifestyle" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Moon className="w-5 h-5 mr-2 text-purple-600" />
                  {recommendations?.lifestyle?.title || "Образ жизни"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations?.lifestyle?.items?.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supplements" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Pill className="w-5 h-5 mr-2 text-orange-600" />
                  {recommendations?.supplements?.title || "Витамины и добавки"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations?.supplements?.items?.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{item}</p>
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