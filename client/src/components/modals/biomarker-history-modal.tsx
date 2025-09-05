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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  const { data: history, isLoading } = useQuery<any[]>({
    queryKey: ["/api/biomarkers", biomarkerId, "history"],
    enabled: !!biomarkerId && open,
  });

  const { data: biomarker } = useQuery<any>({
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
                {/* Chart with Trend Analysis */}
                {history.length > 0 && (
                  <Card className="mb-6">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-medical-blue" />
                        <h3 className="font-semibold text-lg">Динамика изменений</h3>
                        <Badge variant="secondary" className="ml-auto">
                          {history.length} измерений
                        </Badge>
                      </div>
                      
                      <div className="h-64 mb-4">
                        <Bar
                          data={{
                            labels: history.slice().reverse().map((item: any) => {
                              const date = new Date(item.analysisDate || item.date);
                              return `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
                            }),
                            datasets: [
                              {
                                label: biomarker?.name || 'Значение',
                                data: history.slice().reverse().map((item: any) => item.value),
                                backgroundColor: history.slice().reverse().map((item: any) => {
                                  switch (item.status) {
                                    case 'normal': return 'rgba(34, 197, 94, 0.8)';
                                    case 'high': return 'rgba(239, 68, 68, 0.8)';
                                    case 'low': return 'rgba(59, 130, 246, 0.8)';
                                    case 'critical': return 'rgba(245, 158, 11, 0.8)';
                                    default: return 'rgba(156, 163, 175, 0.8)';
                                  }
                                }),
                                borderColor: history.slice().reverse().map((item: any) => {
                                  switch (item.status) {
                                    case 'normal': return 'rgb(34, 197, 94)';
                                    case 'high': return 'rgb(239, 68, 68)';
                                    case 'low': return 'rgb(59, 130, 246)';
                                    case 'critical': return 'rgb(245, 158, 11)';
                                    default: return 'rgb(156, 163, 175)';
                                  }
                                }),
                                borderWidth: 2,
                                borderRadius: 4,
                                borderSkipped: false,
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {
                              intersect: false,
                              mode: 'index'
                            },
                            plugins: {
                              legend: {
                                display: false
                              },
                              tooltip: {
                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                titleColor: '#f8fafc',
                                bodyColor: '#f8fafc',
                                borderColor: '#334155',
                                borderWidth: 1,
                                cornerRadius: 8,
                                callbacks: {
                                  title: (context) => {
                                    const index = context[0].dataIndex;
                                    const item = history.slice().reverse()[index];
                                    const date = new Date(item.analysisDate || item.date);
                                    return `${date.getDate()} ${['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'][date.getMonth()]} ${date.getFullYear()}`;
                                  },
                                  label: (context) => {
                                    const item = history.slice().reverse()[context.dataIndex];
                                    const unit = biomarker?.normalRange?.unit || '';
                                    const statusText = item.status === 'normal' ? 'Норма' :
                                                     item.status === 'high' ? 'Высокий' :
                                                     item.status === 'low' ? 'Низкий' :
                                                     item.status === 'critical' ? 'Критичный' : 'Неопределен';
                                    return [`Значение: ${context.parsed.y} ${unit}`, `Статус: ${statusText}`];
                                  }
                                }
                              }
                            },
                            scales: {
                              x: {
                                grid: {
                                  display: false
                                },
                                ticks: {
                                  color: '#64748b',
                                  font: {
                                    size: 11
                                  }
                                }
                              },
                              y: {
                                beginAtZero: false,
                                grid: {
                                  color: 'rgba(148, 163, 184, 0.1)'
                                },
                                ticks: {
                                  color: '#64748b',
                                  font: {
                                    size: 11
                                  },
                                  callback: function(value) {
                                    const unit = biomarker?.normalRange?.unit || '';
                                    return `${value} ${unit}`;
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                      
                      {/* Reference Range Indicator */}
                      {biomarker?.normalRange && (
                        <div className="flex items-center justify-center gap-6 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-slate-300 rounded-sm"></div>
                            <span className="text-muted-foreground">
                              Норма: {biomarker.normalRange.min}-{biomarker.normalRange.max} {biomarker.normalRange.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                            <span className="text-muted-foreground">Нормальный</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                            <span className="text-muted-foreground">Отклонение</span>
                          </div>
                        </div>
                      )}
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