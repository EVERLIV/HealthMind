import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Calendar, Activity, Plus, Sparkles, TrendingUp, AlertTriangle, CheckCircle, Camera, BarChart3 } from "lucide-react";
import BottomNav from "@/components/layout/bottom-nav";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function BloodAnalysesListPage() {
  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["/api/blood-analyses"],
  });

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
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
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
                <Link href="/blood-analysis">
                  <Card className="group h-20 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 hover:border-emerald-300 transition-all duration-300 cursor-pointer">
                    <div className="h-full p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">Новый анализ</div>
                        <div className="text-xs text-gray-600">Сфотографировать</div>
                      </div>
                      <Plus className="w-4 h-4 text-emerald-600" />
                    </div>
                  </Card>
                </Link>
                
                <Link href="/biomarkers">
                  <Card className="group h-20 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:border-blue-300 transition-all duration-300 cursor-pointer">
                    <div className="h-full p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">Биомаркеры</div>
                        <div className="text-xs text-gray-600">Посмотреть</div>
                      </div>
                      <Sparkles className="w-4 h-4 text-blue-600" />
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
                    <FileText className="w-4 h-4 text-gray-600" />
                    История анализов
                  </h2>
                  <span className="text-xs text-gray-500">
                    {typedAnalyses.length}
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {typedAnalyses.map((analysis: any, index: number) => (
                  <Link key={analysis.id} href={`/blood-analyses/${analysis.id}`}>
                    <div className="group p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        {/* Компактная иконка */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getAnalysisGradient(analysis)} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                          {getAnalysisIcon(analysis)}
                        </div>
                        
                        {/* Компактный контент */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              Анализ крови
                            </h3>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(analysis.createdAt), "d MMM", { locale: ru })}
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
                        
                        {/* Компактная стрелка */}
                        <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
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
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Camera className="w-10 h-10 text-white" />
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Добро пожаловать!
                </h3>
                <p className="text-gray-600 text-sm">
                  Загрузите анализ крови и получите ИИ-рекомендации
                </p>
              </div>
              
              <Link href="/blood-analysis">
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