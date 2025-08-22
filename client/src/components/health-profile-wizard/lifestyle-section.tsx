import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdate({ dietType: "standard" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.dietType === "standard"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Обычное
          </button>
          <button
            onClick={() => onUpdate({ dietType: "vegetarian" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.dietType === "vegetarian"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Вегетарианское
          </button>
          <button
            onClick={() => onUpdate({ dietType: "vegan" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.dietType === "vegan"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Веганское
          </button>
          <button
            onClick={() => onUpdate({ dietType: "keto" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.dietType === "keto"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Кето
          </button>
          <button
            onClick={() => onUpdate({ dietType: "mediterranean" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.dietType === "mediterranean"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Средиземноморское
          </button>
          <button
            onClick={() => onUpdate({ dietType: "other" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.dietType === "other"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Другое
          </button>
        </div>
      </div>
      
      {/* Smoking Status */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Cigarette className="w-4 h-4" />
          <span>Курение</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdate({ smokingStatus: "never" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.smokingStatus === "never"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Никогда
          </button>
          <button
            onClick={() => onUpdate({ smokingStatus: "former" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.smokingStatus === "former"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Бросил
          </button>
          <button
            onClick={() => onUpdate({ smokingStatus: "occasional" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.smokingStatus === "occasional"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Иногда
          </button>
          <button
            onClick={() => onUpdate({ smokingStatus: "regular" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.smokingStatus === "regular"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Регулярно
          </button>
        </div>
      </div>
      
      {/* Alcohol Consumption */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Wine className="w-4 h-4" />
          <span>Употребление алкоголя</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdate({ alcoholConsumption: "none" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.alcoholConsumption === "none"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Не употребляю
          </button>
          <button
            onClick={() => onUpdate({ alcoholConsumption: "occasional" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.alcoholConsumption === "occasional"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Редко
          </button>
          <button
            onClick={() => onUpdate({ alcoholConsumption: "moderate" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.alcoholConsumption === "moderate"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Умеренно
          </button>
          <button
            onClick={() => onUpdate({ alcoholConsumption: "heavy" })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.alcoholConsumption === "heavy"
                ? "bg-medical-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Часто
          </button>
        </div>
      </div>
      
      {/* Water and Caffeine Intake */}
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
          <Label htmlFor="water" className="flex items-center justify-between mb-3">
            <span className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Вода</span>
            </span>
            <span className="text-2xl font-bold text-blue-500">
              {data.waterIntake || 0}
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
        </div>
        
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
          <Label htmlFor="caffeine" className="flex items-center justify-between mb-3">
            <span className="flex items-center space-x-2">
              <Coffee className="w-5 h-5 text-amber-600" />
              <span className="font-medium">Кофеин</span>
            </span>
            <span className="text-2xl font-bold text-amber-600">
              {data.caffeineIntake || 0}
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
        </div>
      </div>
    </div>
  );
}