import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-6">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center animate-bounce">
          <svg className="w-12 h-12 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.76 7.63C8.78 6.66 7.26 6.66 6.29 7.63C5.78 8.14 5.51 8.82 5.51 9.5S5.78 10.86 6.29 11.37C6.8 11.88 7.48 12.15 8.15 12.15C8.83 12.15 9.51 11.88 10.02 11.37C10.53 10.86 10.8 10.18 10.8 9.5S10.53 8.14 10.02 7.63M17.71 7.63C16.73 6.66 15.21 6.66 14.24 7.63C13.73 8.14 13.46 8.82 13.46 9.5S13.73 10.86 14.24 11.37C14.75 11.88 15.43 12.15 16.1 12.15C16.78 12.15 17.46 11.88 17.97 11.37C18.48 10.86 18.75 10.18 18.75 9.5S18.48 8.14 17.97 7.63M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2M12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20M8.5 16C8.5 14.34 9.84 13 11.5 13H12.5C14.16 13 15.5 14.34 15.5 16H8.5Z"/>
          </svg>
        </div>
        <p className="text-sm text-muted-foreground animate-in fade-in duration-700 delay-200">
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
          <span>Низкий 😌</span>
          <span>Средний 😐</span>
          <span>Высокий 😰</span>
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
        <RadioGroup
          value={data.moodChanges || ""}
          onValueChange={(value) => onUpdate({ moodChanges: value as HealthProfileData["moodChanges"] })}
        >
          <Card className="p-3 hover:bg-accent transition-colors">
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="stable" id="stable" />
              <div className="flex-1">
                <Label htmlFor="stable" className="font-medium cursor-pointer">
                  Стабильное
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Настроение обычно ровное и предсказуемое
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 hover:bg-accent transition-colors">
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="mild" id="mild" />
              <div className="flex-1">
                <Label htmlFor="mild" className="font-medium cursor-pointer">
                  Легкие колебания
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Небольшие изменения настроения в течение дня
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 hover:bg-accent transition-colors">
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="moderate" id="moderate" />
              <div className="flex-1">
                <Label htmlFor="moderate" className="font-medium cursor-pointer">
                  Умеренные колебания
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Заметные изменения настроения, влияющие на активность
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 hover:bg-accent transition-colors">
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="severe" id="severe" />
              <div className="flex-1">
                <Label htmlFor="severe" className="font-medium cursor-pointer">
                  Сильные колебания
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Резкие изменения настроения, мешающие повседневной жизни
                </p>
              </div>
            </div>
          </Card>
        </RadioGroup>
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