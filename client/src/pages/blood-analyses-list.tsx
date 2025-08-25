import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Calendar, Activity, Plus, ChevronRight, Clock } from "lucide-react";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function BloodAnalysesListPage() {
  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["/api/blood-analyses"],
  });

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

        {/* Analyses List */}
        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trust-green mx-auto"></div>
            </div>
          ) : analyses.length > 0 ? (
            (analyses as any[]).map((analysis: any) => (
              <Link key={analysis.id} href={`/blood-analyses/${analysis.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          analysis.status === 'analyzed' ? 'bg-trust-green/10' : 'bg-gray-100'
                        }`}>
                          <FileText className={`w-5 h-5 ${
                            analysis.status === 'analyzed' ? 'text-trust-green' : 'text-gray-500'
                          }`} />
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
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2 ml-12">
                          {analysis.results.summary}
                        </p>
                      )}
                      {analysis.status === 'analyzed' && analysis.results?.markers && (
                        <div className="flex gap-2 mt-2 ml-12">
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
            ))
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