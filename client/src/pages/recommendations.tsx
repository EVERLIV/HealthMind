import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Loader2,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  ExternalLink,
  Award,
  Zap,
  Shield,
  Users,
  Clock,
  Info,
  X,
  Eye,
  Star,
  AlertTriangle,
  Link as LinkIcon,
  Dna,
  TestTube,
  User,
  GraduationCap
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  explanation?: string;
  sources?: string[];
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
  const [, navigate] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("overview");

  const { data: recommendations, isLoading, refetch, error } = useQuery<HealthRecommendations>({
    queryKey: ["/api/recommendations"],
    enabled: true,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
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

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    try {
      await refetch({ cancelRefetch: true });
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "nutrition": return <Apple className="w-4 h-4" />;
      case "physicalActivity": return <Activity className="w-4 h-4" />;
      case "lifestyle": return <Moon className="w-4 h-4" />;
      case "supplements": return <Pill className="w-4 h-4" />;
      case "biomarkers": return <Dna className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  const getPriorityIcon = (index: number) => {
    switch (index) {
      case 0: return <AlertTriangle className="w-3 h-3" />;
      case 1: return <Target className="w-3 h-3" />;
      case 2: return <TrendingUp className="w-3 h-3" />;
      default: return <CheckCircle2 className="w-3 h-3" />;
    }
  };

  const getPriorityColor = (index: number) => {
    switch (index) {
      case 0: return "border-red-200 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400";
      case 1: return "border-orange-200 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400";
      case 2: return "border-blue-200 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400";
      default: return "border-gray-200 bg-gray-50 dark:bg-gray-950/20 text-gray-700 dark:text-gray-400";
    }
  };

  const getSourceIcon = (source: string) => {
    if (source.includes('pubmed') || source.includes('ncbi')) return <GraduationCap className="w-3 h-3" />;
    if (source.includes('cochrane')) return <Award className="w-3 h-3" />;
    if (source.includes('who') || source.includes('nih')) return <Shield className="w-3 h-3" />;
    return <BookOpen className="w-3 h-3" />;
  };

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <MobileNav />
        <main className="px-3 py-4 pb-24">
          <div className="mb-4">
            <div className="bg-gradient-to-r from-medical-blue via-blue-500 to-trust-green relative overflow-hidden rounded-xl">
              <div className="relative p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/")}
                    className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">Рекомендации ИИ</h1>
                    <p className="text-white/90 text-xs">Персональный план здоровья</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              <div className="p-4 bg-gradient-to-br from-medical-blue/20 to-trust-green/20 rounded-xl backdrop-blur-sm border border-white/20">
                <Brain className="w-12 h-12 text-medical-blue animate-pulse" />
              </div>
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
            </div>
            
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-medical-blue mx-auto" />
              <h3 className="font-bold text-lg">ИИ анализирует ваши данные</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                🧬 Обрабатываем профиль здоровья и биомаркеры<br/>
                📊 Генерируем персональные рекомендации<br/>
                🔬 Проверяем научные источники
              </p>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error || !canGenerateRecommendations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <MobileNav />
        <main className="px-3 py-4 pb-24">
          <div className="mb-4">
            <div className="bg-gradient-to-r from-medical-blue via-blue-500 to-trust-green relative overflow-hidden rounded-xl">
              <div className="relative p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/")}
                    className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">Рекомендации ИИ</h1>
                    <p className="text-white/90 text-xs">Персональный план здоровья</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-center p-6">
            <div className="space-y-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full w-fit mx-auto">
                <Brain className="w-8 h-8 text-muted-foreground" />
              </div>
              
              <div>
                <h2 className="text-lg font-bold mb-2">
                  {error ? 'Ошибка генерации' : 'Недостаточно данных'}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {error 
                    ? 'Не удалось сгенерировать рекомендации. Попробуйте позже.'
                    : 'Для создания персональных рекомендаций необходимо заполнить профиль здоровья или загрузить анализы крови'
                  }
                </p>
              </div>

              <div className="space-y-2">
                {error ? (
                  <Button 
                    onClick={handleGenerateRecommendations}
                    className="w-full bg-gradient-to-r from-medical-blue to-trust-green"
                    disabled={isGenerating}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Попробовать снова
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => navigate("/health-profile")}
                      className="w-full bg-gradient-to-r from-medical-blue to-trust-green"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Заполнить профиль
                    </Button>
                    <Button 
                      onClick={() => navigate("/blood-analysis")}
                      variant="outline"
                      className="w-full"
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Загрузить анализы
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <MobileNav />
      
      <main className="px-3 py-4 pb-24">
        {/* Mobile-Optimized Header */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-medical-blue via-blue-500 to-trust-green relative overflow-hidden rounded-xl">
            <div className="relative p-4 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/")}
                  className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold">Рекомендации ИИ</h1>
                  <p className="text-white/90 text-xs">Научно обоснованный план</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateRecommendations}
                    disabled={isGenerating}
                    className="h-7 px-2 rounded-lg hover:bg-white/20 text-white text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Обновить
                  </Button>
                </div>
              </div>

              {/* AI Quality Indicators */}
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-0.5">
                  <Sparkles className="w-3 h-3 mr-1" />
                  ИИ-анализ
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-0.5">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  Научные источники
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Important Disclaimer */}
        {recommendations?.disclaimer && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-400 text-sm font-medium">
              Медицинская информация
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300 text-xs mt-1 leading-relaxed">
              {recommendations.disclaimer}
            </AlertDescription>
          </Alert>
        )}

        {/* AI Analysis Summary */}
        {recommendations?.summary && (
          <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-base">
                <div className="p-1.5 bg-medical-blue/10 rounded-lg mr-2">
                  <Heart className="w-4 h-4 text-medical-blue" />
                </div>
                Анализ состояния здоровья
                <Badge className="ml-auto bg-green-100 text-green-700 text-xs">AI</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {recommendations.summary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Priority Areas */}
        {recommendations?.priorityAreas && recommendations.priorityAreas.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-medical-blue" />
              <h2 className="text-base font-bold">Приоритетные направления</h2>
              <Badge className="bg-red-100 text-red-700 text-xs">Важно</Badge>
            </div>
            
            <div className="space-y-2">
              {recommendations.priorityAreas.map((area, index) => (
                <Card 
                  key={index} 
                  className={`border-0 shadow-md ${getPriorityColor(index)} p-3`}
                  data-testid={`priority-area-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${
                      index === 0 ? 'bg-red-200' : 
                      index === 1 ? 'bg-orange-200' : 
                      'bg-blue-200'
                    }`}>
                      {getPriorityIcon(index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          index === 0 ? 'bg-red-200 text-red-800' : 
                          index === 1 ? 'bg-orange-200 text-orange-800' : 
                          'bg-blue-200 text-blue-800'
                        }`}>
                          #{index + 1}
                        </span>
                        <span className="font-medium text-sm">{area}</span>
                      </div>
                      <p className="text-xs opacity-80">
                        {index === 0 ? 'Требует немедленного внимания' : 
                         index === 1 ? 'Важно для улучшения здоровья' : 
                         'Рекомендуется для профилактики'}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Biomarker Recommendations */}
        {recommendations?.biomarkerRecommendations && Object.keys(recommendations.biomarkerRecommendations).length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Dna className="w-4 h-4 text-medical-blue" />
              <h2 className="text-base font-bold">Рекомендации по биомаркерам</h2>
              <Badge className="bg-blue-100 text-blue-700 text-xs">Персональные</Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(recommendations.biomarkerRecommendations).map(([markerName, rec]) => (
                <Card 
                  key={markerName} 
                  className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all duration-300"
                  onClick={() => setSelectedBiomarker(markerName)}
                  data-testid={`biomarker-recommendation-${markerName}`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <TestTube className="w-3 h-3 text-blue-600" />
                          </div>
                          <h3 className="font-bold text-sm">{markerName}</h3>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                      
                      {/* Values */}
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-muted-foreground">Текущий:</span>
                          <Badge variant="outline" className="text-xs font-mono">
                            {rec.currentValue}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Цель:</span>
                          <Badge className="bg-green-100 text-green-700 text-xs font-mono">
                            {rec.targetValue}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Quick Actions Preview */}
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Как улучшить:</p>
                        <div className="space-y-1">
                          {rec.howToImprove.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-start">
                              <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-muted-foreground line-clamp-1">{item}</span>
                            </div>
                          ))}
                          {rec.howToImprove.length > 2 && (
                            <p className="text-xs text-medical-blue font-medium">
                              +{rec.howToImprove.length - 2} рекомендаций...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Category Navigation */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Apple className="w-4 h-4 text-medical-blue" />
            <h2 className="text-base font-bold">Детальные рекомендации</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "nutrition", label: "Питание", icon: Apple },
              { key: "physicalActivity", label: "Активность", icon: Activity },
              { key: "lifestyle", label: "Образ жизни", icon: Moon },
              { key: "supplements", label: "Добавки", icon: Pill },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className={`h-auto py-3 px-3 flex-col gap-1 ${
                  selectedCategory === key 
                    ? 'bg-gradient-to-r from-medical-blue to-trust-green text-white' 
                    : ''
                }`}
                data-testid={`category-${key}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Category Content */}
        {recommendations && selectedCategory && (
          <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                {getCategoryIcon(selectedCategory)}
                <span className="ml-2">
                  {selectedCategory === "nutrition" && "Питание"}
                  {selectedCategory === "physicalActivity" && "Физическая активность"}
                  {selectedCategory === "lifestyle" && "Образ жизни"}
                  {selectedCategory === "supplements" && "Добавки"}
                </span>
                <Badge className="ml-auto bg-green-100 text-green-700 text-xs">
                  {(recommendations as any)[selectedCategory]?.items?.length || 0} советов
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {(recommendations as any)[selectedCategory]?.items?.map((item: string, idx: number) => (
                  <div key={idx} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 bg-medical-blue/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-medical-blue">{idx + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">{item}</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center p-6">
                    <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Рекомендации для этой категории пока не доступны
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Plan */}
        {recommendations?.actionPlan && recommendations.actionPlan.length > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 via-white to-blue-50/30 dark:from-green-950/20 dark:via-slate-800 dark:to-blue-900/20 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg mr-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                План действий
                <Badge className="ml-auto bg-green-100 text-green-700 text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  Пошагово
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {recommendations.actionPlan.map((step, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-white/80 dark:bg-slate-800/80 rounded-lg backdrop-blur-sm">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">{idx + 1}</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {recommendations?.nextSteps && recommendations.nextSteps.length > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-purple-50/30 dark:from-blue-950/20 dark:via-slate-800 dark:to-purple-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                Следующие шаги
                <Badge className="ml-auto bg-blue-100 text-blue-700 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Долгосрочно
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {recommendations.nextSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-white/80 dark:bg-slate-800/80 rounded-lg backdrop-blur-sm">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-3 h-3 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />

      {/* Biomarker Details Modal */}
      <Dialog open={!!selectedBiomarker} onOpenChange={() => setSelectedBiomarker(null)}>
        <DialogContent className="max-w-sm mx-auto max-h-[90vh] p-0">
          <ScrollArea className="max-h-[90vh]">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-medical-blue" />
                  <span className="text-base">{selectedBiomarker}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedBiomarker(null)}
                  className="h-6 w-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>

            <div className="px-4 pb-4">
              {selectedBiomarker && recommendations?.biomarkerRecommendations?.[selectedBiomarker] && (
                <div className="space-y-4">
                  {(() => {
                    const rec = recommendations.biomarkerRecommendations[selectedBiomarker];
                    return (
                      <>
                        {/* Current vs Target Values */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground mb-1">Текущий</p>
                            <p className="font-mono font-bold text-sm">{rec.currentValue}</p>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground mb-1">Цель</p>
                            <p className="font-mono font-bold text-sm text-green-600">{rec.targetValue}</p>
                          </div>
                        </div>

                        {/* Explanation */}
                        {rec.explanation && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <h4 className="font-semibold text-sm mb-2 flex items-center">
                              <Info className="w-3 h-3 mr-1 text-blue-600" />
                              Объяснение
                            </h4>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {rec.explanation}
                            </p>
                          </div>
                        )}

                        {/* How to Improve */}
                        {rec.howToImprove && rec.howToImprove.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
                              Как улучшить
                            </h4>
                            <div className="space-y-2">
                              {rec.howToImprove.map((item, idx) => (
                                <div key={idx} className="flex gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                  <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-green-600">{idx + 1}</span>
                                  </div>
                                  <span className="text-xs leading-relaxed">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Supplements */}
                        {rec.supplements && rec.supplements.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center">
                              <Pill className="w-3 h-3 mr-1 text-orange-600" />
                              Рекомендуемые добавки
                            </h4>
                            <div className="space-y-2">
                              {rec.supplements.map((supp, idx) => (
                                <div key={idx} className="flex gap-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                                  <Pill className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-xs leading-relaxed">{supp}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Retest Frequency */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <h4 className="font-semibold text-sm mb-1 flex items-center">
                            <Calendar className="w-3 h-3 mr-1 text-blue-600" />
                            Частота повторных тестов
                          </h4>
                          <p className="text-xs text-muted-foreground">{rec.retestFrequency}</p>
                        </div>

                        {/* Scientific Sources */}
                        {rec.sources && rec.sources.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center">
                              <GraduationCap className="w-3 h-3 mr-1 text-purple-600" />
                              Научные источники
                            </h4>
                            <div className="space-y-2">
                              {rec.sources.map((source, idx) => (
                                <div key={idx} className="flex gap-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                                  {getSourceIcon(source)}
                                  <span className="text-xs leading-relaxed text-purple-700 dark:text-purple-400">
                                    {source}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}