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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Медицинская история</h3>
        <p className="text-sm text-muted-foreground mb-6">
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
            data-testid="input-condition"
          />
          <Button onClick={addCondition} size="sm" className="bg-medical-blue hover:bg-medical-blue/90">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {data.chronicConditions && data.chronicConditions.length > 0 && (
          <Card className="p-3 bg-light-blue border-0">
            <div className="flex flex-wrap gap-2">
              {data.chronicConditions.map((condition, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="pl-3 pr-1 py-1 flex items-center space-x-1"
                >
                  <span>{condition}</span>
                  <button
                    onClick={() => removeCondition(index)}
                    className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                    data-testid={`remove-condition-${index}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </Card>
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
            data-testid="input-family-history"
          />
          <Button onClick={addFamilyHistory} size="sm" className="bg-medical-blue hover:bg-medical-blue/90">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {data.familyHistory && data.familyHistory.length > 0 && (
          <Card className="p-3 bg-light-blue border-0">
            <div className="flex flex-wrap gap-2">
              {data.familyHistory.map((item, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="pl-3 pr-1 py-1 flex items-center space-x-1"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => removeFamilyHistory(index)}
                    className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                    data-testid={`remove-history-${index}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </Card>
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
            data-testid="input-allergy"
          />
          <Button onClick={addAllergy} size="sm" className="bg-medical-blue hover:bg-medical-blue/90">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {data.allergies && data.allergies.length > 0 && (
          <Card className="p-3 bg-warning-amber/10 border-warning-amber/20">
            <div className="flex flex-wrap gap-2">
              {data.allergies.map((allergy, index) => (
                <Badge 
                  key={index} 
                  variant="outline"
                  className="pl-3 pr-1 py-1 flex items-center space-x-1 border-warning-amber text-warning-amber"
                >
                  <span>{allergy}</span>
                  <button
                    onClick={() => removeAllergy(index)}
                    className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                    data-testid={`remove-allergy-${index}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </div>
      
      {/* Info Card */}
      <Card className="p-4 bg-light-blue border-0">
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
      </Card>
    </div>
  );
}