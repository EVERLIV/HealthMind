import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Target, Trophy, Heart } from "lucide-react";
import type { HealthProfileData } from "./index";

interface HealthGoalsSectionProps {
  data: HealthProfileData;
  onUpdate: (data: Partial<HealthProfileData>) => void;
}

const healthGoalOptions = [
  { value: "weight_loss", label: "Снижение веса", icon: "🎯" },
  { value: "muscle_gain", label: "Набор мышечной массы", icon: "💪" },
  { value: "improve_fitness", label: "Улучшение физической формы", icon: "🏃" },
  { value: "reduce_stress", label: "Снижение стресса", icon: "🧘" },
  { value: "better_sleep", label: "Улучшение сна", icon: "😴" },
  { value: "healthy_eating", label: "Здоровое питание", icon: "🥗" },
  { value: "quit_smoking", label: "Бросить курить", icon: "🚭" },
  { value: "manage_condition", label: "Контроль хронического заболевания", icon: "💊" },
  { value: "increase_energy", label: "Повышение энергии", icon: "⚡" },
  { value: "mental_health", label: "Улучшение ментального здоровья", icon: "🧠" },
  { value: "preventive_care", label: "Профилактика заболеваний", icon: "🛡️" },
  { value: "longevity", label: "Долголетие", icon: "🌟" },
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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-trust-green/20 to-emerald-500/20 rounded-full flex items-center justify-center">
          <Target className="w-10 h-10 text-trust-green" />
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {healthGoalOptions.map((goal) => (
            <Card 
              key={goal.value} 
              className={`p-3 transition-colors cursor-pointer ${
                data.healthGoals?.includes(goal.value) 
                  ? "bg-light-blue border-medical-blue" 
                  : "hover:bg-accent"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={goal.value}
                  checked={data.healthGoals?.includes(goal.value) || false}
                  onCheckedChange={(checked) => handleGoalToggle(goal.value, checked as boolean)}
                />
                <Label htmlFor={goal.value} className="cursor-pointer font-normal flex-1 flex items-center space-x-2">
                  <span className="text-lg">{goal.icon}</span>
                  <span>{goal.label}</span>
                </Label>
              </div>
            </Card>
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
      <Card className="p-4 bg-gradient-to-r from-medical-blue/10 to-trust-green/10 border-0">
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
      </Card>
      
      {/* Selected Goals Summary */}
      {data.healthGoals && data.healthGoals.length > 0 && (
        <Card className="p-4 bg-light-blue border-0">
          <p className="text-sm font-medium mb-2">Выбранные цели ({data.healthGoals.length}):</p>
          <div className="flex flex-wrap gap-2">
            {data.healthGoals.map(goalValue => {
              const goal = healthGoalOptions.find(g => g.value === goalValue);
              return goal ? (
                <span 
                  key={goalValue} 
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-white dark:bg-card rounded-md text-xs"
                >
                  <span>{goal.icon}</span>
                  <span>{goal.label}</span>
                </span>
              ) : null;
            })}
          </div>
        </Card>
      )}
    </div>
  );
}