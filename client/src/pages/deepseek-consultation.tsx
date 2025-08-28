import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Stethoscope,
  MessageCircle,
  Brain,
  ArrowLeft,
  Send,
  Loader2,
  Sparkles,
  Heart,
  Activity,
  TestTube,
  User,
  Lightbulb,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from "lucide-react";

interface ConsultationResponse {
  analysis: string;
  recommendations: string[];
  priority: "high" | "medium" | "low";
  followUp: string[];
  disclaimer: string;
}

export default function DeepSeekConsultation() {
  const [, navigate] = useLocation();
  const [question, setQuestion] = useState("");
  const [consultationHistory, setConsultationHistory] = useState<Array<{
    question: string;
    response: ConsultationResponse;
    timestamp: Date;
  }>>([]);
  const { toast } = useToast();

  const { data: healthProfile } = useQuery({
    queryKey: ["/api/health-profile"],
  });

  const { data: bloodAnalyses } = useQuery({
    queryKey: ["/api/blood-analyses"],
  });

  const hasProfile = !!(healthProfile && ((healthProfile as any)?.profileData || (healthProfile as any)?.completionPercentage > 0));
  const hasAnalyses = !!(bloodAnalyses && Array.isArray(bloodAnalyses) && bloodAnalyses.length > 0);

  const consultationMutation = useMutation({
    mutationFn: async (consultationData: { question: string; healthProfile?: any; bloodAnalyses?: any }) => {
      const response = await apiRequest("/api/deepseek-consultation", {
        method: "POST",
        body: JSON.stringify(consultationData)
      });
      return response as ConsultationResponse;
    },
    onSuccess: (data, variables) => {
      const newConsultation = {
        question: variables.question,
        response: data,
        timestamp: new Date()
      };
      setConsultationHistory(prev => [newConsultation, ...prev]);
      setQuestion("");
      toast({
        title: "✅ Консультация готова!",
        description: "DeepSeek проанализировал ваш запрос",
        className: "bg-gradient-to-r from-medical-blue to-trust-green text-white border-0",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось получить консультацию",
        variant: "destructive",
      });
    },
  });

  const handleSubmitQuestion = () => {
    if (!question.trim()) return;

    consultationMutation.mutate({
      question: question.trim(),
      healthProfile: healthProfile,
      bloodAnalyses: bloodAnalyses
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-orange-100 text-orange-700 border-orange-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertCircle className="w-4 h-4" />;
      case "medium": return <TrendingUp className="w-4 h-4" />;
      case "low": return <CheckCircle2 className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const quickQuestions = [
    "Проанализируйте мои последние анализы крови",
    "Как улучшить мой уровень холестерина?",
    "Рекомендации по питанию на основе моего профиля",
    "Оцените риски для здоровья сердца"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <MobileNav />
      
      <main className="px-3 py-4 pb-24">
        {/* Заголовок */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-medical-blue via-blue-500 to-trust-green relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]"></div>
            </div>
            <div className="relative p-5 text-white">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg transition-all hover:bg-white/30"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-3 py-1">
                  <Brain className="w-3 h-3 mr-1.5" />
                  DeepSeek AI
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    EVERLIV HEALTH Консультант
                  </h1>
                  <p className="text-white/90 text-sm font-medium">
                    Персональные рекомендации на основе ваших данных
                  </p>
                </div>
              </div>
              
              {(hasProfile || hasAnalyses) && (
                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm border border-white/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium">Доступные данные:</span>
                  </div>
                  <div className="flex gap-2">
                    {hasProfile && (
                      <Badge className="bg-white/30 text-white border-white/20 text-xs">
                        <User className="w-3 h-3 mr-1" />
                        Профиль здоровья
                      </Badge>
                    )}
                    {hasAnalyses && (
                      <Badge className="bg-white/30 text-white border-white/20 text-xs">
                        <TestTube className="w-3 h-3 mr-1" />
                        Анализы крови
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Форма вопроса */}
        <Card className="mb-6 p-4 border-0 shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5 text-medical-blue" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Задайте вопрос консультанту
              </h2>
            </div>
            
            <Textarea
              placeholder="Например: Проанализируйте мои последние анализы и дайте рекомендации по улучшению здоровья..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={consultationMutation.isPending}
            />
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSubmitQuestion}
                disabled={!question.trim() || consultationMutation.isPending}
                className="bg-gradient-to-r from-medical-blue to-trust-green hover:from-medical-blue/90 hover:to-trust-green/90 text-white border-0 shadow-lg flex-1"
              >
                {consultationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Анализирую...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Получить консультацию
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Быстрые вопросы */}
        {quickQuestions.length > 0 && consultationHistory.length === 0 && (
          <Card className="mb-6 p-4 border-0 shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-energy-orange" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Популярные вопросы
                </h3>
              </div>
              <div className="grid gap-2">
                {quickQuestions.map((q, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => setQuestion(q)}
                    className="text-left justify-start h-auto py-3 px-4 hover:bg-gray-50 dark:hover:bg-slate-700"
                    disabled={consultationMutation.isPending}
                  >
                    <span className="text-sm">{q}</span>
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* История консультаций */}
        {consultationHistory.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              История консультаций
            </h3>
            
            {consultationHistory.map((consultation, index) => (
              <Card key={index} className="p-5 border-0 shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                <div className="space-y-4">
                  {/* Вопрос */}
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Ваш вопрос:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {consultation.question}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ответ */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-trust-green rounded-lg flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        DeepSeek Консультант
                      </span>
                      <Badge className={`${getPriorityColor(consultation.response.priority)} border text-xs`}>
                        {getPriorityIcon(consultation.response.priority)}
                        <span className="ml-1 capitalize">{consultation.response.priority}</span>
                      </Badge>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {consultation.response.analysis}
                      </p>
                    </div>

                    {consultation.response.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-trust-green" />
                          Рекомендации:
                        </h4>
                        <ul className="space-y-2">
                          {consultation.response.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-trust-green rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {consultation.response.followUp.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-energy-orange" />
                          Дальнейшие шаги:
                        </h4>
                        <ul className="space-y-2">
                          {consultation.response.followUp.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-energy-orange rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        ⚠️ {consultation.response.disclaimer}
                      </p>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {consultation.timestamp.toLocaleString('ru-RU')}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Предупреждение если нет данных */}
        {!hasProfile && !hasAnalyses && (
          <Card className="p-5 border-0 shadow-lg bg-amber-50 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                  Ограниченная функциональность
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Для более точных рекомендаций заполните профиль здоровья или загрузите анализы крови.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate("/health-profile")}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    Заполнить профиль
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate("/blood-analysis")}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    Загрузить анализы
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}