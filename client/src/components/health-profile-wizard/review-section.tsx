import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Edit2, User, Activity, Brain, Moon, Target, Heart, Pill } from "lucide-react";
import type { HealthProfileData } from "./index";

interface ReviewSectionProps {
  data: HealthProfileData;
  onUpdate: (data: Partial<HealthProfileData>) => void;
}

export default function ReviewSection({ data }: ReviewSectionProps) {
  const sections = [
    {
      title: "Личная информация",
      icon: User,
      items: [
        { label: "Возраст", value: data.age ? `${data.age} лет` : "Не указан" },
        { label: "Пол", value: data.gender === "male" ? "Мужской" : data.gender === "female" ? "Женский" : "Не указан" },
        { label: "Рост", value: data.height ? `${data.height} см` : "Не указан" },
        { label: "Вес", value: data.weight ? `${data.weight} кг` : "Не указан" },
        { label: "ИМТ", value: data.bmi ? data.bmi.toString() : "Не рассчитан" },
      ]
    },
    {
      title: "Физическое здоровье",
      icon: Activity,
      items: [
        { label: "Активность", value: data.activityLevel || "Не указана" },
        { label: "Тренировки", value: data.exerciseFrequency || "Не указаны" },
        { label: "Фитнес", value: data.fitnessLevel || "Не указан" },
      ]
    },
    {
      title: "Психическое здоровье",
      icon: Brain,
      items: [
        { label: "Стресс", value: data.stressLevel ? `${data.stressLevel}/10` : "Не указан" },
        { label: "Тревожность", value: data.anxietyLevel ? `${data.anxietyLevel}/10` : "Не указана" },
        { label: "Настроение", value: data.moodChanges || "Не указано" },
      ]
    },
    {
      title: "Сон",
      icon: Moon,
      items: [
        { label: "Часы сна", value: data.sleepHours ? `${data.sleepHours} часов` : "Не указано" },
        { label: "Качество", value: data.sleepQuality || "Не указано" },
        { label: "Проблемы", value: data.sleepProblems?.length ? `${data.sleepProblems.length} проблем` : "Нет" },
      ]
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-trust-green/20 to-emerald-500/20 rounded-full flex items-center justify-center">
          <Check className="w-10 h-10 text-trust-green" />
        </div>
        <p className="text-sm text-muted-foreground">
          Проверьте ваши данные
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5 text-medical-blue" />
                  <h4 className="font-medium">{section.title}</h4>
                </div>
                <Check className="w-4 h-4 text-trust-green" />
              </div>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}:</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Health Goals */}
      {data.healthGoals && data.healthGoals.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-5 h-5 text-medical-blue" />
            <h4 className="font-medium">Цели здоровья</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.healthGoals.map((goal) => (
              <Badge key={goal} variant="secondary">
                {goal.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
          {data.primaryGoal && (
            <p className="text-sm text-muted-foreground mt-3">
              <span className="font-medium">Главная цель:</span> {data.primaryGoal}
            </p>
          )}
        </Card>
      )}
      
      {/* Medical History */}
      {(data.chronicConditions?.length || data.allergies?.length) ? (
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Heart className="w-5 h-5 text-medical-blue" />
            <h4 className="font-medium">Медицинская информация</h4>
          </div>
          {data.chronicConditions && data.chronicConditions.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-muted-foreground mb-2">Хронические заболевания:</p>
              <div className="flex flex-wrap gap-2">
                {data.chronicConditions.map((condition, index) => (
                  <Badge key={index} variant="outline">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {data.allergies && data.allergies.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Аллергии:</p>
              <div className="flex flex-wrap gap-2">
                {data.allergies.map((allergy, index) => (
                  <Badge key={index} variant="outline" className="border-warning-amber text-warning-amber">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      ) : null}
      
      {/* Medications */}
      {(data.currentMedications?.length || data.supplements?.length) ? (
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Pill className="w-5 h-5 text-medical-blue" />
            <h4 className="font-medium">Лекарства и добавки</h4>
          </div>
          {data.currentMedications && data.currentMedications.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-muted-foreground mb-2">Лекарства:</p>
              <div className="space-y-1">
                {data.currentMedications.map((med, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{med.name}</span>
                    <span className="text-muted-foreground"> • {med.dosage} • {med.frequency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.supplements && data.supplements.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">БАДы:</p>
              <div className="space-y-1">
                {data.supplements.map((supp, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{supp.name}</span>
                    {supp.dosage && <span className="text-muted-foreground"> • {supp.dosage}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ) : null}
      
      {/* Success Message */}
      <Card className="p-4 bg-trust-green/10 border-trust-green/20">
        <div className="flex items-start space-x-3">
          <Check className="w-5 h-5 text-trust-green mt-0.5" />
          <div>
            <p className="font-medium text-sm mb-1">Готово к сохранению!</p>
            <p className="text-xs text-muted-foreground">
              Ваш профиль здоровья готов. После сохранения мы проанализируем данные 
              и предоставим персонализированные рекомендации для улучшения вашего здоровья.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}