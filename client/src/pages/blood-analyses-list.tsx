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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 pb-24">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 pt-12 pb-8 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Мои Анализы</h1>
          <p className="text-white/90 text-sm mb-6">
            Отслеживайте здоровье с ИИ-аналитикой
          </p>
          
          {/* Stats Cards */}
          {typedAnalyses.length > 0 && (
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
                <div className="text-xl font-bold">{stats.analyzed}</div>
                <div className="text-xs text-white/80">Готовых</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
                <div className="text-xl font-bold">{stats.normalMarkers}</div>
                <div className="text-xs text-white/80">В норме</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
                <div className="text-xl font-bold">{stats.criticalMarkers}</div>
                <div className="text-xs text-white/80">Отклонений</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10">
        {typedAnalyses.length > 0 ? (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Link href="/blood-analysis">
                <Card className="p-4 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-r from-emerald-400 to-teal-500 text-white transform hover:scale-105 active:scale-95">
                  <div className="flex items-center justify-between">
                    <div>
                      <Camera className="w-6 h-6 mb-2" />
                      <div className="font-semibold">Новый анализ</div>
                      <div className="text-xs text-white/80">Сфотографировать</div>
                    </div>
                    <Plus className="w-5 h-5" />
                  </div>
                </Card>
              </Link>
              
              <Link href="/biomarkers">
                <Card className="p-4 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-r from-blue-400 to-indigo-500 text-white transform hover:scale-105 active:scale-95">
                  <div className="flex items-center justify-between">
                    <div>
                      <TrendingUp className="w-6 h-6 mb-2" />
                      <div className="font-semibold">Биомаркеры</div>
                      <div className="text-xs text-white/80">Посмотреть все</div>
                    </div>
                    <Sparkles className="w-5 h-5" />
                  </div>
                </Card>
              </Link>
            </div>

            {/* Analyses List */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                История анализов
              </h2>
              
              {typedAnalyses.map((analysis: any, index: number) => (
                <Link key={analysis.id} href={`/blood-analyses/${analysis.id}`}>
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 active:scale-98" 
                        style={{ animationDelay: `${index * 100}ms` }}>
                    <div className={`h-1 bg-gradient-to-r ${getAnalysisGradient(analysis)}`}></div>
                    
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${getAnalysisGradient(analysis)} flex items-center justify-center shadow-lg`}>
                          {getAnalysisIcon(analysis)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 truncate">
                              Анализ крови
                            </h3>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(analysis.createdAt), "d MMM", { locale: ru })}
                            </span>
                          </div>
                          
                          {analysis.status === 'analyzed' && analysis.results?.markers ? (
                            <>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {analysis.results.markers.filter((m: any) => m.status === 'normal').length > 0 && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                    <CheckCircle className="w-3 h-3" />
                                    {analysis.results.markers.filter((m: any) => m.status === 'normal').length} в норме
                                  </span>
                                )}
                                {analysis.results.markers.filter((m: any) => m.status === 'high' || m.status === 'low').length > 0 && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                    <AlertTriangle className="w-3 h-3" />
                                    {analysis.results.markers.filter((m: any) => m.status === 'high' || m.status === 'low').length} отклонений
                                  </span>
                                )}
                                {analysis.results.markers.filter((m: any) => m.status === 'critical').length > 0 && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                    <AlertTriangle className="w-3 h-3" />
                                    {analysis.results.markers.filter((m: any) => m.status === 'critical').length} критических
                                  </span>
                                )}
                              </div>
                              
                              {analysis.results.summary && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {analysis.results.summary.substring(0, 120)}...
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-amber-600 flex items-center gap-2">
                              <Activity className="w-4 h-4 animate-pulse" />
                              Анализ обрабатывается...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <Card className="text-center py-12 px-6 border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Camera className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Добро пожаловать в HealthAI! 🩺
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Загрузите фото анализа крови и получите
              <br />
              <span className="font-semibold text-emerald-600">персональные рекомендации ИИ</span>
            </p>
            
            <Link href="/blood-analysis">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 text-lg rounded-2xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200">
                <Camera className="w-6 h-6 mr-3" />
                Сфотографировать анализ
              </Button>
            </Link>
            
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                ИИ-анализ
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Рекомендации
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
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