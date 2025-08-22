import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import HealthProfileWizard from "@/components/health-profile-wizard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Edit } from "lucide-react";

export default function HealthProfilePage() {
  const [, navigate] = useLocation();
  const [showWizard, setShowWizard] = useState(false);
  
  const { data: profile } = useQuery<any>({
    queryKey: ["/api/health-profile"],
  });
  
  const handleComplete = () => {
    setShowWizard(false);
    navigate("/");
  };
  
  if (showWizard || !profile?.profileData) {
    return (
      <div className="min-h-screen bg-background">
        <HealthProfileWizard 
          onComplete={handleComplete}
          initialData={profile?.profileData}
        />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold">Профиль здоровья</h1>
            </div>
            <Button
              onClick={() => setShowWizard(true)}
              className="bg-medical-blue hover:bg-medical-blue/90"
              data-testid="button-edit-profile"
            >
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          </div>
        </div>
      </div>
      
      {/* Profile Summary */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Personal Info */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-5 h-5 text-medical-blue" />
              <h3 className="font-semibold">Личная информация</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Возраст:</span>
                <span className="font-medium">{profile.profileData.age || "—"} лет</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Рост:</span>
                <span className="font-medium">{profile.profileData.height || "—"} см</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Вес:</span>
                <span className="font-medium">{profile.profileData.weight || "—"} кг</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ИМТ:</span>
                <span className="font-medium">{profile.profileData.bmi || "—"}</span>
              </div>
            </div>
          </Card>
          
          {/* Health Goals */}
          {profile.profileData.healthGoals && profile.profileData.healthGoals.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Цели здоровья</h3>
              <div className="flex flex-wrap gap-2">
                {profile.profileData.healthGoals.map((goal: string) => (
                  <span 
                    key={goal}
                    className="px-2 py-1 bg-light-blue rounded-md text-xs"
                  >
                    {goal.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </Card>
          )}
          
          {/* Medical Info */}
          {(profile.profileData.chronicConditions?.length > 0 || profile.profileData.allergies?.length > 0) && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Медицинская информация</h3>
              {profile.profileData.chronicConditions?.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground mb-1">Заболевания:</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.profileData.chronicConditions.map((condition: string, index: number) => (
                      <span key={index} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile.profileData.allergies?.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Аллергии:</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.profileData.allergies.map((allergy: string, index: number) => (
                      <span key={index} className="text-xs px-2 py-1 bg-warning-amber/20 text-warning-amber rounded">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}