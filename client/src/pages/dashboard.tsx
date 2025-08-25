import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import HealthMetricsCard from "@/components/cards/health-metrics-card";
import BloodAnalysisCard from "@/components/cards/blood-analysis-card";
import HealthProfileCard from "@/components/cards/health-profile-card";
import AsklepiosScoreCard from "@/components/cards/asklepios-score-card";
import ActivityCard from "@/components/cards/activity-card";
import AnalysisResultsModal from "@/components/modals/analysis-results-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Camera, MessageCircle, Activity, TrendingUp, Shield, Zap } from "lucide-react";
import aiDoctorBg from '@/assets/images/ai-doctor-bg.png';
import bloodAnalysisBg from '@/assets/images/blood-analysis-bg.png';
import healthProfileBg from '@/assets/images/health-profile-bg.png';

export default function Dashboard() {
  const [, navigate] = useLocation();
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
          <Link href="/chat">
            <button
              data-testid="button-ai-chat"
              className="eva-card-interactive p-6 flex flex-col items-center space-y-3 text-center text-white min-h-[140px] eva-scale-in hover:scale-105 transition-all duration-300 relative overflow-hidden w-full shadow-2xl hover:shadow-[0_20px_50px_rgba(147,_51,_234,_0.7)]"
              style={{
                backgroundImage: `url(${aiDoctorBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/95 via-purple-600/90 to-indigo-600/95 backdrop-blur-sm"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="relative z-10 p-3.5 bg-white/25 backdrop-blur-md rounded-full shadow-lg">
                <MessageCircle className="w-7 h-7 drop-shadow-lg" />
              </div>
              <div className="relative z-10">
                <div className="font-bold text-lg tracking-wide drop-shadow-lg">ИИ Доктор</div>
                <div className="text-xs opacity-95 font-medium mt-1">Консультация</div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -top-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            </button>
          </Link>
          
          <Link href="/blood-analyses">
            <button
              data-testid="button-blood-upload"
              className="eva-card-interactive p-6 flex flex-col items-center space-y-3 text-center text-white min-h-[140px] eva-scale-in hover:scale-105 transition-all duration-300 relative overflow-hidden w-full shadow-2xl hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]"
              style={{
                backgroundImage: `url(${bloodAnalysisBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/95 via-teal-600/90 to-cyan-600/95 backdrop-blur-sm"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="relative z-10 p-3.5 bg-white/25 backdrop-blur-md rounded-full shadow-lg">
                <Camera className="w-7 h-7 drop-shadow-lg" />
              </div>
              <div className="relative z-10">
                <div className="font-bold text-lg tracking-wide drop-shadow-lg">Анализ крови</div>
                <div className="text-xs opacity-95 font-medium mt-1">Загрузить фото</div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -top-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            </button>
          </Link>
        </div>

        {/* Profile Status Card - EVA Style */}
        {!hasProfile ? (
          <div 
            className="eva-card-elevated p-6 mb-6 text-white eva-slide-up relative overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_rgba(99,_102,_241,_0.6)] transition-all duration-300 min-h-[140px]"
            style={{
              backgroundImage: `url(${healthProfileBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/95 via-purple-600/90 to-blue-600/95 backdrop-blur-sm"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-full mr-3">
                    <Shield className="w-6 h-6 drop-shadow-lg" />
                  </div>
                  <h3 className="font-bold text-lg tracking-wide drop-shadow-lg">Создайте профиль здоровья</h3>
                </div>
                <p className="text-sm opacity-95 font-medium leading-relaxed">
                  Персонализированные рекомендации и отслеживание показателей
                </p>
              </div>
              <Button 
                size="sm"
                onClick={() => navigate("/health-profile")}
                className="bg-white/95 backdrop-blur-md text-indigo-600 hover:bg-white hover:scale-105 ml-4 rounded-full px-6 py-2 font-bold shadow-lg transition-all"
                data-testid="button-create-profile"
              >
                Создать
              </Button>
            </div>
            <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -top-3 -left-3 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          </div>
        ) : (
          <div className="eva-card-elevated p-5 mb-6 eva-slide-up relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-500/15 to-teal-500/20"></div>
            <div className="flex items-center relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                <Shield className="w-6 h-6 text-white drop-shadow" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 text-base">Профиль создан</div>
                <div className="text-sm text-emerald-600/80 dark:text-emerald-500/80 font-medium">Готов к использованию</div>
              </div>
              <div className="absolute -right-2 -top-2 w-16 h-16 bg-emerald-400/20 rounded-full blur-xl"></div>
            </div>
          </div>
        )}
        
        {/* Health Cards Grid */}
        <div className="space-y-4 mb-6">
          <div className="eva-slide-up" style={{ animationDelay: '0.1s' }}>
            <ActivityCard />
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
      <AnalysisResultsModal
        open={isAnalysisOpen}
        onOpenChange={setIsAnalysisOpen}
        analysis={latestAnalysis}
      />
    </div>
  );
}