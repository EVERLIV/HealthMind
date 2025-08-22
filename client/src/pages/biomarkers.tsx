import { useQuery } from "@tanstack/react-query";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Zap, Shield, Activity, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

const iconMap = {
  blood: Heart,
  cardiovascular: Heart,
  metabolic: Zap,
  kidney: Shield,
  liver: Activity,
  immune: Shield,
};

const importanceColors = {
  high: "bg-error-red text-white",
  medium: "bg-warning-amber text-white",
  low: "bg-muted text-muted-foreground",
};

export default function Biomarkers() {
  const { data: biomarkers, isLoading } = useQuery({
    queryKey: ["/api/biomarkers"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-health-bg">
        <MobileNav />
        <main className="max-w-md mx-auto px-4 py-6 pb-20">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-health-bg">
      <MobileNav />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Биомаркеры</h1>
          <p className="text-muted-foreground">Подробная информация о показателях здоровья</p>
        </div>

        {/* Biomarkers List */}
        <div className="space-y-4">
          {biomarkers?.map((biomarker) => {
            const IconComponent = iconMap[biomarker.category as keyof typeof iconMap] || Activity;
            
            return (
              <Card key={biomarker.id} data-testid={`card-biomarker-${biomarker.id}`} className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-medical-blue/10 rounded-full flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-medical-blue" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{biomarker.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">{biomarker.category}</p>
                      </div>
                    </div>
                    <Badge 
                      className={importanceColors[biomarker.importance as keyof typeof importanceColors]}
                      data-testid={`badge-importance-${biomarker.importance}`}
                    >
                      {biomarker.importance === 'high' ? 'Высокий' : 
                       biomarker.importance === 'medium' ? 'Средний' : 'Низкий'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-card-foreground">{biomarker.description}</p>
                  
                  {biomarker.normalRange && (
                    <div className="bg-accent/50 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-1 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-medical-blue" />
                        Нормальные значения
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {biomarker.normalRange.min} - {biomarker.normalRange.max} {biomarker.normalRange.unit}
                      </p>
                    </div>
                  )}
                  
                  {biomarker.recommendations && biomarker.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-trust-green" />
                        Рекомендации
                      </h4>
                      <ul className="space-y-1">
                        {biomarker.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start">
                            <span className="w-1 h-1 bg-trust-green rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Educational Note */}
        <Card className="mt-6 border-medical-blue/20 bg-medical-blue/5">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-medical-blue mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm text-medical-blue mb-1">Важная информация</h4>
                <p className="text-xs text-muted-foreground">
                  Данная информация носит образовательный характер и не заменяет профессиональную медицинскую консультацию. 
                  При отклонениях от нормы обратитесь к врачу.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
