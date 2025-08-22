import { useQuery } from "@tanstack/react-query";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Zap, Shield, Activity, TrendingUp, AlertCircle, CheckCircle, Droplets, Brain } from "lucide-react";

const iconMap = {
  blood: Droplets,
  cardiovascular: Heart,
  metabolic: Zap,
  kidney: Shield,
  liver: Activity,
  immune: Shield,
  brain: Brain,
};

const categoryColors = {
  blood: "text-error bg-error-light",
  cardiovascular: "text-primary bg-primary-light", 
  metabolic: "text-energy-orange bg-orange-50",
  kidney: "text-success bg-success-light",
  liver: "text-wellness-purple bg-purple-50",
  immune: "text-info bg-info-light",
  brain: "text-wellness-purple bg-purple-50",
};

const importanceStyles = {
  high: "eva-badge-error",
  medium: "eva-badge-warning", 
  low: "eva-badge eva-badge border-muted-foreground/20 bg-muted text-muted-foreground",
};

export default function Biomarkers() {
  const { data: biomarkers, isLoading } = useQuery({
    queryKey: ["/api/biomarkers"],
  });

  if (isLoading) {
    return (
      <div className="eva-page">
        <MobileNav />
        <main className="eva-page-content">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="eva-card p-5 eva-shimmer">
                <div className="eva-skeleton h-5 w-3/4 mb-3"></div>
                <div className="eva-skeleton h-4 w-1/2 mb-2"></div>
                <div className="eva-skeleton h-3 w-full"></div>
              </div>
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="eva-page">
      <MobileNav />
      
      <main className="eva-page-content">
        <div className="eva-page-header">
          <h1 className="eva-page-title">Биомаркеры</h1>
          <p className="eva-page-subtitle">Подробная информация о показателях здоровья</p>
        </div>

        {/* Summary Cards */}
        <div className="eva-grid-auto mb-6">
          <div className="eva-card p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{Array.isArray(biomarkers) ? biomarkers.length : 0}</div>
            <div className="text-sm text-muted-foreground">Всего маркеров</div>
          </div>
          <div className="eva-card p-4 text-center">
            <div className="text-2xl font-bold text-error mb-1">
              {Array.isArray(biomarkers) ? biomarkers.filter((b: any) => b.importance === 'high').length : 0}
            </div>
            <div className="text-sm text-muted-foreground">Критичных</div>
          </div>
        </div>

        {/* Biomarkers List */}
        <div className="space-y-4">
          {Array.isArray(biomarkers) && biomarkers.map((biomarker: any, index: number) => {
            const IconComponent = iconMap[biomarker.category as keyof typeof iconMap] || Activity;
            const categoryStyle = categoryColors[biomarker.category as keyof typeof categoryColors] || "text-muted-foreground bg-muted";
            
            return (
              <div 
                key={biomarker.id} 
                className="eva-card-interactive eva-slide-up" 
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`card-biomarker-${biomarker.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${categoryStyle}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">{biomarker.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">{biomarker.category}</p>
                      </div>
                    </div>
                    <div className={importanceStyles[biomarker.importance as keyof typeof importanceStyles]}>
                      {biomarker.importance === 'high' ? 'Высокий' : 
                       biomarker.importance === 'medium' ? 'Средний' : 'Низкий'}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed">{biomarker.description}</p>
                  
                  {biomarker.normalRange && (
                    <div className="eva-card bg-surface-1 border-0 p-4">
                      <h4 className="font-semibold text-sm mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                        Нормальные значения
                      </h4>
                      <div className="text-lg font-mono font-bold text-primary">
                        {biomarker.normalRange.min} - {biomarker.normalRange.max}
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          {biomarker.normalRange.unit}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {biomarker.recommendations && biomarker.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-success" />
                        Рекомендации
                      </h4>
                      <div className="space-y-2">
                        {biomarker.recommendations.map((recommendation: any, index: number) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-surface-1 rounded-lg">
                            <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm leading-relaxed">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
            );
          })}
        </div>

        {/* Educational Note - EVA Style */}
        <div className="eva-card border-primary/20 bg-primary-light p-5 mt-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-2">Важная информация</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Данная информация носит образовательный характер и не заменяет профессиональную медицинскую консультацию. 
                При отклонениях от нормы обратитесь к врачу.
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}