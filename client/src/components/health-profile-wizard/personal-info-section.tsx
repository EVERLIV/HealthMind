import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Основная информация</h3>
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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdate({ gender: "male" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.gender === "male"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Мужской
          </button>
          <button
            onClick={() => onUpdate({ gender: "female" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.gender === "female"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Женский
          </button>
          <button
            onClick={() => onUpdate({ gender: "other" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.gender === "other"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Другой
          </button>
        </div>
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