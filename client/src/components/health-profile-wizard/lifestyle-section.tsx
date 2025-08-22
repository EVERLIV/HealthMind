import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Utensils, Cigarette, Wine, Droplets, Coffee } from "lucide-react";
import type { HealthProfileData } from "./index";

interface LifestyleSectionProps {
  data: HealthProfileData;
  onUpdate: (data: Partial<HealthProfileData>) => void;
}

export default function LifestyleSection({ data, onUpdate }: LifestyleSectionProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Образ жизни</h3>
        <p className="text-sm text-muted-foreground">
          Расскажите о ваших привычках
        </p>
      </div>
      
      {/* Diet Type */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Utensils className="w-4 h-4" />
          <span>Тип питания</span>
        </Label>
        <RadioGroup
          value={data.dietType || ""}
          onValueChange={(value) => onUpdate({ dietType: value as HealthProfileData["dietType"] })}
        >
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 hover:shadow-md transition-all cursor-pointer border hover:border-medical-blue/50 bg-card/50">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="cursor-pointer">Обычное</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vegetarian" id="vegetarian" />
                <Label htmlFor="vegetarian" className="cursor-pointer">Вегетарианское</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vegan" id="vegan" />
                <Label htmlFor="vegan" className="cursor-pointer">Веганское</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="keto" id="keto" />
                <Label htmlFor="keto" className="cursor-pointer">Кето</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mediterranean" id="mediterranean" />
                <Label htmlFor="mediterranean" className="cursor-pointer">Средиземноморское</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="cursor-pointer">Другое</Label>
              </div>
            </Card>
          </div>
        </RadioGroup>
      </div>
      
      {/* Smoking Status */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Cigarette className="w-4 h-4" />
          <span>Курение</span>
        </Label>
        <RadioGroup
          value={data.smokingStatus || ""}
          onValueChange={(value) => onUpdate({ smokingStatus: value as HealthProfileData["smokingStatus"] })}
        >
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 hover:shadow-md transition-all cursor-pointer border hover:border-medical-blue/50 bg-card/50">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="smoke-never" />
                <Label htmlFor="smoke-never" className="cursor-pointer">Никогда</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="former" id="former" />
                <Label htmlFor="former" className="cursor-pointer">Бросил</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="occasional" id="occasional" />
                <Label htmlFor="occasional" className="cursor-pointer">Иногда</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="regular" id="regular" />
                <Label htmlFor="regular" className="cursor-pointer">Регулярно</Label>
              </div>
            </Card>
          </div>
        </RadioGroup>
      </div>
      
      {/* Alcohol Consumption */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Wine className="w-4 h-4" />
          <span>Употребление алкоголя</span>
        </Label>
        <RadioGroup
          value={data.alcoholConsumption || ""}
          onValueChange={(value) => onUpdate({ alcoholConsumption: value as HealthProfileData["alcoholConsumption"] })}
        >
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 hover:shadow-md transition-all cursor-pointer border hover:border-medical-blue/50 bg-card/50">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="alc-none" />
                <Label htmlFor="alc-none" className="cursor-pointer">Не употребляю</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="occasional" id="alc-occasional" />
                <Label htmlFor="alc-occasional" className="cursor-pointer">Редко</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="moderate-alc" />
                <Label htmlFor="moderate-alc" className="cursor-pointer">Умеренно</Label>
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="heavy" id="heavy" />
                <Label htmlFor="heavy" className="cursor-pointer">Часто</Label>
              </div>
            </Card>
          </div>
        </RadioGroup>
      </div>
      
      {/* Water and Caffeine Intake */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-0">
          <Label htmlFor="water" className="flex items-center justify-between mb-3">
            <span className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Вода</span>
            </span>
            <span className="text-2xl font-bold text-blue-500">
              {data.waterIntake || 0} 🥤
            </span>
          </Label>
          <Input
            id="water"
            type="number"
            placeholder="8"
            value={data.waterIntake || ""}
            onChange={(e) => onUpdate({ waterIntake: parseInt(e.target.value) || undefined })}
            min={0}
            max={20}
            className="mb-2"
            data-testid="input-water"
          />
          <p className="text-xs text-muted-foreground">Стаканов в день (норма: 8)</p>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-0">
          <Label htmlFor="caffeine" className="flex items-center justify-between mb-3">
            <span className="flex items-center space-x-2">
              <Coffee className="w-5 h-5 text-amber-600" />
              <span className="font-medium">Кофеин</span>
            </span>
            <span className="text-2xl font-bold text-amber-600">
              {data.caffeineIntake || 0} ☕
            </span>
          </Label>
          <Input
            id="caffeine"
            type="number"
            placeholder="2"
            value={data.caffeineIntake || ""}
            onChange={(e) => onUpdate({ caffeineIntake: parseInt(e.target.value) || undefined })}
            min={0}
            max={10}
            className="mb-2"
            data-testid="input-caffeine"
          />
          <p className="text-xs text-muted-foreground">Чашек в день (норма: 1-2)</p>
        </Card>
      </div>
    </div>
  );
}