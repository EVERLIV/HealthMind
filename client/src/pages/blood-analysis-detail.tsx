import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle, Info, Heart, Shield, Brain } from "lucide-react";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { useState } from "react";

interface BloodMarker {
  name: string;
  value: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  recommendation?: string;
  education?: string;
}

export default function BloodAnalysisDetailPage() {
  const { id } = useParams();
  const [expandedMarker, setExpandedMarker] = useState<string | null>(null);
  
  const { data: analysis, isLoading } = useQuery({
    queryKey: [`/api/blood-analyses/${id}`],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high':
        return <TrendingUp className="w-4 h-4" />;
      case 'low':
        return <TrendingDown className="w-4 h-4" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'high':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
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

  const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('гемоглобин') || lowerName.includes('эритроцит')) {
      return <Heart className="w-4 h-4 text-red-500" />;
    }
    if (lowerName.includes('лейкоцит') || lowerName.includes('лимфоцит')) {
      return <Shield className="w-4 h-4 text-blue-500" />;
    }
    if (lowerName.includes('тромбоцит')) {
      return <Brain className="w-4 h-4 text-purple-500" />;
    }
    return <Info className="w-4 h-4 text-gray-500" />;
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

  const results = (analysis as any).results;
  const normalCount = results.markers?.filter((m: BloodMarker) => m.status === 'normal').length || 0;
  const totalCount = results.markers?.length || 0;
  const healthScore = totalCount > 0 ? Math.round((normalCount / totalCount) * 100) : 0;

  return (
    <div className="eva-page">
      <MobileNav />
      
      <main className="eva-page-content pb-24">
        {/* Header */}
        <div className="bg-white sticky top-0 z-10 -mx-4 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
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
            <h1 className="text-xl font-bold">Результаты анализа</h1>
          </div>
        </div>

        {/* Health Score Card */}
        <Card className="mt-6 p-6 bg-gradient-to-br from-trust-green/5 to-medical-blue/5 border-trust-green/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Общее состояние</h2>
              <p className="text-sm text-muted-foreground">
                {normalCount} из {totalCount} показателей в норме
              </p>
            </div>
            <div className="text-3xl font-bold text-trust-green">
              {healthScore}%
            </div>
          </div>
          <Progress value={healthScore} className="h-2 mb-4" />
          <p className="text-sm text-muted-foreground">
            {results.summary}
          </p>
        </Card>

        {/* Biomarkers - Compact Grid */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Показатели анализа</h2>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-green-50 p-2 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {results.markers?.filter((m: BloodMarker) => m.status === 'normal').length || 0}
              </div>
              <div className="text-xs text-green-700">В норме</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {results.markers?.filter((m: BloodMarker) => m.status === 'high' || m.status === 'low').length || 0}
              </div>
              <div className="text-xs text-yellow-700">Отклонения</div>
            </div>
            <div className="bg-red-50 p-2 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {results.markers?.filter((m: BloodMarker) => m.status === 'critical').length || 0}
              </div>
              <div className="text-xs text-red-700">Критично</div>
            </div>
          </div>

          {/* Compact Biomarker Cards */}
          <div className="grid grid-cols-2 gap-2">
            {results.markers?.map((marker: BloodMarker, index: number) => (
              <Card
                key={index}
                className={`p-3 cursor-pointer transition-all ${
                  expandedMarker === marker.name ? 'col-span-2 shadow-lg' : ''
                } ${marker.status === 'critical' ? 'border-red-300 bg-red-50/20' : ''}`}
                onClick={() => setExpandedMarker(
                  expandedMarker === marker.name ? null : marker.name
                )}
                data-testid={`marker-card-${index}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5">{getCategoryIcon(marker.name)}</div>
                    <h3 className="font-medium text-xs truncate max-w-[100px]">{marker.name}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(marker.status)}`}>
                    {getStatusIcon(marker.status)}
                  </span>
                </div>
                <p className="text-sm font-bold">{marker.value}</p>
                
                {expandedMarker === marker.name && (
                  <div className="mt-3 space-y-2 animate-in slide-in-from-top duration-200">
                    <div className="text-xs px-2 py-1 rounded bg-gray-100">
                      <span className={`font-medium ${
                        marker.status === 'normal' ? 'text-green-700' : 
                        marker.status === 'critical' ? 'text-red-700' : 'text-yellow-700'
                      }`}>
                        Статус: {getStatusText(marker.status)}
                      </span>
                    </div>
                    {marker.education && (
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-[10px] font-medium text-blue-900 mb-0.5">📚 Описание</p>
                        <p className="text-[10px] text-blue-700 leading-relaxed">{marker.education}</p>
                      </div>
                    )}
                    {marker.recommendation && (
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-[10px] font-medium text-green-900 mb-0.5">💡 Персональная рекомендация</p>
                        <p className="text-[10px] text-green-700 leading-relaxed">{marker.recommendation}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {results.recommendations && results.recommendations.length > 0 && (
          <Card className="mt-6 p-4 bg-green-50 border-green-200">
            <h3 className="font-semibold text-sm mb-3 text-green-900">
              🎯 Общие рекомендации
            </h3>
            <ul className="space-y-2">
              {results.recommendations.map((rec: string, index: number) => (
                <li key={index} className="text-xs text-green-700 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Risk Factors */}
        {results.riskFactors && results.riskFactors.length > 0 && (
          <Card className="mt-6 p-4 bg-yellow-50 border-yellow-200">
            <h3 className="font-semibold text-sm mb-3 text-yellow-900">
              ⚠️ Факторы риска
            </h3>
            <ul className="space-y-2">
              {results.riskFactors.map((risk: string, index: number) => (
                <li key={index} className="text-xs text-yellow-700 flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <Link href="/chat">
            <Button className="w-full bg-medical-blue hover:bg-medical-blue/90">
              💬 Обсудить с ИИ-врачом
            </Button>
          </Link>
          <Link href="/blood-analysis">
            <Button variant="outline" className="w-full">
              📷 Загрузить новый анализ
            </Button>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}