import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplets } from "lucide-react";
import type { BloodAnalysis } from "@shared/schema";

interface BloodAnalysisCardProps {
  analysis?: BloodAnalysis;
  onViewResults: () => void;
}

export default function BloodAnalysisCard({ analysis, onViewResults }: BloodAnalysisCardProps) {
  if (!analysis) {
    return (
      <Card className="shadow-sm border border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Анализ крови</CardTitle>
            <Badge variant="outline" data-testid="badge-no-analysis">Нет данных</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Загрузите первый анализ крови</p>
          <div className="text-center py-2 text-muted-foreground">
            <Droplets className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Анализы не найдены</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "analyzed":
        return <Badge className="bg-trust-green text-white" data-testid="badge-analysis-ready">Готов</Badge>;
      case "analyzing":
        return <Badge variant="secondary" data-testid="badge-analysis-processing">Обработка</Badge>;
      case "pending":
        return <Badge variant="outline" data-testid="badge-analysis-pending">В очереди</Badge>;
      default:
        return <Badge variant="destructive" data-testid="badge-analysis-error">Ошибка</Badge>;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ru-RU');
  };

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Анализ крови</CardTitle>
          {getStatusBadge(analysis.status)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3" data-testid="text-analysis-date">
          Результаты от {analysis.analyzedAt ? formatDate(analysis.analyzedAt) : formatDate(analysis.createdAt)}
        </p>
        
        {analysis.status === "analyzed" ? (
          <Button
            data-testid="button-view-analysis"
            onClick={onViewResults}
            className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
          >
            Посмотреть результаты
          </Button>
        ) : analysis.status === "analyzing" ? (
          <div className="w-full py-2 text-center">
            <div className="animate-pulse text-sm text-muted-foreground">
              Анализируем ваши результаты...
            </div>
          </div>
        ) : (
          <Button
            data-testid="button-upload-analysis"
            variant="outline"
            className="w-full"
            disabled
          >
            Ожидание обработки
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
