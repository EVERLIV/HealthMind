import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
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
  { id: 1, title: "Личная информация", component: PersonalInfoSection },
  { id: 2, title: "Физическое здоровье", component: PhysicalHealthSection },
  { id: 3, title: "Психическое здоровье", component: MentalHealthSection },
  { id: 4, title: "Образ жизни", component: LifestyleSection },
  { id: 5, title: "Сон и отдых", component: SleepSection },
  { id: 6, title: "Цели здоровья", component: HealthGoalsSection },
  { id: 7, title: "Медицинская история", component: MedicalHistorySection },
  { id: 8, title: "Лекарства", component: MedicationsSection },
  { id: 9, title: "Проверка данных", component: ReviewSection },
];

interface HealthProfileWizardProps {
  onComplete?: () => void;
  initialData?: HealthProfileData;
}

export default function HealthProfileWizard({ onComplete, initialData = {} }: HealthProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<HealthProfileData>(initialData);
  const { toast } = useToast();
  
  const progress = (currentStep / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep - 1].component;
  
  const saveProfileMutation = useMutation({
    mutationFn: async (data: HealthProfileData) => {
      const response = await apiRequest("POST", "/api/health-profile/complete", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Профиль создан",
        description: "Ваш профиль здоровья успешно сохранен",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/health-profile"] });
      onComplete?.();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить профиль",
        variant: "destructive",
      });
    },
  });
  
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleUpdateData = (data: Partial<HealthProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };
  
  const handleComplete = () => {
    saveProfileMutation.mutate(profileData);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-medical-blue/5 to-background">
      <Card className="w-full md:max-w-lg md:mx-auto p-0 overflow-hidden border-0 md:shadow-xl md:my-6 rounded-none md:rounded-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-medical-blue via-purple-500 to-trust-green p-4 md:p-6 text-white animate-gradient-x">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold mb-2 animate-in fade-in duration-500">
                Профиль здоровья
              </h2>
              <p className="text-white/90 text-xs md:text-sm animate-in fade-in duration-700 delay-200">
                Шаг {currentStep} из {steps.length}
              </p>
            </div>
            <div className="text-4xl animate-pulse">
              {currentStep === 1 && "👤"}
              {currentStep === 2 && "💪"}
              {currentStep === 3 && "🧠"}
              {currentStep === 4 && "😴"}
              {currentStep === 5 && "🍎"}
              {currentStep === 6 && "❤️"}
              {currentStep === 7 && "💊"}
              {currentStep === 8 && "🎯"}
              {currentStep === 9 && "✅"}
            </div>
          </div>
        </div>
      
      {/* Progress Bar */}
      <div className="px-4 md:px-6 pt-4">
        <Progress value={progress} className="h-2 md:h-3 bg-gray-200 dark:bg-gray-700" />
      </div>
      
      {/* Step Title - Убираем повторяющийся номер шага */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b">
        <h3 className="text-base md:text-lg font-semibold text-foreground animate-in slide-in-from-left-2 duration-300">
          {steps[currentStep - 1].title}
        </h3>
      </div>
      
      {/* Current Step Content */}
      <div className="px-4 md:px-6 py-6 min-h-[400px] md:max-h-[60vh] overflow-y-auto">
        <div key={currentStep} className="animate-in fade-in-50 slide-in-from-right-4 duration-300">
          <CurrentStepComponent
            data={profileData}
            onUpdate={handleUpdateData}
          />
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="text-muted-foreground text-sm md:text-base"
          data-testid="button-previous"
        >
          <ChevronLeft className="w-4 h-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Назад</span>
        </Button>
        
        {currentStep === steps.length ? (
          <Button
            onClick={handleComplete}
            disabled={saveProfileMutation.isPending}
            className="bg-gradient-to-r from-trust-green to-medical-blue hover:opacity-90 text-white px-4 md:px-6 text-sm md:text-base"
            data-testid="button-complete"
          >
            {saveProfileMutation.isPending ? "Сохранение..." : "Завершить"}
            <Check className="w-4 h-4 ml-1 md:ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-medical-blue to-trust-green hover:opacity-90 text-white px-4 md:px-6 text-sm md:text-base"
            data-testid="button-next"
          >
            Далее
            <ChevronRight className="w-4 h-4 ml-1 md:ml-2" />
          </Button>
        )}
      </div>
    </Card>
    </div>
  );
}