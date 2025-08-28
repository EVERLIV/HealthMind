import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { 
  Target, 
  TrendingUp, 
  Lightbulb, 
  ArrowRight,
  Activity,
  Heart
} from "lucide-react";
import { useLocation } from "wouter";

interface HealthGoal {
  title: string;
  icon: string;
  recommendations: string[];
  priority: "high" | "medium" | "low";
  category: string;
}

export default function RecommendationsPage() {
  const [, navigate] = useLocation();

  const { data: healthProfile } = useQuery({
    queryKey: ["/api/health-profile"],
  });

  // Цели здоровья и их рекомендации
  const healthGoalRecommendations: Record<string, HealthGoal> = {
    "weight_loss": {
      title: "Снижение веса",
      icon: "🎯",
      category: "Физическое здоровье",
      priority: "high",
      recommendations: [
        "Создайте дефицит калорий 300-500 ккал в день",
        "Добавьте 30 минут кардио 4-5 раз в неделю",
        "Увеличьте потребление белка до 1.6-2.2 г/кг веса",
        "Пейте 2-3 литра воды ежедневно",
        "Ведите дневник питания для контроля",
        "Спите 7-8 часов для нормализации гормонов",
        "Ограничьте обработанные продукты и сахар"
      ]
    },
    "muscle_gain": {
      title: "Набор мышечной массы",
      icon: "💪",
      category: "Физическое здоровье",
      priority: "high",
      recommendations: [
        "Силовые тренировки 3-4 раза в неделю",
        "Потребляйте 2.0-2.5 г белка на кг веса",
        "Создайте профицит калорий 300-500 ккал",
        "Спите 7-9 часов для восстановления",
        "Прогрессивно увеличивайте нагрузки",
        "Принимайте креатин 3-5г ежедневно",
        "Ешьте каждые 3-4 часа для поддержания анаболизма"
      ]
    },
    "improve_fitness": {
      title: "Улучшение физической формы",
      icon: "🏃",
      category: "Физическое здоровье",
      priority: "medium",
      recommendations: [
        "Начните с 150 минут умеренной активности в неделю",
        "Комбинируйте кардио и силовые упражнения",
        "Постепенно увеличивайте интенсивность",
        "Добавьте упражнения на гибкость",
        "Отслеживайте прогресс и пульс",
        "Разминка 10 минут перед тренировкой",
        "Заминка и растяжка после нагрузки"
      ]
    },
    "reduce_stress": {
      title: "Снижение стресса",
      icon: "🧘",
      category: "Ментальное здоровье",
      priority: "high",
      recommendations: [
        "Практикуйте медитацию 10-15 минут ежедневно",
        "Изучите техники глубокого дыхания",
        "Ограничьте время в соцсетях",
        "Регулярно бывайте на природе",
        "Планируйте время для хобби и отдыха",
        "Установите границы в работе",
        "Практикуйте йогу или тай-чи"
      ]
    },
    "better_sleep": {
      title: "Улучшение сна",
      icon: "😴",
      category: "Восстановление",
      priority: "high",
      recommendations: [
        "Ложитесь спать в одно и то же время",
        "Избегайте кофеина после 16:00",
        "Создайте прохладную темную спальню",
        "Откажитесь от экранов за час до сна",
        "Практикуйте расслабляющие ритуалы",
        "Поддерживайте температуру 18-20°C",
        "Используйте беруши или маску для сна"
      ]
    },
    "healthy_eating": {
      title: "Здоровое питание",
      icon: "🥗",
      category: "Питание",
      priority: "medium",
      recommendations: [
        "Включите 5-7 порций овощей и фруктов в день",
        "Выбирайте цельнозерновые продукты",
        "Ограничьте обработанные продукты",
        "Готовьте еду дома чаще",
        "Следите за размерами порций",
        "Добавьте омега-3 жирные кислоты",
        "Ешьте разноцветные овощи и фрукты"
      ]
    },
    "quit_smoking": {
      title: "Отказ от курения",
      icon: "🚭",
      category: "Избавление от вредных привычек",
      priority: "high",
      recommendations: [
        "Установите дату отказа от курения",
        "Обратитесь к врачу за поддержкой",
        "Замените привычки здоровыми альтернативами",
        "Избегайте триггеров в первые недели",
        "Присоединитесь к группе поддержки",
        "Используйте никотинозаместительную терапию",
        "Найдите новые способы справляться со стрессом"
      ]
    },
    "manage_condition": {
      title: "Контроль заболевания",
      icon: "🩺",
      category: "Управление здоровьем",
      priority: "high",
      recommendations: [
        "Строго следуйте рекомендациям врача",
        "Регулярно принимайте назначенные лекарства",
        "Ведите дневник симптомов",
        "Посещайте плановые осмотры",
        "Изучите информацию о своем состоянии",
        "Поддерживайте связь с лечащим врачом",
        "Следите за побочными эффектами лекарств"
      ]
    },
    "increase_energy": {
      title: "Повышение энергии",
      icon: "⚡",
      category: "Энергия и витальность",
      priority: "medium",
      recommendations: [
        "Поддерживайте стабильный уровень сахара в крови",
        "Делайте короткие прогулки в течение дня",
        "Пейте достаточно воды",
        "Ограничьте потребление алкоголя",
        "Принимайте витамин D и B12 при дефиците",
        "Избегайте переедания на обед",
        "Делайте перерывы каждые 90 минут"
      ]
    },
    "mental_health": {
      title: "Ментальное здоровье",
      icon: "🧠",
      category: "Психологическое благополучие",
      priority: "high",
      recommendations: [
        "Практикуйте благодарность каждый день",
        "Поддерживайте социальные связи",
        "Обратитесь к психологу при необходимости",
        "Занимайтесь активностями, которые приносят радость",
        "Изучите техники управления эмоциями",
        "Ведите дневник мыслей и чувств",
        "Развивайте эмоциональный интеллект"
      ]
    },
    "preventive_care": {
      title: "Профилактика заболеваний",
      icon: "🛡️",
      category: "Превентивная медицина",
      priority: "medium",
      recommendations: [
        "Проходите регулярные медосмотры",
        "Следите за показателями давления и холестерина",
        "Делайте необходимые прививки",
        "Регулярно сдавайте анализы крови",
        "Проводите самообследования",
        "Поддерживайте здоровый вес",
        "Избегайте вредных привычек"
      ]
    },
    "longevity": {
      title: "Долголетие",
      icon: "🌟",
      category: "Антивозрастная медицина",
      priority: "medium",
      recommendations: [
        "Следуйте принципам средиземноморской диеты",
        "Поддерживайте активную социальную жизнь",
        "Изучайте новое для тренировки мозга",
        "Управляйте стрессом эффективно",
        "Регулярно занимайтесь физической активностью",
        "Принимайте антиоксиданты",
        "Практикуйте интервальное голодание"
      ]
    }
  };

  const hasProfile = !!(healthProfile && ((healthProfile as any)?.profileData || (healthProfile as any)?.completionPercentage > 0));
  
  // Получение рекомендаций на основе целей пользователя
  const getUserGoalRecommendations = (): HealthGoal[] => {
    if (!hasProfile || !healthProfile?.profileData?.healthGoals) return [];
    
    const userGoals = healthProfile.profileData.healthGoals;
    return userGoals.map((goalValue: string) => healthGoalRecommendations[goalValue]).filter(Boolean);
  };

  const goalRecommendations = getUserGoalRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-orange-100 text-orange-700 border-orange-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <MobileNav />
      
      <main className="px-4 py-6 pb-24">
        {/* Заголовок */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-medical-blue via-trust-green to-energy-orange relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]"></div>
            </div>
            <div className="relative p-5 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Персональные рекомендации
                  </h1>
                  <p className="text-white/90 text-sm font-medium">
                    На основе ваших целей здоровья
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Рекомендации на основе целей */}
        {goalRecommendations.length > 0 ? (
          <div className="space-y-6">
            {goalRecommendations.map((goal, index) => (
              <Card key={index} className="p-5 border-0 shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                <div className="space-y-4">
                  {/* Заголовок цели */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{goal.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {goal.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {goal.category}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getPriorityColor(goal.priority)} border text-xs px-2 py-1`}>
                      {goal.priority === "high" ? "Высокий приоритет" : 
                       goal.priority === "medium" ? "Средний приоритет" : "Низкий приоритет"}
                    </Badge>
                  </div>

                  {/* Список рекомендаций */}
                  <div className="space-y-3">
                    {goal.recommendations.map((recommendation, recIndex) => (
                      <div key={recIndex} className="flex items-start gap-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-700 dark:to-slate-600 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                        <div className="w-2 h-2 bg-trust-green rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {recommendation}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Кнопка для консультации ИИ */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={() => navigate("/ai-consultation")}
                      variant="outline"
                      size="sm"
                      className="w-full bg-gradient-to-r from-medical-blue/5 to-trust-green/5 hover:from-medical-blue/10 hover:to-trust-green/10 border-medical-blue/20 text-medical-blue"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Получить персональную ИИ-консультацию
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Пустое состояние */
          <Card className="p-8 text-center border-0 shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-medical-blue to-trust-green rounded-2xl flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Настройте цели здоровья
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Чтобы получить персональные рекомендации, укажите ваши цели в профиле здоровья
                </p>
                <Button
                  onClick={() => navigate("/health-profile")}
                  className="bg-gradient-to-r from-medical-blue to-trust-green hover:from-medical-blue/90 hover:to-trust-green/90 text-white border-0"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Настроить профиль здоровья
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Информационная карточка */}
        <Card className="mt-6 p-4 border-0 shadow-lg bg-amber-50/90 dark:bg-amber-950/20 backdrop-blur-sm border border-amber-200 dark:border-amber-800/30">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                Как работают рекомендации?
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Рекомендации формируются на основе ваших целей здоровья, указанных в профиле. 
                Для получения более детальных советов воспользуйтесь ИИ-консультантом.
              </p>
            </div>
          </div>
        </Card>
      </main>
      
      <BottomNav />
    </div>
  );
}