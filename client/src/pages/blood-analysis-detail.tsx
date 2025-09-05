import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle, Info, Heart, Shield, Brain, Activity, Droplets, Zap, Filter, Grid3X3, BarChart3, CheckCircle, Sparkles, Stethoscope, X } from "lucide-react";
import { IconContainer, iconSizes } from "@/components/ui/icon-container";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { useState, useMemo } from "react";

interface BloodMarker {
  name: string;
  value: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  recommendation?: string;
  education?: string;
  unit?: string;
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
            <Link href="/app/blood-analyses">
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
        {/* Белый Header */}
        <div className="bg-white sticky top-16 z-10 -mx-4 border-b border-gray-100 shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Link href="/app/blood-analyses">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <IconContainer size="xs" variant="soft-primary">
                      <Brain className={iconSizes.xs} />
                    </IconContainer>
                    <h1 className="text-lg font-bold text-gray-900">ИИ Анализ крови</h1>
                  </div>
                  <p className="text-gray-600 text-sm">Результаты готовы</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{healthScore}%</div>
                <div className="text-xs text-gray-500">здоровья</div>
              </div>
            </div>
            
            {/* Компактная статистика */}
            <div className="bg-gray-50 rounded-2xl p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <IconContainer size="xs" variant="soft-success">
                      <CheckCircle className={iconSizes.xs} />
                    </IconContainer>
                    <span className="text-gray-700">{normalCount} норма</span>
                  </div>
                  {abnormalCount > 0 && (
                    <div className="flex items-center gap-2">
                      <IconContainer size="xs" variant="soft-warning">
                        <AlertTriangle className={iconSizes.xs} />
                      </IconContainer>
                      <span className="text-gray-700">{abnormalCount} откл</span>
                    </div>
                  )}
                  {criticalCount > 0 && (
                    <div className="flex items-center gap-2">
                      <IconContainer size="xs" variant="soft-danger">
                        <AlertTriangle className={iconSizes.xs} />
                      </IconContainer>
                      <span className="text-gray-700">{criticalCount} крит</span>
                    </div>
                  )}
                </div>
                <Badge className="bg-white text-gray-700 border-gray-200 text-xs">
                  {totalCount} показателей
                </Badge>
              </div>
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

          {/* EVA Маркеры с современным дизайном */}
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3"}>
            {filteredMarkers.map((marker: BloodMarker, index: number) => {
              const { icon: IconComponent, color } = getCategoryData(marker.name);
              
              const getMarkerVariant = (status: string) => {
                switch (status) {
                  case "normal": return "soft-success";
                  case "high": 
                  case "low": return "soft-warning"; 
                  case "critical": return "soft-danger";
                  default: return "soft-neutral";
                }
              };

              const getStatusIconComponent = (status: string) => {
                switch (status) {
                  case "normal": return CheckCircle;
                  case "high": 
                  case "low": 
                  case "critical": return AlertTriangle;
                  default: return Activity;
                }
              };

              const StatusIcon = getStatusIconComponent(marker.status);
              
              return (
                <Card
                  key={index}
                  className={`eva-mobile-spacing cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] rounded-2xl border-0 shadow-sm ${
                    marker.status === 'critical' ? 'ring-2 ring-red-200 bg-red-50/50' : 
                    marker.status === 'normal' ? 'bg-emerald-50/30' : 'bg-amber-50/30'
                  }`}
                  onClick={() => setSelectedMarker(marker)}
                  data-testid={`marker-card-${index}`}
                >
                  {viewMode === "grid" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <IconContainer size="sm" variant={getMarkerVariant(marker.status)}>
                          <IconComponent className={iconSizes.sm} />
                        </IconContainer>
                        <IconContainer size="xs" variant={getMarkerVariant(marker.status)}>
                          <StatusIcon className={iconSizes.xs} />
                        </IconContainer>
                      </div>
                      <div>
                        <h3 className="font-semibold text-xs leading-tight mb-1 line-clamp-2 text-gray-900">{marker.name}</h3>
                        <p className="text-sm font-bold text-gray-800">{marker.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{getStatusText(marker.status)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <IconContainer size="sm" variant={getMarkerVariant(marker.status)}>
                        <IconComponent className={iconSizes.sm} />
                      </IconContainer>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate text-gray-900">{marker.name}</h3>
                        <p className="text-xs text-gray-600">{marker.value}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <IconContainer size="xs" variant={getMarkerVariant(marker.status)}>
                          <StatusIcon className={iconSizes.xs} />
                        </IconContainer>
                        <span className="text-xs text-gray-500 eva-mobile-text">{getStatusText(marker.status)}</span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>


        {/* EVA Действия */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/app/chat">
            <Button 
              size="sm" 
              className="w-full eva-gradient-primary text-white text-xs h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 border-0"
            >
              <IconContainer size="xs" className="bg-white/20 text-white border-white/30">
                <Brain className={iconSizes.xs} />
              </IconContainer>
              <span className="font-medium">Обсудить с ИИ</span>
            </Button>
          </Link>
          <Link href="/app/blood-analysis">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs h-12 rounded-xl border-2 border-slate-200 hover:border-medical-blue hover:text-medical-blue transition-all duration-200 flex items-center gap-2"
            >
              <IconContainer size="xs" variant="soft-primary">
                <Activity className={iconSizes.xs} />
              </IconContainer>
              <span className="font-medium">Новый анализ</span>
            </Button>
          </Link>
        </div>
      </main>

      {/* EVA Модальное окно деталей биомаркера */}
      {selectedMarker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setSelectedMarker(null)}>
          <Card 
            className="w-full max-h-[80vh] overflow-y-auto rounded-t-3xl border-0 shadow-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Компактный заголовок */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 z-10 rounded-t-3xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedMarker.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-800">{selectedMarker.value}</span>
                    <Badge className={
                      selectedMarker.status === 'normal' ? 'bg-green-100 text-green-700' :
                      selectedMarker.status === 'critical' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }>
                      {getStatusText(selectedMarker.status)}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedMarker(null)}
                  className="h-8 w-8 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Что это показывает</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedMarker.education || 'Важный показатель для оценки состояния здоровья'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Рекомендации</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedMarker.recommendation || 'Обратитесь к врачу для получения персональных рекомендаций по этому показателю'}
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => setSelectedMarker(null)}
                className="w-full h-10 text-sm"
                variant="outline"
                data-testid="button-close-modal"
              >
                Понятно
              </Button>
            </div>
          </Card>
        </div>
      )}

      <BottomNav />
    </div>
  );
}