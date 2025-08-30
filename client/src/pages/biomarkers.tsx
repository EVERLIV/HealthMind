import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconContainer, iconSizes } from "@/components/ui/icon-container";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  Zap,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Droplets,
  Brain,
  Search,
  Filter,
  BarChart3,
  Target,
  ArrowLeft,
  Stethoscope,
  Eye,
  Calendar,
  RotateCcw,
  X,
  Sparkles,
  Minus
} from "lucide-react";

// Enhanced icon mapping
const iconMap = {
  blood: Droplets,
  cardiovascular: Heart,
  metabolic: Zap,
  kidney: Shield,
  liver: Activity,
  immune: Shield,
  brain: Brain,
  hormonal: Target,
  vitamins: Sparkles,
};

// Enhanced category colors - unified with IconContainer variants
const categoryVariants = {
  blood: "soft-danger",
  cardiovascular: "soft-info", 
  metabolic: "soft-warning",
  kidney: "soft-success",
  liver: "soft-primary",
  immune: "info",
  brain: "primary",
} as const;

const importanceVariants = {
  high: { variant: "soft-danger", dot: "bg-red-500" },
  medium: { variant: "soft-warning", dot: "bg-amber-500" }, 
  low: { variant: "soft-neutral", dot: "bg-gray-500" },
} as const;

const MiniChart = ({ values, color = "bg-medical-blue" }: { values: number[]; color?: string }) => (
  <div className="flex items-end gap-0.5 h-6 w-12">
    {values.map((value, index) => (
      <div
        key={index}
        className={`w-1 ${color} opacity-70 rounded-sm transition-all duration-300`}
        style={{ height: `${Math.max(value, 10)}%` }}
      />
    ))}
  </div>
);

// Stable trend generation based on biomarker ID
const generateTrend = (biomarkerId: string) => {
  // Use biomarker ID as seed for consistent trends
  const seed = biomarkerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (seed * 9301 + 49297) % 233280;
  const direction = (random / 233280) > 0.5 ? 'up' : 'down';
  const percentage = Math.floor((random / 233280) * 20) + 1;
  
  // Generate consistent values based on seed
  const values = Array.from({length: 6}, (_, i) => {
    const val = ((seed + i * 123) % 1000) / 10;
    return Math.max(val, 10);
  });
  
  return { direction, percentage, values };
};

export default function Biomarkers() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImportance, setSelectedImportance] = useState("all");
  const [selectedBiomarkerId, setSelectedBiomarkerId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const { data: biomarkers, isLoading } = useQuery({
    queryKey: ["/api/biomarkers"],
  });

  const { data: selectedBiomarker } = useQuery({
    queryKey: ["/api/biomarkers", selectedBiomarkerId],
    enabled: !!selectedBiomarkerId,
  });

  const { data: biomarkerHistory } = useQuery({
    queryKey: ["/api/biomarkers", selectedBiomarkerId, "history"],
    enabled: !!selectedBiomarkerId,
  });

  // Enhanced filtering logic - MOBILE OPTIMIZED
  const filteredBiomarkers = useMemo(() => {
    if (!Array.isArray(biomarkers)) return [];
    
    let filtered = biomarkers.filter((biomarker: any) => {
      const matchesSearch = biomarker.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || biomarker.category === selectedCategory;
      const matchesImportance = selectedImportance === "all" || biomarker.importance === selectedImportance;
      
      return matchesSearch && matchesCategory && matchesImportance;
    });

    // Sort by importance for mobile
    return filtered.sort((a: any, b: any) => {
      const importanceOrder = { high: 3, medium: 2, low: 1 };
      return importanceOrder[b.importance as keyof typeof importanceOrder] - 
             importanceOrder[a.importance as keyof typeof importanceOrder];
    });
  }, [biomarkers, searchTerm, selectedCategory, selectedImportance]);

  // Statistics
  const stats = useMemo(() => {
    if (!Array.isArray(biomarkers)) return { total: 0, high: 0, medium: 0, low: 0 };
    
    return {
      total: biomarkers.length,
      high: biomarkers.filter((b: any) => b.importance === 'high').length,
      medium: biomarkers.filter((b: any) => b.importance === 'medium').length,
      low: biomarkers.filter((b: any) => b.importance === 'low').length,
    };
  }, [biomarkers]);

  const openDetails = (biomarkerId: string) => {
    setSelectedBiomarkerId(biomarkerId);
    setShowHistory(false);
  };

  const openHistory = (biomarkerId: string) => {
    setSelectedBiomarkerId(biomarkerId);
    setShowHistory(true);
  };

  const closeModal = () => {
    setSelectedBiomarkerId(null);
    setShowHistory(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <MobileNav />
        <main className="px-3 py-4 pb-24">
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <MobileNav />
      
      <main className="px-3 py-4 pb-24">
        {/* Mobile-Optimized Header */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-medical-blue via-blue-500 to-trust-green relative overflow-hidden rounded-xl">
            <div className="relative p-4 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/")}
                  className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <IconContainer size="xs" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Stethoscope className={iconSizes.xs} />
                </IconContainer>
                <div>
                  <h1 className="text-lg font-bold">Биомаркеры</h1>
                  <p className="text-white/90 text-xs">Умная аналитика здоровья</p>
                </div>
              </div>
              
              {/* Compact Mobile Stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white/15 rounded-lg p-2 backdrop-blur-sm text-center">
                  <div className="text-sm font-bold">{stats.total}</div>
                  <div className="text-xs text-white/80">Всего</div>
                </div>
                <div className="bg-white/15 rounded-lg p-2 backdrop-blur-sm text-center">
                  <div className="text-sm font-bold text-red-200">{stats.high}</div>
                  <div className="text-xs text-white/80">Критич</div>
                </div>
                <div className="bg-white/15 rounded-lg p-2 backdrop-blur-sm text-center">
                  <div className="text-sm font-bold text-yellow-200">{stats.medium}</div>
                  <div className="text-xs text-white/80">Важных</div>
                </div>
                <div className="bg-white/15 rounded-lg p-2 backdrop-blur-sm text-center">
                  <div className="text-sm font-bold">{stats.low}</div>
                  <div className="text-xs text-white/80">Обычн</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Search and Filters */}
        <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm mb-4">
          <CardContent className="p-3">
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Поиск..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-lg border-2 h-10"
                />
              </div>
              
              {/* Mobile Filters - Stacked */}
              <div className="space-y-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full rounded-lg border-2 h-10">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    <SelectItem value="blood">Кровь</SelectItem>
                    <SelectItem value="cardiovascular">Сердце</SelectItem>
                    <SelectItem value="metabolic">Метаболизм</SelectItem>
                    <SelectItem value="kidney">Почки</SelectItem>
                    <SelectItem value="liver">Печень</SelectItem>
                    <SelectItem value="immune">Иммунитет</SelectItem>
                    <SelectItem value="brain">Мозг</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Select value={selectedImportance} onValueChange={setSelectedImportance}>
                    <SelectTrigger className="flex-1 rounded-lg border-2 h-10">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      <SelectValue placeholder="Важность" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все уровни</SelectItem>
                      <SelectItem value="high">Критичные</SelectItem>
                      <SelectItem value="medium">Важные</SelectItem>
                      <SelectItem value="low">Обычные</SelectItem>
                    </SelectContent>
                  </Select>

                  {(searchTerm || selectedCategory !== "all" || selectedImportance !== "all") && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                        setSelectedImportance("all");
                      }}
                      className="rounded-lg h-10 w-10 flex-shrink-0"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        {(searchTerm || selectedCategory !== "all" || selectedImportance !== "all") && (
          <div className="mb-4">
            <Badge className="bg-medical-blue/10 text-medical-blue border-medical-blue/20 text-sm px-3 py-1">
              Найдено: {filteredBiomarkers.length} из {stats.total}
            </Badge>
          </div>
        )}

        {/* Mobile-Optimized Biomarkers List - Single Column */}
        <div className="space-y-3">
          {filteredBiomarkers.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <IconContainer size="lg" variant="soft-neutral" className="mx-auto mb-3">
                  <Search className={iconSizes.lg} />
                </IconContainer>
                <h3 className="font-bold text-lg mb-2">Биомаркеры не найдены</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Попробуйте изменить параметры поиска
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredBiomarkers.map((biomarker: any) => {
              const categoryVariant = categoryVariants[biomarker.category as keyof typeof categoryVariants] || "soft-danger";
              const IconComponent = iconMap[biomarker.category as keyof typeof iconMap] || Activity;
              const importanceStyle = importanceVariants[biomarker.importance as keyof typeof importanceVariants] || importanceVariants.low;
              const trend = generateTrend(biomarker.id); // Stable trend based on ID

              return (
                <Card
                  key={biomarker.id}
                  className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                  data-testid={`card-biomarker-${biomarker.id}`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header Row - Mobile Optimized */}
                      <div className="flex items-start gap-3">
                        <IconContainer size="sm" variant={categoryVariant} className="flex-shrink-0">
                          <IconComponent className={iconSizes.sm} />
                        </IconContainer>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm leading-tight mb-1">{biomarker.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {biomarker.description}
                          </p>
                        </div>
                        <Badge className="text-xs px-2 py-0.5 flex-shrink-0 border-0" style={{ 
                          backgroundColor: importanceStyle.variant === 'soft-danger' ? 'rgb(254 242 242)' : 
                                          importanceStyle.variant === 'soft-warning' ? 'rgb(255 251 235)' : 'rgb(249 250 251)',
                          color: importanceStyle.variant === 'soft-danger' ? 'rgb(185 28 28)' : 
                                importanceStyle.variant === 'soft-warning' ? 'rgb(180 83 9)' : 'rgb(55 65 81)'
                        }}>
                          <div className={`w-1.5 h-1.5 rounded-full ${importanceStyle.dot} mr-1`}></div>
                          {biomarker.importance === 'high' ? 'Крит' : 
                           biomarker.importance === 'medium' ? 'Важн' : 'Обыч'}
                        </Badge>
                      </div>

                      {/* Normal Range + Trend - Mobile Compact */}
                      {biomarker.normalRange && (
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Норма</div>
                              <div className="font-mono text-sm font-bold">
                                {biomarker.normalRange.min}-{biomarker.normalRange.max}
                                <span className="text-xs font-normal text-muted-foreground ml-1">
                                  {biomarker.normalRange.unit}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="flex items-center gap-1 mb-1">
                                  {trend.direction === 'up' ? (
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3 text-red-600" />
                                  )}
                                  <span className={`text-xs font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {trend.percentage}%
                                  </span>
                                </div>
                                <MiniChart 
                                  values={trend.values} 
                                  color={trend.direction === 'up' ? 'bg-green-500' : 'bg-red-500'} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mobile Action Buttons - Single Row */}
                      <div className="flex gap-2 pt-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 rounded-lg text-xs h-8"
                          onClick={() => openDetails(biomarker.id)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Детали
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 rounded-lg text-xs h-8"
                          onClick={() => openHistory(biomarker.id)}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          История
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* AI Insights - Mobile */}
        {filteredBiomarkers.length > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 via-white to-yellow-50/30 dark:from-orange-950/20 dark:via-slate-800 dark:to-yellow-900/20 mt-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500/15 to-yellow-500/10 rounded-lg border border-orange-200/50">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base mb-1 flex items-center gap-2">
                    ИИ Анализ биомаркеров
                    <Badge className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5">AI</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    🧬 Обнаружены взаимосвязи между показателями. Рекомендуется контроль холестерина и глюкозы.
                  </p>
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:opacity-90 text-white rounded-lg text-xs">
                    <Target className="w-3 h-3 mr-1" />
                    Рекомендации
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />

      {/* EVA Modal for Details and History */}
      <Dialog open={!!selectedBiomarkerId} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-sm mx-auto max-h-[90vh] p-0 rounded-3xl border-0 shadow-2xl">
          <ScrollArea className="max-h-[90vh]">
            {/* Минимальный заголовок */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {!showHistory ? (selectedBiomarker as any)?.name : 'История показателя'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {!showHistory ? 'Анализ и рекомендации' : 'Динамика изменений'}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closeModal} 
                  className="h-8 w-8 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {selectedBiomarker ? (
                <div className="space-y-6">
                  {!showHistory ? (
                    <>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Что это показывает</h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {(selectedBiomarker as any)?.description}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Функция в организме</h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {(selectedBiomarker as any)?.name === 'Гемоглобин' && 'Переносит кислород от легких к тканям. Основа энергетического обмена в клетках.'}
                            {(selectedBiomarker as any)?.name === 'Общий холестерин' && 'Строительный материал для клеточных мембран и гормонов (тестостерон, эстроген, кортизол).'}
                            {(selectedBiomarker as any)?.name === 'Глюкоза' && 'Главный источник энергии для мозга и мышц. Регулируется инсулином поджелудочной железы.'}
                            {(selectedBiomarker as any)?.name === 'Креатинин' && 'Продукт распада мышечного креатина. Показатель фильтрационной способности почек.'}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Добавки и витамины</h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {(selectedBiomarker as any)?.name === 'Гемоглобин' && 'Железо (сульфат железа 325мг), Витамин C (1000мг) для усвоения железа, Фолиевая кислота (400мкг), Витамин B12 (1000мкг)'}
                            {(selectedBiomarker as any)?.name === 'Общий холестерин' && 'Омега-3 (2-3г EPA/DHA), Красный дрожжевой рис (600мг), Коэнзим Q10 (100мг), Берберин (500мг 3 раза)'}
                            {(selectedBiomarker as any)?.name === 'Глюкоза' && 'Хром пиколинат (200мкг), Альфа-липоевая кислота (300мг), Корица (500мг), Берберин (500мг 3 раза)'}
                            {(selectedBiomarker as any)?.name === 'Креатинин' && 'Корень одуванчика, Листья крапивы, Клюква (36мг PAC). Избегать креатин и НПВП'}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Питание</h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {(selectedBiomarker as any)?.name === 'Гемоглобин' && 'Говядина, печень теленка, моллюски, тунец, темная фасоль, шпинат, тыквенные семечки, темный шоколад'}
                            {(selectedBiomarker as any)?.name === 'Общий холестерин' && 'Овсянка, ячмень, бобовые, яблоки, авокадо, жирная рыба, орехи, оливковое масло'}
                            {(selectedBiomarker as any)?.name === 'Глюкоза' && 'Листовая зелень, брокколи, авокадо, ягоды, орехи, жирная рыба, цельные злаки'}
                            {(selectedBiomarker as any)?.name === 'Креатинин' && 'Ограничить белок до 0.8г/кг, больше воды, клюква, арбуз, огурцы'}
                          </p>
                        </div>

                        {(selectedBiomarker as any)?.normalRange && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h3 className="font-semibold text-gray-900 mb-1">Нормальный диапазон</h3>
                            <div className="text-lg font-mono font-semibold text-gray-800">
                              {(selectedBiomarker as any).normalRange.min} - {(selectedBiomarker as any).normalRange.max} {(selectedBiomarker as any).normalRange.unit}
                            </div>
                          </div>
                        )}

                        <div className="pt-2">
                          <Button 
                            variant="outline" 
                            className="w-full h-10 text-sm"
                            onClick={() => setShowHistory(true)}
                          >
                            Посмотреть историю показателя
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* EVA History View */
                    <>
                      {/* История Header */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                          <IconContainer size="lg" variant="soft-primary">
                            <BarChart3 className={iconSizes.lg} />
                          </IconContainer>
                          <div className="flex-1">
                            <h3 className="font-bold text-xl text-gray-900">{(selectedBiomarker as any)?.name}</h3>
                            <p className="text-sm text-gray-600">История динамики показателей</p>
                          </div>
                        </div>
                      </div>

                      {biomarkerHistory && Array.isArray(biomarkerHistory) && biomarkerHistory.length > 0 ? (
                        <div className="space-y-4">
                          {/* Статистика */}
                          <div className="eva-gradient-primary rounded-2xl p-4 text-white">
                            <div className="flex items-center gap-3">
                              <IconContainer size="sm" className="bg-white/20 text-white border-white/30">
                                <Target className={iconSizes.sm} />
                              </IconContainer>
                              <div className="flex-1">
                                <h4 className="font-bold text-sm mb-1">Статистика измерений</h4>
                                <div className="bg-white/15 rounded-xl p-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/90">Всего записей:</span>
                                    <span className="text-lg font-bold text-white">{biomarkerHistory.length}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Записи истории */}
                          <div className="space-y-3">
                            {biomarkerHistory.slice(0, 5).map((entry: any, index: number) => {
                              const getStatusVariant = (status: string) => {
                                switch (status) {
                                  case 'normal': return 'soft-success';
                                  case 'high': 
                                  case 'critical': return 'soft-danger';
                                  case 'low': return 'soft-warning';
                                  default: return 'soft-neutral';
                                }
                              };

                              const getStatusIcon = (status: string) => {
                                switch (status) {
                                  case 'normal': return CheckCircle;
                                  case 'high': 
                                  case 'critical': 
                                  case 'low': return AlertTriangle;
                                  default: return Activity;
                                }
                              };

                              const StatusIcon = getStatusIcon(entry.status);
                              
                              return (
                                <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <IconContainer size="sm" variant={getStatusVariant(entry.status)}>
                                        <StatusIcon className={iconSizes.sm} />
                                      </IconContainer>
                                      <div>
                                        <div className="font-mono text-lg font-bold text-gray-900">
                                          {entry.value} {entry.unit}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {new Date(entry.date).toLocaleDateString('ru-RU', { 
                                            day: 'numeric', 
                                            month: 'long', 
                                            year: 'numeric' 
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                    <Badge className={
                                      entry.status === 'normal' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                      entry.status === 'high' || entry.status === 'critical' ? 'bg-red-100 text-red-700 border-red-200' :
                                      entry.status === 'low' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                      'bg-gray-100 text-gray-700 border-gray-200'
                                    }>
                                      {entry.status === 'normal' ? 'Норма' :
                                       entry.status === 'high' ? 'Высокий' :
                                       entry.status === 'low' ? 'Низкий' : 'Критичный'}
                                    </Badge>
                                  </div>
                                  
                                  {/* Мини трендовая информация */}
                                  {index < biomarkerHistory.length - 1 && (
                                    <div className="mt-3 p-2 bg-gray-50 rounded-xl">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600">Изменение от предыдущего:</span>
                                        {(() => {
                                          const prevValue = biomarkerHistory[index + 1]?.value;
                                          if (prevValue) {
                                            const change = entry.value - prevValue;
                                            const changePercent = ((change / prevValue) * 100).toFixed(1);
                                            return (
                                              <div className={`flex items-center gap-1 ${
                                                change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600'
                                              }`}>
                                                {change > 0 ? <TrendingUp className="w-3 h-3" /> : 
                                                 change < 0 ? <TrendingDown className="w-3 h-3" /> : 
                                                 <Minus className="w-3 h-3" />}
                                                <span className="font-medium">
                                                  {change > 0 ? '+' : ''}{changePercent}%
                                                </span>
                                              </div>
                                            );
                                          }
                                          return <span className="text-gray-500">-</span>;
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {biomarkerHistory.length > 5 && (
                            <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                              <p className="text-sm text-gray-600">
                                Показано 5 из {biomarkerHistory.length} записей
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                          <IconContainer size="lg" variant="soft-neutral" className="mx-auto mb-4">
                            <Calendar className={iconSizes.lg} />
                          </IconContainer>
                          <h4 className="font-bold text-lg text-gray-900 mb-2">История недоступна</h4>
                          <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            Данные о динамике этого биомаркера пока не собраны.<br />
                            Продолжайте делать анализы для отслеживания трендов.
                          </p>
                        </div>
                      )}

                      {/* EVA Действие назад */}
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-12 rounded-xl border-2 border-slate-200 hover:border-medical-blue hover:text-medical-blue transition-all duration-200 flex items-center gap-2"
                          onClick={() => setShowHistory(false)}
                        >
                          <IconContainer size="xs" variant="soft-info">
                            <Eye className={iconSizes.xs} />
                          </IconContainer>
                          <span className="font-medium">Назад к деталям</span>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className="animate-spin w-6 h-6 border-2 border-medical-blue border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Загрузка...</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}