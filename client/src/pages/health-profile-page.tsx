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
      sedentary: '🪑 Малоподвижный',
      light: '🚶 Легкая активность',
      moderate: '🏃 Умеренная активность',
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
    muscle_gain: { label: "Набор мышечной массы", icon: "💪", color: "bg-purple-100 text-purple-700" },
    improve_fitness: { label: "Улучшение физической формы", icon: "🏃", color: "bg-green-100 text-green-700" },
    reduce_stress: { label: "Снижение стресса", icon: "🧘", color: "bg-indigo-100 text-indigo-700" },
    better_sleep: { label: "Улучшение сна", icon: "😴", color: "bg-indigo-100 text-indigo-700" },
    healthy_eating: { label: "Здоровое питание", icon: "🥗", color: "bg-emerald-100 text-emerald-700" },
    quit_smoking: { label: "Бросить курить", icon: "🚭", color: "bg-red-100 text-red-700" },
    manage_condition: { label: "Контроль заболевания", icon: "🏥", color: "bg-orange-100 text-orange-700" },
    increase_energy: { label: "Повышение энергии", icon: "⚡", color: "bg-yellow-100 text-yellow-700" },
    mental_health: { label: "Ментальное здоровье", icon: "🧠", color: "bg-purple-100 text-purple-700" },
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
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/5 via-background to-trust-green/5">
      {/* Professional Header */}
      <div className="bg-white dark:bg-gray-950 border-b backdrop-blur-lg bg-opacity-95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full hover:bg-medical-blue/10"
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-medical-blue to-trust-green bg-clip-text text-transparent">
                  Профиль здоровья
                </h1>
                <p className="text-xs text-muted-foreground">Управление вашими данными</p>
              </div>
            </div>
            <Button
              onClick={() => setShowWizard(true)}
              className="bg-gradient-to-r from-medical-blue to-trust-green hover:opacity-90 text-white rounded-full px-6 shadow-lg transition-all hover:shadow-xl"
              data-testid="button-edit-profile"
            >
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          </div>
        </div>
      </div>
      
      {/* Completion Status Card */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-medical-blue/20 to-trust-green/20 rounded-2xl">
                  <Award className="w-6 h-6 text-medical-blue" />
                </div>
                <div>
                  <CardTitle className="text-lg">Заполненность профиля</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {completionPercentage === 100 
                      ? "✨ Профиль полностью заполнен!" 
                      : `Заполнено ${completionPercentage}% данных`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-medical-blue to-trust-green bg-clip-text text-transparent">
                  {completionPercentage}%
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress 
              value={completionPercentage} 
              className="h-3 bg-gray-200 dark:bg-gray-700"
            />
            {completionPercentage < 100 && (
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Заполните профиль для получения персонализированных рекомендаций
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Main Content Grid */}
        <div className="grid gap-4 md:gap-6">
          
          {/* Basic Information Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Personal Data Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="p-2 bg-medical-blue/10 rounded-lg">
                      <User className="w-4 h-4 text-medical-blue" />
                    </div>
                    Основные данные
                  </CardTitle>
                  {pd.age && pd.gender && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Возраст</span>
                    <Badge variant="secondary" className="font-mono">
                      {pd.age || "—"} лет
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Пол</span>
                    <Badge variant="secondary">
                      {pd.gender ? `${getGenderIcon(pd.gender)} ${getGenderLabel(pd.gender)}` : "—"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Physical Parameters Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="p-2 bg-trust-green/10 rounded-lg">
                      <Activity className="w-4 h-4 text-trust-green" />
                    </div>
                    Физические данные
                  </CardTitle>
                  {pd.height && pd.weight && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Ruler className="w-3 h-3" />
                      Рост
                    </span>
                    <Badge variant="secondary" className="font-mono">
                      {pd.height || "—"} см
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Weight className="w-3 h-3" />
                      Вес
                    </span>
                    <Badge variant="secondary" className="font-mono">
                      {pd.weight || "—"} кг
                    </Badge>
                  </div>
                  {pd.bmi && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">ИМТ</span>
                        <Badge 
                          className={`font-mono ${
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
            
            {/* Mental Health Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Brain className="w-4 h-4 text-purple-500" />
                    </div>
                    Ментальное здоровье
                  </CardTitle>
                  {pd.stressLevel && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Стресс</span>
                      <Badge variant="secondary" className="font-mono">
                        {pd.stressLevel ? `${pd.stressLevel}/10` : "—"}
                      </Badge>
                    </div>
                    {pd.stressLevel && (
                      <Progress 
                        value={pd.stressLevel * 10} 
                        className="h-2"
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Тревожность</span>
                      <Badge variant="secondary" className="font-mono">
                        {pd.anxietyLevel ? `${pd.anxietyLevel}/10` : "—"}
                      </Badge>
                    </div>
                    {pd.anxietyLevel && (
                      <Progress 
                        value={pd.anxietyLevel * 10} 
                        className="h-2"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Sleep Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <Moon className="w-4 h-4 text-indigo-500" />
                    </div>
                    Сон и отдых
                  </CardTitle>
                  {pd.sleepHours && pd.sleepQuality && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Часы сна</span>
                    <Badge variant="secondary" className="font-mono">
                      {pd.sleepHours || "—"} ч
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Качество</span>
                    <Badge variant="secondary">
                      {pd.sleepQuality ? `${getSleepQualityIcon(pd.sleepQuality)} ${
                        pd.sleepQuality === 'poor' ? 'Плохое' : 
                        pd.sleepQuality === 'fair' ? 'Среднее' :
                        pd.sleepQuality === 'good' ? 'Хорошее' :
                        pd.sleepQuality === 'excellent' ? 'Отличное' : '—'
                      }` : '—'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Health Goals Section */}
          {pd.healthGoals && pd.healthGoals.length > 0 && (
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-medical-blue/5 to-trust-green/5">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-medical-blue/20 to-trust-green/20 rounded-xl">
                    <Target className="w-5 h-5 text-medical-blue" />
                  </div>
                  Цели здоровья
                  <Badge className="ml-auto">{pd.healthGoals.length} целей</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {pd.healthGoals.map((goal: string) => {
                    const goalInfo = healthGoalLabels[goal] || { 
                      label: goal, 
                      icon: "🎯", 
                      color: "bg-gray-100 text-gray-700" 
                    };
                    return (
                      <Badge 
                        key={goal}
                        className={`px-3 py-1.5 ${goalInfo.color} border-0 font-medium`}
                      >
                        <span className="mr-1.5">{goalInfo.icon}</span>
                        {goalInfo.label}
                      </Badge>
                    );
                  })}
                </div>
                {pd.primaryGoal && (
                  <div className="p-4 bg-gradient-to-r from-medical-blue/5 to-trust-green/5 rounded-xl border border-medical-blue/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-medical-blue" />
                      <p className="text-sm font-semibold">Главная цель</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{pd.primaryGoal}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Activity & Lifestyle Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Activity Level */}
            {pd.activityLevel && (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Activity className="w-4 h-4 text-orange-500" />
                    </div>
                    Уровень активности
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={`${getActivityColor(pd.activityLevel)} border-0 px-3 py-1.5`}>
                    {getActivityLabel(pd.activityLevel)}
                  </Badge>
                  {pd.exerciseFrequency && (
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Тренировки: {pd.exerciseFrequency}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Diet */}
            {pd.dietType && (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Coffee className="w-4 h-4 text-green-500" />
                    </div>
                    Питание
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-green-100 text-green-700 border-0 px-3 py-1.5">
                    {pd.dietType === 'standard' ? '🍽️ Стандартное' :
                     pd.dietType === 'vegetarian' ? '🥬 Вегетарианское' :
                     pd.dietType === 'vegan' ? '🌱 Веганское' :
                     pd.dietType === 'keto' ? '🥑 Кето' :
                     pd.dietType === 'mediterranean' ? '🫒 Средиземноморское' : pd.dietType}
                  </Badge>
                  <div className="flex gap-4 mt-3">
                    {pd.waterIntake && (
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-muted-foreground">{pd.waterIntake} стаканов/день</span>
                      </div>
                    )}
                    {pd.caffeineIntake && (
                      <div className="flex items-center gap-1">
                        <Coffee className="w-3 h-3 text-brown-600" />
                        <span className="text-xs text-muted-foreground">{pd.caffeineIntake} чашек/день</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Medications & Supplements */}
            {(pd.currentMedications?.length > 0 || pd.supplements?.length > 0) && (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <Pill className="w-4 h-4 text-red-500" />
                    </div>
                    Препараты и добавки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pd.currentMedications?.length > 0 && (
                      <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <span className="text-sm flex items-center gap-1">
                          💊 Лекарства
                        </span>
                        <Badge variant="secondary">
                          {pd.currentMedications.length}
                        </Badge>
                      </div>
                    )}
                    {pd.supplements?.length > 0 && (
                      <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <span className="text-sm flex items-center gap-1">
                          🌿 БАДы
                        </span>
                        <Badge variant="secondary">
                          {pd.supplements.length}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Medical History Section */}
          {(pd.chronicConditions?.length > 0 || pd.allergies?.length > 0 || pd.familyHistory?.length > 0) && (
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-500/5 to-orange-500/5">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-xl">
                    <Shield className="w-5 h-5 text-red-500" />
                  </div>
                  Медицинская информация
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {pd.chronicConditions?.length > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        Хронические заболевания
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pd.chronicConditions.map((condition: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-red-200">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {pd.allergies?.length > 0 && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        Аллергии
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pd.allergies.map((allergy: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-orange-200">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {pd.familyHistory?.length > 0 && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-500" />
                        Семейная история
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pd.familyHistory.map((history: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-purple-200">
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