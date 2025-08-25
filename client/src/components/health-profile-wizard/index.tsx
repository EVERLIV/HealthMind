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
  { id: 1, title: "Личная информация", shortTitle: "Личное", icon: User, component: PersonalInfoSection, color: "from-blue-500 to-blue-600" },
  { id: 2, title: "Физическое здоровье", shortTitle: "Физика", icon: Activity, component: PhysicalHealthSection, color: "from-green-500 to-green-600" },
  { id: 3, title: "Ментальное здоровье", shortTitle: "Психика", icon: Brain, component: MentalHealthSection, color: "from-purple-500 to-purple-600" },
  { id: 4, title: "Образ жизни", shortTitle: "Стиль", icon: Coffee, component: LifestyleSection, color: "from-orange-500 to-orange-600" },
  { id: 5, title: "Сон и отдых", shortTitle: "Сон", icon: Moon, component: SleepSection, color: "from-indigo-500 to-indigo-600" },
  { id: 6, title: "Цели здоровья", shortTitle: "Цели", icon: Target, component: HealthGoalsSection, color: "from-pink-500 to-pink-600" },
  { id: 7, title: "Медицинская история", shortTitle: "Медицина", icon: Heart, component: MedicalHistorySection, color: "from-red-500 to-red-600" },
  { id: 8, title: "Лекарства", shortTitle: "Лекарства", icon: Pill, component: MedicationsSection, color: "from-amber-500 to-amber-600" },
  { id: 9, title: "Проверка данных", shortTitle: "Проверка", icon: CheckCircle2, component: ReviewSection, color: "from-emerald-500 to-emerald-600" },
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
  
  const handleStepClick = (stepId: number) => {
    // Allow navigation to any previous step or the next immediate step
    if (stepId <= currentStep + 1) {
      setCurrentStep(stepId);
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
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/5 via-background to-trust-green/5">
      <div className="w-full max-w-4xl mx-auto min-h-screen md:min-h-0 md:py-8 px-0 md:px-4">
        <Card className="border-0 shadow-2xl overflow-hidden rounded-none md:rounded-2xl bg-white dark:bg-gray-950">
          {/* Mobile-optimized Header */}
          <div className={`bg-gradient-to-r ${steps[currentStep - 1].color} p-4 md:p-8 text-white`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-2xl">
                  <CurrentIcon className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold">
                    Профиль здоровья
                  </h2>
                  <p className="text-white/90 text-[10px] md:text-sm mt-0.5 md:mt-1">
                    <span className="hidden sm:inline">Заполните информацию для персонализированных рекомендаций</span>
                    <span className="sm:hidden">Заполните для рекомендаций</span>
                  </p>
                </div>
              </div>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs">
                {currentStep}/{steps.length}
              </Badge>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-1.5 md:h-2 bg-white transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Mobile-optimized Step Navigation */}
          <div className="px-3 md:px-6 py-3 md:py-4 bg-gray-50 dark:bg-gray-900/50 border-b">
            <div className="flex gap-1 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {steps.map((step) => {
                const StepIcon = step.icon;
                const isCompleted = completedSteps.has(step.id);
                const isCurrent = step.id === currentStep;
                const isClickable = step.id <= currentStep + 1;
                
                return (
                  <Button
                    key={step.id}
                    variant={isCurrent ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleStepClick(step.id)}
                    disabled={!isClickable}
                    className={`
                      flex items-center gap-1 md:gap-2 whitespace-nowrap transition-all min-w-fit
                      px-2 md:px-3 py-1 md:py-1.5 h-7 md:h-8 text-[10px] md:text-xs
                      ${isCurrent ? 'bg-gradient-to-r from-medical-blue to-trust-green text-white shadow-lg' : ''}
                      ${isCompleted && !isCurrent ? 'text-green-600' : ''}
                      ${!isClickable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                    `}
                    data-testid={`step-${step.id}`}
                  >
                    {isCompleted && !isCurrent ? (
                      <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                    ) : isCurrent ? (
                      <StepIcon className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                    )}
                    <span className="hidden lg:inline">{step.title}</span>
                    <span className="lg:hidden">{step.shortTitle}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Mobile-optimized Content */}
          <div className="p-4 md:p-8">
            {/* Step Title */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-base md:text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2 md:gap-3">
                <div className={`p-1.5 md:p-2 bg-gradient-to-r ${steps[currentStep - 1].color} rounded-lg md:rounded-xl`}>
                  <CurrentIcon className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" />
                </div>
                <span className="hidden md:inline">{steps[currentStep - 1].title}</span>
                <span className="md:hidden">{steps[currentStep - 1].shortTitle}</span>
              </h3>
              <p className="text-[11px] md:text-sm text-muted-foreground mt-1 md:mt-2">
                {currentStep === 1 && "Начнем с базовой информации о вас"}
                {currentStep === 2 && "Расскажите о вашей физической активности"}
                {currentStep === 3 && "Оцените ваше психологическое состояние"}
                {currentStep === 4 && "Опишите ваш образ жизни и привычки"}
                {currentStep === 5 && "Качество сна влияет на все аспекты здоровья"}
                {currentStep === 6 && "Какие цели вы хотите достичь?"}
                {currentStep === 7 && "Важная медицинская информация"}
                {currentStep === 8 && "Укажите принимаемые препараты"}
                {currentStep === 9 && "Проверьте введенные данные"}
              </p>
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
          
          {/* Mobile-optimized Footer Navigation */}
          <div className="px-4 md:px-8 py-3 md:py-6 bg-gray-50 dark:bg-gray-900/50 border-t">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="group h-8 md:h-10 text-[11px] md:text-sm px-3 md:px-4"
                data-testid="button-previous"
              >
                <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Назад</span>
                <span className="sm:hidden">←</span>
              </Button>
              
              {/* Mobile-optimized Step Dots */}
              <div className="flex items-center gap-1 md:gap-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`
                      rounded-full transition-all
                      ${step.id === currentStep 
                        ? 'w-4 md:w-8 h-1.5 md:h-2 bg-gradient-to-r from-medical-blue to-trust-green' 
                        : ''}
                      ${step.id < currentStep ? 'w-1.5 md:w-2 h-1.5 md:h-2 bg-green-500' : ''}
                      ${step.id > currentStep ? 'w-1.5 md:w-2 h-1.5 md:h-2 bg-gray-300' : ''}
                    `}
                  />
                ))}
              </div>
              
              {currentStep === steps.length ? (
                <Button
                  onClick={handleComplete}
                  disabled={saveProfileMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg group h-8 md:h-10 text-[11px] md:text-sm px-3 md:px-4"
                  data-testid="button-complete"
                >
                  {saveProfileMutation.isPending ? (
                    <>
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin" />
                      <span className="hidden sm:inline">Сохранение...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Завершить</span>
                      <span className="sm:hidden">Готово</span>
                      <Check className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-medical-blue to-trust-green hover:opacity-90 text-white shadow-lg group h-8 md:h-10 text-[11px] md:text-sm px-3 md:px-4"
                  data-testid="button-next"
                >
                  <span className="hidden sm:inline">Далее</span>
                  <span className="sm:hidden">→</span>
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}