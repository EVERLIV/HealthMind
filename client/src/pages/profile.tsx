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
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Settings, Heart, Activity, Brain, Moon, Target, Coffee, Plus, Droplets, Shield } from "lucide-react";

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
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
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
      <div className="eva-page">
        <MobileNav />
        <main className="eva-page-content">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="eva-card p-5 eva-shimmer">
                <div className="eva-skeleton h-5 w-3/4 mb-3"></div>
                <div className="eva-skeleton h-4 w-1/2"></div>
              </div>
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const getActivityLabel = (level: string) => {
    const labels: Record<string, string> = {
      sedentary: 'Малоподвижный',
      light: 'Легкая активность',
      moderate: 'Умеренная активность',
      active: 'Активный',
      very_active: 'Очень активный'
    };
    return labels[level] || level;
  };
  
  const healthGoalLabels: Record<string, string> = {
    weight_loss: "Снижение веса",
    muscle_gain: "Набор мышечной массы",
    improve_fitness: "Улучшение физической формы",
    reduce_stress: "Снижение стресса",
    better_sleep: "Улучшение сна",
    healthy_eating: "Здоровое питание",
    quit_smoking: "Бросить курить",
    manage_condition: "Контроль хронического заболевания",
    increase_energy: "Повышение энергии",
    mental_health: "Улучшение ментального здоровья",
    preventive_care: "Профилактика заболеваний",
    longevity: "Долголетие",
  };

  return (
    <div className="eva-page">
      <MobileNav />
      
      <main className="eva-page-content">
        <div className="eva-page-header">
          <h1 className="eva-page-title">Профиль здоровья</h1>
          <p className="eva-page-subtitle">Управление вашими данными и настройками</p>
        </div>

        {/* Profile Status - EVA Style */}
        {!hasProfile ? (
          <div className="eva-card-elevated p-6 mb-6 eva-gradient-primary text-white eva-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Профиль здоровья не создан</h3>
                  <p className="text-sm opacity-90">
                    Создайте профиль для персонализированных рекомендаций
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/health-profile")}
                className="bg-white text-primary hover:bg-white/90 ml-4 rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Создать
              </Button>
            </div>
          </div>
        ) : (
          <div className="eva-card border-success p-5 mb-6 eva-slide-up" style={{ backgroundColor: 'hsl(var(--success-light))' }}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-success text-lg mb-1">Профиль создан</h3>
                <p className="text-sm text-muted-foreground">
                  Ваш профиль здоровья готов к использованию
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate("/health-profile")}
                className="rounded-full border-success text-success hover:bg-success hover:text-white"
              >
                Просмотреть
              </Button>
            </div>
          </div>
        )}

        {/* Health Information - EVA Style */}
        {hasProfile && (
          <div className="eva-card mb-6 eva-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-primary" />
                  Основная информация
                </CardTitle>
                <Button
                  data-testid="button-edit-profile"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/health-profile")}
                  className="rounded-full"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Редактировать
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="eva-grid-auto gap-4 mb-6">
                <div className="eva-card bg-surface-1 border-0 p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Возраст</div>
                  <div className="text-2xl font-bold text-primary" data-testid="text-age">
                    {pd.age ? `${pd.age}` : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">лет</div>
                </div>
                
                <div className="eva-card bg-surface-1 border-0 p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Пол</div>
                  <div className="text-lg font-bold">
                    {pd.gender === 'male' ? '👨' : pd.gender === 'female' ? '👩' : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pd.gender === 'male' ? 'Мужской' : pd.gender === 'female' ? 'Женский' : "Не указан"}
                  </div>
                </div>
                
                <div className="eva-card bg-surface-1 border-0 p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Вес</div>
                  <div className="text-2xl font-bold text-success" data-testid="text-weight">
                    {pd.weight || "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">кг</div>
                </div>
                
                <div className="eva-card bg-surface-1 border-0 p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Рост</div>
                  <div className="text-2xl font-bold text-info" data-testid="text-height">
                    {pd.height || "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">см</div>
                </div>
              </div>
              
              {pd.activityLevel && (
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-2">Уровень активности</div>
                  <div className="eva-badge eva-badge bg-energy-orange text-white border-0">
                    <Activity className="w-3 h-3 mr-1" />
                    {getActivityLabel(pd.activityLevel)}
                  </div>
                </div>
              )}
              
              {pd.healthGoals && pd.healthGoals.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-3">Цели здоровья</div>
                  <div className="flex flex-wrap gap-2">
                    {pd.healthGoals.slice(0, 3).map((goal: string) => (
                      <div 
                        key={goal}
                        className="eva-chip eva-chip-selected text-xs"
                      >
                        <Target className="w-3 h-3" />
                        {healthGoalLabels[goal] || goal}
                      </div>
                    ))}
                    {pd.healthGoals.length > 3 && (
                      <div className="eva-badge">
                        +{pd.healthGoals.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </div>
        )}

        {/* Quick Stats Cards - EVA Style */}
        {hasProfile && (
          <div className="eva-grid-auto gap-4 eva-slide-up" style={{ animationDelay: '0.2s' }}>
            {pd.stressLevel && (
              <div className="eva-card p-4 text-center">
                <div className="w-10 h-10 bg-wellness-purple rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-wellness-purple mb-1">{pd.stressLevel}/10</div>
                <div className="text-sm text-muted-foreground">Уровень стресса</div>
              </div>
            )}
            
            {pd.sleepHours && (
              <div className="eva-card p-4 text-center">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-indigo-500 mb-1">{pd.sleepHours}</div>
                <div className="text-sm text-muted-foreground">Часов сна</div>
              </div>
            )}
            
            {pd.waterIntake && (
              <div className="eva-card p-4 text-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-500 mb-1">{pd.waterIntake}</div>
                <div className="text-sm text-muted-foreground">Стаканов воды</div>
              </div>
            )}
            
            <div className="eva-card p-4 text-center">
              <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-success mb-1">
                {Array.isArray(healthMetrics) ? healthMetrics.length : 0}
              </div>
              <div className="text-sm text-muted-foreground">Записей анализов</div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}