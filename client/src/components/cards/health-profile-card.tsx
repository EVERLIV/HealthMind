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
    <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-blue-900/20 relative overflow-hidden hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/10"></div>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-purple-400/20 rounded-full blur-2xl"></div>
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mr-2 shadow-lg">
              <User className="w-4 h-4 text-white drop-shadow" />
            </div>
            Профиль здоровья
          </CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold drop-shadow" data-testid="profile-completion-badge">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-sm text-muted-foreground mb-3 font-medium" data-testid="profile-completion-text">
          Профиль заполнен на {completionPercentage}%
        </p>
        
        <div className="w-full bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-full h-3 mb-4 shadow-inner">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${completionPercentage}%` }}
            data-testid="profile-completion-bar"
          ></div>
        </div>
        
        <Link href="/app/profile">
          <Button 
            data-testid="button-complete-profile"
            className="w-full justify-between bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            {completionPercentage < 100 ? "Дополнить профиль" : "Редактировать профиль"}
            <ArrowRight className="w-4 h-4 drop-shadow" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
