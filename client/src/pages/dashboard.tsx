import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import SmartHealthGuide from "@/components/smart-health-guide";
import AnalysisResultsModal from "@/components/modals/analysis-results-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IconContainer, iconSizes } from "@/components/ui/icon-container";
import { 
  Heart, 
  Camera, 
  MessageCircle, 
  Shield, 
  Activity,
  TrendingUp,
  Zap,
  Stethoscope,
  Sparkles,
  ChevronRight,
  Target,
  BarChart3
} from "lucide-react";
import aiDoctorBg from '@/assets/images/ai-doctor-bg.png';
import bloodAnalysisBg from '@/assets/images/blood-analysis-bg.png';
import biomarkersBg from '@assets/generated_images/Medical_biomarkers_dashboard_background_70006ade.png';
import profileBg from '@assets/generated_images/Health_profile_medical_background_02e78c15.png';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <MobileNav />
      
      <main className="p-4 pb-24">
        {/* Modern Medical Header */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-medical-blue via-blue-500 to-trust-green relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]"></div>
            </div>
            <div className="relative p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold mb-1">
                    Привет, <span data-testid="user-name" className="text-white/95">{hasProfile ? "Анна" : "Пользователь"}</span>
                  </h1>
                  <p className="text-white/90 text-sm font-medium">
                    Добро пожаловать в EVERLIV HEALTH 🏥
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg border border-white/30">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {!hasProfile && (
                <div className="mt-3 p-3 bg-white/15 rounded-xl backdrop-blur-sm border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold">Создайте профиль здоровья</p>
                      <p className="text-white/80 text-xs">Персонализированные рекомендации</p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => navigate("/health-profile")}
                      className="bg-white text-medical-blue hover:bg-white/90 rounded-xl px-3 py-1.5 text-xs font-bold shadow-lg"
                      data-testid="button-create-profile"
                    >
                      Создать
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Action Cards - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* AI Doctor */}
          <Link href="/chat">
            <button
              data-testid="button-ai-chat"
              className="p-4 flex flex-col items-center justify-center gap-3 text-center text-white h-[160px] hover:scale-[1.02] transition-all duration-300 relative overflow-hidden w-full rounded-2xl shadow-xl hover:shadow-2xl"
              style={{
                backgroundImage: `url(${aiDoctorBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
              <div className="w-12 h-12 bg-medical-blue/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg">
                <MessageCircle className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              <div className="relative z-10 text-center">
                <div className="font-bold text-lg leading-tight text-white mb-0.5" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>ИИ Доктор</div>
                <div className="text-xs font-medium text-white/90" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>24/7 Консультации</div>
              </div>
            </button>
          </Link>
          
          {/* Blood Analysis */}
          <Link href="/blood-analysis">
            <button
              data-testid="button-blood-upload"
              className="p-4 flex flex-col items-center justify-center gap-3 text-center text-white h-[160px] hover:scale-[1.02] transition-all duration-300 relative overflow-hidden w-full rounded-2xl shadow-xl hover:shadow-2xl"
              style={{
                backgroundImage: `url(${bloodAnalysisBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg">
                <Camera className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              <div className="relative z-10 text-center">
                <div className="font-bold text-lg leading-tight text-white mb-0.5" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>Анализ крови</div>
                <div className="text-xs font-medium text-white/90" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>Загрузить фото</div>
              </div>
            </button>
          </Link>

          {/* My Biomarkers - New Card */}
          <Link href="/biomarkers">
            <button
              data-testid="button-biomarkers"
              className="p-4 flex flex-col items-center justify-center gap-3 text-center text-white h-[160px] hover:scale-[1.02] transition-all duration-300 relative overflow-hidden w-full rounded-2xl shadow-xl hover:shadow-2xl"
              style={{
                backgroundImage: `url(${biomarkersBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-700/60 to-purple-500/40"></div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg">
                <BarChart3 className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              <div className="relative z-10 text-center">
                <div className="font-bold text-lg leading-tight text-white mb-0.5" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>Биомаркеры</div>
                <div className="text-xs font-medium text-white/90" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>Мои показатели</div>
              </div>
            </button>
          </Link>

          {/* Health Profile Summary - Compact */}
          <Link href="/profile">
            <button
              data-testid="button-health-profile"
              className="p-4 flex flex-col items-center justify-center gap-3 text-center text-white h-[160px] hover:scale-[1.02] transition-all duration-300 relative overflow-hidden w-full rounded-2xl shadow-xl hover:shadow-2xl"
              style={{
                backgroundImage: `url(${profileBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-700/60 to-emerald-500/40"></div>
              {hasProfile && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
              )}
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg">
                <Shield className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              <div className="relative z-10 text-center">
                <div className="font-bold text-lg leading-tight text-white mb-0.5" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>Мой профиль</div>
                <div className="text-xs font-medium text-white/90" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
                  {hasProfile ? "Заполнен ✓" : "Создать"}
                </div>
              </div>
            </button>
          </Link>
        </div>


        {/* Health Insights */}
        <div className="mb-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 via-white to-yellow-50/30 dark:from-orange-950/20 dark:via-slate-800 dark:to-yellow-900/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    Рекомендация дня
                    <Badge className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5">AI</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    💧 Пейте больше воды! Рекомендуем 8-10 стаканов в день для поддержания оптимального уровня гидратации.
                  </p>
                  <Link href="/recommendations">
                    <Button size="sm" className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:opacity-90 text-white rounded-xl">
                      <Target className="w-4 h-4 mr-1" />
                      Все рекомендации
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Умный справочник здоровья */}
        <SmartHealthGuide 
          userGoals={hasProfile ? ["heart-health", "weight-loss", "energy"] : []}
          userBiomarkers={latestAnalysis?.biomarkerResults || []}
        />

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