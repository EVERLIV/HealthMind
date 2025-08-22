import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import HealthProfileWizard from "@/components/health-profile-wizard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Edit, Activity, Brain, Moon, Pill, Target, Heart, Coffee, Droplets } from "lucide-react";

export default function HealthProfilePage() {
  const [, navigate] = useLocation();
  const [showWizard, setShowWizard] = useState(false);
  
  const { data: profile } = useQuery<any>({
    queryKey: ["/api/health-profile"],
  });
  
  const handleComplete = () => {
    setShowWizard(false);
    navigate("/");
  };
  
  if (showWizard || !profile?.profileData) {
    return (
      <div className="min-h-screen bg-background">
        <HealthProfileWizard 
          onComplete={handleComplete}
          initialData={profile?.profileData}
        />
      </div>
    );
  }
  
  const pd = profile.profileData;
  
  const getGenderLabel = (gender: string) => {
    switch(gender) {
      case 'male': return 'Мужской';
      case 'female': return 'Женский';
      default: return 'Не указан';
    }
  };
  
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
    <div className="min-h-screen bg-gradient-to-b from-medical-blue/5 to-background">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full"
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold">Профиль здоровья</h1>
            </div>
            <Button
              onClick={() => setShowWizard(true)}
              className="bg-gradient-to-r from-medical-blue to-trust-green hover:opacity-90 text-white rounded-full px-6"
              data-testid="button-edit-profile"
            >
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          </div>
        </div>
      </div>
      
      {/* Profile Summary */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-4 md:gap-6">
          
          {/* Personal Info Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white dark:bg-gray-950 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-medical-blue/10 rounded-full">
                  <User className="w-4 h-4 text-medical-blue" />
                </div>
                <span className="text-sm font-medium">Основные данные</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Возраст:</span>
                  <span className="text-sm font-semibold">{pd.age || "—"} лет</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Пол:</span>
                  <span className="text-sm font-semibold">{getGenderLabel(pd.gender)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-950 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-trust-green/10 rounded-full">
                  <Activity className="w-4 h-4 text-trust-green" />
                </div>
                <span className="text-sm font-medium">Физические параметры</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Рост:</span>
                  <span className="text-sm font-semibold">{pd.height || "—"} см</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Вес:</span>
                  <span className="text-sm font-semibold">{pd.weight || "—"} кг</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">ИМТ:</span>
                  <span className="text-sm font-semibold">{pd.bmi || "—"}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-950 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <Brain className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-sm font-medium">Ментальное здоровье</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Стресс:</span>
                  <span className="text-sm font-semibold">{pd.stressLevel ? `${pd.stressLevel}/10` : "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Тревожность:</span>
                  <span className="text-sm font-semibold">{pd.anxietyLevel ? `${pd.anxietyLevel}/10` : "—"}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-950 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-indigo-500/10 rounded-full">
                  <Moon className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-sm font-medium">Сон</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Часы сна:</span>
                  <span className="text-sm font-semibold">{pd.sleepHours || "—"} ч</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Качество:</span>
                  <span className="text-sm font-semibold">
                    {pd.sleepQuality === 'poor' ? 'Плохое' : 
                     pd.sleepQuality === 'fair' ? 'Среднее' :
                     pd.sleepQuality === 'good' ? 'Хорошее' :
                     pd.sleepQuality === 'excellent' ? 'Отличное' : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Health Goals */}
          {pd.healthGoals && pd.healthGoals.length > 0 && (
            <div className="bg-white dark:bg-gray-950 rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-medical-blue/10 to-trust-green/10 rounded-full">
                  <Target className="w-5 h-5 text-medical-blue" />
                </div>
                <h3 className="font-semibold">Цели здоровья</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {pd.healthGoals.map((goal: string) => (
                  <span 
                    key={goal}
                    className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full text-sm font-medium"
                  >
                    {healthGoalLabels[goal] || goal}
                  </span>
                ))}
              </div>
              {pd.primaryGoal && (
                <div className="mt-4 p-4 bg-gradient-to-r from-medical-blue/5 to-trust-green/5 rounded-lg">
                  <p className="text-sm font-medium mb-1">Главная цель:</p>
                  <p className="text-sm text-muted-foreground">{pd.primaryGoal}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Lifestyle Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pd.activityLevel && (
              <div className="bg-white dark:bg-gray-950 rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-orange-500/10 rounded-full">
                    <Activity className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-sm font-medium">Активность</span>
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-full text-sm">
                    {getActivityLabel(pd.activityLevel)}
                  </span>
                  {pd.exerciseFrequency && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Частота тренировок: {pd.exerciseFrequency}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {pd.dietType && (
              <div className="bg-white dark:bg-gray-950 rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <Coffee className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-sm font-medium">Питание</span>
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full text-sm">
                    {pd.dietType === 'standard' ? 'Стандартное' :
                     pd.dietType === 'vegetarian' ? 'Вегетарианское' :
                     pd.dietType === 'vegan' ? 'Веганское' :
                     pd.dietType === 'keto' ? 'Кето' :
                     pd.dietType === 'mediterranean' ? 'Средиземноморское' : pd.dietType}
                  </span>
                  <div className="flex gap-4 mt-2">
                    {pd.waterIntake && (
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-blue-500" />
                        <span className="text-xs">{pd.waterIntake} стаканов/день</span>
                      </div>
                    )}
                    {pd.caffeineIntake && (
                      <div className="flex items-center gap-1">
                        <Coffee className="w-3 h-3 text-brown-500" />
                        <span className="text-xs">{pd.caffeineIntake} чашек/день</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {(pd.currentMedications?.length > 0 || pd.supplements?.length > 0) && (
              <div className="bg-white dark:bg-gray-950 rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-red-500/10 rounded-full">
                    <Pill className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm font-medium">Препараты</span>
                </div>
                <div className="space-y-2">
                  {pd.currentMedications?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Лекарства: {pd.currentMedications.length}</p>
                    </div>
                  )}
                  {pd.supplements?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">БАДы: {pd.supplements.length}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Medical History */}
          {(pd.chronicConditions?.length > 0 || pd.allergies?.length > 0 || pd.familyHistory?.length > 0) && (
            <div className="bg-white dark:bg-gray-950 rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-full">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-semibold">Медицинская история</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {pd.chronicConditions?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Хронические заболевания</p>
                    <div className="flex flex-wrap gap-2">
                      {pd.chronicConditions.map((condition: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-full text-xs font-medium">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {pd.allergies?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Аллергии</p>
                    <div className="flex flex-wrap gap-2">
                      {pd.allergies.map((allergy: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-warning-amber/20 rounded-full text-xs font-medium text-warning-amber">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {pd.familyHistory?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Семейная история</p>
                    <div className="flex flex-wrap gap-2">
                      {pd.familyHistory.map((history: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-full text-xs font-medium">
                          {history}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}