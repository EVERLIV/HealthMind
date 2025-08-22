import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Heart, Users, AlertTriangle } from "lucide-react";
import type { HealthProfileData } from "./index";

interface MedicalHistorySectionProps {
  data: HealthProfileData;
  onUpdate: (data: Partial<HealthProfileData>) => void;
}

export default function MedicalHistorySection({ data, onUpdate }: MedicalHistorySectionProps) {
  const [newCondition, setNewCondition] = useState("");
  const [newFamilyHistory, setNewFamilyHistory] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  
  const addCondition = () => {
    if (newCondition.trim()) {
      const conditions = data.chronicConditions || [];
      onUpdate({ chronicConditions: [...conditions, newCondition.trim()] });
      setNewCondition("");
    }
  };
  
  const removeCondition = (index: number) => {
    const conditions = data.chronicConditions || [];
    onUpdate({ chronicConditions: conditions.filter((_, i) => i !== index) });
  };
  
  const addFamilyHistory = () => {
    if (newFamilyHistory.trim()) {
      const history = data.familyHistory || [];
      onUpdate({ familyHistory: [...history, newFamilyHistory.trim()] });
      setNewFamilyHistory("");
    }
  };
  
  const removeFamilyHistory = (index: number) => {
    const history = data.familyHistory || [];
    onUpdate({ familyHistory: history.filter((_, i) => i !== index) });
  };
  
  const addAllergy = () => {
    if (newAllergy.trim()) {
      const allergies = data.allergies || [];
      onUpdate({ allergies: [...allergies, newAllergy.trim()] });
      setNewAllergy("");
    }
  };
  
  const removeAllergy = (index: number) => {
    const allergies = data.allergies || [];
    onUpdate({ allergies: allergies.filter((_, i) => i !== index) });
  };
  
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Медицинская история</h3>
        <p className="text-sm text-muted-foreground">
          Эта информация поможет нам лучше понять ваше здоровье
        </p>
      </div>
      
      {/* Chronic Conditions */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Heart className="w-4 h-4" />
          <span>Хронические заболевания</span>
        </Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Например: Диабет, Гипертония..."
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCondition()}
            className="rounded-full"
            data-testid="input-condition"
          />
          <Button onClick={addCondition} size="sm" className="rounded-full bg-medical-blue hover:bg-medical-blue/90 px-4">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {data.chronicConditions && data.chronicConditions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.chronicConditions.map((condition, index) => (
              <button
                key={index}
                onClick={() => removeCondition(index)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-medical-blue text-white shadow-md hover:bg-medical-blue/90 transition-all flex items-center gap-2"
                data-testid={`remove-condition-${index}`}
              >
                <span>{condition}</span>
                <X className="w-3 h-3 opacity-70 hover:opacity-100" />
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Family History */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>Семейная история заболеваний</span>
        </Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Например: Диабет (мать), Рак (дед)..."
            value={newFamilyHistory}
            onChange={(e) => setNewFamilyHistory(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addFamilyHistory()}
            className="rounded-full"
            data-testid="input-family-history"
          />
          <Button onClick={addFamilyHistory} size="sm" className="rounded-full bg-medical-blue hover:bg-medical-blue/90 px-4">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {data.familyHistory && data.familyHistory.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.familyHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => removeFamilyHistory(index)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-trust-green text-white shadow-md hover:bg-trust-green/90 transition-all flex items-center gap-2"
                data-testid={`remove-history-${index}`}
              >
                <span>{item}</span>
                <X className="w-3 h-3 opacity-70 hover:opacity-100" />
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Allergies */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Аллергии</span>
        </Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Например: Пенициллин, Орехи, Пыльца..."
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addAllergy()}
            className="rounded-full"
            data-testid="input-allergy"
          />
          <Button onClick={addAllergy} size="sm" className="rounded-full bg-warning-amber hover:bg-warning-amber/90 px-4">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {data.allergies && data.allergies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.allergies.map((allergy, index) => (
              <button
                key={index}
                onClick={() => removeAllergy(index)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-warning-amber text-white shadow-md hover:bg-warning-amber/90 transition-all flex items-center gap-2"
                data-testid={`remove-allergy-${index}`}
              >
                <span>{allergy}</span>
                <X className="w-3 h-3 opacity-70 hover:opacity-100" />
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Info Card */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Heart className="w-5 h-5 text-medical-blue mt-0.5" />
          <div>
            <p className="font-medium text-sm mb-1">Конфиденциальность</p>
            <p className="text-xs text-muted-foreground">
              Вся медицинская информация строго конфиденциальна и используется только 
              для персонализации рекомендаций. Мы не передаем ваши данные третьим лицам.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}