import { useQuery } from "@tanstack/react-query";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, BarChart3, Heart, Droplets, Activity, Zap, Target } from "lucide-react";

export default function Statistics() {
  const { data: healthMetrics, isLoading } = useQuery({
    queryKey: ["/api/health-metrics"],
  });

  const { data: bloodAnalyses } = useQuery({
    queryKey: ["/api/blood-analyses"],
  });

  if (isLoading) {
    return (
      <div className="eva-page">
        <MobileNav />
        <main className="eva-page-content">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="eva-card p-5 eva-shimmer">
                <div className="eva-skeleton h-5 w-3/4 mb-3"></div>
                <div className="eva-skeleton h-8 w-1/2 mb-3"></div>
                <div className="eva-skeleton h-4 w-full"></div>
              </div>
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const latestMetrics = Array.isArray(healthMetrics) ? healthMetrics[0] : null;
  const latestAnalysis = Array.isArray(bloodAnalyses) ? bloodAnalyses[0] : null;

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
      return "text-success";
    }
    return "text-warning";
  };

  const getStatusBadge = (value: any, normalRange?: { min: number; max: number }) => {
    if (!normalRange || !value) return <Badge className="eva-badge">Нет данных</Badge>;
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue >= normalRange.min && numValue <= normalRange.max) {
      return <Badge className="eva-badge-success">Норма</Badge>;
    } else if (numValue > normalRange.max) {
      return <Badge className="eva-badge-warning">Повышен</Badge>;
    } else {
      return <Badge className="eva-badge-error">Понижен</Badge>;
    }
  };

  return (
    <div className="eva-page">
      <MobileNav />
      
      <main className="eva-page-content">
        <div className="eva-page-header">
          <h1 className="eva-page-title">Статистика</h1>
          <p className="eva-page-subtitle">Анализ ваших показателей здоровья</p>
        </div>

        {/* Health Score Overview */}
        <div className="eva-card-elevated p-6 mb-6 text-center eva-fade-in">
          <div className="mb-4">
            <div className="text-4xl font-bold eva-gradient-primary bg-clip-text text-transparent mb-2">85</div>
            <div className="text-sm text-muted-foreground">Общий балл здоровья</div>
          </div>
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <div className="text-lg font-bold text-success">↗ 5%</div>
              <div className="text-xs text-muted-foreground">За неделю</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-warning">→ 0%</div>
              <div className="text-xs text-muted-foreground">За месяц</div>
            </div>
          </div>
        </div>

        {/* Current Health Metrics */}
        <div className="eva-card mb-6 eva-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2 text-primary" />
              Текущие показатели
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestMetrics ? (
              <div className="eva-grid-auto gap-4">
                <div className="eva-card bg-surface-1 border-0 p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="w-5 h-5 text-primary mr-2" />
                    <span className="text-2xl font-bold text-primary" data-testid="text-heart-rate">
                      {latestMetrics.heartRate}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Пульс (уд/мин)</div>
                  <div className="eva-badge-success">Норма</div>
                </div>
                
                <div className="eva-card bg-surface-1 border-0 p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="w-5 h-5 text-success mr-2" />
                    <span className="text-2xl font-bold text-success" data-testid="text-blood-pressure">
                      {latestMetrics.bloodPressureSystolic}/{latestMetrics.bloodPressureDiastolic}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Давление</div>
                  <div className="eva-badge-success">Отлично</div>
                </div>
                
                <div className="eva-card bg-surface-1 border-0 p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-warning mr-2" />
                    <span className="text-2xl font-bold text-warning" data-testid="text-temperature">
                      {latestMetrics.temperature}°
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Температура</div>
                  <div className="eva-badge-success">Норма</div>
                </div>
                
                <div className="eva-card bg-surface-1 border-0 p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="w-5 h-5 text-primary mr-2" />
                    <span className="text-2xl font-bold text-primary" data-testid="text-health-score">85</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Здоровье (%)</div>
                  <div className="eva-badge-info">Хорошо</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium mb-1">Нет данных о здоровье</p>
                <p className="text-sm">Добавьте первые измерения для анализа</p>
              </div>
            )}
          </CardContent>
        </div>

        {/* Blood Analysis Summary */}
        <div className="eva-card mb-6 eva-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-primary" />
              Анализы крови
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestAnalysis?.results ? (
              <div className="space-y-4">
                <div className="eva-card bg-surface-1 border-0 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm mb-1">Гемоглобин</div>
                      <div className="text-2xl font-bold text-success" data-testid="text-hemoglobin">
                        {latestAnalysis.results.hemoglobin?.value} 
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {latestAnalysis.results.hemoglobin?.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-success">{getTrendIcon("stable")}</span>
                      <div className="eva-badge-success" data-testid="badge-hemoglobin-status">
                        {latestAnalysis.results.hemoglobin?.status === "normal" ? "Норма" : "Отклонение"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="eva-card bg-surface-1 border-0 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm mb-1">Холестерин</div>
                      <div className="text-2xl font-bold text-warning" data-testid="text-cholesterol">
                        {latestAnalysis.results.cholesterol?.value} 
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {latestAnalysis.results.cholesterol?.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-warning">{getTrendIcon("up")}</span>
                      <div className="eva-badge-warning" data-testid="badge-cholesterol-status">
                        {latestAnalysis.results.cholesterol?.status === "high" ? "Повышен" : "Норма"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="eva-card bg-surface-1 border-0 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm mb-1">Глюкоза</div>
                      <div className="text-2xl font-bold text-success" data-testid="text-glucose">
                        {latestAnalysis.results.glucose?.value} 
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {latestAnalysis.results.glucose?.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-success">{getTrendIcon("stable")}</span>
                      <div className="eva-badge-success" data-testid="badge-glucose-status">
                        {latestAnalysis.results.glucose?.status === "normal" ? "Норма" : "Отклонение"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Droplets className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium mb-1">Нет данных анализов</p>
                <p className="text-sm">Загрузите первый анализ крови для статистики</p>
              </div>
            )}
          </CardContent>
        </div>

        {/* Health Trends */}
        <div className="eva-card eva-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Тенденции
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 eva-card bg-surface-1 border-0">
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="font-medium">Показатели сердца</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={getTrendColor("stable", true)}>
                    {getTrendIcon("stable")}
                  </span>
                  <span className="text-sm font-medium">Стабильно</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 eva-card bg-surface-1 border-0">
                <div className="flex items-center space-x-3">
                  <Droplets className="w-5 h-5 text-warning" />
                  <span className="font-medium">Качество анализов</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={getTrendColor("up", false)}>
                    {getTrendIcon("up")}
                  </span>
                  <span className="text-sm font-medium">Требует внимания</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 eva-card bg-surface-1 border-0">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-success" />
                  <span className="font-medium">Общее состояние</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={getTrendColor("up", true)}>
                    {getTrendIcon("up")}
                  </span>
                  <span className="text-sm font-medium">Улучшается</span>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}