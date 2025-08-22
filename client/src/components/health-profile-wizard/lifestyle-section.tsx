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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Образ жизни</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Расскажите о ваших привычках и образе жизни
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
            <Card className="p-3 hover:bg-accent transition-colors">
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
            <Card className="p-3 hover:bg-accent transition-colors">
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
            <Card className="p-3 hover:bg-accent transition-colors">
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="water" className="flex items-center space-x-2">
            <Droplets className="w-4 h-4" />
            <span>Вода (стаканов/день)</span>
          </Label>
          <Input
            id="water"
            type="number"
            placeholder="8"
            value={data.waterIntake || ""}
            onChange={(e) => onUpdate({ waterIntake: parseInt(e.target.value) || undefined })}
            min={0}
            max={20}
            data-testid="input-water"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="caffeine" className="flex items-center space-x-2">
            <Coffee className="w-4 h-4" />
            <span>Кофеин (чашек/день)</span>
          </Label>
          <Input
            id="caffeine"
            type="number"
            placeholder="2"
            value={data.caffeineIntake || ""}
            onChange={(e) => onUpdate({ caffeineIntake: parseInt(e.target.value) || undefined })}
            min={0}
            max={10}
            data-testid="input-caffeine"
          />
        </div>
      </div>
    </div>
  );
}