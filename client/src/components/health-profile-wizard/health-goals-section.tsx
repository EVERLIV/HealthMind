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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {healthGoalOptions.map((goal) => (
            <Card 
              key={goal.value} 
              className={`p-3 hover:shadow-md transition-all cursor-pointer border ${
                data.healthGoals?.includes(goal.value) 
                  ? "border-medical-blue bg-medical-blue/10" 
                  : "hover:border-medical-blue/50 bg-card/50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={goal.value}
                  checked={data.healthGoals?.includes(goal.value) || false}
                  onCheckedChange={(checked) => handleGoalToggle(goal.value, checked as boolean)}
                />
                <Label htmlFor={goal.value} className="cursor-pointer font-normal flex-1">
                  {goal.label}
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
                  className="inline-flex items-center px-2 py-1 bg-white dark:bg-card rounded-md text-xs"
                >
                  {goal.label}
                </span>
              ) : null;
            })}
          </div>
        </Card>
      )}
    </div>
  );
}