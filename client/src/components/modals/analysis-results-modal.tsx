import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Lightbulb, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
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
      <DialogContent className="max-w-md mx-auto h-[90vh] p-0 gap-0">
        {/* Header */}
        <div className="bg-card p-4 border-b border-border flex items-center justify-between rounded-t-lg">
          <h3 className="text-lg font-bold text-card-foreground">Результаты анализа</h3>
          <Button
            data-testid="button-close-analysis"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-accent"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4 max-h-96">
          <div className="space-y-6">
            {/* Analysis Date and Overall Status */}
            <div>
              <p className="text-sm text-muted-foreground" data-testid="text-analysis-date">
                Дата анализа: {analysis.analyzedAt ? formatDate(analysis.analyzedAt) : formatDate(analysis.createdAt)}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <div className={`w-3 h-3 rounded-full ${overallStatus === "normal" ? "bg-trust-green" : "bg-warning-amber"}`}></div>
                <span className={`text-sm font-medium ${overallStatus === "normal" ? "text-trust-green" : "text-warning-amber"}`} data-testid="text-overall-status">
                  {overallStatus === "normal" ? "В норме (все показатели)" : "Требует внимания (есть отклонения)"}
                </span>
              </div>
            </div>

            {/* Biomarker Results */}
            <div className="space-y-4">
              {biomarkerResults?.map((result: any) => (
                <div 
                  key={result.id} 
                  className={`border rounded-xl p-4 ${getBorderColor(result.status)}`}
                  data-testid={`biomarker-result-${result.biomarker?.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-card-foreground">{result.biomarker?.name}</h4>
                    <Badge className={getStatusColor(result.status)} data-testid={`badge-status-${result.status}`}>
                      {getStatusIcon(result.status)}
                      <span className="ml-1">{getStatusText(result.status)}</span>
                    </Badge>
                  </div>
                  
                  <div className={`text-2xl font-bold mb-1 ${
                    result.status === "normal" ? "text-card-foreground" : 
                    result.status === "critical" ? "text-error-red" : "text-warning-amber"
                  }`} data-testid={`value-${result.biomarker?.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {result.value} {result.unit}
                  </div>
                  
                  {result.biomarker?.normalRange && (
                    <p className="text-xs text-muted-foreground mb-2" data-testid={`range-${result.biomarker?.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      Норма: {result.biomarker.normalRange.min} - {result.biomarker.normalRange.max} {result.biomarker.normalRange.unit}
                    </p>
                  )}
                  
                  <p className="text-sm text-card-foreground">
                    {result.biomarker?.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {hasAbnormalResults && (
              <div className="bg-medical-blue/5 rounded-xl p-4">
                <h4 className="font-semibold text-card-foreground mb-3 flex items-center">
                  <Lightbulb className="w-5 h-5 text-medical-blue mr-2" />
                  Рекомендации
                </h4>
                <ul className="space-y-2 text-sm text-card-foreground">
                  <li className="flex items-start" data-testid="recommendation-diet">
                    <CheckCircle className="w-4 h-4 text-trust-green mr-2 mt-0.5 flex-shrink-0" />
                    Снизить потребление насыщенных жиров
                  </li>
                  <li className="flex items-start" data-testid="recommendation-exercise">
                    <CheckCircle className="w-4 h-4 text-trust-green mr-2 mt-0.5 flex-shrink-0" />
                    Увеличить физическую активность до 150 мин/неделя
                  </li>
                  <li className="flex items-start" data-testid="recommendation-doctor">
                    <CheckCircle className="w-4 h-4 text-trust-green mr-2 mt-0.5 flex-shrink-0" />
                    Консультация кардиолога в ближайшие 2 недели
                  </li>
                  <li className="flex items-start" data-testid="recommendation-retest">
                    <CheckCircle className="w-4 h-4 text-trust-green mr-2 mt-0.5 flex-shrink-0" />
                    Повторный анализ через 3 месяца
                  </li>
                </ul>
              </div>
            )}

            {/* Trends Section */}
            <div className="bg-accent/50 rounded-xl p-4">
              <h4 className="font-semibold text-card-foreground mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 text-medical-blue mr-2" />
                Тенденции
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-card-foreground">Общий холестерин</span>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4 text-warning-amber" />
                    <span className="text-warning-amber font-medium">Повышен</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-card-foreground">Функция почек</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-trust-green" />
                    <span className="text-trust-green font-medium">Норма</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-card-foreground">Гемоглобин</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-trust-green" />
                    <span className="text-trust-green font-medium">Стабильно</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h4 className="font-semibold text-card-foreground mb-3">Следующие шаги</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Следуйте рекомендациям по питанию и образу жизни</p>
                <p>• Запишитесь на консультацию к специалисту</p>
                <p>• Повторите анализы через рекомендованный период</p>
                <p>• Ведите дневник здоровья для отслеживания прогресса</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex space-x-3">
            <Button
              data-testid="button-download-report"
              variant="outline"
              className="flex-1"
            >
              Скачать отчет
            </Button>
            <Button
              data-testid="button-share-with-doctor"
              className="flex-1 bg-medical-blue hover:bg-medical-blue/90 text-white"
            >
              Поделиться с врачом
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
