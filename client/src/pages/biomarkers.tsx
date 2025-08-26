import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  Clock,
  ArrowLeft,
  Stethoscope,
  LineChart,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Eye,
  Calendar,
  Plus,
  Minus,
  RotateCcw
} from "lucide-react";

// Enhanced icon mapping with more categories
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
  minerals: BarChart3,
  inflammatory: AlertTriangle,
};

// Enhanced category colors
const categoryColors = {
  blood: { bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
  cardiovascular: { bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  metabolic: { bg: "bg-orange-50 dark:bg-orange-950/20", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
  kidney: { bg: "bg-green-50 dark:bg-green-950/20", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
  liver: { bg: "bg-purple-50 dark:bg-purple-950/20", text: "text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
  immune: { bg: "bg-cyan-50 dark:bg-cyan-950/20", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-800" },
  brain: { bg: "bg-indigo-50 dark:bg-indigo-950/20", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-800" },
  hormonal: { bg: "bg-pink-50 dark:bg-pink-950/20", text: "text-pink-700 dark:text-pink-400", border: "border-pink-200 dark:border-pink-800" },
  vitamins: { bg: "bg-yellow-50 dark:bg-yellow-950/20", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-200 dark:border-yellow-800" },
  minerals: { bg: "bg-slate-50 dark:bg-slate-950/20", text: "text-slate-700 dark:text-slate-400", border: "border-slate-200 dark:border-slate-800" },
  inflammatory: { bg: "bg-rose-50 dark:bg-rose-950/20", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800" },
};

const importanceColors = {
  high: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  medium: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", dot: "bg-yellow-500" },
  low: { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-500" },
};

// Mock trend data - in real app would come from API
const generateTrend = () => ({
  direction: Math.random() > 0.5 ? 'up' : 'down',
  percentage: Math.floor(Math.random() * 20) + 1,
  period: '30д',
  values: Array.from({length: 7}, () => Math.random() * 100)
});

const BiomarkerTrend = ({ trend }: { trend: any }) => {
  const isUp = trend.direction === 'up';
  const TrendIcon = isUp ? TrendingUp : TrendingDown;
  const colorClass = isUp ? "text-green-600" : "text-red-600";

  return (
    <div className="flex items-center gap-1 text-xs">
      <TrendIcon className={`w-3 h-3 ${colorClass}`} />
      <span className={colorClass}>{trend.percentage}%</span>
      <span className="text-muted-foreground">{trend.period}</span>
    </div>
  );
};

const MiniChart = ({ values, color = "bg-medical-blue" }: { values: number[]; color?: string }) => (
  <div className="flex items-end gap-0.5 h-8 w-16">
    {values.map((value, index) => (
      <div
        key={index}
        className={`w-1.5 ${color} opacity-70 rounded-sm transition-all duration-300 hover:opacity-100`}
        style={{ height: `${Math.max(value, 10)}%` }}
      />
    ))}
  </div>
);

export default function Biomarkers() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImportance, setSelectedImportance] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { data: biomarkers, isLoading } = useQuery({
    queryKey: ["/api/biomarkers"],
  });

  const { data: bloodAnalyses } = useQuery({
    queryKey: ["/api/blood-analyses"],
  });

  // Enhanced filtering and sorting logic
  const filteredAndSortedBiomarkers = useMemo(() => {
    if (!Array.isArray(biomarkers)) return [];
    
    let filtered = biomarkers.filter((biomarker: any) => {
      const matchesSearch = biomarker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          biomarker.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || biomarker.category === selectedCategory;
      const matchesImportance = selectedImportance === "all" || biomarker.importance === selectedImportance;
      
      return matchesSearch && matchesCategory && matchesImportance;
    });

    // Sorting
    filtered = filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "importance":
          const importanceOrder = { high: 3, medium: 2, low: 1 };
          return importanceOrder[b.importance as keyof typeof importanceOrder] - 
                 importanceOrder[a.importance as keyof typeof importanceOrder];
        case "category":
          return a.category.localeCompare(b.category);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [biomarkers, searchTerm, selectedCategory, selectedImportance, sortBy]);

  // Group biomarkers by category
  const groupedBiomarkers = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredAndSortedBiomarkers.forEach((biomarker: any) => {
      if (!groups[biomarker.category]) {
        groups[biomarker.category] = [];
      }
      groups[biomarker.category].push({
        ...biomarker,
        trend: generateTrend() // In real app, this would come from API
      });
    });
    return groups;
  }, [filteredAndSortedBiomarkers]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!Array.isArray(biomarkers)) return { total: 0, high: 0, medium: 0, low: 0, categories: 0 };
    
    return {
      total: biomarkers.length,
      high: biomarkers.filter((b: any) => b.importance === 'high').length,
      medium: biomarkers.filter((b: any) => b.importance === 'medium').length,
      low: biomarkers.filter((b: any) => b.importance === 'low').length,
      categories: new Set(biomarkers.map((b: any) => b.category)).size,
    };
  }, [biomarkers]);

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <MobileNav />
        <main className="px-3 py-4 pb-24">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
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
        {/* Modern Medical Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-medical-blue via-blue-500 to-trust-green relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]"></div>
            </div>
            <div className="relative p-5 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/")}
                    className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">
                      Мои биомаркеры
                    </h1>
                    <p className="text-white/90 text-sm font-medium">
                      Умная аналитика показателей здоровья
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                  <div className="text-lg font-bold">{stats.total}</div>
                  <div className="text-xs text-white/80">Всего</div>
                </div>
                <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                  <div className="text-lg font-bold text-red-200">{stats.high}</div>
                  <div className="text-xs text-white/80">Критичных</div>
                </div>
                <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                  <div className="text-lg font-bold text-yellow-200">{stats.medium}</div>
                  <div className="text-xs text-white/80">Важных</div>
                </div>
                <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                  <div className="text-lg font-bold">{stats.categories}</div>
                  <div className="text-xs text-white/80">Категорий</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Поиск биомаркеров..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-2 focus:border-medical-blue transition-colors"
                />
              </div>
              
              {/* Filters Row */}
              <div className="flex flex-wrap gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-auto min-w-[120px] rounded-xl border-2">
                    <Filter className="w-4 h-4 mr-1" />
                    <SelectValue placeholder="Категория" />
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

                <Select value={selectedImportance} onValueChange={setSelectedImportance}>
                  <SelectTrigger className="w-auto min-w-[120px] rounded-xl border-2">
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

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-auto min-w-[120px] rounded-xl border-2">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">По названию</SelectItem>
                    <SelectItem value="importance">По важности</SelectItem>
                    <SelectItem value="category">По категории</SelectItem>
                  </SelectContent>
                </Select>

                <div className="ml-auto flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-xl"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="rounded-xl"
                  >
                    <LineChart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {searchTerm && (
          <div className="mb-4">
            <Badge className="bg-medical-blue/10 text-medical-blue border-medical-blue/20 text-sm px-3 py-1">
              Найдено {filteredAndSortedBiomarkers.length} из {stats.total} биомаркеров
            </Badge>
          </div>
        )}

        {/* Biomarkers by Category */}
        <div className="space-y-4">
          {Object.entries(groupedBiomarkers).map(([category, categoryBiomarkers]) => {
            const categoryData = categoryColors[category as keyof typeof categoryColors] || categoryColors.blood;
            const IconComponent = iconMap[category as keyof typeof iconMap] || Activity;
            const isCollapsed = collapsedCategories.has(category);
            const categoryStats = {
              total: categoryBiomarkers.length,
              high: categoryBiomarkers.filter(b => b.importance === 'high').length,
              medium: categoryBiomarkers.filter(b => b.importance === 'medium').length,
              low: categoryBiomarkers.filter(b => b.importance === 'low').length,
            };

            return (
              <Card key={category} className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                {/* Category Header */}
                <CardHeader
                  className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${categoryData.bg} ${categoryData.border} border-b`}
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${categoryData.bg} rounded-xl border ${categoryData.border}`}>
                        <IconComponent className={`w-5 h-5 ${categoryData.text}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg capitalize flex items-center gap-2">
                          {category === 'blood' && 'Кровь'}
                          {category === 'cardiovascular' && 'Сердечно-сосудистая система'}
                          {category === 'metabolic' && 'Метаболизм'}
                          {category === 'kidney' && 'Почки'}
                          {category === 'liver' && 'Печень'}
                          {category === 'immune' && 'Иммунная система'}
                          {category === 'brain' && 'Нервная система'}
                          <Badge className="text-xs">{categoryStats.total}</Badge>
                        </h3>
                        <div className="flex gap-2 mt-1">
                          {categoryStats.high > 0 && (
                            <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5">
                              {categoryStats.high} критичных
                            </Badge>
                          )}
                          {categoryStats.medium > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5">
                              {categoryStats.medium} важных
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`${categoryData.bg} ${categoryData.text} border-0 text-xs px-2 py-1`}>
                        {categoryBiomarkers.length} показателей
                      </Badge>
                      {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </div>
                  </div>
                </CardHeader>

                {/* Category Content */}
                {!isCollapsed && (
                  <CardContent className="p-4">
                    {viewMode === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryBiomarkers.map((biomarker: any, index: number) => {
                          const importanceStyle = importanceColors[biomarker.importance as keyof typeof importanceColors];
                          
                          return (
                            <Card
                              key={biomarker.id}
                              className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                              data-testid={`card-biomarker-${biomarker.id}`}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  {/* Header */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-sm leading-tight">{biomarker.name}</h4>
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {biomarker.description}
                                      </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 ml-2">
                                      <Badge className={`${importanceStyle.bg} ${importanceStyle.text} border-0 text-xs px-2 py-0.5`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${importanceStyle.dot} mr-1`}></div>
                                        {biomarker.importance === 'high' ? 'Критичный' : 
                                         biomarker.importance === 'medium' ? 'Важный' : 'Обычный'}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Normal Range */}
                                  {biomarker.normalRange && (
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="text-xs text-muted-foreground mb-1">Норма</div>
                                          <div className="font-mono text-sm font-bold">
                                            {biomarker.normalRange.min} - {biomarker.normalRange.max}
                                            <span className="text-xs font-normal text-muted-foreground ml-1">
                                              {biomarker.normalRange.unit}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <BiomarkerTrend trend={biomarker.trend} />
                                          <MiniChart 
                                            values={biomarker.trend.values} 
                                            color={biomarker.trend.direction === 'up' ? 'bg-green-500' : 'bg-red-500'} 
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Actions */}
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1 rounded-lg text-xs h-8">
                                      <Eye className="w-3 h-3 mr-1" />
                                      Детали
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1 rounded-lg text-xs h-8">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      История
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      /* Table View */
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                              <th className="text-left p-2 font-semibold">Показатель</th>
                              <th className="text-left p-2 font-semibold">Норма</th>
                              <th className="text-left p-2 font-semibold">Важность</th>
                              <th className="text-left p-2 font-semibold">Тренд</th>
                              <th className="text-right p-2 font-semibold">Действия</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categoryBiomarkers.map((biomarker: any) => {
                              const importanceStyle = importanceColors[biomarker.importance as keyof typeof importanceColors];
                              
                              return (
                                <tr key={biomarker.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                  <td className="p-2">
                                    <div>
                                      <div className="font-medium">{biomarker.name}</div>
                                      <div className="text-xs text-muted-foreground line-clamp-1">
                                        {biomarker.description}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    {biomarker.normalRange ? (
                                      <div className="font-mono text-sm">
                                        {biomarker.normalRange.min}-{biomarker.normalRange.max}
                                        <span className="text-xs text-muted-foreground ml-1">
                                          {biomarker.normalRange.unit}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </td>
                                  <td className="p-2">
                                    <Badge className={`${importanceStyle.bg} ${importanceStyle.text} border-0 text-xs`}>
                                      <div className={`w-1.5 h-1.5 rounded-full ${importanceStyle.dot} mr-1`}></div>
                                      {biomarker.importance === 'high' ? 'Критичный' : 
                                       biomarker.importance === 'medium' ? 'Важный' : 'Обычный'}
                                    </Badge>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      <BiomarkerTrend trend={biomarker.trend} />
                                      <MiniChart 
                                        values={biomarker.trend.values} 
                                        color={biomarker.trend.direction === 'up' ? 'bg-green-500' : 'bg-red-500'} 
                                      />
                                    </div>
                                  </td>
                                  <td className="p-2 text-right">
                                    <div className="flex gap-1 justify-end">
                                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                        <Eye className="w-3 h-3" />
                                      </Button>
                                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                        <Calendar className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAndSortedBiomarkers.length === 0 && !isLoading && (
          <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">Биомаркеры не найдены</h3>
              <p className="text-muted-foreground mb-4">
                Попробуйте изменить параметры поиска или фильтры
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedImportance("all");
                }}
                className="bg-gradient-to-r from-medical-blue to-trust-green hover:opacity-90 text-white rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Сбросить фильтры
              </Button>
            </CardContent>
          </Card>
        )}

        {/* AI Insights */}
        {filteredAndSortedBiomarkers.length > 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 via-white to-yellow-50/30 dark:from-orange-950/20 dark:via-slate-800 dark:to-yellow-900/20 mt-6">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-500/15 to-yellow-500/10 rounded-xl border border-orange-200/50 dark:border-orange-800/50 shadow-sm">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    ИИ Анализ биомаркеров
                    <Badge className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5">AI</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    🧬 Обнаружены потенциальные взаимосвязи между показателями сердечно-сосудистой системы и метаболизма. 
                    Рекомендуется обратить внимание на уровень холестерина и глюкозы.
                  </p>
                  <Link href="/recommendations">
                    <Button size="sm" className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:opacity-90 text-white rounded-xl">
                      <Target className="w-4 h-4 mr-1" />
                      Персональные рекомендации
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}