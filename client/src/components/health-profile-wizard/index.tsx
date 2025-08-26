import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  User,
  Activity,
  Brain,
  Coffee,
  Moon,
  Target,
  Heart,
  Pill,
  CheckCircle2,
  Circle,
  Sparkles
} from "lucide-react";
import PersonalInfoSection from "./personal-info-section";
import PhysicalHealthSection from "./physical-health-section";
import MentalHealthSection from "./mental-health-section";
import LifestyleSection from "./lifestyle-section";
import SleepSection from "./sleep-section";
import HealthGoalsSection from "./health-goals-section";
import MedicalHistorySection from "./medical-history-section";
import MedicationsSection from "./medications-section";
import ReviewSection from "./review-section";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface HealthProfileData {
  // Personal Info
  age?: number;
  gender?: "male" | "female" | "other";
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
  
  // Physical Health
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  exerciseFrequency?: string;
  fitnessLevel?: "beginner" | "intermediate" | "advanced";
  
  // Mental Health
  stressLevel?: number; // 1-10
  anxietyLevel?: number; // 1-10
  moodChanges?: "stable" | "mild" | "moderate" | "severe";
  
  // Lifestyle
  dietType?: "standard" | "vegetarian" | "vegan" | "keto" | "mediterranean" | "other";
  smokingStatus?: "never" | "former" | "occasional" | "regular";
  alcoholConsumption?: "none" | "occasional" | "moderate" | "heavy";
  waterIntake?: number; // glasses per day
  caffeineIntake?: number; // cups per day
  
  // Sleep
  sleepHours?: number;
  sleepQuality?: "poor" | "fair" | "good" | "excellent";
  sleepProblems?: string[];
  
  // Health Goals
  healthGoals?: string[];
  primaryGoal?: string;
  
  // Medical History
  chronicConditions?: string[];
  familyHistory?: string[];
  allergies?: string[];
  
  // Medications
  currentMedications?: Array<{ name: string; dosage: string; frequency: string }>;
  supplements?: Array<{ name: string; dosage: string }>;
}

const steps = [
  { id: 1, title: "Личная информация", shortTitle: "Личное", icon: User, component: PersonalInfoSection, color: "from-medical-blue via-blue-500 to-blue-600", bgColor: "bg-gradient-to-br from-medical-blue/8 via-blue-50 to-blue-100/50", iconBg: "bg-medical-blue/15", iconColor: "text-medical-blue" },
  { id: 2, title: "Физическое здоровье", shortTitle: "Физика", icon: Activity, component: PhysicalHealthSection, color: "from-trust-green via-green-500 to-emerald-600", bgColor: "bg-gradient-to-br from-trust-green/8 via-green-50 to-emerald-100/50", iconBg: "bg-trust-green/15", iconColor: "text-trust-green" },
  { id: 3, title: "Ментальное здоровье", shortTitle: "Психика", icon: Brain, component: MentalHealthSection, color: "from-wellness-purple via-purple-500 to-purple-600", bgColor: "bg-gradient-to-br from-purple-100/8 via-purple-50 to-purple-100/50", iconBg: "bg-purple-500/15", iconColor: "text-purple-600" },
  { id: 4, title: "Образ жизни", shortTitle: "Стиль", icon: Coffee, component: LifestyleSection, color: "from-energy-orange via-orange-500 to-orange-600", bgColor: "bg-gradient-to-br from-orange-100/8 via-orange-50 to-orange-100/50", iconBg: "bg-orange-500/15", iconColor: "text-orange-600" },
  { id: 5, title: "Сон и отдых", shortTitle: "Сон", icon: Moon, component: SleepSection, color: "from-indigo-500 via-indigo-500 to-purple-600", bgColor: "bg-gradient-to-br from-indigo-100/8 via-indigo-50 to-purple-100/50", iconBg: "bg-indigo-500/15", iconColor: "text-indigo-600" },
  { id: 6, title: "Цели здоровья", shortTitle: "Цели", icon: Target, component: HealthGoalsSection, color: "from-pink-500 via-rose-500 to-red-500", bgColor: "bg-gradient-to-br from-pink-100/8 via-pink-50 to-rose-100/50", iconBg: "bg-pink-500/15", iconColor: "text-pink-600" },
  { id: 7, title: "Медицинская история", shortTitle: "Медицина", icon: Heart, component: MedicalHistorySection, color: "from-red-500 via-red-500 to-rose-600", bgColor: "bg-gradient-to-br from-red-100/8 via-red-50 to-rose-100/50", iconBg: "bg-red-500/15", iconColor: "text-red-600" },
  { id: 8, title: "Лекарства", shortTitle: "Лекарства", icon: Pill, component: MedicationsSection, color: "from-amber-500 via-yellow-500 to-orange-500", bgColor: "bg-gradient-to-br from-amber-100/8 via-yellow-50 to-orange-100/50", iconBg: "bg-amber-500/15", iconColor: "text-amber-600" },
  { id: 9, title: "Проверка данных", shortTitle: "Проверка", icon: CheckCircle2, component: ReviewSection, color: "from-emerald-500 via-green-500 to-teal-600", bgColor: "bg-gradient-to-br from-emerald-100/8 via-green-50 to-teal-100/50", iconBg: "bg-emerald-500/15", iconColor: "text-emerald-600" },
];

interface HealthProfileWizardProps {
  onComplete?: () => void;
  initialData?: HealthProfileData;
}

export default function HealthProfileWizard({ onComplete, initialData = {} }: HealthProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<HealthProfileData>(initialData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  
  const progress = (currentStep / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep - 1].component;
  const CurrentIcon = steps[currentStep - 1].icon;
  
  // Mark step as completed when moving forward
  useEffect(() => {
    if (currentStep > 1) {
      setCompletedSteps(prev => new Set(prev).add(currentStep - 1));
    }
  }, [currentStep]);
  
  const saveProfileMutation = useMutation({
    mutationFn: async (data: HealthProfileData) => {
      // Calculate BMI if height and weight are provided
      if (data.height && data.weight) {
        const heightInMeters = data.height / 100;
        data.bmi = parseFloat((data.weight / (heightInMeters * heightInMeters)).toFixed(1));
      }
      
      const response = await apiRequest("POST", "/api/health-profile/complete", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Профиль сохранен!",
        description: "Ваши данные успешно сохранены",
        className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/health-profile"] });
      onComplete?.();
    },
    onError: () => {
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить профиль",
        variant: "destructive",
      });
    },
  });
  
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleUpdateData = (data: Partial<HealthProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };
  
  const handleComplete = () => {
    saveProfileMutation.mutate(profileData);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="w-full max-w-4xl mx-auto min-h-screen md:min-h-0 md:py-8 px-0 md:px-4">
        <Card className="border-0 shadow-2xl overflow-hidden rounded-none md:rounded-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
          {/* Modern Medical Header */}
          <div className={`bg-gradient-to-r ${steps[currentStep - 1].color} relative overflow-hidden`}>
            {/* Background pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]"></div>
            </div>
            <div className="relative p-4 md:p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative">
                  <div className="p-3 md:p-4 bg-white/20 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/30 shadow-lg">
                    <CurrentIcon className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                  {currentStep > 1 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-white/90 rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-green-600" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg md:text-3xl font-bold tracking-tight">
                    HealthAI
                  </h2>
                  <p className="text-white/90 text-xs md:text-sm mt-0.5 font-medium">
                    <span className="hidden sm:inline">Персонализированный анализ здоровья</span>
                    <span className="sm:hidden">Анализ здоровья</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-3 py-1 text-xs font-semibold rounded-full">
                  {currentStep}/{steps.length}
                </Badge>
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-xs font-medium">{steps[currentStep - 1].title}</span>
                <span className="text-white/90 text-xs font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
                <div 
                  className="h-2 md:h-2.5 bg-gradient-to-r from-white via-white/95 to-white/90 transition-all duration-700 ease-out rounded-full relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
            </div>
          </div>
          
          {/* Enhanced Content Section */}
          <div className={`${steps[currentStep - 1].bgColor} p-4 md:p-8`}>
            {/* Modern Step Title */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`p-2.5 md:p-3 ${steps[currentStep - 1].iconBg} rounded-xl md:rounded-2xl backdrop-blur-sm border border-white/50 shadow-sm`}>
                    <CurrentIcon className={`w-4 h-4 md:w-6 md:h-6 ${steps[currentStep - 1].iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                      <span className="hidden md:inline">{steps[currentStep - 1].title}</span>
                      <span className="md:hidden">{steps[currentStep - 1].shortTitle}</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: steps.length }, (_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              i + 1 === currentStep
                                ? 'w-6 bg-gradient-to-r ' + steps[currentStep - 1].color
                                : i + 1 < currentStep
                                ? 'w-1.5 bg-green-500'
                                : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <Badge className={`${steps[currentStep - 1].iconBg} ${steps[currentStep - 1].iconColor} border-0 px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-sm`}>
                  Шаг {currentStep}
                </Badge>
              </div>
              <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-sm">
                <div className="p-4 md:p-5">
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {currentStep === 1 && "🏥 Начнем с базовой информации о вас для создания персонального медицинского профиля"}
                    {currentStep === 2 && "💪 Расскажите о вашей физической активности и образе жизни"}
                    {currentStep === 3 && "🧠 Оцените ваше психологическое состояние и эмоциональное здоровье"}
                    {currentStep === 4 && "☕ Опишите ваш образ жизни, привычки питания и повседневную активность"}
                    {currentStep === 5 && "😴 Качество сна критически влияет на все аспекты физического и ментального здоровья"}
                    {currentStep === 6 && "🎯 Определите ваши приоритетные цели в области здоровья и самочувствия"}
                    {currentStep === 7 && "📋 Предоставьте важную медицинскую информацию для точного анализа"}
                    {currentStep === 8 && "💊 Укажите все принимаемые лекарства и биологически активные добавки"}
                    {currentStep === 9 && "✅ Проверьте все введенные данные перед завершением создания профиля"}
                  </p>
                </div>
              </Card>
            </div>
            
            {/* Step Content */}
            <div 
              key={currentStep} 
              className="animate-in fade-in-50 slide-in-from-right-10 duration-500"
            >
              <CurrentStepComponent
                data={profileData}
                onUpdate={handleUpdateData}
              />
            </div>
          </div>
          
          {/* Enhanced Navigation Footer */}
          <div className="px-4 md:px-8 py-4 md:py-6 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="group h-10 md:h-12 text-sm px-4 md:px-6 rounded-xl border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 disabled:opacity-50"
                data-testid="button-previous"
              >
                <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Назад</span>
              </Button>
              
              {/* Enhanced Step Indicators */}
              <div className="flex items-center gap-2 md:gap-3 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`
                        rounded-full transition-all duration-300 flex items-center justify-center border-2
                        ${step.id === currentStep 
                          ? 'w-8 h-8 bg-gradient-to-r ' + steps[currentStep - 1].color + ' border-transparent text-white shadow-lg' 
                          : ''}
                        ${step.id < currentStep ? 'w-6 h-6 bg-green-500 border-green-500 text-white shadow-md' : ''}
                        ${step.id > currentStep ? 'w-6 h-6 bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500 text-slate-500' : ''}
                      `}
                    >
                      {step.id < currentStep ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <span className="text-xs font-bold">{step.id}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-3 h-0.5 mx-1 rounded-full transition-colors duration-300 ${
                        step.id < currentStep ? 'bg-green-400' : 'bg-slate-300 dark:bg-slate-600'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              {currentStep === steps.length ? (
                <Button
                  onClick={handleComplete}
                  disabled={saveProfileMutation.isPending}
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl group h-10 md:h-12 text-sm px-4 md:px-6 rounded-xl transition-all duration-200"
                  data-testid="button-complete"
                >
                  {saveProfileMutation.isPending ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      <span className="font-medium">Сохранение...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">Завершить</span>
                      <Check className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform duration-200" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-medical-blue via-blue-500 to-trust-green hover:from-blue-600 hover:via-blue-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl group h-10 md:h-12 text-sm px-4 md:px-6 rounded-xl transition-all duration-200"
                  data-testid="button-next"
                >
                  <span className="font-medium">Продолжить</span>
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}