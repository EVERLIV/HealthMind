import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Heart,
  Zap,
  Shield,
  Activity,
  Droplets,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Calendar,
  Target,
  Sparkles,
  BarChart3
} from "lucide-react";

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
  blood: { bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-700 dark:text-red-400" },
  cardiovascular: { bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-700 dark:text-blue-400" },
  metabolic: { bg: "bg-orange-50 dark:bg-orange-950/20", text: "text-orange-700 dark:text-orange-400" },
  kidney: { bg: "bg-green-50 dark:bg-green-950/20", text: "text-green-700 dark:text-green-400" },
  liver: { bg: "bg-purple-50 dark:bg-purple-950/20", text: "text-purple-700 dark:text-purple-400" },
  immune: { bg: "bg-cyan-50 dark:bg-cyan-950/20", text: "text-cyan-700 dark:text-cyan-400" },
  brain: { bg: "bg-indigo-50 dark:bg-indigo-950/20", text: "text-indigo-700 dark:text-indigo-400" },
};

const importanceColors = {
  high: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  medium: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", dot: "bg-yellow-500" },
  low: { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-500" },
};

interface BiomarkerDetailsModalProps {
  biomarkerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BiomarkerDetailsModal({
  biomarkerId,
  open,
  onOpenChange,
}: BiomarkerDetailsModalProps) {
  const { data: biomarker, isLoading } = useQuery({
    queryKey: ["/api/biomarkers", biomarkerId],
    enabled: !!biomarkerId && open,
  });

  const { data: history } = useQuery({
    queryKey: ["/api/biomarkers", biomarkerId, "history"],
    enabled: !!biomarkerId && open,
  });

  if (!biomarkerId) return null;

  const categoryData = categoryColors[biomarker?.category as keyof typeof categoryColors] || categoryColors.blood;
  const IconComponent = iconMap[biomarker?.category as keyof typeof iconMap] || Activity;
  const importanceStyle = importanceColors[biomarker?.importance as keyof typeof importanceColors];

  const latestValue = history && history.length > 0 ? history[0] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-3">
              <div className={`p-2 ${categoryData.bg} rounded-xl`}>
                <IconComponent className={`w-5 h-5 ${categoryData.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg truncate">{biomarker?.name}</h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {biomarker?.category === 'blood' && 'Кровь'}
                  {biomarker?.category === 'cardiovascular' && 'Сердечно-сосудистая'}
                  {biomarker?.category === 'metabolic' && 'Метаболизм'}
                  {biomarker?.category === 'kidney' && 'Почки'}
                  {biomarker?.category === 'liver' && 'Печень'}
                  {biomarker?.category === 'immune' && 'Иммунная система'}
                  {biomarker?.category === 'brain' && 'Нервная система'}
                </p>
              </div>
              {importanceStyle && (
                <Badge className={`${importanceStyle.bg} ${importanceStyle.text} border-0 text-xs`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${importanceStyle.dot} mr-1`}></div>
                  {biomarker?.importance === 'high' ? 'Критичный' : 
                   biomarker?.importance === 'medium' ? 'Важный' : 'Обычный'}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            ) : (
              <>
                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-medical-blue" />
                    Описание
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {biomarker?.description}
                  </p>
                </div>

                {/* Normal Range & Current Status */}
                {biomarker?.normalRange && (
                  <Card className="border-2">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        Нормальные значения
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-2xl font-bold font-mono text-green-600">
                              {biomarker.normalRange.min} - {biomarker.normalRange.max}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {biomarker.normalRange.unit}
                            </div>
                          </div>
                        </div>

                        {latestValue && (
                          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Ваш результат:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold font-mono">
                                  {latestValue.value} {latestValue.unit}
                                </span>
                                <Badge className={
                                  latestValue.status === 'normal' ? 'bg-green-100 text-green-700' :
                                  latestValue.status === 'high' ? 'bg-red-100 text-red-700' :
                                  latestValue.status === 'low' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }>
                                  {latestValue.status === 'normal' ? 'Норма' :
                                   latestValue.status === 'high' ? 'Высокий' :
                                   latestValue.status === 'low' ? 'Низкий' : 'Критичный'}
                                </Badge>
                              </div>
                            </div>
                            
                            {latestValue.status !== 'normal' && (
                              <div className="mt-2">
                                <Progress 
                                  value={
                                    latestValue.status === 'high' 
                                      ? Math.min(100, (latestValue.value / biomarker.normalRange.max) * 100)
                                      : Math.max(0, (latestValue.value / biomarker.normalRange.min) * 100)
                                  }
                                  className="h-2"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Latest Trend */}
                {history && history.length > 1 && (
                  <Card className="border-2">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-medical-blue" />
                        Тренд изменений
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">За последний период</div>
                          <div className="flex items-center gap-2 mt-1">
                            {history[0].value > history[1].value ? (
                              <>
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-green-600 font-semibold">
                                  +{((history[0].value - history[1].value) / history[1].value * 100).toFixed(1)}%
                                </span>
                              </>
                            ) : history[0].value < history[1].value ? (
                              <>
                                <TrendingDown className="w-4 h-4 text-red-600" />
                                <span className="text-red-600 font-semibold">
                                  {((history[0].value - history[1].value) / history[1].value * 100).toFixed(1)}%
                                </span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">Без изменений</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Mini chart */}
                        <div className="flex items-end gap-1 h-8">
                          {history.slice(0, 7).reverse().map((point: any, index: number) => {
                            const maxValue = Math.max(...history.slice(0, 7).map((h: any) => h.value));
                            const height = (point.value / maxValue) * 100;
                            return (
                              <div
                                key={index}
                                className="w-2 bg-medical-blue opacity-70 rounded-sm"
                                style={{ height: `${Math.max(height, 10)}%` }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {biomarker?.recommendations && biomarker.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Рекомендации
                    </h3>
                    <div className="space-y-2">
                      {biomarker.recommendations.map((recommendation: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm leading-relaxed">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent History Preview */}
                {history && history.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-medical-blue" />
                      Последние результаты
                    </h3>
                    <div className="space-y-2">
                      {history.slice(0, 3).map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <div className="font-mono font-semibold">
                              {entry.value} {entry.unit}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                          <Badge className={
                            entry.status === 'normal' ? 'bg-green-100 text-green-700' :
                            entry.status === 'high' ? 'bg-red-100 text-red-700' :
                            entry.status === 'low' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }>
                            {entry.status === 'normal' ? 'Норма' :
                             entry.status === 'high' ? 'Высокий' :
                             entry.status === 'low' ? 'Низкий' : 'Критичный'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}