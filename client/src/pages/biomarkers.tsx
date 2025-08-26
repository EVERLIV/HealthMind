import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Sparkles
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

// Enhanced category colors for mobile
const categoryColors = {
  blood: { bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-700 dark:text-red-400", border: "border-red-200" },
  cardiovascular: { bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200" },
  metabolic: { bg: "bg-orange-50 dark:bg-orange-950/20", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200" },
  kidney: { bg: "bg-green-50 dark:bg-green-950/20", text: "text-green-700 dark:text-green-400", border: "border-green-200" },
  liver: { bg: "bg-purple-50 dark:bg-purple-950/20", text: "text-purple-700 dark:text-purple-400", border: "border-purple-200" },
  immune: { bg: "bg-cyan-50 dark:bg-cyan-950/20", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-200" },
  brain: { bg: "bg-indigo-50 dark:bg-indigo-950/20", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-200" },
};

const importanceColors = {
  high: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  medium: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", dot: "bg-yellow-500" },
  low: { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-500" },
};

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

const generateTrend = () => ({
  direction: Math.random() > 0.5 ? 'up' : 'down',
  percentage: Math.floor(Math.random() * 20) + 1,
  values: Array.from({length: 6}, () => Math.random() * 100)
});

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
                <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Stethoscope className="w-4 h-4" />
                </div>
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
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">Биомаркеры не найдены</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Попробуйте изменить параметры поиска
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredBiomarkers.map((biomarker: any) => {
              const categoryData = categoryColors[biomarker.category as keyof typeof categoryColors] || categoryColors.blood;
              const IconComponent = iconMap[biomarker.category as keyof typeof iconMap] || Activity;
              const importanceStyle = importanceColors[biomarker.importance as keyof typeof importanceColors];
              const trend = generateTrend(); // In real app, this would come from API

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
                        <div className={`p-2 ${categoryData.bg} rounded-lg border ${categoryData.border} flex-shrink-0`}>
                          <IconComponent className={`w-4 h-4 ${categoryData.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm leading-tight mb-1">{biomarker.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {biomarker.description}
                          </p>
                        </div>
                        <Badge className={`${importanceStyle.bg} ${importanceStyle.text} border-0 text-xs px-2 py-0.5 flex-shrink-0`}>
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

      {/* Simplified Modal for Details and History */}
      <Dialog open={!!selectedBiomarkerId} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-sm mx-auto max-h-[85vh] p-0">
          <ScrollArea className="max-h-[85vh]">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!showHistory ? (
                    <>
                      <Eye className="w-4 h-4 text-medical-blue" />
                      <span className="text-base">Детали биомаркера</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 text-medical-blue" />
                      <span className="text-base">История изменений</span>
                    </>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={closeModal} className="h-6 w-6">
                  <X className="w-4 h-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>

            <div className="px-4 pb-4">
              {selectedBiomarker ? (
                <div className="space-y-4">
                  {!showHistory ? (
                    /* Details View */
                    <>
                      <div className="text-center">
                        <h3 className="font-bold text-lg">{selectedBiomarker.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {selectedBiomarker.category}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Описание</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedBiomarker.description}
                        </p>
                      </div>

                      {selectedBiomarker.normalRange && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <h4 className="font-semibold text-sm mb-2">Нормальные значения</h4>
                          <div className="text-lg font-bold font-mono text-green-600">
                            {selectedBiomarker.normalRange.min} - {selectedBiomarker.normalRange.max}
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                              {selectedBiomarker.normalRange.unit}
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedBiomarker.recommendations && selectedBiomarker.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Рекомендации</h4>
                          <div className="space-y-2">
                            {selectedBiomarker.recommendations.map((rec: string, index: number) => (
                              <div key={index} className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-xs leading-relaxed">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setShowHistory(true)}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          История
                        </Button>
                      </div>
                    </>
                  ) : (
                    /* History View */
                    <>
                      <div className="text-center">
                        <h3 className="font-bold text-lg">{selectedBiomarker.name}</h3>
                        <p className="text-sm text-muted-foreground">История результатов</p>
                      </div>

                      {biomarkerHistory && Array.isArray(biomarkerHistory) && biomarkerHistory.length > 0 ? (
                        <div className="space-y-3">
                          <div className="text-center p-3 bg-medical-blue/10 rounded-lg">
                            <div className="text-sm font-medium text-medical-blue">
                              Всего записей: {biomarkerHistory.length}
                            </div>
                          </div>
                          
                          {biomarkerHistory.slice(0, 5).map((entry: any, index: number) => (
                            <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <div className="flex justify-between items-center mb-1">
                                <div className="font-mono font-bold">
                                  {entry.value} {entry.unit}
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
                              <div className="text-xs text-muted-foreground">
                                {new Date(entry.date).toLocaleDateString('ru-RU')}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            История результатов пока не доступна
                          </p>
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setShowHistory(false)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Назад к деталям
                      </Button>
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