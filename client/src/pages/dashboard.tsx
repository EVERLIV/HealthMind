import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import HealthMetricsCard from "@/components/cards/health-metrics-card";
import BloodAnalysisCard from "@/components/cards/blood-analysis-card";
import HealthProfileCard from "@/components/cards/health-profile-card";
import AsklepiosScoreCard from "@/components/cards/asklepios-score-card";
import ActivityCard from "@/components/cards/activity-card";
import AIChatModal from "@/components/modals/ai-chat-modal";
import BloodAnalysisModal from "@/components/modals/blood-analysis-modal";
import AnalysisResultsModal from "@/components/modals/analysis-results-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Camera, MessageCircle, Activity, TrendingUp, Shield, Zap } from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  const { data: healthProfile } = useQuery({
    queryKey: ["/api/health-profile"],
  });

  const { data: latestMetrics } = useQuery({
    queryKey: ["/api/health-metrics/latest"],
  });

  const { data: bloodAnalyses } = useQuery({
    queryKey: ["/api/blood-analyses"],
  });

  const latestAnalysis = bloodAnalyses && Array.isArray(bloodAnalyses) ? bloodAnalyses[0] : null;
  const hasProfile = healthProfile && ((healthProfile as any)?.profileData || (healthProfile as any)?.completionPercentage > 0);

  return (
    <div className="eva-page">
      <MobileNav />
      
      <main className="eva-page-content">
        {/* Welcome Section with EVA branding */}
        <div className="eva-page-header">
          <div className="flex items-center justify-between">
            <div className="eva-fade-in">
              <h1 className="eva-page-title">
                Привет, <span data-testid="user-name" className="text-primary">{hasProfile ? "Анна" : "Пользователь"}</span>
              </h1>
              <p className="eva-page-subtitle">Давайте проверим ваше здоровье</p>
            </div>
            <div className="w-12 h-12 eva-gradient-primary rounded-full flex items-center justify-center shadow-md eva-scale-in">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Quick Actions - EVA Style */}
        <div className="eva-grid-auto mb-6">
          <button
            data-testid="button-ai-chat"
            onClick={() => setIsAIChatOpen(true)}
            className="eva-card-interactive p-6 flex flex-col items-center space-y-3 text-center eva-gradient-primary text-white min-h-[120px] eva-scale-in hover:scale-105 transition-all duration-300"
          >
            <div className="p-3 bg-white/20 rounded-full">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold">ИИ Доктор</div>
              <div className="text-xs opacity-90">Консультация</div>
            </div>
          </button>
          
          <button
            data-testid="button-blood-upload"
            onClick={() => setIsUploadOpen(true)}
            className="eva-card-interactive p-6 flex flex-col items-center space-y-3 text-center eva-gradient-success text-white min-h-[120px] eva-scale-in hover:scale-105 transition-all duration-300"
          >
            <div className="p-3 bg-white/20 rounded-full">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold">Анализ крови</div>
              <div className="text-xs opacity-90">Загрузить фото</div>
            </div>
          </button>
        </div>

        {/* Profile Status Card - EVA Style */}
        {!hasProfile ? (
          <div className="eva-card-elevated p-5 mb-6 eva-gradient-primary text-white eva-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 mr-2" />
                  <h3 className="font-semibold">Создайте профиль здоровья</h3>
                </div>
                <p className="text-sm opacity-90">
                  Персонализированные рекомендации и отслеживание показателей
                </p>
              </div>
              <Button 
                size="sm"
                onClick={() => navigate("/health-profile")}
                className="bg-white text-primary hover:bg-white/90 ml-4 rounded-full"
                data-testid="button-create-profile"
              >
                Создать
              </Button>
            </div>
          </div>
        ) : (
          <div className="eva-card p-4 mb-6 border-success/20 bg-success-light eva-slide-up">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-success">Профиль создан</div>
                <div className="text-sm text-muted-foreground">Готов к использованию</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Health Score - EVA Style */}
        <div className="eva-card-elevated p-6 mb-6 text-center eva-fade-in">
          <div className="mb-4">
            <div className="text-3xl font-bold eva-gradient-primary bg-clip-text text-transparent mb-2">88</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center">
              <TrendingUp className="w-4 h-4 mr-1 text-success" />
              Индекс здоровья EVA
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mb-1">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground">Сердце</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-success-light rounded-full flex items-center justify-center mb-1">
                <Zap className="w-5 h-5 text-success" />
              </div>
              <div className="text-xs text-muted-foreground">Энергия</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-warning-light rounded-full flex items-center justify-center mb-1">
                <Activity className="w-5 h-5 text-warning" />
              </div>
              <div className="text-xs text-muted-foreground">Активность</div>
            </div>
          </div>
        </div>
        
        {/* Health Cards Grid */}
        <div className="space-y-4 mb-6">
          <div className="eva-slide-up" style={{ animationDelay: '0.1s' }}>
            <ActivityCard />
          </div>
          <div className="eva-slide-up" style={{ animationDelay: '0.2s' }}>
            <HealthMetricsCard metrics={latestMetrics as any} />
          </div>
          <div className="eva-slide-up" style={{ animationDelay: '0.3s' }}>
            <BloodAnalysisCard 
              analysis={latestAnalysis} 
              onViewResults={() => setIsAnalysisOpen(true)}
            />
          </div>
          <div className="eva-slide-up" style={{ animationDelay: '0.4s' }}>
            <HealthProfileCard profile={healthProfile as any} />
          </div>
        </div>

        {/* Recent Activity - EVA Style */}
        <div className="eva-card p-5 eva-fade-in">
          <h3 className="font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary" />
            Недавняя активность
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Анализ крови загружен</div>
                <div className="text-xs text-muted-foreground">2 часа назад</div>
              </div>
              <div className="eva-badge-success">Завершено</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-success-light rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Консультация с ИИ</div>
                <div className="text-xs text-muted-foreground">Вчера</div>
              </div>
              <div className="eva-badge-info">Активно</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-warning-light rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Обновлены показатели</div>
                <div className="text-xs text-muted-foreground">3 дня назад</div>
              </div>
              <div className="eva-badge-warning">Важно</div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />

      {/* Modals */}
      <AIChatModal 
        open={isAIChatOpen} 
        onOpenChange={setIsAIChatOpen}
      />
      
      <BloodAnalysisModal 
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
      />
      
      <AnalysisResultsModal
        open={isAnalysisOpen}
        onOpenChange={setIsAnalysisOpen}
        analysis={latestAnalysis}
      />
    </div>
  );
}