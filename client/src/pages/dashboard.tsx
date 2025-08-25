import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import HealthMetricsCard from "@/components/cards/health-metrics-card";
import BloodAnalysisCard from "@/components/cards/blood-analysis-card";
import HealthProfileCard from "@/components/cards/health-profile-card";
import AsklepiosScoreCard from "@/components/cards/asklepios-score-card";
import AnalysisResultsModal from "@/components/modals/analysis-results-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Camera, MessageCircle, Shield } from "lucide-react";
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
        <div className="grid grid-cols-2 gap-5 mb-6">
          <Link href="/chat">
            <button
              data-testid="button-ai-chat"
              className="p-8 flex flex-col items-center justify-center gap-4 text-center text-white h-[200px] hover:scale-[1.02] transition-all duration-300 relative overflow-hidden w-full rounded-xl shadow-xl hover:shadow-2xl"
              style={{
                backgroundImage: `url(${aiDoctorBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30"></div>
              <div className="relative z-10 p-3 bg-white/15 backdrop-blur-sm rounded-xl">
                <MessageCircle className="w-10 h-10" />
              </div>
              <div className="relative z-10 space-y-1">
                <div className="font-bold text-2xl tracking-wide text-shadow-strong">ИИ Доктор</div>
                <div className="text-base font-medium text-shadow">Консультация</div>
              </div>
            </button>
          </Link>
          
          <Link href="/blood-analyses">
            <button
              data-testid="button-blood-upload"
              className="p-8 flex flex-col items-center justify-center gap-4 text-center text-white h-[200px] hover:scale-[1.02] transition-all duration-300 relative overflow-hidden w-full rounded-xl shadow-xl hover:shadow-2xl"
              style={{
                backgroundImage: `url(${bloodAnalysisBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30"></div>
              <div className="relative z-10 p-3 bg-white/15 backdrop-blur-sm rounded-xl">
                <Camera className="w-10 h-10" />
              </div>
              <div className="relative z-10 space-y-1">
                <div className="font-bold text-2xl tracking-wide text-shadow-strong">Анализ крови</div>
                <div className="text-base font-medium text-shadow">Загрузить фото</div>
              </div>
            </button>
          </Link>
        </div>

        {/* Profile Status Card - EVA Style */}
        {!hasProfile ? (
          <div 
            className="p-6 mb-6 text-white relative overflow-hidden rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[150px] hover:scale-[1.01]"
            style={{
              backgroundImage: `url(${healthProfileBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-white/15 backdrop-blur-sm rounded-xl mr-3">
                    <Shield className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-xl tracking-wide text-shadow-strong">Создайте профиль здоровья</h3>
                </div>
                <p className="text-base font-medium leading-relaxed text-shadow ml-16">
                  Персонализированные рекомендации и отслеживание показателей
                </p>
              </div>
              <Button 
                size="sm"
                onClick={() => navigate("/health-profile")}
                className="bg-white/95 text-gray-800 hover:bg-white hover:scale-105 ml-4 rounded-xl px-6 py-2.5 font-bold shadow-lg transition-all"
                data-testid="button-create-profile"
              >
                Создать
              </Button>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
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