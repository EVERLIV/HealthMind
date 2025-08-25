import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Target, Trophy, Heart } from "lucide-react";
import type { HealthProfileData } from "./index";

interface HealthGoalsSectionProps {
  data: HealthProfileData;
  onUpdate: (data: Partial<HealthProfileData>) => void;
}

const healthGoalOptions = [
  { value: "weight_loss", label: "Снижение веса" },
  { value: "muscle_gain", label: "Набор мышечной массы" },
  { value: "improve_fitness", label: "Улучшение физической формы" },
  { value: "reduce_stress", label: "Снижение стресса" },
  { value: "better_sleep", label: "Улучшение сна" },
  { value: "healthy_eating", label: "Здоровое питание" },
  { value: "quit_smoking", label: "Бросить курить" },
  { value: "manage_condition", label: "Контроль хронического заболевания" },
  { value: "increase_energy", label: "Повышение энергии" },
  { value: "mental_health", label: "Улучшение ментального здоровья" },
  { value: "preventive_care", label: "Профилактика заболеваний" },
  { value: "longevity", label: "Долголетие" },
];

export default function HealthGoalsSection({ data, onUpdate }: HealthGoalsSectionProps) {
  const handleGoalToggle = (goal: string, checked: boolean) => {
    const currentGoals = data.healthGoals || [];
    const newGoals = checked
      ? [...currentGoals, goal]
      : currentGoals.filter(g => g !== goal);
    onUpdate({ healthGoals: newGoals });
  };
  
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Цели здоровья</h3>
        <p className="text-sm text-muted-foreground">
          Что вы хотите улучшить?
        </p>
      </div>
      
      {/* Health Goals Selection */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Target className="w-4 h-4" />
          <span>Выберите ваши цели</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {healthGoalOptions.map((goal) => (
            <button
              key={goal.value}
              onClick={() => handleGoalToggle(goal.value, !data.healthGoals?.includes(goal.value))}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                data.healthGoals?.includes(goal.value)
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {goal.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Primary Goal */}
      <div className="space-y-3">
        <Label htmlFor="primary-goal" className="flex items-center space-x-2">
          <Trophy className="w-4 h-4" />
          <span>Главная цель (опишите подробнее)</span>
        </Label>
        <Textarea
          id="primary-goal"
          placeholder="Например: Хочу похудеть на 10 кг за 3 месяца, чтобы улучшить самочувствие и снизить нагрузку на суставы..."
          value={data.primaryGoal || ""}
          onChange={(e) => onUpdate({ primaryGoal: e.target.value })}
          rows={4}
          className="resize-none"
          data-testid="textarea-primary-goal"
        />
      </div>
      
      {/* Motivation Card */}
      <div className="p-4 bg-gradient-to-r from-medical-blue/10 to-trust-green/10 rounded-lg">
        <div className="flex items-start space-x-3">
          <Heart className="w-5 h-5 text-medical-blue mt-0.5" />
          <div>
            <p className="font-medium text-sm mb-1">Вы на правильном пути!</p>
            <p className="text-xs text-muted-foreground">
              Постановка четких целей - это первый шаг к их достижению. 
              Мы поможем вам отслеживать прогресс и предоставим персонализированные рекомендации 
              для достижения ваших целей здоровья.
            </p>
          </div>
        </div>
      </div>
      
      {/* Selected Goals Summary */}
      {data.healthGoals && data.healthGoals.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
          <p className="text-sm font-medium mb-2">Выбранные цели ({data.healthGoals.length}):</p>
          <div className="flex flex-wrap gap-2">
            {data.healthGoals.map(goalValue => {
              const goal = healthGoalOptions.find(g => g.value === goalValue);
              return goal ? (
                <span 
                  key={goalValue} 
                  className="inline-flex items-center px-3 py-1 bg-white dark:bg-card rounded-full text-xs font-medium shadow-sm"
                >
                  {goal.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}