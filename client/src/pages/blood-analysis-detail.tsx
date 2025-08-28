import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle, Info, Heart, Shield, Brain, Activity, Droplets, Zap, Filter, Grid3X3, BarChart3 } from "lucide-react";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { useState, useMemo } from "react";

interface BloodMarker {
  name: string;
  value: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  recommendation?: string;
  education?: string;
}

export default function BloodAnalysisDetailPage() {
  const { id } = useParams();
  const [selectedMarker, setSelectedMarker] = useState<BloodMarker | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { data: analysis, isLoading } = useQuery({
    queryKey: [`/api/blood-analyses/${id}`],
  });

  // Все вычисления и хуки должны быть до условных возвратов
  const results = (analysis as any)?.results;
  const normalCount = results?.markers?.filter((m: BloodMarker) => m.status === 'normal').length || 0;
  const totalCount = results?.markers?.length || 0;
  const healthScore = totalCount > 0 ? Math.round((normalCount / totalCount) * 100) : 0;
  const criticalCount = results?.markers?.filter((m: BloodMarker) => m.status === 'critical').length || 0;
  const abnormalCount = results?.markers?.filter((m: BloodMarker) => m.status === 'high' || m.status === 'low').length || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high':
        return <TrendingUp className="w-3 h-3" />;
      case 'low':
        return <TrendingDown className="w-3 h-3" />;
      case 'critical':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-emerald-500';
      case 'high':
        return 'bg-amber-500';
      case 'low':
        return 'bg-blue-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'В норме';
      case 'high':
        return 'Повышен';
      case 'low':
        return 'Понижен';
      case 'critical':
        return 'Критично';
      default:
        return 'Неизвестно';
    }
  };

  const getCategoryData = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('гемоглобин') || lowerName.includes('эритроцит') || lowerName.includes('гематокрит')) {
      return { icon: Heart, color: 'bg-red-500', category: 'blood' };
    }
    if (lowerName.includes('лейкоцит') || lowerName.includes('лимфоцит') || lowerName.includes('иммун')) {
      return { icon: Shield, color: 'bg-blue-500', category: 'immunity' };
    }
    if (lowerName.includes('тромбоцит') || lowerName.includes('коагул') || lowerName.includes('свертыв')) {
      return { icon: Droplets, color: 'bg-purple-500', category: 'coagulation' };
    }
    if (lowerName.includes('глюкоз') || lowerName.includes('сахар') || lowerName.includes('инсулин')) {
      return { icon: Zap, color: 'bg-orange-500', category: 'metabolism' };
    }
    if (lowerName.includes('холестерин') || lowerName.includes('лпвп') || lowerName.includes('лпнп') || lowerName.includes('триглицерид')) {
      return { icon: Activity, color: 'bg-green-500', category: 'lipids' };
    }
    return { icon: BarChart3, color: 'bg-gray-500', category: 'other' };
  };

  // Группировка биомаркеров по категориям
  const groupedMarkers = useMemo(() => {
    if (!(analysis as any)?.results?.markers) return {};
    
    const groups: { [key: string]: BloodMarker[] } = {
      blood: [],
      immunity: [],
      coagulation: [],
      metabolism: [],
      lipids: [],
      other: []
    };

    (analysis as any).results.markers.forEach((marker: BloodMarker) => {
      const { category } = getCategoryData(marker.name);
      groups[category].push(marker);
    });

    return groups;
  }, [analysis]);

  // Фильтрация маркеров по активной вкладке
  const filteredMarkers = useMemo(() => {
    if (!results?.markers) return [];
    if (activeTab === "all") return results.markers;
    return groupedMarkers[activeTab] || [];
  }, [results?.markers, activeTab, groupedMarkers]);

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'blood': return 'Кровь';
      case 'immunity': return 'Иммунитет';
      case 'coagulation': return 'Свертываемость';
      case 'metabolism': return 'Обмен веществ';
      case 'lipids': return 'Липиды';
      case 'other': return 'Другое';
      default: return 'Все';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'blood': return Heart;
      case 'immunity': return Shield;
      case 'coagulation': return Droplets;
      case 'metabolism': return Zap;
      case 'lipids': return Activity;
      case 'other': return BarChart3;
      default: return Grid3X3;
    }
  };

  if (isLoading) {
    return (
      <div className="eva-page">
        <MobileNav />
        <main className="eva-page-content flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trust-green"></div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!analysis || !(analysis as any).results) {
    return (
      <div className="eva-page">
        <MobileNav />
        <main className="eva-page-content">
          <div className="text-center py-12">
            <p>Анализ не найден</p>
            <Link href="/blood-analyses">
              <Button className="mt-4">К списку анализов</Button>
            </Link>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="eva-page">
      <MobileNav />
      
      <main className="eva-page-content pb-24">
        {/* Компактный Header с ключевой статистикой */}
        <div className="bg-white sticky top-0 z-10 -mx-4 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/blood-analyses">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold">Анализ крови</h1>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    {normalCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    {abnormalCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    {criticalCount}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">{healthScore}%</div>
              <div className="text-xs text-gray-500">здоровья</div>
            </div>
          </div>
        </div>

        {/* Компактная сводка и управление */}
        <div className="mt-4 space-y-3">
          {/* Быстрая навигация по категориям */}
          <div className="space-y-3">
            {/* Переключатель режима просмотра */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-700">Категории</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="text-xs h-8 px-2"
                data-testid="button-view-mode"
              >
                {viewMode === "grid" ? <Filter className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </Button>
            </div>
            
            {/* Кнопки категорий с переносом */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("all")}
                className="text-xs h-8 px-3"
                data-testid="tab-all"
              >
                Все ({totalCount})
              </Button>
              {Object.entries(groupedMarkers).map(([category, markers]) => {
                if (markers.length === 0) return null;
                const IconComponent = getCategoryIcon(category);
                return (
                  <Button
                    key={category}
                    variant={activeTab === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab(category)}
                    className="text-xs h-8 px-3 flex items-center gap-1.5"
                    data-testid={`tab-${category}`}
                  >
                    <IconComponent className="w-3 h-3" />
                    {getCategoryName(category)} ({markers.length})
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Маркеры в компактной сетке */}
          <div className={viewMode === "grid" ? "grid grid-cols-3 gap-2" : "space-y-2"}>
            {filteredMarkers.map((marker: BloodMarker, index: number) => {
              const { icon: IconComponent, color } = getCategoryData(marker.name);
              return (
                <Card
                  key={index}
                  className={`p-2 cursor-pointer transition-all hover:shadow-md ${
                    marker.status === 'critical' ? 'ring-1 ring-red-300' : ''
                  } ${viewMode === "list" ? 'flex items-center gap-3' : ''}`}
                  onClick={() => setSelectedMarker(marker)}
                  data-testid={`marker-card-${index}`}
                >
                  {viewMode === "grid" ? (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${color}`}>
                          <IconComponent className="w-2.5 h-2.5 text-white" />
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(marker.status)}`}></div>
                      </div>
                      <h3 className="font-medium text-[10px] leading-tight mb-1 line-clamp-2">{marker.name}</h3>
                      <p className="text-xs font-bold">{marker.value}</p>
                    </>
                  ) : (
                    <>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color} flex-shrink-0`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{marker.name}</h3>
                        <p className="text-xs text-gray-600">{marker.value}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(marker.status)}`}></div>
                        <span className="text-xs text-gray-500">{getStatusText(marker.status)}</span>
                      </div>
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Общие рекомендации и факторы риска */}
        {(results?.recommendations?.length > 0 || results?.riskFactors?.length > 0) && (
          <div className="mt-6 space-y-3">
            {results.recommendations && results.recommendations.length > 0 && (
              <Card className="p-3 bg-emerald-50 border-emerald-200">
                <h3 className="font-semibold text-sm mb-2 text-emerald-900 flex items-center gap-1">
                  🎯 Рекомендации
                </h3>
                <ul className="space-y-1">
                  {results.recommendations.slice(0, 3).map((rec: string, index: number) => (
                    <li key={index} className="text-xs text-emerald-700 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5 text-[8px]">●</span>
                      <span className="line-clamp-2">{rec}</span>
                    </li>
                  ))}
                </ul>
                {results.recommendations.length > 3 && (
                  <p className="text-xs text-emerald-600 mt-2">+{results.recommendations.length - 3} еще</p>
                )}
              </Card>
            )}

            {results.riskFactors && results.riskFactors.length > 0 && (
              <Card className="p-3 bg-amber-50 border-amber-200">
                <h3 className="font-semibold text-sm mb-2 text-amber-900 flex items-center gap-1">
                  ⚠️ Факторы риска
                </h3>
                <ul className="space-y-1">
                  {results.riskFactors.slice(0, 2).map((risk: string, index: number) => (
                    <li key={index} className="text-xs text-amber-700 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 text-[8px]">●</span>
                      <span className="line-clamp-2">{risk}</span>
                    </li>
                  ))}
                </ul>
                {results.riskFactors.length > 2 && (
                  <p className="text-xs text-amber-600 mt-2">+{results.riskFactors.length - 2} еще</p>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Действия */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/chat">
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs h-10">
              💬 Обсудить с ИИ
            </Button>
          </Link>
          <Link href="/blood-analysis">
            <Button variant="outline" size="sm" className="w-full text-xs h-10">
              📷 Новый анализ
            </Button>
          </Link>
        </div>
      </main>

      {/* Модальное окно деталей биомаркера */}
      {selectedMarker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setSelectedMarker(null)}>
          <Card 
            className="w-full max-h-[80vh] overflow-y-auto rounded-t-xl border-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const IconComponent = getCategoryData(selectedMarker.name).icon;
                    return (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getCategoryData(selectedMarker.name).color}`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                    );
                  })()}
                  <div>
                    <h2 className="font-semibold text-lg">{selectedMarker.name}</h2>
                    <p className="text-sm font-bold text-gray-600">{selectedMarker.value}</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(selectedMarker.status)} text-white border-0`}>
                  {getStatusIcon(selectedMarker.status)}
                  <span className="ml-1">{getStatusText(selectedMarker.status)}</span>
                </Badge>
              </div>

              {selectedMarker.education && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-sm text-blue-900 mb-2">📚 Что это значит</h3>
                  <p className="text-sm text-blue-700 leading-relaxed">{selectedMarker.education}</p>
                </div>
              )}

              {selectedMarker.recommendation && (
                <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
                  <h3 className="font-medium text-sm text-emerald-900 mb-2">💡 Персональная рекомендация</h3>
                  <p className="text-sm text-emerald-700 leading-relaxed">{selectedMarker.recommendation}</p>
                </div>
              )}

              <Button 
                onClick={() => setSelectedMarker(null)}
                className="w-full mt-4"
                data-testid="button-close-modal"
              >
                Закрыть
              </Button>
            </div>
          </Card>
        </div>
      )}

      <BottomNav />
    </div>
  );
}