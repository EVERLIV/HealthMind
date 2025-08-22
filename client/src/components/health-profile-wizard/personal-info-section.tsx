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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-medical-blue/20 to-trust-green/20 rounded-full flex items-center justify-center">
          <Calculator className="w-10 h-10 text-medical-blue" />
        </div>
        <p className="text-sm text-muted-foreground">
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