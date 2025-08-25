import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import HealthProfileWizard from "@/components/health-profile-wizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  User, 
  Edit, 
  Activity, 
  Brain, 
  Moon, 
  Pill, 
  Target, 
  Heart, 
  Coffee, 
  Droplets,
  Ruler,
  Weight,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Award
} from "lucide-react";

export default function HealthProfilePage() {
  const [, navigate] = useLocation();
  const [showWizard, setShowWizard] = useState(false);
  
  const { data: profile } = useQuery<any>({
    queryKey: ["/api/health-profile"],
  });
  
  const handleComplete = () => {
    setShowWizard(false);
    window.location.reload(); // Reload to get fresh data
  };
  
  // Calculate profile completion percentage
  const calculateCompletion = () => {
    if (!profile?.profileData) return 0;
    const pd = profile.profileData;
    let filled = 0;
    let total = 20; // Total important fields
    
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
    if (pd.waterIntake) filled++;
    if (pd.exerciseFrequency) filled++;
    if (pd.smokingStatus) filled++;
    if (pd.alcoholConsumption) filled++;
    
    return Math.round((filled / total) * 100);
  };
  
  const completionPercentage = calculateCompletion();
  
  if (showWizard || !profile?.profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-blue/5 via-background to-trust-green/5">
        <HealthProfileWizard 
          onComplete={handleComplete}
          initialData={profile?.profileData}
        />
      </div>
    );
  }
  
  const pd = profile.profileData;
  
  const getGenderIcon = (gender: string) => {
    switch(gender) {
      case 'male': return '👨';
      case 'female': return '👩';
      default: return '👤';
    }
  };
  
  const getGenderLabel = (gender: string) => {
    switch(gender) {
      case 'male': return 'Мужской';
      case 'female': return 'Женский';
      default: return 'Не указан';
    }
  };
  
  const getActivityLabel = (level: string) => {
    const labels: Record<string, string> = {
      sedentary: '🪑 Сидячий',
      light: '🚶 Легкая',
      moderate: '🏃 Умеренная',
      active: '⚡ Активный',
      very_active: '🔥 Очень активный'
    };
    return labels[level] || level;
  };

  const getActivityColor = (level: string) => {
    const colors: Record<string, string> = {
      sedentary: 'bg-gray-100 text-gray-700',
      light: 'bg-blue-100 text-blue-700',
      moderate: 'bg-green-100 text-green-700',
      active: 'bg-orange-100 text-orange-700',
      very_active: 'bg-red-100 text-red-700'
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
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

  const getSleepQualityIcon = (quality: string) => {
    switch(quality) {
      case 'poor': return '😫';
      case 'fair': return '😐';
      case 'good': return '😊';
      case 'excellent': return '😴';
      default: return '💤';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/5 via-background to-trust-green/5 pb-20">
      {/* Mobile-optimized Header */}
      <div className="bg-white dark:bg-gray-950 border-b backdrop-blur-lg bg-opacity-95">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full hover:bg-medical-blue/10 h-8 w-8"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-base font-bold bg-gradient-to-r from-medical-blue to-trust-green bg-clip-text text-transparent">
                  Профиль здоровья
                </h1>
                <p className="text-[10px] text-muted-foreground hidden sm:block">Управление данными</p>
              </div>
            </div>
            <Button
              onClick={() => setShowWizard(true)}
              size="sm"
              className="bg-gradient-to-r from-medical-blue to-trust-green hover:opacity-90 text-white rounded-full px-3 text-xs shadow-lg"
              data-testid="button-edit-profile"
            >
              <Edit className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Редактировать</span>
              <span className="sm:hidden">Изменить</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile-optimized Completion Card */}
      <div className="px-3 py-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-medical-blue/20 to-trust-green/20 rounded-lg">
                  <Award className="w-4 h-4 text-medical-blue" />
                </div>
                <div>
                  <CardTitle className="text-sm">Заполненность</CardTitle>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {completionPercentage === 100 
                      ? "✨ Профиль заполнен!" 
                      : `Заполнено ${completionPercentage}%`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold bg-gradient-to-r from-medical-blue to-trust-green bg-clip-text text-transparent">
                  {completionPercentage}%
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <Progress 
              value={completionPercentage} 
              className="h-2 bg-gray-200 dark:bg-gray-700"
            />
            {completionPercentage < 100 && (
              <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5" />
                Заполните для персональных рекомендаций
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Mobile-optimized Main Content */}
        <div className="space-y-3 mt-4">
          
          {/* Basic Information - Mobile Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Personal Data */}
            <Card className="border-0 shadow-md">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[11px] font-medium flex items-center gap-1.5">
                    <div className="p-1 bg-medical-blue/10 rounded">
                      <User className="w-3 h-3 text-medical-blue" />
                    </div>
                    <span className="hidden sm:inline">Основные данные</span>
                    <span className="sm:hidden">Данные</span>
                  </CardTitle>
                  {pd.age && pd.gender && (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Возраст</span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                      {pd.age || "—"} лет
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Пол</span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                      {pd.gender ? `${getGenderIcon(pd.gender)}` : "—"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Physical Parameters */}
            <Card className="border-0 shadow-md">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[11px] font-medium flex items-center gap-1.5">
                    <div className="p-1 bg-trust-green/10 rounded">
                      <Activity className="w-3 h-3 text-trust-green" />
                    </div>
                    <span className="hidden sm:inline">Физические</span>
                    <span className="sm:hidden">Физ.</span>
                  </CardTitle>
                  {pd.height && pd.weight && (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Ruler className="w-2.5 h-2.5" />
                      Рост
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono">
                      {pd.height || "—"} см
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Weight className="w-2.5 h-2.5" />
                      Вес
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono">
                      {pd.weight || "—"} кг
                    </Badge>
                  </div>
                  {pd.bmi && (
                    <div className="pt-1 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-muted-foreground">ИМТ</span>
                        <Badge 
                          className={`text-[9px] h-4 px-1 font-mono ${
                            pd.bmi < 18.5 ? 'bg-yellow-100 text-yellow-700' :
                            pd.bmi < 25 ? 'bg-green-100 text-green-700' :
                            pd.bmi < 30 ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}
                        >
                          {pd.bmi.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Mental Health */}
            <Card className="border-0 shadow-md">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[11px] font-medium flex items-center gap-1.5">
                    <div className="p-1 bg-purple-500/10 rounded">
                      <Brain className="w-3 h-3 text-purple-500" />
                    </div>
                    <span className="hidden sm:inline">Ментальное</span>
                    <span className="sm:hidden">Псих.</span>
                  </CardTitle>
                  {pd.stressLevel && (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Стресс</span>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono">
                        {pd.stressLevel ? `${pd.stressLevel}/10` : "—"}
                      </Badge>
                    </div>
                    {pd.stressLevel && (
                      <Progress 
                        value={pd.stressLevel * 10} 
                        className="h-1.5"
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Тревога</span>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono">
                        {pd.anxietyLevel ? `${pd.anxietyLevel}/10` : "—"}
                      </Badge>
                    </div>
                    {pd.anxietyLevel && (
                      <Progress 
                        value={pd.anxietyLevel * 10} 
                        className="h-1.5"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Sleep */}
            <Card className="border-0 shadow-md">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[11px] font-medium flex items-center gap-1.5">
                    <div className="p-1 bg-indigo-500/10 rounded">
                      <Moon className="w-3 h-3 text-indigo-500" />
                    </div>
                    <span className="hidden sm:inline">Сон</span>
                    <span className="sm:hidden">Сон</span>
                  </CardTitle>
                  {pd.sleepHours && pd.sleepQuality && (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Часы</span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono">
                      {pd.sleepHours || "—"} ч
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Качество</span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                      {pd.sleepQuality ? `${getSleepQualityIcon(pd.sleepQuality)}` : '—'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Health Goals - Mobile Optimized */}
          {pd.healthGoals && pd.healthGoals.length > 0 && (
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="p-3 bg-gradient-to-r from-medical-blue/5 to-trust-green/5">
                <CardTitle className="text-xs flex items-center gap-2">
                  <div className="p-1 bg-gradient-to-br from-medical-blue/20 to-trust-green/20 rounded">
                    <Target className="w-3.5 h-3.5 text-medical-blue" />
                  </div>
                  Цели здоровья
                  <Badge className="ml-auto text-[9px] h-4 px-1.5">{pd.healthGoals.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-1.5">
                  {pd.healthGoals.map((goal: string) => {
                    const goalInfo = healthGoalLabels[goal] || { 
                      label: goal, 
                      icon: "🎯", 
                      color: "bg-gray-100 text-gray-700" 
                    };
                    return (
                      <Badge 
                        key={goal}
                        className={`px-2 py-0.5 text-[9px] ${goalInfo.color} border-0 font-medium`}
                      >
                        <span className="mr-0.5 text-[10px]">{goalInfo.icon}</span>
                        {goalInfo.label}
                      </Badge>
                    );
                  })}
                </div>
                {pd.primaryGoal && (
                  <div className="mt-2 p-2 bg-gradient-to-r from-medical-blue/5 to-trust-green/5 rounded-lg border border-medical-blue/20">
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3 text-medical-blue" />
                      <p className="text-[10px] font-semibold">Главная цель</p>
                    </div>
                    <p className="text-[9px] text-muted-foreground">{pd.primaryGoal}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Activity & Lifestyle - Mobile Stack */}
          <div className="space-y-2">
            {/* Activity Level */}
            {pd.activityLevel && (
              <Card className="border-0 shadow-md">
                <CardHeader className="p-3">
                  <CardTitle className="text-[11px] font-medium flex items-center gap-1.5">
                    <div className="p-1 bg-orange-500/10 rounded">
                      <Activity className="w-3 h-3 text-orange-500" />
                    </div>
                    Уровень активности
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <Badge className={`${getActivityColor(pd.activityLevel)} border-0 px-2 py-0.5 text-[10px]`}>
                    {getActivityLabel(pd.activityLevel)}
                  </Badge>
                  {pd.exerciseFrequency && (
                    <p className="text-[9px] text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      Тренировки: {pd.exerciseFrequency}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Diet */}
            {pd.dietType && (
              <Card className="border-0 shadow-md">
                <CardHeader className="p-3">
                  <CardTitle className="text-[11px] font-medium flex items-center gap-1.5">
                    <div className="p-1 bg-green-500/10 rounded">
                      <Coffee className="w-3 h-3 text-green-500" />
                    </div>
                    Питание
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <Badge className="bg-green-100 text-green-700 border-0 px-2 py-0.5 text-[10px]">
                    {pd.dietType === 'standard' ? '🍽️ Стандартное' :
                     pd.dietType === 'vegetarian' ? '🥬 Вегетарианское' :
                     pd.dietType === 'vegan' ? '🌱 Веганское' :
                     pd.dietType === 'keto' ? '🥑 Кето' :
                     pd.dietType === 'mediterranean' ? '🫒 Средиземноморское' : pd.dietType}
                  </Badge>
                  <div className="flex gap-3 mt-2">
                    {pd.waterIntake && (
                      <div className="flex items-center gap-0.5">
                        <Droplets className="w-2.5 h-2.5 text-blue-500" />
                        <span className="text-[9px] text-muted-foreground">{pd.waterIntake} ст/день</span>
                      </div>
                    )}
                    {pd.caffeineIntake && (
                      <div className="flex items-center gap-0.5">
                        <Coffee className="w-2.5 h-2.5 text-brown-600" />
                        <span className="text-[9px] text-muted-foreground">{pd.caffeineIntake} чашек</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Medications */}
            {(pd.currentMedications?.length > 0 || pd.supplements?.length > 0) && (
              <Card className="border-0 shadow-md">
                <CardHeader className="p-3">
                  <CardTitle className="text-[11px] font-medium flex items-center gap-1.5">
                    <div className="p-1 bg-red-500/10 rounded">
                      <Pill className="w-3 h-3 text-red-500" />
                    </div>
                    Препараты
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="space-y-1.5">
                    {pd.currentMedications?.length > 0 && (
                      <div className="flex items-center justify-between p-1.5 bg-red-50 dark:bg-red-950/20 rounded">
                        <span className="text-[10px] flex items-center gap-0.5">
                          💊 Лекарства
                        </span>
                        <Badge variant="secondary" className="text-[9px] h-4 px-1">
                          {pd.currentMedications.length}
                        </Badge>
                      </div>
                    )}
                    {pd.supplements?.length > 0 && (
                      <div className="flex items-center justify-between p-1.5 bg-green-50 dark:bg-green-950/20 rounded">
                        <span className="text-[10px] flex items-center gap-0.5">
                          🌿 БАДы
                        </span>
                        <Badge variant="secondary" className="text-[9px] h-4 px-1">
                          {pd.supplements.length}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Medical History - Mobile Optimized */}
          {(pd.chronicConditions?.length > 0 || pd.allergies?.length > 0 || pd.familyHistory?.length > 0) && (
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="p-3 bg-gradient-to-r from-red-500/5 to-orange-500/5">
                <CardTitle className="text-xs flex items-center gap-2">
                  <div className="p-1 bg-red-500/10 rounded">
                    <Shield className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  Медицинская информация
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {pd.chronicConditions?.length > 0 && (
                    <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                      <p className="text-[10px] font-semibold mb-1.5 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        Хронические заболевания
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {pd.chronicConditions.map((condition: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-red-200 text-[9px] px-1.5 py-0">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {pd.allergies?.length > 0 && (
                    <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                      <p className="text-[10px] font-semibold mb-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-orange-500" />
                        Аллергии
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {pd.allergies.map((allergy: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-orange-200 text-[9px] px-1.5 py-0">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {pd.familyHistory?.length > 0 && (
                    <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                      <p className="text-[10px] font-semibold mb-1.5 flex items-center gap-1">
                        <User className="w-3 h-3 text-purple-500" />
                        Семейная история
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {pd.familyHistory.map((history: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-purple-200 text-[9px] px-1.5 py-0">
                            {history}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}