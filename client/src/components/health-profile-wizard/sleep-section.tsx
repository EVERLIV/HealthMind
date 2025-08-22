import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Moon, Clock, AlertCircle } from "lucide-react";
import type { HealthProfileData } from "./index";

interface SleepSectionProps {
  data: HealthProfileData;
  onUpdate: (data: Partial<HealthProfileData>) => void;
}

const sleepProblems = [
  { value: "insomnia", label: "Бессонница" },
  { value: "snoring", label: "Храп" },
  { value: "apnea", label: "Апноэ сна" },
  { value: "restless", label: "Беспокойный сон" },
  { value: "nightmares", label: "Кошмары" },
  { value: "early_waking", label: "Ранние пробуждения" },
];

export default function SleepSection({ data, onUpdate }: SleepSectionProps) {
  const handleProblemToggle = (problem: string, checked: boolean) => {
    const currentProblems = data.sleepProblems || [];
    const newProblems = checked
      ? [...currentProblems, problem]
      : currentProblems.filter(p => p !== problem);
    onUpdate({ sleepProblems: newProblems });
  };
  
  const getSleepColor = (hours?: number) => {
    if (!hours) return "";
    if (hours < 6) return "text-error-red";
    if (hours <= 9) return "text-trust-green";
    return "text-warning-amber";
  };
  
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Режим сна</h3>
        <p className="text-sm text-muted-foreground">
          Качественный сон важен для здоровья
        </p>
      </div>
      
      {/* Sleep Hours */}
      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-0">
        <Label className="flex items-center justify-between mb-3">
          <span className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <span className="font-medium">Часов сна</span>
          </span>
          <span className={`text-3xl font-bold ${getSleepColor(data.sleepHours)}`}>
            {data.sleepHours || 7}h
          </span>
        </Label>
        <Slider
          value={[data.sleepHours || 7]}
          onValueChange={([value]) => onUpdate({ sleepHours: value })}
          min={3}
          max={12}
          step={0.5}
          className="w-full mb-2"
          data-testid="slider-sleep"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>3h</span>
          <span>7-9h (норма)</span>
          <span>12h</span>
        </div>
      </Card>
      
      {/* Sleep Quality */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Moon className="w-4 h-4" />
          <span>Качество сна</span>
        </Label>
        <RadioGroup
          value={data.sleepQuality || ""}
          onValueChange={(value) => onUpdate({ sleepQuality: value as HealthProfileData["sleepQuality"] })}
        >
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 hover:shadow-md transition-all cursor-pointer border hover:border-medical-blue/50 bg-card/50">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poor" id="poor" />
                <Label htmlFor="poor" className="cursor-pointer">Плохое</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:shadow-md transition-all cursor-pointer border hover:border-medical-blue/50 bg-card/50">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fair" id="fair" />
                <Label htmlFor="fair" className="cursor-pointer">Удовлетворительное</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:shadow-md transition-all cursor-pointer border hover:border-medical-blue/50 bg-card/50">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="good" />
                <Label htmlFor="good" className="cursor-pointer">Хорошее</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:shadow-md transition-all cursor-pointer border hover:border-medical-blue/50 bg-card/50">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excellent" id="excellent" />
                <Label htmlFor="excellent" className="cursor-pointer">Отличное</Label>
              </div>
            </Card>
          </div>
        </RadioGroup>
      </div>
      
      {/* Sleep Problems */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>Проблемы со сном</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {sleepProblems.map((problem) => (
            <Card key={problem.value} className="p-3 hover:shadow-md transition-all cursor-pointer border hover:border-medical-blue/50 bg-card/50">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={problem.value}
                  checked={data.sleepProblems?.includes(problem.value) || false}
                  onCheckedChange={(checked) => handleProblemToggle(problem.value, checked as boolean)}
                />
                <Label htmlFor={problem.value} className="cursor-pointer font-normal">
                  {problem.label}
                </Label>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Sleep Tips */}
      <Card className="p-4 bg-light-blue border-0">
        <div className="flex items-start space-x-3">
          <Moon className="w-5 h-5 text-medical-blue mt-0.5" />
          <div>
            <p className="font-medium text-sm mb-1">Рекомендация</p>
            <p className="text-xs text-muted-foreground">
              Взрослым рекомендуется спать 7-9 часов в сутки. Регулярный режим сна, комфортная температура 
              и отказ от экранов за час до сна помогут улучшить качество отдыха.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}