import { Label } from "@/components/ui/label";
import { Activity, Dumbbell, TrendingUp } from "lucide-react";
import type { HealthProfileData } from "./index";

interface PhysicalHealthSectionProps {
  data: HealthProfileData;
  onUpdate: (data: Partial<HealthProfileData>) => void;
}

export default function PhysicalHealthSection({ data, onUpdate }: PhysicalHealthSectionProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Физическая активность</h3>
        <p className="text-sm text-muted-foreground">
          Оцените ваш уровень активности
        </p>
      </div>
      
      {/* Activity Level */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Activity className="w-4 h-4" />
          <span>Уровень активности</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdate({ activityLevel: "sedentary" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.activityLevel === "sedentary"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Сидячий
          </button>
          <button
            onClick={() => onUpdate({ activityLevel: "light" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.activityLevel === "light"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Легкая активность
          </button>
          <button
            onClick={() => onUpdate({ activityLevel: "moderate" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.activityLevel === "moderate"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Умеренная
          </button>
          <button
            onClick={() => onUpdate({ activityLevel: "active" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.activityLevel === "active"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Активный
          </button>
          <button
            onClick={() => onUpdate({ activityLevel: "very_active" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.activityLevel === "very_active"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Очень активный
          </button>
        </div>
      </div>
      
      {/* Exercise Frequency */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Dumbbell className="w-4 h-4" />
          <span>Частота тренировок</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdate({ exerciseFrequency: "never" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.exerciseFrequency === "never"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Никогда
          </button>
          <button
            onClick={() => onUpdate({ exerciseFrequency: "1-2_week" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.exerciseFrequency === "1-2_week"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            1-2 раза/нед
          </button>
          <button
            onClick={() => onUpdate({ exerciseFrequency: "3-4_week" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.exerciseFrequency === "3-4_week"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            3-4 раза/нед
          </button>
          <button
            onClick={() => onUpdate({ exerciseFrequency: "5+_week" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.exerciseFrequency === "5+_week"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            5+ раз/нед
          </button>
        </div>
      </div>
      
      {/* Fitness Level */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span>Уровень физической подготовки</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdate({ fitnessLevel: "beginner" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.fitnessLevel === "beginner"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Начинающий
          </button>
          <button
            onClick={() => onUpdate({ fitnessLevel: "intermediate" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.fitnessLevel === "intermediate"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Средний
          </button>
          <button
            onClick={() => onUpdate({ fitnessLevel: "advanced" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.fitnessLevel === "advanced"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Продвинутый
          </button>
        </div>
      </div>
    </div>
  );
}