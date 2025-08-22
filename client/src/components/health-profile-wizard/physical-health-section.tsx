import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Activity, Dumbbell, TrendingUp } from "lucide-react";
import type { HealthProfileData } from "./index";

interface PhysicalHealthSectionProps {
  data: HealthProfileData;
  onUpdate: (data: Partial<HealthProfileData>) => void;
}

export default function PhysicalHealthSection({ data, onUpdate }: PhysicalHealthSectionProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-6">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-trust-green/20 to-emerald-500/20 rounded-full flex items-center justify-center animate-pulse">
          <svg className="w-12 h-12 text-trust-green" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 5A1.5 1.5 0 0017 3.5c0-.83-.67-1.5-1.5-1.5S14 2.67 14 3.5 14.67 5 15.5 5M9.5 8.5L12 7l2.5 1.5L17 7l1.09 3.27c.22.66-.16 1.38-.82 1.6L16 12.5v6c0 .55-.45 1-1 1s-1-.45-1-1v-5.5h-2V18c0 .55-.45 1-1 1s-1-.45-1-1v-6l-1.27-.63c-.66-.22-1.04-.94-.82-1.6L9.5 8.5z"/>
            <circle cx="6" cy="16" r="2"/>
            <circle cx="18" cy="16" r="2"/>
          </svg>
        </div>
        <p className="text-sm text-muted-foreground animate-in fade-in duration-700 delay-200">
          Оцените ваш уровень активности
        </p>
      </div>
      
      {/* Activity Level */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Activity className="w-4 h-4" />
          <span>Уровень активности</span>
        </Label>
        <RadioGroup
          value={data.activityLevel || ""}
          onValueChange={(value) => onUpdate({ activityLevel: value as HealthProfileData["activityLevel"] })}
        >
          <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-medical-blue">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="sedentary" id="sedentary" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="sedentary" className="font-medium cursor-pointer flex items-center gap-2">
                  <span className="text-lg">🪑</span>
                  Сидячий образ жизни
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Минимальная активность
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 hover:bg-accent transition-colors">
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="light" id="light" />
              <div className="flex-1">
                <Label htmlFor="light" className="font-medium cursor-pointer">
                  Легкая активность
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Легкие упражнения 1-3 раза в неделю
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 hover:bg-accent transition-colors">
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="moderate" id="moderate" />
              <div className="flex-1">
                <Label htmlFor="moderate" className="font-medium cursor-pointer">
                  Умеренная активность
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Умеренные упражнения 3-5 раз в неделю
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 hover:bg-accent transition-colors">
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="active" id="active" />
              <div className="flex-1">
                <Label htmlFor="active" className="font-medium cursor-pointer">
                  Активный образ жизни
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Интенсивные упражнения 6-7 раз в неделю
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 hover:bg-accent transition-colors">
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="very_active" id="very_active" />
              <div className="flex-1">
                <Label htmlFor="very_active" className="font-medium cursor-pointer">
                  Очень активный
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Профессиональный спорт или физический труд
                </p>
              </div>
            </div>
          </Card>
        </RadioGroup>
      </div>
      
      {/* Exercise Frequency */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Dumbbell className="w-4 h-4" />
          <span>Частота тренировок</span>
        </Label>
        <RadioGroup
          value={data.exerciseFrequency || ""}
          onValueChange={(value) => onUpdate({ exerciseFrequency: value })}
        >
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="never" />
                <Label htmlFor="never" className="cursor-pointer">Никогда</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1-2_week" id="1-2_week" />
                <Label htmlFor="1-2_week" className="cursor-pointer">1-2 раза/нед</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3-4_week" id="3-4_week" />
                <Label htmlFor="3-4_week" className="cursor-pointer">3-4 раза/нед</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5+_week" id="5+_week" />
                <Label htmlFor="5+_week" className="cursor-pointer">5+ раз/нед</Label>
              </div>
            </Card>
          </div>
        </RadioGroup>
      </div>
      
      {/* Fitness Level */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span>Уровень физической подготовки</span>
        </Label>
        <RadioGroup
          value={data.fitnessLevel || ""}
          onValueChange={(value) => onUpdate({ fitnessLevel: value as HealthProfileData["fitnessLevel"] })}
        >
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex flex-col items-center space-y-2">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner" className="cursor-pointer text-center">
                  Начинающий
                </Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex flex-col items-center space-y-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate" className="cursor-pointer text-center">
                  Средний
                </Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex flex-col items-center space-y-2">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced" className="cursor-pointer text-center">
                  Продвинутый
                </Label>
              </div>
            </Card>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}