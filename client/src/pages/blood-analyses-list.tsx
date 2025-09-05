import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconContainer, iconSizes } from "@/components/ui/icon-container";
import { FileText, Calendar, Activity, Plus, Sparkles, TrendingUp, AlertTriangle, CheckCircle, Camera, BarChart3, Trash2 } from "lucide-react";
import BottomNav from "@/components/layout/bottom-nav";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BloodAnalysesListPage() {
  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["/api/blood-analyses"],
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteAnalysisMutation = useMutation({
    mutationFn: async (analysisId: string) => {
      return await apiRequest(`/api/blood-analyses/${analysisId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blood-analyses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/biomarkers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/biomarkers/latest-values"] });
      toast({
        title: "Анализ удален",
        description: "Анализ и связанные биомаркеры успешно удалены",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить анализ",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAnalysis = (analysisId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (confirm("Вы уверены, что хотите удалить этот анализ? Это действие нельзя отменить.")) {
      deleteAnalysisMutation.mutate(analysisId);
    }
  };

  // Типизированные анализы
  const typedAnalyses = analyses as any[];

  // Статистика по анализам
  const stats = {
    total: typedAnalyses.length,
    analyzed: typedAnalyses.filter((a: any) => a.status === 'analyzed').length,
    pending: typedAnalyses.filter((a: any) => a.status === 'pending').length,
    normalMarkers: typedAnalyses.reduce((acc: number, a: any) => 
      acc + (a.results?.markers?.filter((m: any) => m.status === 'normal')?.length || 0), 0),
    criticalMarkers: typedAnalyses.reduce((acc: number, a: any) => 
      acc + (a.results?.markers?.filter((m: any) => m.status === 'critical' || m.status === 'high' || m.status === 'low')?.length || 0), 0),
  };

  const getAnalysisGradient = (analysis: any) => {
    if (analysis.status === 'analyzed') {
      const critical = analysis.results?.markers?.filter((m: any) => m.status === 'critical' || m.status === 'high' || m.status === 'low')?.length || 0;
      if (critical === 0) return 'from-emerald-400 to-teal-500';
      if (critical <= 2) return 'from-amber-400 to-orange-500';
      return 'from-red-400 to-pink-500';
    }
    return 'from-gray-300 to-gray-400';
  };

  const getAnalysisIcon = (analysis: any) => {
    if (analysis.status === 'analyzed') {
      const critical = analysis.results?.markers?.filter((m: any) => m.status === 'critical' || m.status === 'high' || m.status === 'low')?.length || 0;
      if (critical === 0) return <CheckCircle className="w-6 h-6 text-white" />;
      if (critical <= 2) return <AlertTriangle className="w-6 h-6 text-white" />;
      return <AlertTriangle className="w-6 h-6 text-white" />;
    }
    return <Activity className="w-6 h-6 text-white animate-pulse" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Загружаем анализы...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-24">
      {/* Компактная Hero секция */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 pt-12 pb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/8 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/8 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10 text-center text-white px-4">
          <IconContainer size="xl" className="bg-white/15 text-white border-white/20 backdrop-blur-sm mx-auto mb-3">
            <BarChart3 className={iconSizes.xl} />
          </IconContainer>
          <h1 className="text-2xl font-bold mb-2">Мои Анализы</h1>
          <p className="text-white/85 text-sm mb-4">
            ИИ-аналитика здоровья
          </p>
          
          {/* Компактные статистики */}
          {typedAnalyses.length > 0 && (
            <div className="grid grid-cols-3 gap-2 max-w-64 mx-auto">
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 text-center">
                <div className="text-lg font-bold">{stats.analyzed}</div>
                <div className="text-xs text-white/75">Готовых</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 text-center">
                <div className="text-lg font-bold">{stats.normalMarkers}</div>
                <div className="text-xs text-white/75">В норме</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 text-center">
                <div className="text-lg font-bold">{stats.criticalMarkers}</div>
                <div className="text-xs text-white/75">Отклонений</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Компактный основной контент */}
      <div className="px-3 -mt-3 relative z-10">
        {typedAnalyses.length > 0 ? (
          <div className="space-y-4">
            {/* Компактные быстрые действия */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <Link href="/app/blood-analysis">
                  <Card className="group h-20 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 hover:border-emerald-300 transition-all duration-300 cursor-pointer overflow-hidden">
                    <div className="h-full p-3 flex items-center gap-2 max-w-full">
                      <IconContainer size="sm" variant="success" className="flex-shrink-0">
                        <Camera className={iconSizes.sm} />
                      </IconContainer>
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="font-semibold text-gray-900 text-sm truncate">Новый анализ</div>
                        <div className="text-xs text-gray-600 truncate">Сфотографировать</div>
                      </div>
                      <IconContainer size="xs" variant="soft-success" className="flex-shrink-0">
                        <Plus className={iconSizes.xs} />
                      </IconContainer>
                    </div>
                  </Card>
                </Link>
                
                <Link href="/app/biomarkers">
                  <Card className="group h-20 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:border-blue-300 transition-all duration-300 cursor-pointer overflow-hidden">
                    <div className="h-full p-3 flex items-center gap-2 max-w-full">
                      <IconContainer size="sm" variant="info" className="flex-shrink-0">
                        <TrendingUp className={iconSizes.sm} />
                      </IconContainer>
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="font-semibold text-gray-900 text-sm truncate">Биомаркеры</div>
                        <div className="text-xs text-gray-600 truncate">Посмотреть</div>
                      </div>
                      <IconContainer size="xs" variant="soft-info" className="flex-shrink-0">
                        <Sparkles className={iconSizes.xs} />
                      </IconContainer>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Компактный список анализов */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <IconContainer size="xs" variant="soft-neutral">
                      <FileText className={iconSizes.xs} />
                    </IconContainer>
                    История анализов
                  </h2>
                  <span className="text-xs text-gray-500">
                    {typedAnalyses.length}
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {typedAnalyses.map((analysis: any, index: number) => (
                  <Link key={analysis.id} href={`/app/blood-analyses/${analysis.id}`}>
                    <div className="group p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        {/* Компактная иконка */}
                        <IconContainer 
                          size="lg" 
                          className={`bg-gradient-to-br ${getAnalysisGradient(analysis)} text-white border-0 shadow-sm group-hover:shadow-md transition-shadow`}
                        >
                          {getAnalysisIcon(analysis)}
                        </IconContainer>
                        
                        {/* Компактный контент */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              Анализ крови
                            </h3>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(analysis.analysisDate || analysis.createdAt), "d MMM", { locale: ru })}
                            </span>
                          </div>
                          
                          {/* Компактные бейджи */}
                          {analysis.status === 'analyzed' && analysis.results?.markers ? (
                            <div className="flex flex-wrap gap-1">
                              {analysis.results.markers.filter((m: any) => m.status === 'normal').length > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                                  <CheckCircle className="w-2 h-2" />
                                  {analysis.results.markers.filter((m: any) => m.status === 'normal').length} норма
                                </span>
                              )}
                              {analysis.results.markers.filter((m: any) => m.status === 'high' || m.status === 'low').length > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="w-2 h-2" />
                                  {analysis.results.markers.filter((m: any) => m.status === 'high' || m.status === 'low').length} откл
                                </span>
                              )}
                              {analysis.results.markers.filter((m: any) => m.status === 'critical').length > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="w-2 h-2" />
                                  {analysis.results.markers.filter((m: any) => m.status === 'critical').length} крит
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                              <span className="text-xs text-amber-700">Обрабатывается...</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Кнопки действий */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteAnalysis(analysis.id, e)}
                            disabled={deleteAnalysisMutation.isPending}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 p-0 rounded-full"
                            data-testid={`button-delete-analysis-${analysis.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Компактный Empty State */
          <Card className="text-center py-12 px-6 border-0 shadow-xl bg-white">
            <IconContainer size="xl" className="bg-gradient-to-br from-emerald-400 to-blue-500 text-white border-0 shadow-lg mx-auto mb-6">
              <Camera className={iconSizes.xl} />
            </IconContainer>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Добро пожаловать!
                </h3>
                <p className="text-gray-600 text-sm">
                  Загрузите анализ крови и получите ИИ-рекомендации
                </p>
              </div>
              
              <Link href="/app/blood-analysis">
                <Button className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200">
                  <Camera className="w-4 h-4 mr-2" />
                  Сфотографировать анализ
                </Button>
              </Link>
            </div>
            
            {/* Компактные преимущества */}
            <div className="mt-8 flex justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                ИИ-анализ
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Рекомендации
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Отслеживание
              </div>
            </div>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}