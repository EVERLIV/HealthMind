import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { 
  Target, 
  TrendingUp, 
  Lightbulb, 
  ArrowRight,
  Activity,
  Heart,
  Pill
} from "lucide-react";
import { useLocation } from "wouter";

interface HealthGoal {
  title: string;
  icon: string;
  recommendations: string[];
  category: string;
}

export default function RecommendationsPage() {
  const [, navigate] = useLocation();

  const { data: healthProfile } = useQuery({
    queryKey: ["/api/health-profile"],
  });

  // Цели здоровья и их конкретные рекомендации с добавками и протоколами
  const healthGoalRecommendations: Record<string, HealthGoal> = {
    "weight_loss": {
      title: "Снижение веса",
      icon: "🎯",
      category: "Физическое здоровье",
      recommendations: [
        "L-карнитин 2-3г за 30 мин до тренировки для жиросжигания",
        "Хром пиколинат 200 мкг утром для контроля аппетита",
        "Зеленый чай экстракт 400-500 мг EGCG ежедневно",
        "CLA (конъюгированная линолевая кислота) 3.2г в день с едой",
        "Берберин 500 мг 3 раза в день перед едой для метаболизма",
        "Интервальное голодание 16:8 - окно питания 12:00-20:00",
        "HIIT тренировки 20 мин 3 раза в неделю"
      ]
    },
    "muscle_gain": {
      title: "Набор мышечной массы",
      icon: "💪",
      category: "Физическое здоровье",
      recommendations: [
        "Креатин моногидрат 5г ежедневно с загрузкой 20г первые 5 дней",
        "Сывороточный протеин 25-30г сразу после тренировки",
        "HMB 3г в день (1г утром, 1г до, 1г после тренировки)",
        "Бета-аланин 3.2г в день для повышения выносливости",
        "Витамин D3 4000 МЕ + K2 100 мкг для синтеза тестостерона",
        "ZMA (цинк 15мг + магний 450мг + B6 10.5мг) перед сном",
        "Аргинин + Цитруллин 6г за 30 мин до тренировки для пампа"
      ]
    },
    "improve_fitness": {
      title: "Улучшение физической формы",
      icon: "🏃",
      category: "Физическое здоровье",
      recommendations: [
        "Комплекс для суставов: глюкозамин 1500мг + хондроитин 1200мг",
        "Коэнзим Q10 100мг для энергии мышц во время тренировок",
        "Протокол периодизации: 3 недели интенсив + 1 неделя восстановления",
        "Функциональные тренировки 3-4 раза в неделю по 45 минут",
        "Контроль ЧСС: 70-85% от максимального пульса (220-возраст)",
        "Прогрессивная перегрузка: +2.5-5% веса каждые 2 недели",
        "Восстановление: массаж/миофасциальный релиз 2 раза в неделю"
      ]
    },
    "reduce_stress": {
      title: "Снижение стресса",
      icon: "🧘",
      category: "Ментальное здоровье",
      recommendations: [
        "Ашваганда 300-600 мг дважды в день для снижения кортизола",
        "Магний глицинат 400 мг перед сном против тревожности",
        "L-теанин 200 мг утром для спокойствия без сонливости",
        "Родиола розовая 200-400 мг утром натощак как адаптоген",
        "GABA 750 мг вечером для расслабления нервной системы",
        "Валериана + пассифлора комплекс 500 мг при остром стрессе",
        "Омега-3 EPA 1000 мг ежедневно для стабилизации настроения"
      ]
    },
    "better_sleep": {
      title: "Улучшение сна",
      icon: "😴",
      category: "Восстановление",
      recommendations: [
        "Мелатонин 0.5-3 мг за 30-60 мин до сна (начать с 0.5 мг)",
        "Глицин 3г под язык за 30 мин до сна для глубокого сна",
        "Магний бисглицинат 200-400 мг за 1-2 часа до сна",
        "L-триптофан 500-1000 мг вечером для выработки серотонина",
        "Таурин 500-2000 мг для расслабления и антистресс эффекта",
        "Теобромин из какао 200 мг вечером (не позднее 18:00)",
        "Комплекс трав: ромашка + лаванда + пассифлора перед сном"
      ]
    },
    "healthy_eating": {
      title: "Здоровое питание",
      icon: "🥗",
      category: "Питание",
      recommendations: [
        "Пробиотики 10-50 млрд КОЕ утром натощак для здоровья кишечника",
        "Омега-3 рыбий жир 2-3г EPA+DHA ежедневно с едой",
        "Пищеварительные ферменты с каждым основным приемом пищи",
        "Клетчатка псиллиум 5-10г в день для детоксикации",
        "Куркумин 500-1000 мг с черным перцем как противовоспалительное",
        "Мультивитамины высокого качества утром с завтраком",
        "Хлорелла или спирулина 3-5г для восполнения микронутриентов"
      ]
    },
    "quit_smoking": {
      title: "Отказ от курения",
      icon: "🚭",
      category: "Избавление от вредных привычек",
      recommendations: [
        "NAC (N-ацетилцистеин) 600мг дважды в день для очищения легких",
        "Витамин C 1000мг + цинк 15мг для восстановления иммунитета",
        "Никотиновая заместительная терапия: пластыри 21-14-7мг поэтапно",
        "L-тирозин 500мг утром для поддержки дофамина",
        "Комплекс витаминов группы B для нервной системы",
        "Магний 400мг для снятия напряжения и раздражительности",
        "Дыхательные практики: техника 4-7-8 при желании курить"
      ]
    },
    "manage_condition": {
      title: "Контроль заболевания",
      icon: "🩺",
      category: "Управление здоровьем",
      recommendations: [
        "Ведите дневник приема препаратов с напоминаниями",
        "Контролируйте ключевые показатели: давление, пульс, сахар",
        "Регулярные анализы крови каждые 3-6 месяцев",
        "Поддерживающие добавки согласованные с врачом",
        "Система мониторинга симптомов и побочных эффектов",
        "План действий при обострении заболевания",
        "Координация с командой врачей разных специальностей"
      ]
    },
    "increase_energy": {
      title: "Повышение энергии",
      icon: "⚡",
      category: "Энергия и витальность",
      recommendations: [
        "Коэнзим Q10 100-200 мг утром для клеточной энергии",
        "Витамин B12 1000 мкг сублингвально при дефиците",
        "Железо 18-25 мг с витамином C при анемии (проверить ферритин)",
        "Витамин D3 4000 МЕ ежедневно при уровне <30 нг/мл",
        "Адаптогенный комплекс: женьшень + элеутерококк 500 мг утром",
        "PQQ 20 мг + CoQ10 для митохондриального здоровья",
        "Никотинамид рибозид (NAD+ бустер) 300 мг утром натощак"
      ]
    },
    "mental_health": {
      title: "Ментальное здоровье",
      icon: "🧠",
      category: "Психологическое благополучие",
      recommendations: [
        "Омега-3 DHA 1000мг ежедневно для функций мозга",
        "Магний L-треонат 144мг для когнитивных функций",
        "Комплекс витаминов группы B для нейротрансмиттеров",
        "5-HTP 100-200мг вечером для выработки серотонина",
        "Практика осознанности: медитация 15-20 минут ежедневно",
        "Когнитивно-поведенческая терапия или психотерапия",
        "Социальная активность: общение минимум 30 минут в день"
      ]
    },
    "preventive_care": {
      title: "Профилактика заболеваний",
      icon: "🛡️",
      category: "Превентивная медицина",
      recommendations: [
        "Комплексное обследование Check-up раз в год",
        "Витамин D3 + K2 для костного здоровья и иммунитета",
        "Омега-3 для сердечно-сосудистой профилактики",
        "Антиоксидантный комплекс: витамины C, E, селен, цинк",
        "Регулярный скрининг: маммография, колоноскопия по возрасту",
        "Вакцинация по календарю и сезонные прививки",
        "Контроль факторов риска: давление, холестерин, сахар"
      ]
    },
    "longevity": {
      title: "Долголетие",
      icon: "🌟",
      category: "Антивозрастная медицина",
      recommendations: [
        "Ресвератрол 250-500мг + птеростильбен для активации сиртуинов",
        "Спермидин 1-3мг для автофагии и обновления клеток",
        "Метформин 500мг (по назначению врача) для антиэйджинг эффекта",
        "Куркумин + пиперин для противовоспалительного действия",
        "Интервальное голодание 16:8 или 18:6 для аутофагии",
        "Холодовая терапия: контрастный душ или криотерапия",
        "Силовые тренировки для поддержания мышечной массы"
      ]
    }
  };

  const hasProfile = !!(healthProfile && (((healthProfile as any)?.profileData || (healthProfile as any)?.completionPercentage > 0)));
  
  // Получение рекомендаций на основе целей пользователя
  const getUserGoalRecommendations = (): HealthGoal[] => {
    if (!hasProfile || !(healthProfile as any)?.profileData?.healthGoals) return [];
    
    const userGoals = (healthProfile as any).profileData.healthGoals;
    return userGoals.map((goalValue: string) => healthGoalRecommendations[goalValue]).filter(Boolean);
  };

  const goalRecommendations = getUserGoalRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <MobileNav />
      
      <main className="p-4 pb-24">
        {/* Заголовок */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-medical-blue via-trust-green to-energy-orange relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]"></div>
            </div>
            <div className="relative p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">
                    Персональные рекомендации
                  </h1>
                  <p className="text-white/90 text-sm">
                    Конкретные добавки и протоколы
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Рекомендации на основе целей */}
        {goalRecommendations.length > 0 ? (
          <div className="space-y-4">
            {goalRecommendations.map((goal, index) => (
              <Card key={index} className="p-4 border-0 shadow-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                <div className="space-y-3">
                  {/* Заголовок цели */}
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{goal.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {goal.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {goal.category}
                      </p>
                    </div>
                  </div>

                  {/* Список рекомендаций */}
                  <div className="space-y-2">
                    {goal.recommendations.map((recommendation, recIndex) => (
                      <div key={recIndex} className="flex items-start gap-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-700 dark:to-slate-600 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                        <Pill className="w-4 h-4 text-trust-green mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {recommendation}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Кнопка для консультации ИИ */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={() => navigate("/app/ai-consultation")}
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs bg-gradient-to-r from-medical-blue/5 to-trust-green/5 hover:from-medical-blue/10 hover:to-trust-green/10 border-medical-blue/20 text-medical-blue"
                    >
                      <TrendingUp className="w-3 h-3 mr-2" />
                      Получить персональную ИИ-консультацию
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Пустое состояние */
          <Card className="p-5 text-center border-0 shadow-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-medical-blue to-trust-green rounded-xl flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Настройте цели здоровья
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Чтобы получить персональные рекомендации с добавками и протоколами, укажите ваши цели в профиле здоровья
                </p>
                <Button
                  onClick={() => navigate("/app/health-profile")}
                  size="sm"
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
        <Card className="mt-4 p-4 border-0 shadow-sm bg-amber-50/90 dark:bg-amber-950/20 backdrop-blur-sm border border-amber-200 dark:border-amber-800/30">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                Важная информация
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Рекомендации носят информационный характер. Перед началом приема добавок проконсультируйтесь с врачом. 
                Дозировки могут отличаться в зависимости от индивидуальных особенностей.
              </p>
            </div>
          </div>
        </Card>
      </main>
      
      <BottomNav />
    </div>
  );
}