import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Download, 
  Shield, 
  Lock, 
  Brain, 
  Activity, 
  Heart, 
  Microscope, 
  Target, 
  Users, 
  Zap, 
  CheckCircle2,
  Star,
  Globe,
  BookOpen,
  Stethoscope,
  TrendingUp
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function LandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);

  useEffect(() => {
    // Check if PWA is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPWAInstalled(true);
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsPWAInstalled(true);
      }
    }
  };

  const handleIOSInstall = () => {
    // For iOS, show instructions modal or redirect to app store
    alert("Для установки на iOS: нажмите кнопку 'Поделиться' в Safari и выберите 'На экран «Домой»'");
  };

  const features = [
    {
      icon: Brain,
      title: "Анализ крови с ИИ",
      description: "Загрузите фото анализов и получите подробную расшифровку от искусственного интеллекта с рекомендациями",
      color: "from-medical-blue to-blue-600"
    },
    {
      icon: Activity,
      title: "Мониторинг здоровья",
      description: "Отслеживайте динамику биомаркеров, ведите дневник самочувствия и получайте персональные рекомендации",
      color: "from-trust-green to-emerald-600"
    },
    {
      icon: Stethoscope,
      title: "Консультации с ИИ",
      description: "Задавайте вопросы о здоровье и получайте ответы от медицинского ИИ-ассистента в любое время",
      color: "from-wellness-purple to-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Персональные цели",
      description: "Ставьте цели здоровья и получайте конкретные планы с добавками, диетой и рекомендациями",
      color: "from-energy-orange to-orange-600"
    }
  ];

  const securityFeatures = [
    {
      icon: Shield,
      title: "Шифрование данных",
      description: "Все данные защищены современными алгоритмами шифрования"
    },
    {
      icon: Lock,
      title: "Приватность",
      description: "Ваши медицинские данные никогда не передаются третьим лицам"
    },
    {
      icon: CheckCircle2,
      title: "GDPR соответствие",
      description: "Полное соответствие международным стандартам защиты данных"
    }
  ];

  const goals = [
    {
      icon: Heart,
      title: "Здоровье для всех",
      description: "Сделать качественную медицинскую аналитику доступной каждому человеку"
    },
    {
      icon: Users,
      title: "Профилактика",
      description: "Помочь людям предотвращать заболевания через раннюю диагностику"
    },
    {
      icon: Globe,
      title: "Инновации",
      description: "Использовать передовые технологии ИИ для улучшения здравоохранения"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-medical-blue via-blue-600 to-trust-green">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:40px_40px]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center text-white">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/30 shadow-lg">
                <Microscope className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              EVERLIV HEALTH
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium mb-4">
              Персонализированный анализ здоровья с ИИ
            </p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
              Загружайте анализы крови, получайте детальную расшифровку от ИИ и персональные рекомендации 
              для улучшения вашего здоровья. Всё в одном удобном приложении.
            </p>
            
            {/* PWA Install Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isPWAInstalled && (
                <>
                  <Button
                    onClick={handleInstallPWA}
                    size="lg"
                    className="bg-white text-medical-blue hover:bg-gray-50 font-semibold h-14 px-8 rounded-xl shadow-lg border-0 min-w-[250px]"
                    data-testid="button-install-android"
                  >
                    <Smartphone className="w-5 h-5 mr-3" />
                    Установить на Android
                    <Download className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Button
                    onClick={handleIOSInstall}
                    size="lg"
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold h-14 px-8 rounded-xl backdrop-blur-sm min-w-[250px]"
                    data-testid="button-install-ios"
                  >
                    <Smartphone className="w-5 h-5 mr-3" />
                    Установить на iOS
                    <Download className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
              
              {isPWAInstalled && (
                <div className="text-center">
                  <Badge className="bg-white/20 text-white border-white/30 px-6 py-3 text-lg font-semibold rounded-full backdrop-blur-sm">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Приложение установлено
                  </Badge>
                  <p className="text-white/80 text-sm mt-3">
                    Откройте приложение с главного экрана для входа
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Возможности приложения
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Комплексная платформа для анализа здоровья с использованием передовых технологий искусственного интеллекта
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-900">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Безопасность данных
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ваши медицинские данные защищены по самым высоким стандартам безопасности
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-8 text-center border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company Goals Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-medical-blue to-trust-green rounded-2xl shadow-lg">
                <Target className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Наши цели
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Мы стремимся революционизировать подход к персональному здравоохранению
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {goals.map((goal, index) => {
              const Icon = goal.icon;
              return (
                <Card key={index} className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-900">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-medical-blue to-trust-green flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {goal.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {goal.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-medical-blue via-blue-600 to-trust-green">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">95%</div>
              <div className="text-white/80 text-lg">Точность анализа ИИ</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-white/80 text-lg">Доступность</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-white/80 text-lg">Типов анализов</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">100%</div>
              <div className="text-white/80 text-lg">Безопасность</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-medical-blue to-trust-green rounded-2xl">
              <Microscope className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4">EVERLIV HEALTH</h3>
          <p className="text-slate-400 mb-6">
            Персонализированный анализ здоровья с искусственным интеллектом
          </p>
          <div className="text-sm text-slate-500">
            © 2025 EVERLIV HEALTH. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}