import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BiomarkerHistoryModalProps {
  biomarkerId: string | null;
  biomarkerName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BiomarkerHistoryModal({
  biomarkerId,
  biomarkerName,
  open,
  onOpenChange,
}: BiomarkerHistoryModalProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ["/api/biomarkers", biomarkerId, "history"],
    enabled: !!biomarkerId && open,
  });

  const { data: biomarker } = useQuery({
    queryKey: ["/api/biomarkers", biomarkerId],
    enabled: !!biomarkerId && open,
  });

  if (!biomarkerId) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-700';
      case 'high': return 'bg-red-100 text-red-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      case 'critical': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return 'Норма';
      case 'high': return 'Высокий';
      case 'low': return 'Низкий';
      case 'critical': return 'Критичный';
      default: return 'Неопределен';
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg truncate">
                  История: {biomarkerName || biomarker?.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Изменения показателя во времени
                </p>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4 text-medical-blue" />
                <span className="text-sm font-medium">
                  {history?.length || 0} записей
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : !history || history.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Нет данных</h3>
                  <p className="text-muted-foreground text-sm">
                    История результатов для этого биомаркера пока не доступна
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-medical-blue">
                        {history.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Анализов</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold">
                        {history[0]?.value}
                      </div>
                      <div className="text-xs text-muted-foreground">Последний</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold">
                        {biomarker?.normalRange 
                          ? `${biomarker.normalRange.min}-${biomarker.normalRange.max}`
                          : '—'
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">Норма</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Visual Chart */}
                {history.length > 1 && (
                  <Card className="mb-6">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-medical-blue" />
                        График изменений
                      </h3>
                      
                      <div className="flex items-end justify-between gap-1 h-24 mb-3">
                        {history.slice().reverse().map((point: any, index: number) => {
                          const maxValue = Math.max(...history.map((h: any) => h.value));
                          const minValue = Math.min(...history.map((h: any) => h.value));
                          const range = maxValue - minValue;
                          const height = range > 0 ? ((point.value - minValue) / range) * 100 : 50;
                          
                          return (
                            <div key={index} className="flex flex-col items-center flex-1">
                              <div
                                className={`w-full max-w-3 rounded-sm transition-all duration-300 ${
                                  point.status === 'normal' ? 'bg-green-500' :
                                  point.status === 'high' ? 'bg-red-500' :
                                  point.status === 'low' ? 'bg-blue-500' :
                                  'bg-yellow-500'
                                }`}
                                style={{ height: `${Math.max(height, 10)}%` }}
                              />
                              <div className="text-xs text-muted-foreground mt-1 writing-mode-vertical-rl text-orientation-mixed">
                                {new Date(point.date).getDate()}/{new Date(point.date).getMonth() + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex items-center justify-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Норма</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Высокий</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Низкий</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Timeline */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-medical-blue" />
                    Хронология результатов
                  </h3>
                  
                  {history.map((entry: any, index: number) => {
                    const previousEntry = history[index + 1];
                    const change = previousEntry ? calculateChange(entry.value, previousEntry.value) : null;
                    
                    return (
                      <Card key={index} className="border-l-4" 
                            style={{
                              borderLeftColor: 
                                entry.status === 'normal' ? '#10b981' :
                                entry.status === 'high' ? '#ef4444' :
                                entry.status === 'low' ? '#3b82f6' : '#f59e0b'
                            }}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-lg">
                                {entry.value} {entry.unit}
                              </span>
                              {change && (
                                <div className="flex items-center gap-1">
                                  {change.direction === 'up' ? (
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                  ) : change.direction === 'down' ? (
                                    <TrendingDown className="w-3 h-3 text-red-600" />
                                  ) : null}
                                  {change.direction !== 'same' && (
                                    <span className={`text-xs font-medium ${
                                      change.direction === 'up' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {change.direction === 'up' ? '+' : ''}{change.percentage}%
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <Badge className={getStatusColor(entry.status)}>
                              {getStatusText(entry.status)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{entry.analysisName}</span>
                            <span>{new Date(entry.date).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}