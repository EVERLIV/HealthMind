import { useQuery } from "@tanstack/react-query";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, BarChart3, Heart, Droplets } from "lucide-react";

export default function Statistics() {
  const { data: healthMetrics, isLoading } = useQuery({
    queryKey: ["/api/health-metrics"],
  });

  const { data: bloodAnalyses } = useQuery({
    queryKey: ["/api/blood-analyses"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-health-bg">
        <MobileNav />
        <main className="max-w-md mx-auto px-4 py-6 pb-20">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const latestMetrics = healthMetrics?.[0];
  const latestAnalysis = bloodAnalyses?.[0];

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4" />;
      case "down":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable", isGood: boolean) => {
    if (trend === "stable") return "text-muted-foreground";
    if ((trend === "up" && isGood) || (trend === "down" && !isGood)) {
      return "text-trust-green";
    }
    return "text-warning-amber";
  };

  return (
    <div className="min-h-screen bg-health-bg">
      <MobileNav />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Статистика</h1>
          <p className="text-muted-foreground">Анализ ваших показателей здоровья</p>
        </div>

        {/* Current Health Metrics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2 text-medical-blue" />
              Текущие показатели
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestMetrics ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-medical-blue/5 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    {getTrendIcon("stable")}
                    <span className="ml-1 text-2xl font-bold text-medical-blue" data-testid="text-heart-rate">
                      {latestMetrics.heartRate}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Пульс (уд/мин)</div>
                  <Badge variant="secondary" className="text-xs mt-1">Норма</Badge>
                </div>
                
                <div className="text-center p-3 bg-trust-green/5 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    {getTrendIcon("stable")}
                    <span className="ml-1 text-2xl font-bold text-trust-green" data-testid="text-blood-pressure">
                      {latestMetrics.bloodPressureSystolic}/{latestMetrics.bloodPressureDiastolic}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Давление</div>
                  <Badge variant="secondary" className="text-xs mt-1">Отлично</Badge>
                </div>
                
                <div className="text-center p-3 bg-warning-amber/5 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    {getTrendIcon("stable")}
                    <span className="ml-1 text-2xl font-bold text-warning-amber" data-testid="text-temperature">
                      {latestMetrics.temperature}°
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Температура</div>
                  <Badge variant="secondary" className="text-xs mt-1">Норма</Badge>
                </div>
                
                <div className="text-center p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <BarChart3 className="w-4 h-4" />
                    <span className="ml-1 text-2xl font-bold text-foreground" data-testid="text-health-score">85</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Здоровье (%)</div>
                  <Badge variant="secondary" className="text-xs mt-1">Хорошо</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Нет данных о здоровье</p>
                <p className="text-xs">Добавьте первые измерения</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blood Analysis Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-medical-blue" />
              Анализы крови
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestAnalysis?.results ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Гемоглобин</div>
                    <div className="text-lg font-bold text-trust-green" data-testid="text-hemoglobin">
                      {latestAnalysis.results.hemoglobin?.value} {latestAnalysis.results.hemoglobin?.unit}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon("stable")}
                    <Badge 
                      variant={latestAnalysis.results.hemoglobin?.status === "normal" ? "secondary" : "destructive"}
                      data-testid="badge-hemoglobin-status"
                    >
                      {latestAnalysis.results.hemoglobin?.status === "normal" ? "Норма" : "Отклонение"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Холестерин</div>
                    <div className="text-lg font-bold text-warning-amber" data-testid="text-cholesterol">
                      {latestAnalysis.results.cholesterol?.value} {latestAnalysis.results.cholesterol?.unit}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon("up")}
                    <Badge 
                      variant={latestAnalysis.results.cholesterol?.status === "normal" ? "secondary" : "destructive"}
                      data-testid="badge-cholesterol-status"
                    >
                      {latestAnalysis.results.cholesterol?.status === "high" ? "Повышен" : "Норма"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Глюкоза</div>
                    <div className="text-lg font-bold text-trust-green" data-testid="text-glucose">
                      {latestAnalysis.results.glucose?.value} {latestAnalysis.results.glucose?.unit}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon("stable")}
                    <Badge 
                      variant={latestAnalysis.results.glucose?.status === "normal" ? "secondary" : "destructive"}
                      data-testid="badge-glucose-status"
                    >
                      {latestAnalysis.results.glucose?.status === "normal" ? "Норма" : "Отклонение"}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Droplets className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Нет данных анализов</p>
                <p className="text-xs">Загрузите первый анализ крови</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-medical-blue" />
              Тенденции
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Показатели сердца</span>
                <div className="flex items-center space-x-2">
                  <span className={getTrendColor("stable", true)}>
                    {getTrendIcon("stable")}
                  </span>
                  <span className="text-sm font-medium">Стабильно</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Качество анализов</span>
                <div className="flex items-center space-x-2">
                  <span className={getTrendColor("up", false)}>
                    {getTrendIcon("up")}
                  </span>
                  <span className="text-sm font-medium">Требует внимания</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Общее состояние</span>
                <div className="flex items-center space-x-2">
                  <span className={getTrendColor("up", true)}>
                    {getTrendIcon("up")}
                  </span>
                  <span className="text-sm font-medium">Улучшается</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
