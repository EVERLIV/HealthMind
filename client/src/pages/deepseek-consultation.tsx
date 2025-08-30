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
  TrendingUp,
  Target
} from "lucide-react";

interface ConsultationResponse {
  analysis: string;
  recommendations: string[];
  priority: "high" | "medium" | "low";
  followUp: string[];
  disclaimer: string;
}

export default function AIConsultation() {
  const [, navigate] = useLocation();
  const [question, setQuestion] = useState("");
  const [consultationHistory, setConsultationHistory] = useState<Array<{
    question: string;
    response: ConsultationResponse;
    timestamp: Date;
  }>>([]);
  const [expandedGoals, setExpandedGoals] = useState<Set<number>>(new Set());
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
      const response = await apiRequest("/api/ai-consultation", {
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
        description: "ИИ-консультант проанализировал ваш запрос",
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
    "Анализ крови: что означают результаты?",
    "Как снизить холестерин?",
    "Персональное питание",
    "Здоровье сердца: профилактика"
  ];

  // Цели здоровья и их рекомендации
  const healthGoalRecommendations = {
    "weight_loss": {
      title: "Снижение веса",
      icon: "🎯",
      recommendations: [
        "Создайте дефицит калорий 300-500 ккал в день",
        "Добавьте 30 минут кардио 4-5 раз в неделю",
        "Увеличьте потребление белка до 1.6-2.2 г/кг веса",
        "Пейте 2-3 литра воды ежедневно",
        "Ведите дневник питания для контроля"
      ]
    },
    "muscle_gain": {
      title: "Набор мышечной массы",
      icon: "💪",
      recommendations: [
        "Силовые тренировки 3-4 раза в неделю",
        "Потребляйте 2.0-2.5 г белка на кг веса",
        "Создайте профицит калорий 300-500 ккал",
        "Спите 7-9 часов для восстановления",
        "Прогрессивно увеличивайте нагрузки"
      ]
    },
    "improve_fitness": {
      title: "Улучшение физической формы",
      icon: "🏃",
      recommendations: [
        "Начните с 150 минут умеренной активности в неделю",
        "Комбинируйте кардио и силовые упражнения",
        "Постепенно увеличивайте интенсивность",
        "Добавьте упражнения на гибкость",
        "Отслеживайте прогресс и пульс"
      ]
    },
    "reduce_stress": {
      title: "Снижение стресса",
      icon: "🧘",
      recommendations: [
        "Практикуйте медитацию 10-15 минут ежедневно",
        "Изучите техники глубокого дыхания",
        "Ограничьте время в соцсетях",
        "Регулярно бывайте на природе",
        "Планируйте время для хобби и отдыха"
      ]
    },
    "better_sleep": {
      title: "Улучшение сна",
      icon: "😴",
      recommendations: [
        "Ложитесь спать в одно и то же время",
        "Избегайте кофеина после 16:00",
        "Создайте прохладную темную спальню",
        "Откажитесь от экранов за час до сна",
        "Практикуйте расслабляющие ритуалы"
      ]
    },
    "healthy_eating": {
      title: "Здоровое питание",
      icon: "🥗",
      recommendations: [
        "Включите 5-7 порций овощей и фруктов в день",
        "Выбирайте цельнозерновые продукты",
        "Ограничьте обработанные продукты",
        "Готовьте еду дома чаще",
        "Следите за размерами порций"
      ]
    },
    "quit_smoking": {
      title: "Отказ от курения",
      icon: "🚭",
      recommendations: [
        "Установите дату отказа от курения",
        "Обратитесь к врачу за поддержкой",
        "Замените привычки здоровыми альтернативами",
        "Избегайте триггеров в первые недели",
        "Присоединитесь к группе поддержки"
      ]
    },
    "manage_condition": {
      title: "Контроль заболевания",
      icon: "🩺",
      recommendations: [
        "Строго следуйте рекомендациям врача",
        "Регулярно принимайте назначенные лекарства",
        "Ведите дневник симптомов",
        "Посещайте плановые осмотры",
        "Изучите информацию о своем состоянии"
      ]
    },
    "increase_energy": {
      title: "Повышение энергии",
      icon: "⚡",
      recommendations: [
        "Поддерживайте стабильный уровень сахара в крови",
        "Делайте короткие прогулки в течение дня",
        "Пейте достаточно воды",
        "Ограничьте потребление алкоголя",
        "Принимайте витамин D и B12 при дефиците"
      ]
    },
    "mental_health": {
      title: "Ментальное здоровье",
      icon: "🧠",
      recommendations: [
        "Практикуйте благодарность каждый день",
        "Поддерживайте социальные связи",
        "Обратитесь к психологу при необходимости",
        "Занимайтесь активностями, которые приносят радость",
        "Изучите техники управления эмоциями"
      ]
    },
    "preventive_care": {
      title: "Профилактика заболеваний",
      icon: "🛡️",
      recommendations: [
        "Проходите регулярные медосмотры",
        "Следите за показателями давления и холестерина",
        "Делайте необходимые прививки",
        "Регулярно сдавайте анализы крови",
        "Проводите самообследования"
      ]
    },
    "longevity": {
      title: "Долголетие",
      icon: "🌟",
      recommendations: [
        "Следуйте принципам средиземноморской диеты",
        "Поддерживайте активную социальную жизнь",
        "Изучайте новое для тренировки мозга",
        "Управляйте стрессом эффективно",
        "Регулярно занимайтесь физической активностью"
      ]
    }
  };

  // Получение рекомендаций на основе целей пользователя
  const getUserGoalRecommendations = () => {
    if (!hasProfile || !healthProfile?.profileData?.healthGoals) return [];
    
    const userGoals = healthProfile.profileData.healthGoals;
    return userGoals.map(goalValue => healthGoalRecommendations[goalValue]).filter(Boolean);
  };

  const goalRecommendations = getUserGoalRecommendations();

  const toggleGoalExpansion = (index: number) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedGoals(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-x-hidden">
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
                  onClick={() => navigate("/app/dashboard")}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg transition-all hover:bg-white/30"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-3 py-1">
                  <Brain className="w-3 h-3 mr-1.5" />
                  ИИ Консультант
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

        {/* Рекомендации на основе целей пользователя */}
        {goalRecommendations.length > 0 && (
          <Card className="mb-6 p-5 border-0 shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Target className="w-5 h-5 text-medical-blue" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Персональные рекомендации
                </h3>
                <Badge className="bg-trust-green/10 text-trust-green border-trust-green/20 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                  ваши цели
                </Badge>
              </div>
              
              <div className="grid gap-4">
                {goalRecommendations.map((goal, index) => (
                  <div key={index} className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{goal.icon}</span>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {goal.title}
                      </h4>
                    </div>
                    
                    <div className="space-y-2">
                      {(expandedGoals.has(index) ? goal.recommendations : goal.recommendations.slice(0, 3)).map((rec, recIndex) => (
                        <div key={recIndex} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-trust-green rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {rec}
                          </span>
                        </div>
                      ))}
                      {goal.recommendations.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleGoalExpansion(index)}
                          className="text-xs text-trust-green hover:text-trust-green hover:bg-trust-green/10 p-1 h-auto mt-2"
                        >
                          {expandedGoals.has(index) 
                            ? `Скрыть ${goal.recommendations.length - 3} рекомендаций`
                            : `+${goal.recommendations.length - 3} дополнительных рекомендаций`
                          }
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800/30">
                <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <Lightbulb className="w-3 h-3" />
                  Эти рекомендации основаны на ваших целях в профиле здоровья. Обновите цели в профиле для новых рекомендаций.
                </p>
              </div>
            </div>
          </Card>
        )}

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
                    className="text-left justify-start h-auto py-3 px-4 hover:bg-gray-50 dark:hover:bg-slate-700 whitespace-normal text-wrap"
                    disabled={consultationMutation.isPending}
                  >
                    <span className="text-xs leading-relaxed break-words">{q}</span>
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
                        ИИ Консультант
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
                    onClick={() => navigate("/app/health-profile")}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    Заполнить профиль
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate("/app/blood-analysis")}
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