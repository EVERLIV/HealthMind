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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Психическое здоровье</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Оцените ваше текущее эмоциональное состояние
        </p>
      </div>
      
      {/* Stress Level */}
      <div className="space-y-3">
        <Label className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Уровень стресса</span>
          </span>
          <span className={`text-2xl font-bold ${getStressColor(data.stressLevel)}`}>
            {data.stressLevel || 5}
          </span>
        </Label>
        <Slider
          value={[data.stressLevel || 5]}
          onValueChange={([value]) => onUpdate({ stressLevel: value })}
          min={1}
          max={10}
          step={1}
          className="w-full"
          data-testid="slider-stress"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Низкий</span>
          <span>Средний</span>
          <span>Высокий</span>
        </div>
      </div>
      
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