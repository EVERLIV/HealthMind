import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import type { HealthProfileData } from "./index";

interface PersonalInfoSectionProps {
  data: HealthProfileData;
  onUpdate: (data: Partial<HealthProfileData>) => void;
}

export default function PersonalInfoSection({ data, onUpdate }: PersonalInfoSectionProps) {
  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };
  
  const handleWeightChange = (weight: number) => {
    const bmi = calculateBMI(weight, data.height);
    onUpdate({ weight, ...(bmi && { bmi }) });
  };
  
  const handleHeightChange = (height: number) => {
    const bmi = calculateBMI(data.weight, height);
    onUpdate({ height, ...(bmi && { bmi }) });
  };
  
  const getBMICategory = (bmi?: number) => {
    if (!bmi) return "";
    if (bmi < 18.5) return "Недостаточный вес";
    if (bmi < 25) return "Нормальный вес";
    if (bmi < 30) return "Избыточный вес";
    return "Ожирение";
  };
  
  const getBMIColor = (bmi?: number) => {
    if (!bmi) return "";
    if (bmi < 18.5) return "text-warning-amber";
    if (bmi < 25) return "text-trust-green";
    if (bmi < 30) return "text-warning-amber";
    return "text-error-red";
  };
  
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-6">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-medical-blue/20 to-trust-green/20 rounded-full flex items-center justify-center animate-bounce">
          <svg className="w-12 h-12 text-medical-blue" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L18 5L15 7V9C15 11.2 13.2 13 11 13V15L13 17L15 18L17 15V13L21 9ZM3 9V7L6 5L9 7V9C9 11.2 10.8 13 13 13V15L11 17L9 18L7 15V13L3 9ZM12 13.5C14 13.5 15.5 12 15.5 10C15.5 8 14 6.5 12 6.5C10 6.5 8.5 8 8.5 10C8.5 12 10 13.5 12 13.5Z"/>
          </svg>
        </div>
        <p className="text-sm text-muted-foreground animate-in fade-in duration-700 delay-200">
          Расскажите о себе для персональных рекомендаций
        </p>
      </div>
      
      {/* Age */}
      <div className="space-y-2">
        <Label htmlFor="age">Возраст</Label>
        <Input
          id="age"
          type="number"
          placeholder="Введите ваш возраст"
          value={data.age || ""}
          onChange={(e) => onUpdate({ age: parseInt(e.target.value) || undefined })}
          min={1}
          max={120}
          data-testid="input-age"
        />
      </div>
      
      {/* Gender */}
      <div className="space-y-2">
        <Label>Пол</Label>
        <RadioGroup
          value={data.gender || ""}
          onValueChange={(value) => onUpdate({ gender: value as HealthProfileData["gender"] })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male" className="font-normal">Мужской</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female" className="font-normal">Женский</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other" className="font-normal">Другой</Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Height and Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height">Рост (см)</Label>
          <Input
            id="height"
            type="number"
            placeholder="170"
            value={data.height || ""}
            onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
            min={50}
            max={250}
            data-testid="input-height"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="weight">Вес (кг)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="70"
            value={data.weight || ""}
            onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0)}
            min={20}
            max={300}
            step={0.1}
            data-testid="input-weight"
          />
        </div>
      </div>
      
      {/* BMI Calculator */}
      {data.bmi && (
        <Card className="p-4 bg-gradient-to-r from-medical-blue/10 to-trust-green/10 border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white dark:bg-card rounded-xl shadow-md">
                <Calculator className="w-6 h-6 text-medical-blue" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">ИМТ</p>
                <p className="text-3xl font-bold">
                  <span className={getBMIColor(data.bmi)} data-testid="text-bmi">
                    {data.bmi}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getBMIColor(data.bmi)} bg-white dark:bg-card`}>
                {getBMICategory(data.bmi)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                18.5 - 24.9
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-medical-blue to-trust-green transition-all"
              style={{ width: `${Math.min(100, (data.bmi / 40) * 100)}%` }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}