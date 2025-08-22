import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Brain, Heart, TrendingUp } from "lucide-react";
import type { HealthProfileData } from "./index";

interface MentalHealthSectionProps {
  data: HealthProfileData;
  onUpdate: (data: Partial<HealthProfileData>) => void;
}

export default function MentalHealthSection({ data, onUpdate }: MentalHealthSectionProps) {
  const getStressColor = (level?: number) => {
    if (!level) return "";
    if (level <= 3) return "text-trust-green";
    if (level <= 6) return "text-warning-amber";
    return "text-error-red";
  };
  
  const getAnxietyColor = (level?: number) => {
    if (!level) return "";
    if (level <= 3) return "text-trust-green";
    if (level <= 6) return "text-warning-amber";
    return "text-error-red";
  };
  
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Психическое здоровье</h3>
        <p className="text-sm text-muted-foreground">
          Оцените ваше эмоциональное состояние
        </p>
      </div>
      
      {/* Stress Level */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-0">
        <Label className="flex items-center justify-between mb-3">
          <span className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <span className="font-medium">Уровень стресса</span>
          </span>
          <span className={`text-3xl font-bold ${getStressColor(data.stressLevel)}`}>
            {data.stressLevel || 5}
          </span>
        </Label>
        <Slider
          value={[data.stressLevel || 5]}
          onValueChange={([value]) => onUpdate({ stressLevel: value })}
          min={1}
          max={10}
          step={1}
          className="w-full mb-2"
          data-testid="slider-stress"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Низкий</span>
          <span>Средний</span>
          <span>Высокий</span>
        </div>
      </Card>
      
      {/* Anxiety Level */}
      <div className="space-y-3">
        <Label className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Heart className="w-4 h-4" />
            <span>Уровень тревожности</span>
          </span>
          <span className={`text-2xl font-bold ${getAnxietyColor(data.anxietyLevel)}`}>
            {data.anxietyLevel || 5}
          </span>
        </Label>
        <Slider
          value={[data.anxietyLevel || 5]}
          onValueChange={([value]) => onUpdate({ anxietyLevel: value })}
          min={1}
          max={10}
          step={1}
          className="w-full"
          data-testid="slider-anxiety"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Низкий</span>
          <span>Средний</span>
          <span>Высокий</span>
        </div>
      </div>
      
      {/* Mood Changes */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span>Изменения настроения</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdate({ moodChanges: "stable" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.moodChanges === "stable"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Стабильное
          </button>
          <button
            onClick={() => onUpdate({ moodChanges: "mild" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.moodChanges === "mild"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Легкие колебания
          </button>
          <button
            onClick={() => onUpdate({ moodChanges: "moderate" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.moodChanges === "moderate"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Умеренные
          </button>
          <button
            onClick={() => onUpdate({ moodChanges: "severe" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.moodChanges === "severe"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Сильные колебания
          </button>
        </div>
      </div>
      
      {/* Helpful Tips */}
      <Card className="p-4 bg-light-blue border-0">
        <div className="flex items-start space-x-3">
          <Heart className="w-5 h-5 text-medical-blue mt-0.5" />
          <div>
            <p className="font-medium text-sm mb-1">Совет</p>
            <p className="text-xs text-muted-foreground">
              Регулярная физическая активность и медитация могут значительно снизить уровень стресса и тревожности. 
              Не стесняйтесь обратиться к специалисту, если чувствуете, что вам нужна помощь.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}