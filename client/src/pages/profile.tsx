import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Settings, 
  Heart, 
  Activity, 
  Brain, 
  Moon, 
  Target, 
  Coffee, 
  Plus, 
  Droplets, 
  Shield,
  ArrowLeft,
  Edit,
  TrendingUp,
  Award,
  CheckCircle2,
  Sparkles,
  Calendar,
  Ruler,
  Weight,
  Stethoscope
} from "lucide-react";

const profileSchema = z.object({
  age: z.number().min(1).max(120).optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  medicalConditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
});

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/health-profile"],
  });

  const { data: healthMetrics } = useQuery({
    queryKey: ["/api/health-metrics"],
  });
  
  const pd = (profile as any)?.profileData || {};
  const hasProfile = profile && ((profile as any)?.profileData || (profile as any)?.completionPercentage > 0);

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    if (!pd) return 0;
    let filled = 0;
    let total = 15;
    
    if (pd.age) filled++;
    if (pd.gender) filled++;
    if (pd.height) filled++;
    if (pd.weight) filled++;
    if (pd.activityLevel) filled++;
    if (pd.dietType) filled++;
    if (pd.sleepHours) filled++;
    if (pd.sleepQuality) filled++;
    if (pd.stressLevel) filled++;
    if (pd.healthGoals?.length > 0) filled += 2;
    if (pd.chronicConditions) filled++;
    if (pd.allergies) filled++;
    if (pd.familyHistory) filled++;
    if (pd.currentMedications) filled++;
    if (pd.supplements) filled++;
    
    return Math.round((filled / total) * 100);
  };

  const completionPercentage = calculateCompletion();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: pd.age || undefined,
      weight: pd.weight || "",
      height: pd.height || "",
      medicalConditions: pd.medicalConditions || [],
      medications: pd.medications || [],
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/health-profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-profile"] });
      setIsEditing(false);
      toast({
        title: "✅ Профиль обновлен",
        description: "Ваши данные успешно сохранены",
        className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <MobileNav />
        <main className="px-3 py-4 pb-24">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const getActivityLabel = (level: string) => {
    const labels: Record<string, { label: string; icon: string; color: string }> = {
      sedentary: { label: 'Сидячий', icon: '🪑', color: 'bg-gray-100 text-gray-700' },
      light: { label: 'Легкая активность', icon: '🚶', color: 'bg-blue-100 text-blue-700' },
      moderate: { label: 'Умеренная активность', icon: '🏃', color: 'bg-green-100 text-green-700' },
      active: { label: 'Активный', icon: '⚡', color: 'bg-orange-100 text-orange-700' },
      very_active: { label: 'Очень активный', icon: '🔥', color: 'bg-red-100 text-red-700' }
    };
    return labels[level] || { label: level, icon: '🏃', color: 'bg-gray-100 text-gray-700' };
  };
  
  const healthGoalLabels: Record<string, { label: string; icon: string; color: string }> = {
    weight_loss: { label: "Снижение веса", icon: "⚖️", color: "bg-blue-100 text-blue-700" },
    muscle_gain: { label: "Набор массы", icon: "💪", color: "bg-purple-100 text-purple-700" },
    improve_fitness: { label: "Фитнес", icon: "🏃", color: "bg-green-100 text-green-700" },
    reduce_stress: { label: "Меньше стресса", icon: "🧘", color: "bg-indigo-100 text-indigo-700" },
    better_sleep: { label: "Лучше сон", icon: "😴", color: "bg-indigo-100 text-indigo-700" },
    healthy_eating: { label: "Питание", icon: "🥗", color: "bg-emerald-100 text-emerald-700" },
    quit_smoking: { label: "Бросить курить", icon: "🚭", color: "bg-red-100 text-red-700" },
    manage_condition: { label: "Контроль болезни", icon: "🏥", color: "bg-orange-100 text-orange-700" },
    increase_energy: { label: "Больше энергии", icon: "⚡", color: "bg-yellow-100 text-yellow-700" },
    mental_health: { label: "Ментальное", icon: "🧠", color: "bg-purple-100 text-purple-700" },
    preventive_care: { label: "Профилактика", icon: "🛡️", color: "bg-cyan-100 text-cyan-700" },
    longevity: { label: "Долголетие", icon: "🌱", color: "bg-teal-100 text-teal-700" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <MobileNav />
      
      <main className="px-3 py-4 pb-24">
        {/* Modern Medical Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-medical-blue via-blue-500 to-trust-green relative overflow-hidden rounded-2xl">
            {/* Background pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]"></div>
            </div>
            <div className="relative p-5 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">
                      HealthAI Профиль
                    </h1>
                    <p className="text-white/90 text-sm font-medium">
                      Персональный медицинский профиль
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/80">Версия</div>
                  <div className="text-lg font-bold">2.0</div>
                </div>
              </div>
              
              {hasProfile && (
                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm border border-white/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-sm font-medium">Заполненность профиля</span>
                    <span className="text-white text-sm font-bold">{completionPercentage}%</span>
                  </div>
                  <div className="bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                      className="h-2 bg-gradient-to-r from-white via-white/95 to-white/90 transition-all duration-700 ease-out rounded-full relative overflow-hidden"
                      style={{ width: `${completionPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Status */}
        {!hasProfile ? (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 via-white to-orange-50/30 dark:from-red-950/30 dark:via-slate-800 dark:to-orange-950/30 mb-6">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-red-500/15 to-orange-500/10 rounded-2xl border border-red-200/50 dark:border-red-800/50 shadow-sm">
                  <User className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-2">Профиль здоровья не создан</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    🏥 Создайте персональный медицинский профиль для получения точных рекомендаций по здоровью и персонализированного анализа результатов
                  </p>
                  <Button 
                    onClick={() => navigate("/health-profile")}
                    className="bg-gradient-to-r from-medical-blue to-trust-green hover:opacity-90 text-white rounded-xl shadow-lg"
                    data-testid="button-create-profile"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Создать профиль
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 via-white to-emerald-50/30 dark:from-green-950/30 dark:via-slate-800 dark:to-emerald-950/30 mb-6">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500/15 to-emerald-500/10 rounded-2xl border border-green-200/50 dark:border-green-800/50 shadow-sm">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                    Профиль активен
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    ✅ Ваш медицинский профиль готов к использованию и анализу
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health Information */}
        {hasProfile && (
          <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-medical-blue/15 to-trust-green/10 rounded-xl border border-medical-blue/20 shadow-sm">
                  <Heart className="w-5 h-5 text-medical-blue" />
                </div>
                <div>
                  <span className="text-lg font-bold">Основные показатели</span>
                  <p className="text-xs text-muted-foreground font-normal mt-0.5">Ключевые параметры вашего здоровья</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-medical-blue/5 dark:from-blue-950/20 dark:to-slate-800">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-medical-blue/15 rounded-lg">
                        <Calendar className="w-4 h-4 text-medical-blue" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-medical-blue mb-1" data-testid="text-age">
                      {pd.age || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">лет</div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-500/5 dark:from-purple-950/20 dark:to-slate-800">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-purple-500/15 rounded-lg">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                    <div className="text-xl font-bold mb-1">
                      {pd.gender === 'male' ? '👨' : pd.gender === 'female' ? '👩' : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {pd.gender === 'male' ? 'Мужской' : pd.gender === 'female' ? 'Женский' : "—"}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-trust-green/5 dark:from-green-950/20 dark:to-slate-800">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-trust-green/15 rounded-lg">
                        <Weight className="w-4 h-4 text-trust-green" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-trust-green mb-1" data-testid="text-weight">
                      {pd.weight || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">кг</div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-500/5 dark:from-orange-950/20 dark:to-slate-800">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-orange-500/15 rounded-lg">
                        <Ruler className="w-4 h-4 text-orange-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-orange-600 mb-1" data-testid="text-height">
                      {pd.height || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">см</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Activity Level */}
              {pd.activityLevel && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    Уровень активности
                  </h4>
                  <Badge className={`${getActivityLabel(pd.activityLevel).color} border-0 px-3 py-1 text-sm font-medium rounded-full`}>
                    <span className="mr-1">{getActivityLabel(pd.activityLevel).icon}</span>
                    {getActivityLabel(pd.activityLevel).label}
                  </Badge>
                </div>
              )}
              
              {/* Health Goals */}
              {pd.healthGoals && pd.healthGoals.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-pink-500" />
                    Цели здоровья
                    <Badge className="text-xs px-2 py-0.5">{pd.healthGoals.length}</Badge>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {pd.healthGoals.slice(0, 4).map((goal: string) => {
                      const goalInfo = healthGoalLabels[goal] || { label: goal, icon: "🎯", color: "bg-gray-100 text-gray-700" };
                      return (
                        <Badge 
                          key={goal}
                          className={`${goalInfo.color} border-0 px-3 py-1 text-xs font-medium rounded-full`}
                        >
                          <span className="mr-1">{goalInfo.icon}</span>
                          {goalInfo.label}
                        </Badge>
                      );
                    })}
                    {pd.healthGoals.length > 4 && (
                      <Badge className="bg-slate-100 text-slate-600 border-0 px-3 py-1 text-xs rounded-full">
                        +{pd.healthGoals.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Health Metrics Quick Stats */}
        {hasProfile && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pd.stressLevel && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-white to-purple-100/30 dark:from-purple-950/20 dark:via-slate-800 dark:to-purple-900/20">
                <CardContent className="p-4 text-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500/15 to-violet-500/10 rounded-2xl mx-auto mb-3 w-fit">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mb-1">{pd.stressLevel}/10</div>
                  <div className="text-xs text-muted-foreground">Уровень стресса</div>
                  <Progress value={pd.stressLevel * 10} className="h-1.5 mt-2" />
                </CardContent>
              </Card>
            )}
            
            {pd.sleepHours && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 via-white to-indigo-100/30 dark:from-indigo-950/20 dark:via-slate-800 dark:to-indigo-900/20">
                <CardContent className="p-4 text-center">
                  <div className="p-3 bg-gradient-to-br from-indigo-500/15 to-blue-500/10 rounded-2xl mx-auto mb-3 w-fit">
                    <Moon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 mb-1">{pd.sleepHours}ч</div>
                  <div className="text-xs text-muted-foreground">Часы сна</div>
                  <div className="mt-2 text-xs">
                    {pd.sleepHours >= 7 && pd.sleepHours <= 9 ? "✅ Норма" : pd.sleepHours < 7 ? "⚠️ Мало" : "⚠️ Много"}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {pd.waterIntake && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-cyan-100/30 dark:from-blue-950/20 dark:via-slate-800 dark:to-cyan-900/20">
                <CardContent className="p-4 text-center">
                  <div className="p-3 bg-gradient-to-br from-blue-500/15 to-cyan-500/10 rounded-2xl mx-auto mb-3 w-fit">
                    <Droplets className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{pd.waterIntake}</div>
                  <div className="text-xs text-muted-foreground">Стаканов воды</div>
                  <div className="mt-2 text-xs">
                    {pd.waterIntake >= 8 ? "✅ Отлично" : pd.waterIntake >= 6 ? "👍 Хорошо" : "💧 Пейте больше"}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 via-white to-emerald-100/30 dark:from-green-950/20 dark:via-slate-800 dark:to-emerald-900/20">
              <CardContent className="p-4 text-center">
                <div className="p-3 bg-gradient-to-br from-green-500/15 to-emerald-500/10 rounded-2xl mx-auto mb-3 w-fit">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {Array.isArray(healthMetrics) ? healthMetrics.length : 0}
                </div>
                <div className="text-xs text-muted-foreground">Анализов крови</div>
                <div className="mt-2 text-xs text-green-600 font-medium">
                  📊 Данные собираются
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}