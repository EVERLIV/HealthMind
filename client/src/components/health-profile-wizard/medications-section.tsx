import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X, Pill, Leaf } from "lucide-react";
import type { HealthProfileData } from "./index";

interface MedicationsSectionProps {
  data: HealthProfileData;
  onUpdate: (data: Partial<HealthProfileData>) => void;
}

export default function MedicationsSection({ data, onUpdate }: MedicationsSectionProps) {
  const [newMedication, setNewMedication] = useState({ name: "", dosage: "", frequency: "" });
  const [newSupplement, setNewSupplement] = useState({ name: "", dosage: "" });
  
  const addMedication = () => {
    if (newMedication.name.trim()) {
      const medications = data.currentMedications || [];
      onUpdate({ currentMedications: [...medications, { ...newMedication }] });
      setNewMedication({ name: "", dosage: "", frequency: "" });
    }
  };
  
  const removeMedication = (index: number) => {
    const medications = data.currentMedications || [];
    onUpdate({ currentMedications: medications.filter((_, i) => i !== index) });
  };
  
  const addSupplement = () => {
    if (newSupplement.name.trim()) {
      const supplements = data.supplements || [];
      onUpdate({ supplements: [...supplements, { ...newSupplement }] });
      setNewSupplement({ name: "", dosage: "" });
    }
  };
  
  const removeSupplement = (index: number) => {
    const supplements = data.supplements || [];
    onUpdate({ supplements: supplements.filter((_, i) => i !== index) });
  };
  
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Лекарства и добавки</h3>
        <p className="text-sm text-muted-foreground">
          Укажите все принимаемые препараты для учета взаимодействий
        </p>
      </div>
      
      {/* Current Medications */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Pill className="w-4 h-4" />
          <span>Текущие лекарства</span>
        </Label>
        <Card className="p-4 bg-light-blue border-0">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                placeholder="Название"
                value={newMedication.name}
                onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                className="rounded-full"
                data-testid="input-med-name"
              />
              <Input
                placeholder="Дозировка"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                className="rounded-full"
                data-testid="input-med-dosage"
              />
              <div className="flex space-x-2">
                <Input
                  placeholder="Частота"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                  onKeyPress={(e) => e.key === "Enter" && addMedication()}
                  className="rounded-full"
                  data-testid="input-med-frequency"
                />
                <Button onClick={addMedication} size="sm" className="rounded-full bg-medical-blue hover:bg-medical-blue/90 px-4">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {data.currentMedications && data.currentMedications.length > 0 && (
              <div className="space-y-2 mt-3">
                {data.currentMedications.map((med, index) => (
                  <Card key={index} className="p-3 bg-white dark:bg-card flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage} • {med.frequency}
                      </p>
                    </div>
                    <button
                      onClick={() => removeMedication(index)}
                      className="ml-2 p-1 hover:bg-destructive/20 rounded"
                      data-testid={`remove-med-${index}`}
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Supplements */}
      <div className="space-y-3">
        <Label className="flex items-center space-x-2">
          <Leaf className="w-4 h-4" />
          <span>БАДы и витамины</span>
        </Label>
        <Card className="p-4 bg-light-blue border-0">
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Название"
                value={newSupplement.name}
                onChange={(e) => setNewSupplement({ ...newSupplement, name: e.target.value })}
                className="flex-1 rounded-full"
                data-testid="input-supp-name"
              />
              <Input
                placeholder="Дозировка"
                value={newSupplement.dosage}
                onChange={(e) => setNewSupplement({ ...newSupplement, dosage: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && addSupplement()}
                className="flex-1 rounded-full"
                data-testid="input-supp-dosage"
              />
              <Button onClick={addSupplement} size="sm" className="rounded-full bg-trust-green hover:bg-trust-green/90 px-4">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {data.supplements && data.supplements.length > 0 && (
              <div className="space-y-2 mt-3">
                {data.supplements.map((supp, index) => (
                  <Card key={index} className="p-3 bg-white dark:bg-card flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{supp.name}</p>
                      {supp.dosage && (
                        <p className="text-xs text-muted-foreground">{supp.dosage}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeSupplement(index)}
                      className="ml-2 p-1 hover:bg-destructive/20 rounded"
                      data-testid={`remove-supp-${index}`}
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Warning Card */}
      <Card className="p-4 bg-warning-amber/10 border-warning-amber/20">
        <div className="flex items-start space-x-3">
          <Pill className="w-5 h-5 text-warning-amber mt-0.5" />
          <div>
            <p className="font-medium text-sm mb-1">Важно</p>
            <p className="text-xs text-muted-foreground">
              Обязательно укажите все принимаемые препараты, включая безрецептурные. 
              Это поможет избежать опасных взаимодействий и получить корректные рекомендации.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}