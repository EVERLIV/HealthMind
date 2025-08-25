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
      <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 via-transparent to-gray-500/10"></div>
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center">
              <div className="p-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full mr-2">
                <Droplets className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              Анализ крови
            </CardTitle>
            <Badge variant="outline" className="bg-gray-100/50 dark:bg-gray-800/50" data-testid="badge-no-analysis">Нет данных</Badge>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-sm text-muted-foreground mb-3">Загрузите первый анализ крови</p>
          <div className="text-center py-4 text-muted-foreground bg-gray-100/30 dark:bg-gray-800/30 rounded-lg">
            <Droplets className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium">Анализы не найдены</p>
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
    <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 relative overflow-hidden hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10"></div>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-teal-400/20 rounded-full blur-2xl"></div>
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mr-2 shadow-lg">
              <Droplets className="w-4 h-4 text-white drop-shadow" />
            </div>
            Анализ крови
          </CardTitle>
          {getStatusBadge(analysis.status)}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-sm text-muted-foreground mb-3 font-medium" data-testid="text-analysis-date">
          Результаты от {formatDate(analysis.analyzedAt || analysis.createdAt)}
        </p>
        
        {analysis.status === "analyzed" ? (
          <Button
            data-testid="button-view-analysis"
            onClick={onViewResults}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            Посмотреть результаты
          </Button>
        ) : analysis.status === "analyzing" ? (
          <div className="w-full py-3 text-center bg-white/50 dark:bg-black/20 rounded-lg backdrop-blur-sm">
            <div className="animate-pulse text-sm text-emerald-700 dark:text-emerald-400 font-medium">
              Анализируем ваши результаты...
            </div>
          </div>
        ) : (
          <Button
            data-testid="button-upload-analysis"
            variant="outline"
            className="w-full border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
            disabled
          >
            Ожидание обработки
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
