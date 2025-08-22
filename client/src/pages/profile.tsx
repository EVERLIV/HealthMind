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
import { User, Settings, Heart, Activity, Brain, Moon, Target, Coffee, Plus, Droplets } from "lucide-react";

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
  const hasProfile = profile && ((profile as any)?.profileData || profile.completionPercentage > 0);

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
      <div className="min-h-screen bg-health-bg">
        <MobileNav />
        <main className="max-w-md mx-auto px-4 py-6 pb-20">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
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
    <div className="min-h-screen bg-health-bg">
      <MobileNav />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Профиль здоровья</h1>
          <p className="text-muted-foreground">Управление вашими данными и настройками</p>
        </div>

        {/* Profile Status */}
        {!hasProfile ? (
          <Card className="mb-6 bg-gradient-to-r from-medical-blue/10 to-trust-green/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-medical-blue" />
                Профиль здоровья не создан
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Создайте профиль здоровья для получения персонализированных рекомендаций и отслеживания показателей
              </p>
              <Button 
                onClick={() => navigate("/health-profile")}
                className="w-full bg-gradient-to-r from-medical-blue to-trust-green hover:opacity-90 text-white rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Создать профиль здоровья
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 bg-gradient-to-r from-trust-green/10 to-medical-blue/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-trust-green" />
                  Профиль создан
                </CardTitle>
                <div className="w-10 h-10 bg-trust-green rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold" data-testid="text-completion-percentage">
                    ✓
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Ваш профиль здоровья успешно создан и готов к использованию
              </p>
              <Button 
                variant="outline"
                onClick={() => navigate("/health-profile")}
                className="w-full rounded-full"
              >
                Просмотреть полный профиль
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Health Information - Only show if profile exists */}
        {hasProfile && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-medical-blue" />
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
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Возраст</div>
                    <div className="font-medium" data-testid="text-age">
                      {pd.age ? `${pd.age} лет` : "Не указан"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Пол</div>
                    <div className="font-medium">
                      {pd.gender === 'male' ? 'Мужской' : pd.gender === 'female' ? 'Женский' : "Не указан"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Вес</div>
                    <div className="font-medium" data-testid="text-weight">
                      {pd.weight ? `${pd.weight} кг` : "Не указан"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Рост</div>
                    <div className="font-medium" data-testid="text-height">
                      {pd.height ? `${pd.height} см` : "Не указан"}
                    </div>
                  </div>
                </div>
                
                {pd.activityLevel && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Уровень активности</div>
                    <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-full text-sm">
                      {getActivityLabel(pd.activityLevel)}
                    </span>
                  </div>
                )}
                
                {pd.healthGoals && pd.healthGoals.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Цели здоровья</div>
                    <div className="flex flex-wrap gap-2">
                      {pd.healthGoals.slice(0, 3).map((goal: string) => (
                        <span 
                          key={goal}
                          className="px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full text-xs font-medium"
                        >
                          {healthGoalLabels[goal] || goal}
                        </span>
                      ))}
                      {pd.healthGoals.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                          +{pd.healthGoals.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats Cards */}
        {hasProfile && (
          <div className="grid grid-cols-2 gap-4">
            {pd.stressLevel && (
              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-purple-500/10 rounded-full">
                    <Brain className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium">Стресс</span>
                </div>
                <div className="text-2xl font-bold">{pd.stressLevel}/10</div>
              </Card>
            )}
            
            {pd.sleepHours && (
              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-indigo-500/10 rounded-full">
                    <Moon className="w-4 h-4 text-indigo-500" />
                  </div>
                  <span className="text-sm font-medium">Сон</span>
                </div>
                <div className="text-2xl font-bold">{pd.sleepHours} ч</div>
              </Card>
            )}
            
            {pd.waterIntake && (
              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-full">
                    <Droplets className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium">Вода</span>
                </div>
                <div className="text-2xl font-bold">{pd.waterIntake} ст</div>
              </Card>
            )}
            
            <Card className="p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <Activity className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm font-medium">Анализы</span>
              </div>
              <div className="text-2xl font-bold">{Array.isArray(healthMetrics) ? healthMetrics.length : 0}</div>
            </Card>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}