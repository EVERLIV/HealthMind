import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconContainer, iconSizes } from "@/components/ui/icon-container";
import { 
  X, 
  Lightbulb, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Brain,
  Sparkles,
  Download,
  Share,
  Activity,
  Heart
} from "lucide-react";
import type { BloodAnalysis } from "@shared/schema";

interface AnalysisResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis?: BloodAnalysis;
}

export default function AnalysisResultsModal({ open, onOpenChange, analysis }: AnalysisResultsModalProps) {
  const { data: biomarkerResults } = useQuery({
    queryKey: ["/api/blood-analyses", analysis?.id, "biomarker-results"],
    enabled: !!analysis?.id && open,
  });

  if (!analysis) {
    return null;
  }

  // Check if we have AI analysis results
  const hasAIResults = analysis.results && analysis.results.markers && analysis.results.markers.length > 0;

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ru-RU');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-trust-green text-white";
      case "high":
      case "low":
        return "bg-warning-amber text-white";
      case "critical":
        return "bg-error-red text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "normal":
        return "Норма";
      case "high":
        return "Повышен";
      case "low":
        return "Понижен";
      case "critical":
        return "Критично";
      default:
        return "Неизвестно";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <CheckCircle className="w-4 h-4" />;
      case "high":
      case "low":
        return <AlertTriangle className="w-4 h-4" />;
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case "normal":
        return "border-trust-green/20 bg-trust-green/5";
      case "high":
      case "low":
        return "border-warning-amber/20 bg-warning-amber/5";
      case "critical":
        return "border-error-red/20 bg-error-red/5";
      default:
        return "border-border";
    }
  };

  // Check overall health status
  const hasAbnormalResults = biomarkerResults?.some((result: any) => result.status !== "normal");
  const overallStatus = hasAbnormalResults ? "attention" : "normal";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto h-[90vh] p-0 gap-0 bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-3xl overflow-hidden">
        <DialogTitle className="sr-only">Результаты анализа крови</DialogTitle>
        <DialogDescription className="sr-only">Подробные результаты вашего анализа крови с рекомендациями</DialogDescription>
        
        {/* EVA Header with Gradient */}
        <div className="eva-gradient-primary relative overflow-hidden">
          <div className="p-6 text-white relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <IconContainer size="sm" variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Brain className={iconSizes.sm} />
                </IconContainer>
                <div>
                  <h3 className="text-lg font-bold">ИИ Анализ</h3>
                  <p className="text-white/90 text-sm">Результаты готовы</p>
                </div>
              </div>
              <Button
                data-testid="button-close-analysis"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Overall Status Indicator */}
            <div className="bg-white/15 rounded-2xl p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${overallStatus === "normal" ? "bg-green-400" : "bg-amber-400"} animate-pulse`}></div>
                  <span className="text-sm font-medium">
                    {overallStatus === "normal" ? "Все в норме" : "Требует внимания"}
                  </span>
                </div>
                {hasAIResults && (
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    {analysis.results.markers.length} показателей
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        <ScrollArea className="flex-1 p-4 max-h-96">
          <div className="space-y-6">
            {/* Analysis Date */}
            <div className="eva-mobile-spacing bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <p className="text-sm text-muted-foreground eva-mobile-text" data-testid="text-analysis-date">
                Дата анализа: {analysis.analyzedAt ? formatDate(analysis.analyzedAt) : formatDate(analysis.createdAt)}
              </p>
            </div>

            {/* AI Analysis Results */}
            {hasAIResults && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <IconContainer size="sm" variant="soft-primary">
                    <Sparkles className={iconSizes.sm} />
                  </IconContainer>
                  <h4 className="font-bold text-card-foreground">ИИ Анализ биомаркеров</h4>
                </div>
                
                <div className="space-y-3">
                  {analysis.results.markers.map((marker: any, index: number) => {
                    const getMarkerIcon = (status: string) => {
                      switch (status) {
                        case "normal": return CheckCircle;
                        case "high": 
                        case "low": return AlertTriangle;
                        case "critical": return AlertTriangle;
                        default: return Activity;
                      }
                    };

                    const getMarkerVariant = (status: string) => {
                      switch (status) {
                        case "normal": return "soft-success";
                        case "high": 
                        case "low": return "soft-warning"; 
                        case "critical": return "soft-danger";
                        default: return "soft-neutral";
                      }
                    };

                    const MarkerIcon = getMarkerIcon(marker.status);
                    
                    return (
                      <div 
                        key={index} 
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                        data-testid={`ai-marker-${marker.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <IconContainer size="xs" variant={getMarkerVariant(marker.status)}>
                            <MarkerIcon className={iconSizes.xs} />
                          </IconContainer>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-semibold text-card-foreground text-sm truncate">{marker.name}</h5>
                              <Badge 
                                className={`eva-mobile-text ${getStatusColor(marker.status)} ml-2 flex-shrink-0`} 
                                data-testid={`ai-badge-${marker.status}`}
                              >
                                {getStatusText(marker.status)}
                              </Badge>
                            </div>
                            
                            <div className={`text-xl font-bold mb-2 ${
                              marker.status === "normal" ? "text-emerald-600" : 
                              marker.status === "critical" ? "text-red-600" : "text-amber-600"
                            }`}>
                              {marker.value} {marker.unit}
                            </div>
                            
                            {marker.referenceRange && (
                              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2 mb-2">
                                <p className="text-xs text-muted-foreground font-medium">
                                  Референсный диапазон: {marker.referenceRange}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Section */}
                {analysis.results.summary && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <IconContainer size="sm" variant="soft-info">
                        <Brain className={iconSizes.sm} />
                      </IconContainer>
                      <div>
                        <h5 className="font-semibold text-card-foreground mb-2">Заключение ИИ</h5>
                        <p className="text-sm text-card-foreground leading-relaxed">{analysis.results.summary}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.results.recommendations && analysis.results.recommendations.length > 0 && (
                  <div className="eva-gradient-success rounded-2xl p-4 text-white">
                    <div className="flex items-start gap-3">
                      <IconContainer size="sm" className="bg-white/20 text-white border-white/30">
                        <Lightbulb className={iconSizes.sm} />
                      </IconContainer>
                      <div>
                        <h5 className="font-semibold mb-3">Рекомендации специалиста</h5>
                        <ul className="space-y-2">
                          {analysis.results.recommendations.map((recommendation: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0"></div>
                              <span className="leading-relaxed">{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Traditional Biomarker Results */}
            {biomarkerResults && biomarkerResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <IconContainer size="sm" variant="soft-info">
                    <Activity className={iconSizes.sm} />
                  </IconContainer>
                  <h4 className="font-bold text-card-foreground">Детальные показатели</h4>
                </div>
                
                <div className="space-y-3">
                  {biomarkerResults.map((result: any) => (
                    <div 
                      key={result.id} 
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm"
                      data-testid={`biomarker-result-${result.biomarker?.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-start gap-3">
                        <IconContainer size="xs" variant={result.status === "normal" ? "soft-success" : result.status === "critical" ? "soft-danger" : "soft-warning"}>
                          {result.status === "normal" ? <CheckCircle className={iconSizes.xs} /> : <AlertTriangle className={iconSizes.xs} />}
                        </IconContainer>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-card-foreground text-sm">{result.biomarker?.name}</h5>
                            <Badge className={`eva-mobile-text ${getStatusColor(result.status)} flex-shrink-0`} data-testid={`badge-status-${result.status}`}>
                              {getStatusText(result.status)}
                            </Badge>
                          </div>
                          
                          <div className={`text-xl font-bold mb-2 ${
                            result.status === "normal" ? "text-emerald-600" : 
                            result.status === "critical" ? "text-red-600" : "text-amber-600"
                          }`} data-testid={`value-${result.biomarker?.name.toLowerCase().replace(/\s+/g, '-')}`}>
                            {result.value} {result.unit}
                          </div>
                          
                          {result.biomarker?.normalRange && (
                            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2 mb-2">
                              <p className="text-xs text-muted-foreground font-medium" data-testid={`range-${result.biomarker?.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                Норма: {result.biomarker.normalRange.min} - {result.biomarker.normalRange.max} {result.biomarker.normalRange.unit}
                              </p>
                            </div>
                          )}
                          
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {result.biomarker?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Health Insights */}
            {hasAbnormalResults && (
              <div className="eva-gradient-wellness rounded-2xl p-4 text-white">
                <div className="flex items-start gap-3">
                  <IconContainer size="sm" className="bg-white/20 text-white border-white/30">
                    <Heart className={iconSizes.sm} />
                  </IconContainer>
                  <div>
                    <h4 className="font-bold mb-3">Персональные рекомендации</h4>
                    <div className="space-y-3">
                      <div className="bg-white/15 rounded-xl p-3">
                        <p className="text-sm font-medium mb-1">💪 Образ жизни</p>
                        <p className="text-sm text-white/90">Увеличьте физическую активность до 150 мин/неделю</p>
                      </div>
                      <div className="bg-white/15 rounded-xl p-3">
                        <p className="text-sm font-medium mb-1">🥗 Питание</p>
                        <p className="text-sm text-white/90">Снизьте потребление насыщенных жиров</p>
                      </div>
                      <div className="bg-white/15 rounded-xl p-3">
                        <p className="text-sm font-medium mb-1">👨‍⚕️ Специалист</p>
                        <p className="text-sm text-white/90">Консультация кардиолога в ближайшие 2 недели</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* EVA Footer Actions */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <Button
              data-testid="button-download-report"
              variant="outline"
              className="eva-mobile-touch flex items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-medical-blue hover:text-medical-blue transition-all duration-200"
            >
              <IconContainer size="xs" variant="soft-primary">
                <Download className={iconSizes.xs} />
              </IconContainer>
              <span className="eva-mobile-text font-medium">Отчет</span>
            </Button>
            <Button
              data-testid="button-share-with-doctor"
              className="eva-mobile-touch eva-gradient-primary text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 border-0"
            >
              <IconContainer size="xs" className="bg-white/20 text-white border-white/30">
                <Share className={iconSizes.xs} />
              </IconContainer>
              <span className="eva-mobile-text font-medium">Врачу</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
