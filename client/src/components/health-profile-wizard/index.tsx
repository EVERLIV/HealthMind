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
    <Card className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Создание профиля здоровья
        </h2>
        <p className="text-muted-foreground text-sm">
          Шаг {currentStep} из {steps.length}: {steps[currentStep - 1].title}
        </p>
      </div>
      
      {/* Progress Bar */}
      <Progress value={progress} className="mb-6 h-2" />
      
      {/* Step Indicators */}
      <div className="flex justify-between mb-8">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
              step.id < currentStep
                ? "bg-trust-green text-white"
                : step.id === currentStep
                ? "bg-medical-blue text-white"
                : "bg-muted text-muted-foreground"
            }`}
            data-testid={`step-indicator-${step.id}`}
          >
            {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
          </div>
        ))}
      </div>
      
      {/* Current Step Content */}
      <div className="min-h-[400px] mb-6">
        <CurrentStepComponent
          data={profileData}
          onUpdate={handleUpdateData}
        />
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          data-testid="button-previous"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        
        {currentStep === steps.length ? (
          <Button
            onClick={handleComplete}
            disabled={saveProfileMutation.isPending}
            className="bg-trust-green hover:bg-trust-green/90"
            data-testid="button-complete"
          >
            {saveProfileMutation.isPending ? "Сохранение..." : "Завершить"}
            <Check className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="bg-medical-blue hover:bg-medical-blue/90"
            data-testid="button-next"
          >
            Далее
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </Card>
  );
}