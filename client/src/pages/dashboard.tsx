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
import { Heart, Camera, MessageCircle, Activity } from "lucide-react";

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

  const latestAnalysis = bloodAnalyses?.[0];

  return (
    <div className="min-h-screen bg-health-bg">
      <MobileNav />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-20">
        {/* Welcome Section with Logo */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Привет, <span data-testid="user-name">{healthProfile?.userId ? "Анна" : "Пользователь"}</span>
            </h1>
            <p className="text-sm text-muted-foreground">Время проверить ваше здоровье</p>
          </div>
          <img 
            src="/health-logo.png" 
            alt="HealthAI" 
            className="w-12 h-12 rounded-xl shadow-sm"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            data-testid="button-ai-chat"
            onClick={() => setIsAIChatOpen(true)}
            className="bg-medical-blue hover:bg-medical-blue/90 text-white p-4 h-auto flex flex-col items-center space-y-2 shadow-sm hover:shadow-md transition-shadow"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm font-medium">ИИ Доктор</span>
          </Button>
          
          <Button
            data-testid="button-blood-upload"
            onClick={() => setIsUploadOpen(true)}
            className="bg-trust-green hover:bg-trust-green/90 text-white p-4 h-auto flex flex-col items-center space-y-2 shadow-sm hover:shadow-md transition-shadow"
          >
            <Camera className="w-6 h-6" />
            <span className="text-sm font-medium">Анализ крови</span>
          </Button>
        </div>

        {/* Health Profile Card */}
        {!healthProfile?.profileData && (
          <Card className="p-4 bg-gradient-to-r from-medical-blue/10 to-trust-green/10 border-0 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Создайте профиль здоровья</h3>
                <p className="text-xs text-muted-foreground">
                  Заполните информацию для персональных рекомендаций
                </p>
              </div>
              <Button 
                size="sm"
                onClick={() => navigate("/health-profile")}
                className="bg-medical-blue hover:bg-medical-blue/90"
                data-testid="button-create-profile"
              >
                Создать
              </Button>
            </div>
          </Card>
        )}
        
        {/* Asklepios Score */}
        <div className="mb-6">
          <AsklepiosScoreCard score={88} trend="up" />
        </div>
        
        {/* Health Metrics Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <ActivityCard />
          <HealthMetricsCard metrics={latestMetrics} />
          <BloodAnalysisCard 
            analysis={latestAnalysis} 
            onViewResults={() => setIsAnalysisOpen(true)}
          />
          <HealthProfileCard profile={healthProfile} />
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border mb-6">
          <h3 className="font-semibold text-card-foreground mb-4">Недавняя активность</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-medical-blue/10 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-medical-blue" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-card-foreground">Анализ крови загружен</div>
                <div className="text-xs text-muted-foreground">2 часа назад</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-trust-green/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-trust-green" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-card-foreground">Консультация с ИИ Доктором</div>
                <div className="text-xs text-muted-foreground">Вчера</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning-amber/10 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-warning-amber" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-card-foreground">Обновлены показатели здоровья</div>
                <div className="text-xs text-muted-foreground">3 дня назад</div>
              </div>
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
