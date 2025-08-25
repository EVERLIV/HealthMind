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
  { id: 1, title: "Личная информация", icon: User, component: PersonalInfoSection, color: "from-blue-500 to-blue-600" },
  { id: 2, title: "Физическое здоровье", icon: Activity, component: PhysicalHealthSection, color: "from-green-500 to-green-600" },
  { id: 3, title: "Ментальное здоровье", icon: Brain, component: MentalHealthSection, color: "from-purple-500 to-purple-600" },
  { id: 4, title: "Образ жизни", icon: Coffee, component: LifestyleSection, color: "from-orange-500 to-orange-600" },
  { id: 5, title: "Сон и отдых", icon: Moon, component: SleepSection, color: "from-indigo-500 to-indigo-600" },
  { id: 6, title: "Цели здоровья", icon: Target, component: HealthGoalsSection, color: "from-pink-500 to-pink-600" },
  { id: 7, title: "Медицинская история", icon: Heart, component: MedicalHistorySection, color: "from-red-500 to-red-600" },
  { id: 8, title: "Лекарства", icon: Pill, component: MedicationsSection, color: "from-amber-500 to-amber-600" },
  { id: 9, title: "Проверка данных", icon: CheckCircle2, component: ReviewSection, color: "from-emerald-500 to-emerald-600" },
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
        description: "Ваш профиль здоровья успешно создан. Теперь вы получите персонализированные рекомендации.",
        className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/health-profile"] });
      onComplete?.();
    },
    onError: () => {
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить профиль. Попробуйте еще раз.",
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
          {/* Professional Header */}
          <div className={`bg-gradient-to-r ${steps[currentStep - 1].color} p-6 md:p-8 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <CurrentIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    Профиль здоровья
                  </h2>
                  <p className="text-white/90 text-sm mt-1">
                    Заполните информацию для персонализированных рекомендаций
                  </p>
                </div>
              </div>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 px-3 py-1">
                Шаг {currentStep} из {steps.length}
              </Badge>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-2 bg-white transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Step Navigation Pills */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b">
            <div className="flex gap-2 overflow-x-auto pb-2">
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
                      flex items-center gap-2 whitespace-nowrap transition-all
                      ${isCurrent ? 'bg-gradient-to-r from-medical-blue to-trust-green text-white shadow-lg' : ''}
                      ${isCompleted && !isCurrent ? 'text-green-600' : ''}
                      ${!isClickable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                    `}
                    data-testid={`step-${step.id}`}
                  >
                    {isCompleted && !isCurrent ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isCurrent ? (
                      <StepIcon className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                    <span className="sm:hidden">{step.id}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Current Step Content */}
          <div className="p-6 md:p-8">
            {/* Step Title with Animation */}
            <div className="mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3">
                <div className={`p-2 bg-gradient-to-r ${steps[currentStep - 1].color} rounded-xl`}>
                  <CurrentIcon className="w-5 h-5 text-white" />
                </div>
                {steps[currentStep - 1].title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
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
            
            {/* Step Content with Animation */}
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
          
          {/* Professional Navigation Footer */}
          <div className="px-6 md:px-8 py-4 md:py-6 bg-gray-50 dark:bg-gray-900/50 border-t">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="group"
                data-testid="button-previous"
              >
                <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Назад
              </Button>
              
              <div className="flex items-center gap-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`
                      w-2 h-2 rounded-full transition-all
                      ${step.id === currentStep ? 'w-8 bg-gradient-to-r from-medical-blue to-trust-green' : ''}
                      ${step.id < currentStep ? 'bg-green-500' : ''}
                      ${step.id > currentStep ? 'bg-gray-300' : ''}
                    `}
                  />
                ))}
              </div>
              
              {currentStep === steps.length ? (
                <Button
                  onClick={handleComplete}
                  disabled={saveProfileMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg group"
                  data-testid="button-complete"
                >
                  {saveProfileMutation.isPending ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      Завершить
                      <Check className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-medical-blue to-trust-green hover:opacity-90 text-white shadow-lg group"
                  data-testid="button-next"
                >
                  Далее
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}