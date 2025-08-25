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
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/chat">
            <button
              data-testid="button-ai-chat"
              className="eva-card-interactive p-6 flex flex-col items-center justify-center space-y-3 text-center text-white min-h-[160px] eva-scale-in hover:scale-[1.03] transition-all duration-300 relative overflow-hidden w-full rounded-2xl shadow-2xl hover:shadow-[0_30px_60px_rgba(147,_51,_234,_0.5)]"
              style={{
                backgroundImage: `url(${aiDoctorBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/80 via-purple-600/75 to-indigo-600/80 backdrop-blur-[2px]"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="relative z-10 p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/30">
                <MessageCircle className="w-8 h-8 drop-shadow-lg" />
              </div>
              <div className="relative z-10">
                <div className="font-bold text-xl tracking-wide drop-shadow-2xl">ИИ Доктор</div>
                <div className="text-sm opacity-95 font-medium mt-1 drop-shadow-lg">Консультация 24/7</div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </button>
          </Link>
          
          <Link href="/blood-analyses">
            <button
              data-testid="button-blood-upload"
              className="eva-card-interactive p-6 flex flex-col items-center justify-center space-y-3 text-center text-white min-h-[160px] eva-scale-in hover:scale-[1.03] transition-all duration-300 relative overflow-hidden w-full rounded-2xl shadow-2xl hover:shadow-[0_30px_60px_rgba(8,_112,_184,_0.5)]"
              style={{
                backgroundImage: `url(${bloodAnalysisBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/80 via-teal-600/75 to-cyan-600/80 backdrop-blur-[2px]"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="relative z-10 p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/30">
                <Camera className="w-8 h-8 drop-shadow-lg" />
              </div>
              <div className="relative z-10">
                <div className="font-bold text-xl tracking-wide drop-shadow-2xl">Анализ крови</div>
                <div className="text-sm opacity-95 font-medium mt-1 drop-shadow-lg">Загрузить фото</div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </button>
          </Link>
        </div>

        {/* Profile Status Card - EVA Style */}
        {!hasProfile ? (
          <div 
            className="eva-card-elevated p-6 mb-6 text-white eva-slide-up relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-[0_30px_60px_rgba(99,_102,_241,_0.5)] transition-all duration-300 min-h-[150px] hover:scale-[1.01]"
            style={{
              backgroundImage: `url(${healthProfileBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/85 via-purple-600/80 to-blue-600/85 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-white/25 backdrop-blur-md rounded-xl mr-3 border border-white/30">
                    <Shield className="w-6 h-6 drop-shadow-lg" />
                  </div>
                  <h3 className="font-bold text-xl tracking-wide drop-shadow-2xl">Создайте профиль здоровья</h3>
                </div>
                <p className="text-sm opacity-95 font-medium leading-relaxed drop-shadow-lg">
                  Персонализированные рекомендации и отслеживание показателей
                </p>
              </div>
              <Button 
                size="sm"
                onClick={() => navigate("/health-profile")}
                className="bg-white/90 backdrop-blur-md text-indigo-600 hover:bg-white hover:scale-105 ml-4 rounded-xl px-6 py-2.5 font-bold shadow-xl transition-all border border-white/50"
                data-testid="button-create-profile"
              >
                Создать
              </Button>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -top-6 -left-6 w-28 h-28 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        ) : (
          <div className="eva-card-elevated p-5 mb-6 eva-slide-up relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-0 hover:scale-[1.01] bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-green-500/10 to-teal-500/15"></div>
            <div className="flex items-center relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-xl">
                <Shield className="w-7 h-7 text-white drop-shadow" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">Профиль создан</div>
                <div className="text-sm text-emerald-600/80 dark:text-emerald-500/80 font-medium">Готов к использованию</div>
              </div>
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-400/15 rounded-full blur-2xl"></div>
              <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-teal-400/15 rounded-full blur-2xl"></div>
            </div>
          </div>
        )}
        
        {/* Health Cards Grid */}
        <div className="grid grid-cols-1 gap-5 mb-6">
          <div className="eva-slide-up transform transition-all duration-500 hover:translate-y-[-4px]" style={{ animationDelay: '0.1s' }}>
            <ActivityCard />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="eva-slide-up transform transition-all duration-500 hover:translate-y-[-4px]" style={{ animationDelay: '0.2s' }}>
              <BloodAnalysisCard 
                analysis={latestAnalysis} 
                onViewResults={() => setIsAnalysisOpen(true)}
              />
            </div>
            <div className="eva-slide-up transform transition-all duration-500 hover:translate-y-[-4px]" style={{ animationDelay: '0.3s' }}>
              <HealthProfileCard profile={healthProfile as any} />
            </div>
          </div>
        </div>

        {/* Recent Activity - EVA Style */}
        <div className="eva-card-elevated p-6 eva-fade-in rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <h3 className="font-bold text-lg mb-5 flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-3 shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Недавняя активность
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Анализ крови загружен</div>
                <div className="text-xs text-muted-foreground font-medium">2 часа назад</div>
              </div>
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">Завершено</div>
            </div>
            <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Консультация с ИИ</div>
                <div className="text-xs text-muted-foreground font-medium">Вчера</div>
              </div>
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold">Активно</div>
            </div>
            <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Обновлены показатели</div>
                <div className="text-xs text-muted-foreground font-medium">3 дня назад</div>
              </div>
              <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold">Важно</div>
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