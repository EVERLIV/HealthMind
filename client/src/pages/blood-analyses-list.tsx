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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-32">
      {/* Hero Section - Применяем 8px grid */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 pt-16 pb-12 relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/8 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/8 rounded-full translate-y-16 -translate-x-16"></div>
        
        {/* Контент hero секции */}
        <div className="relative z-10 text-center text-white px-6">
          <div className="w-24 h-24 bg-white/15 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <BarChart3 className="w-12 h-12 text-white" />
          </div>
          
          {/* Заголовок с правильной типографикой */}
          <h1 className="text-3xl font-bold mb-3 tracking-tight">Мои Анализы</h1>
          <p className="text-white/85 text-base mb-8 max-w-xs mx-auto leading-relaxed">
            Отслеживайте здоровье с помощью ИИ-аналитики
          </p>
          
          {/* Stats Cards - улучшенная группировка */}
          {typedAnalyses.length > 0 && (
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                <div className="text-2xl font-bold mb-1">{stats.analyzed}</div>
                <div className="text-xs text-white/75 font-medium">Готовых</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                <div className="text-2xl font-bold mb-1">{stats.normalMarkers}</div>
                <div className="text-xs text-white/75 font-medium">В норме</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                <div className="text-2xl font-bold mb-1">{stats.criticalMarkers}</div>
                <div className="text-xs text-white/75 font-medium">Отклонений</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Основной контент - соблюдаем 8px grid */}
      <div className="px-4 -mt-8 relative z-10">
        {typedAnalyses.length > 0 ? (
          <div className="space-y-8">
            {/* Quick Actions - улучшенное расположение */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-4 h-4 text-emerald-600" />
                </div>
                Быстрые действия
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Link href="/blood-analysis">
                  <Card className="group h-28 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 hover:border-emerald-300 transition-all duration-300 cursor-pointer">
                    <div className="h-full p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center">
                          <Plus className="w-3 h-3 text-emerald-600" />
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm mb-1">Новый анализ</div>
                        <div className="text-xs text-gray-600">Сфотографировать</div>
                      </div>
                    </div>
                  </Card>
                </Link>
                
                <Link href="/biomarkers">
                  <Card className="group h-28 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:border-blue-300 transition-all duration-300 cursor-pointer">
                    <div className="h-full p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm mb-1">Биомаркеры</div>
                        <div className="text-xs text-gray-600">Посмотреть все</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Analyses List - улучшенная структура */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-600" />
                </div>
                История анализов
                <span className="ml-auto text-sm font-normal text-gray-500">
                  {typedAnalyses.length} {typedAnalyses.length === 1 ? 'анализ' : 'анализов'}
                </span>
              </h2>
              
              <div className="space-y-4">
                {typedAnalyses.map((analysis: any, index: number) => (
                  <Link key={analysis.id} href={`/blood-analyses/${analysis.id}`}>
                    <Card className="group border-gray-200/60 hover:border-gray-300 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden">
                      {/* Статусная полоска */}
                      <div className={`h-1 bg-gradient-to-r ${getAnalysisGradient(analysis)}`}></div>
                      
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Иконка анализа */}
                          <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${getAnalysisGradient(analysis)} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                            {getAnalysisIcon(analysis)}
                          </div>
                          
                          {/* Контент анализа */}
                          <div className="flex-1 min-w-0 space-y-3">
                            {/* Заголовок и дата */}
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-bold text-gray-900 text-base mb-1">
                                  Анализ крови
                                </h3>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(analysis.createdAt), "d MMMM yyyy", { locale: ru })}
                                </p>
                              </div>
                            </div>
                            
                            {/* Статус и бейджи */}
                            {analysis.status === 'analyzed' && analysis.results?.markers ? (
                              <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                  {analysis.results.markers.filter((m: any) => m.status === 'normal').length > 0 && (
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
                                      <CheckCircle className="w-3 h-3" />
                                      {analysis.results.markers.filter((m: any) => m.status === 'normal').length} в норме
                                    </span>
                                  )}
                                  {analysis.results.markers.filter((m: any) => m.status === 'high' || m.status === 'low').length > 0 && (
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200">
                                      <AlertTriangle className="w-3 h-3" />
                                      {analysis.results.markers.filter((m: any) => m.status === 'high' || m.status === 'low').length} отклонений
                                    </span>
                                  )}
                                  {analysis.results.markers.filter((m: any) => m.status === 'critical').length > 0 && (
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-200">
                                      <AlertTriangle className="w-3 h-3" />
                                      {analysis.results.markers.filter((m: any) => m.status === 'critical').length} критических
                                    </span>
                                  )}
                                </div>
                                
                                {analysis.results.summary && (
                                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed pr-8">
                                    {analysis.results.summary.substring(0, 140)}...
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 py-2">
                                <div className="w-4 h-4 bg-amber-200 rounded-full flex items-center justify-center">
                                  <Activity className="w-2 h-2 text-amber-600 animate-pulse" />
                                </div>
                                <p className="text-sm text-amber-700 font-medium">
                                  Анализ обрабатывается...
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Стрелка */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Empty State - профессиональный дизайн */
          <Card className="text-center py-16 px-8 border-0 shadow-xl bg-white">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Camera className="w-16 h-16 text-white" />
            </div>
            
            <div className="max-w-sm mx-auto space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Добро пожаловать в HealthAI!
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Загрузите фото анализа крови и получите персональные рекомендации от искусственного интеллекта
                </p>
              </div>
              
              <Link href="/blood-analysis">
                <Button className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200">
                  <Camera className="w-5 h-5 mr-3" />
                  Сфотографировать анализ
                </Button>
              </Link>
            </div>
            
            {/* Преимущества */}
            <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-xs font-medium text-gray-700 mb-1">ИИ-анализ</p>
                <p className="text-xs text-gray-500">Умная обработка</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs font-medium text-gray-700 mb-1">Рекомендации</p>
                <p className="text-xs text-gray-500">Персональные советы</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-xs font-medium text-gray-700 mb-1">Отслеживание</p>
                <p className="text-xs text-gray-500">Динамика здоровья</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}