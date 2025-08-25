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
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Сидячий
          </button>
          <button
            onClick={() => onUpdate({ activityLevel: "light" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.activityLevel === "light"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Легкая активность
          </button>
          <button
            onClick={() => onUpdate({ activityLevel: "moderate" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.activityLevel === "moderate"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Умеренная
          </button>
          <button
            onClick={() => onUpdate({ activityLevel: "active" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.activityLevel === "active"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Активный
          </button>
          <button
            onClick={() => onUpdate({ activityLevel: "very_active" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.activityLevel === "very_active"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
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
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Никогда
          </button>
          <button
            onClick={() => onUpdate({ exerciseFrequency: "1-2_week" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.exerciseFrequency === "1-2_week"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            1-2 раза/нед
          </button>
          <button
            onClick={() => onUpdate({ exerciseFrequency: "3-4_week" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.exerciseFrequency === "3-4_week"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            3-4 раза/нед
          </button>
          <button
            onClick={() => onUpdate({ exerciseFrequency: "5+_week" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.exerciseFrequency === "5+_week"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
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
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Начинающий
          </button>
          <button
            onClick={() => onUpdate({ fitnessLevel: "intermediate" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.fitnessLevel === "intermediate"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Средний
          </button>
          <button
            onClick={() => onUpdate({ fitnessLevel: "advanced" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.fitnessLevel === "advanced"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Продвинутый
          </button>
        </div>
      </div>
    </div>
  );
}