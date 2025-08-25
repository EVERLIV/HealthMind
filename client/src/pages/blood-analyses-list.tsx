import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Calendar, Activity, Plus, ChevronRight, Clock, Search } from "lucide-react";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function BloodAnalysesListPage() {
  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["/api/blood-analyses"],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "analyzed" | "pending">("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzed':
        return 'text-trust-green';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'analyzed':
        return 'Анализ готов';
      case 'pending':
        return 'В обработке';
      default:
        return 'Ожидает';
    }
  };

  const filteredAnalyses = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return (analyses as any[])
      .filter((a) => statusFilter === "all" ? true : a.status === statusFilter)
      .filter((a) => {
        if (!normalizedQuery) return true;
        const idMatch = (a.id || "").toString().toLowerCase().includes(normalizedQuery);
        const summaryMatch = (a.results?.summary || "").toLowerCase().includes(normalizedQuery);
        const dateMatch = (() => {
          try {
            const formatted = format(new Date(a.createdAt), "d MMM yyyy", { locale: ru }).toLowerCase();
            return formatted.includes(normalizedQuery);
          } catch {
            return false;
          }
        })();
        return idMatch || summaryMatch || dateMatch;
      });
  }, [analyses, searchQuery, statusFilter]);

  return (
    <div className="eva-page">
      <MobileNav />
      
      <main className="eva-page-content">
        {/* Header */}
        <div className="bg-white sticky top-0 z-10 -mx-4 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Мои Анализы</h1>
            </div>
            <Link href="/blood-analysis">
              <Button size="icon" className="bg-trust-green hover:bg-trust-green/90">
                <Plus className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по номеру, дате или итогу"
              className="pl-9 eva-mobile-text"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="analyzed">Готово</TabsTrigger>
              <TabsTrigger value="pending">В обработке</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Analyses List */}
        <div className="mt-6">
          {isLoading ? (
            <div className="eva-grid-auto">
              {[0,1,2].map((i) => (
                <div key={i} className="eva-card p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-5 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAnalyses.length > 0 ? (
            <div className="eva-grid-auto">
              {filteredAnalyses.map((analysis: any) => (
                <Link key={analysis.id} href={`/blood-analyses/${analysis.id}`} aria-label={`Открыть анализ ${analysis.id}`}>
                  <Card className="eva-card-interactive p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`${analysis.status === 'analyzed' ? 'bg-trust-green/10' : 'bg-gray-100'} w-10 h-10 rounded-xl flex items-center justify-center shadow-eva-sm`}>
                            <FileText className={`w-5 h-5 ${analysis.status === 'analyzed' ? 'text-trust-green' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">
                              Анализ крови #{analysis.id.slice(-6)}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(analysis.createdAt), "d MMM yyyy", { locale: ru })}
                              </span>
                              <span className={`flex items-center gap-1 ${getStatusColor(analysis.status)}`}>
                                {analysis.status === 'analyzed' ? (
                                  <Activity className="w-3 h-3" />
                                ) : (
                                  <Clock className="w-3 h-3" />
                                )}
                                {getStatusText(analysis.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {analysis.status === 'analyzed' && analysis.results?.summary && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 pl-13">
                            {analysis.results.summary}
                          </p>
                        )}
                        {analysis.status === 'analyzed' && analysis.results?.markers && (
                          <div className="flex flex-wrap gap-2 mt-2 pl-12">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              ✓ {analysis.results.markers.filter((m: any) => m.status === 'normal').length} в норме
                            </span>
                            {analysis.results.markers.filter((m: any) => m.status === 'high' || m.status === 'low').length > 0 && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                ⚠ {analysis.results.markers.filter((m: any) => m.status === 'high' || m.status === 'low').length} отклонений
                              </span>
                            )}
                            {analysis.results.markers.filter((m: any) => m.status === 'critical').length > 0 && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                ! {analysis.results.markers.filter((m: any) => m.status === 'critical').length} критических
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Нет анализов</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Загрузите свой первый анализ крови
              </p>
              <Link href="/blood-analysis">
                <Button className="bg-trust-green hover:bg-trust-green/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить анализ
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}