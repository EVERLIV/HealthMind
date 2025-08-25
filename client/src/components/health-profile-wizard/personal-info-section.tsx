import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  User, 
  Ruler, 
  Weight, 
  Calendar,
  Info,
  TrendingUp,
  TrendingDown
} from "lucide-react";
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
    if (bmi < 18.5) return "text-yellow-600 bg-yellow-50";
    if (bmi < 25) return "text-green-600 bg-green-50";
    if (bmi < 30) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getBMIIcon = (bmi?: number) => {
    if (!bmi) return null;
    if (bmi < 18.5) return <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />;
    if (bmi < 25) return <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />;
    if (bmi < 30) return <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />;
    return <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />;
  };
  
  const getBMIAdvice = (bmi?: number) => {
    if (!bmi) return "";
    if (bmi < 18.5) return "Рекомендуется увеличить калорийность питания";
    if (bmi < 25) return "Отличный показатель! Поддерживайте текущий вес";
    if (bmi < 30) return "Рекомендуется снизить вес для улучшения здоровья";
    return "Важно проконсультироваться с врачом о программе снижения веса";
  };
  
  return (
    <div className="space-y-3 md:space-y-6">
      {/* Age Input - Mobile Optimized */}
      <Card className="border-0 shadow-md md:shadow-lg">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg md:rounded-xl">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div className="flex-1 space-y-2 md:space-y-3">
              <div>
                <Label htmlFor="age" className="text-sm md:text-base font-semibold">
                  Возраст
                </Label>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                  Ваш возраст помогает точнее рассчитать показатели
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="age"
                  type="number"
                  placeholder="35"
                  value={data.age || ""}
                  onChange={(e) => onUpdate({ age: parseInt(e.target.value) || undefined })}
                  min={1}
                  max={120}
                  className="max-w-[120px] md:max-w-[150px] h-8 md:h-10 text-sm md:text-base placeholder:text-xs md:placeholder:text-sm"
                  data-testid="input-age"
                />
                <span className="text-xs md:text-sm text-muted-foreground">лет</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Gender Selection - Mobile Optimized */}
      <Card className="border-0 shadow-md md:shadow-lg">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg md:rounded-xl">
              <User className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
            </div>
            <div className="flex-1 space-y-2 md:space-y-3">
              <div>
                <Label className="text-sm md:text-base font-semibold">
                  Пол
                </Label>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                  Биологический пол влияет на метаболизм
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                <button
                  onClick={() => onUpdate({ gender: "male" })}
                  className={`
                    px-2 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all border
                    ${data.gender === "male"
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }
                  `}
                  data-testid="button-gender-male"
                >
                  <div className="flex flex-col items-center gap-0.5 md:gap-1">
                    <span className="text-base md:text-lg">👨</span>
                    <span className="text-[10px] md:text-xs font-semibold">Мужской</span>
                  </div>
                </button>
                <button
                  onClick={() => onUpdate({ gender: "female" })}
                  className={`
                    px-2 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all border
                    ${data.gender === "female"
                      ? "bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700 shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }
                  `}
                  data-testid="button-gender-female"
                >
                  <div className="flex flex-col items-center gap-0.5 md:gap-1">
                    <span className="text-base md:text-lg">👩</span>
                    <span className="text-[10px] md:text-xs font-semibold">Женский</span>
                  </div>
                </button>
                <button
                  onClick={() => onUpdate({ gender: "other" })}
                  className={`
                    px-2 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all border
                    ${data.gender === "other"
                      ? "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }
                  `}
                  data-testid="button-gender-other"
                >
                  <div className="flex flex-col items-center gap-0.5 md:gap-1">
                    <span className="text-base md:text-lg">👤</span>
                    <span className="text-[10px] md:text-xs font-semibold">Другой</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Height and Weight - Mobile Stack */}
      <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
        <Card className="border-0 shadow-md md:shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg md:rounded-xl">
                <Ruler className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              </div>
              <div className="flex-1 space-y-2 md:space-y-3">
                <div>
                  <Label htmlFor="height" className="text-sm md:text-base font-semibold">
                    Рост
                  </Label>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                    Укажите ваш рост в см
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={data.height || ""}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    min={50}
                    max={250}
                    className="max-w-[100px] md:max-w-[120px] h-8 md:h-10 text-sm md:text-base placeholder:text-xs md:placeholder:text-sm"
                    data-testid="input-height"
                  />
                  <span className="text-xs md:text-sm text-muted-foreground">см</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md md:shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg md:rounded-xl">
                <Weight className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
              </div>
              <div className="flex-1 space-y-2 md:space-y-3">
                <div>
                  <Label htmlFor="weight" className="text-sm md:text-base font-semibold">
                    Вес
                  </Label>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                    Укажите ваш текущий вес
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={data.weight || ""}
                    onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0)}
                    min={20}
                    max={300}
                    step={0.1}
                    className="max-w-[100px] md:max-w-[120px] h-8 md:h-10 text-sm md:text-base placeholder:text-xs md:placeholder:text-sm"
                    data-testid="input-weight"
                  />
                  <span className="text-xs md:text-sm text-muted-foreground">кг</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* BMI Calculator - Mobile Optimized */}
      {data.bmi && (
        <Card className="overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
          <div className="p-4 md:p-6 bg-gradient-to-r from-medical-blue/10 to-trust-green/10">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 bg-white dark:bg-gray-900 rounded-lg md:rounded-xl shadow-md md:shadow-lg">
                  <Calculator className="w-4 h-4 md:w-6 md:h-6 text-medical-blue" />
                </div>
                <div>
                  <h3 className="text-sm md:text-lg font-bold">Индекс массы тела</h3>
                  <p className="text-[9px] md:text-xs text-muted-foreground">
                    Автоматический расчет
                  </p>
                </div>
              </div>
              <Badge className="px-1.5 md:px-3 py-0.5 md:py-1 text-[9px] md:text-xs" variant="outline">
                <Info className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                WHO
              </Badge>
            </div>
            
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-baseline gap-2 md:gap-3">
                  <span className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-medical-blue to-trust-green bg-clip-text text-transparent" data-testid="text-bmi">
                    {data.bmi}
                  </span>
                  <span className="text-xs md:text-sm text-muted-foreground">кг/м²</span>
                </div>
                
                <div className={`inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full ${getBMIColor(data.bmi)}`}>
                  {getBMIIcon(data.bmi)}
                  <span className="font-semibold text-xs md:text-sm">{getBMICategory(data.bmi)}</span>
                </div>
                
                <p className="text-[10px] md:text-sm text-muted-foreground">
                  {getBMIAdvice(data.bmi)}
                </p>
              </div>
              
              <div className="space-y-2 md:space-y-3">
                <div className="space-y-1.5 md:space-y-2">
                  <div className="flex justify-between text-[9px] md:text-xs">
                    <span className="hidden sm:inline">Недостаточный</span>
                    <span className="sm:hidden">Низкий</span>
                    <span>Норма</span>
                    <span className="hidden sm:inline">Избыточный</span>
                    <span className="sm:hidden">Выше</span>
                    <span className="hidden sm:inline">Ожирение</span>
                    <span className="sm:hidden">Высокий</span>
                  </div>
                  <div className="h-2 md:h-3 bg-gradient-to-r from-yellow-300 via-green-400 to-red-400 rounded-full relative overflow-hidden">
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 md:w-1 bg-gray-900 dark:bg-white shadow-lg"
                      style={{ left: `${Math.min(95, Math.max(5, ((data.bmi - 15) / 25) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] md:text-xs text-muted-foreground">
                    <span>15</span>
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>40</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-1 md:gap-2 text-[8px] md:text-xs">
                  <div className="text-center p-1 md:p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <div className="font-semibold text-yellow-600">&lt;18.5</div>
                    <div className="text-muted-foreground text-[7px] md:text-[10px]">Низкий</div>
                  </div>
                  <div className="text-center p-1 md:p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="font-semibold text-green-600">18.5-24.9</div>
                    <div className="text-muted-foreground text-[7px] md:text-[10px]">Норма</div>
                  </div>
                  <div className="text-center p-1 md:p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                    <div className="font-semibold text-orange-600">25-29.9</div>
                    <div className="text-muted-foreground text-[7px] md:text-[10px]">Выше</div>
                  </div>
                  <div className="text-center p-1 md:p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <div className="font-semibold text-red-600">≥30</div>
                    <div className="text-muted-foreground text-[7px] md:text-[10px]">Высокий</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Info Card - Mobile Optimized */}
      {!data.bmi && (data.height || data.weight) && (
        <Card className="border-dashed border-2 border-medical-blue/30">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Info className="w-4 h-4 md:w-5 md:h-5 text-medical-blue shrink-0" />
              <p className="text-[10px] md:text-sm text-muted-foreground">
                Введите {!data.height ? "рост" : "вес"} для автоматического расчета ИМТ
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}