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
  TrendingDown,
  Check
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
    if (bmi < 18.5) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    if (bmi < 25) return "text-green-600 bg-green-50 dark:bg-green-900/20";
    if (bmi < 30) return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
    return "text-red-600 bg-red-50 dark:bg-red-900/20";
  };

  const getBMIIcon = (bmi?: number) => {
    if (!bmi) return null;
    if (bmi < 18.5) return <TrendingDown className="w-4 h-4" />;
    if (bmi < 25) return <Check className="w-4 h-4" />;
    if (bmi < 30) return <TrendingUp className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };
  
  const getBMIAdvice = (bmi?: number) => {
    if (!bmi) return "";
    if (bmi < 18.5) return "Рекомендуется увеличить калорийность питания";
    if (bmi < 25) return "Отличный показатель! Поддерживайте текущий вес";
    if (bmi < 30) return "Рекомендуется снизить вес для улучшения здоровья";
    return "Важно проконсультироваться с врачом о программе снижения веса";
  };
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Age Input - Enhanced Medical Design */}
      <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-gradient-to-br from-medical-blue/15 to-blue-500/10 rounded-xl border border-medical-blue/20 shadow-sm">
                <Calendar className="w-5 h-5 text-medical-blue" />
              </div>
              <div>
                <Label htmlFor="age" className="text-base md:text-lg font-semibold text-foreground block">
                  Возраст
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">Для точного расчета медицинских норм</p>
              </div>
            </div>
            {data.age && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-400">Заполнено</span>
              </div>
            )}
          </div>
          <div className="relative">
            <Input
              id="age"
              type="number"
              placeholder="25"
              value={data.age || ""}
              onChange={(e) => onUpdate({ age: parseInt(e.target.value) || undefined })}
              min={1}
              max={120}
              className="h-12 md:h-14 text-base pl-12 bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 transition-all duration-200"
              data-testid="input-age"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <span className="text-slate-400 text-sm font-medium">лет</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Gender Selection - Enhanced */}
      <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-gradient-to-br from-trust-green/15 to-emerald-500/10 rounded-xl border border-trust-green/20 shadow-sm">
                <User className="w-5 h-5 text-trust-green" />
              </div>
              <div>
                <Label className="text-base md:text-lg font-semibold text-foreground block">
                  Биологический пол
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">Влияет на медицинские нормы</p>
              </div>
            </div>
            {data.gender && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-400">Заполнено</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              { value: 'male', label: 'Мужской', emoji: '👨', color: 'from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-800' },
              { value: 'female', label: 'Женский', emoji: '👩', color: 'from-pink-500/10 to-pink-600/5 border-pink-200 dark:border-pink-800' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onUpdate({ gender: option.value as any })}
                className={`relative p-4 md:p-5 rounded-xl border-2 transition-all duration-200 text-center group ${
                  data.gender === option.value
                    ? 'border-medical-blue bg-gradient-to-br from-medical-blue/15 to-blue-500/10 text-medical-blue shadow-lg scale-105'
                    : `bg-gradient-to-br ${option.color} hover:shadow-md hover:scale-102 hover:border-opacity-60`
                }`}
                data-testid={`button-gender-${option.value}`}
              >
                {data.gender === option.value && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-medical-blue rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
                <div className="text-2xl md:text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{option.emoji}</div>
                <div className="text-sm md:text-base font-semibold">{option.label}</div>
              </button>
            ))}
          </div>
          
          {/* Other option as separate button */}
          <button
            type="button"
            onClick={() => onUpdate({ gender: 'other' as any })}
            className={`w-full mt-3 p-3 rounded-xl border-2 transition-all duration-200 text-center ${
              data.gender === 'other'
                ? 'border-medical-blue bg-gradient-to-br from-medical-blue/15 to-blue-500/10 text-medical-blue shadow-lg'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'
            }`}
            data-testid="button-gender-other"
          >
            <span className="text-sm font-medium">👤 Предпочитаю не указывать</span>
          </button>
        </CardContent>
      </Card>

      {/* Height & Weight - Enhanced Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Height */}
        <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-orange-500/15 to-amber-500/10 rounded-xl border border-orange-200 dark:border-orange-800 shadow-sm">
                  <Ruler className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <Label className="text-sm md:text-base font-semibold text-foreground block">
                    Рост
                  </Label>
                  <p className="text-xs text-muted-foreground">В сантиметрах</p>
                </div>
              </div>
              {data.height && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="175"
                value={data.height || ""}
                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                className="h-12 text-base pl-4 pr-12 bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                data-testid="input-height"
                min={100}
                max={250}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <span className="text-slate-500 text-sm font-medium">см</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weight */}
        <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-500/15 to-violet-500/10 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
                  <Weight className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <Label className="text-sm md:text-base font-semibold text-foreground block">
                    Вес
                  </Label>
                  <p className="text-xs text-muted-foreground">В килограммах</p>
                </div>
              </div>
              {data.weight && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="70"
                value={data.weight || ""}
                onChange={(e) => handleWeightChange(parseInt(e.target.value) || 0)}
                className="h-12 text-base pl-4 pr-12 bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                data-testid="input-weight"
                min={30}
                max={300}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <span className="text-slate-500 text-sm font-medium">кг</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BMI Calculator - Medical-grade Display */}
      {data.height && data.weight && data.bmi && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 border border-slate-200/50 dark:border-slate-600/50">
          <CardContent className="p-5 md:p-7">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-gradient-to-br from-medical-blue/20 to-trust-green/15 rounded-2xl border border-medical-blue/30 shadow-sm">
                  <Calculator className="w-6 h-6 text-medical-blue" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
                    Индекс массы тела
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Медицинский показатель соотношения роста и веса
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold text-medical-blue">
                  {data.bmi}
                </div>
                <p className="text-xs text-muted-foreground mt-1">кг/м²</p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-slate-200/50 dark:border-slate-600/50 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${getBMIColor(data.bmi)} border`}>
                    {getBMIIcon(data.bmi)}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Категория ИМТ</div>
                    <div className="text-lg font-bold">{getBMICategory(data.bmi)}</div>
                  </div>
                </div>
                <Badge className={`${getBMIColor(data.bmi)} border-2 px-3 py-1.5 text-sm font-bold rounded-full shadow-sm`}>
                  {data.bmi < 18.5 ? '⚠️' : data.bmi < 25 ? '✅' : data.bmi < 30 ? '⚠️' : '🚨'} ИМТ {data.bmi}
                </Badge>
              </div>
              
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-medical-blue/15 rounded-lg flex-shrink-0">
                    <Info className="w-4 h-4 text-medical-blue" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Медицинская рекомендация</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{getBMIAdvice(data.bmi)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}