import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { HealthProfile } from "@shared/schema";

interface HealthProfileCardProps {
  profile?: HealthProfile;
}

export default function HealthProfileCard({ profile }: HealthProfileCardProps) {
  const completionPercentage = profile?.completionPercentage || 0;

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Профиль здоровья</CardTitle>
          <div className="w-8 h-8 bg-trust-green rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold" data-testid="profile-completion-badge">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3" data-testid="profile-completion-text">
          Профиль заполнен на {completionPercentage}%
        </p>
        
        <div className="w-full bg-muted rounded-full h-2 mb-3">
          <div 
            className="bg-trust-green h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
            data-testid="profile-completion-bar"
          ></div>
        </div>
        
        <Link href="/profile">
          <Button 
            data-testid="button-complete-profile"
            variant="ghost" 
            className="w-full justify-between text-medical-blue hover:text-medical-blue"
          >
            {completionPercentage < 100 ? "Дополнить профиль" : "Редактировать профиль"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
