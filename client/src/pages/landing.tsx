import { useState, useEffect, useRef } from "react";
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
  TrendingUp,
  ArrowRight,
  Sparkles,
  PlayCircle,
  Monitor,
  Plus
} from "lucide-react";
import aiBloodImage from '@assets/generated_images/AI_blood_analysis_a3b7806b.png';
import healthMonitoringImage from '@assets/generated_images/Health_monitoring_scene_e2ffcf2b.png';
import aiConsultationImage from '@assets/generated_images/AI_medical_consultation_211a67ef.png';
import personalGoalsImage from '@assets/generated_images/Personal_health_goals_200a8db1.png';
import logoImage from '@assets/logo_1756447359961.png';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function LandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  
  const featuresRef = useRef<HTMLElement>(null);
  const securityRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Check if PWA is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPWAInstalled(true);
      console.log('PWA is already installed');
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsPWAInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Check PWA requirements
    const checkPWARequirements = async () => {
      const checks = {
        serviceWorker: 'serviceWorker' in navigator,
        manifest: document.querySelector('link[rel="manifest"]') !== null,
        https: location.protocol === 'https:' || location.hostname === 'localhost',
      };
      
      console.log('PWA requirements check:', checks);
      
      // Try to fetch manifest
      try {
        const response = await fetch('/manifest.json');
        if (response.ok) {
          const manifest = await response.json();
          console.log('Manifest loaded successfully:', manifest.name);
        } else {
          console.error('Failed to load manifest.json');
        }
      } catch (error) {
        console.error('Error loading manifest:', error);
      }
    };
    
    checkPWARequirements();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Intersection Observer for smooth section animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '-10px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('section-hidden');
          entry.target.classList.add('section-visible');
        }
      });
    }, observerOptions);

    const sections = [featuresRef.current, securityRef.current].filter(Boolean);
    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const handleInstallPWA = async () => {
    console.log('Install button clicked');
    console.log('deferredPrompt available:', !!deferredPrompt);
    
    if (deferredPrompt) {
      try {
        console.log('Showing install prompt...');
        // Show the install prompt
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('User choice:', outcome);
        
        if (outcome === 'accepted') {
          console.log('PWA install accepted');
          setDeferredPrompt(null);
          setIsPWAInstalled(true);
        } else {
          console.log('PWA install dismissed');
        }
      } catch (error) {
        console.error('Error during PWA install:', error);
        showManualInstructions();
      }
    } else {
      console.log('No deferred prompt available, showing manual instructions');
      showManualInstructions();
    }
  };

  const showManualInstructions = () => {
    // Более детальные инструкции в зависимости от браузера и устройства
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const isChrome = /chrome/.test(userAgent) && !/edg|opr/.test(userAgent);
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isDesktop = !isMobile;
    
    let instructions = '';
    
    if (isAndroid && isChrome) {
      instructions = `📱 Для установки на Android:

1. Откройте меню браузера (⋮)
2. Найдите "Добавить на главный экран" или "Установить приложение"
3. Нажмите "Установить"

Приложение появится на главном экране как обычное приложение.`;
    } else if (isMobile) {
      instructions = `📱 Для установки на мобильное устройство:

1. Откройте меню браузера
2. Найдите "Добавить на главный экран" или "Add to Home Screen"
3. Нажмите "Добавить"

Для лучшей работы рекомендуем использовать Chrome или Safari.`;
    } else {
      instructions = `🌐 Для установки приложения:

• Chrome: найдите иконку установки в адресной строке
• Firefox: добавьте в закладки для быстрого доступа
• Safari: используйте "Добавить в Dock" (macOS)
• Edge: найдите "Установить это приложение" в меню

Современные браузеры поддерживают установку PWA как обычных приложений.`;Chrome) {
        instructions = `🤖 Установка на Android:

1. Нажмите меню браузера (три точки ⋮ справа вверху)
2. Выберите "Добавить на главный экран" или "Установить приложение"
3. Нажмите "Установить" или "Добавить"
4. Приложение EVERLIV HEALTH появится на главном экране

Если не видите опцию установки, убедитесь что:
• Вы используете Chrome или другой современный браузер
• Сайт открыт по HTTPS (безопасное соединение)`;
      } else if (isDesktop && isChrome) {
        instructions = `💻 Установка на компьютер:

1. Найдите иконку установки в адресной строке (справа)
2. Нажмите на неё и выберите "Установить"
3. Или используйте меню Chrome ⋮ → "Установить EVERLIV HEALTH..."

После установки приложение будет доступно как обычная программа!`;
      } else if (isMobile) {
        instructions = `📱 Добавление на главный экран:

1. Откройте меню браузера
2. Найдите "Добавить на главный экран" или "Add to Home Screen"
3. Нажмите "Добавить"

Для лучшей работы рекомендуем использовать Chrome или Safari.`;
      } else {
      instructions = `🌐 Для установки приложения:

• Chrome: найдите иконку установки в адресной строке
• Firefox: добавьте в закладки для быстрого доступа
• Safari: используйте "Добавить в Dock" (macOS)
• Edge: найдите "Установить это приложение" в меню

Современные браузеры поддерживают установку PWA как обычных приложений.`;
    }

    alert(instructions);овку веб-приложений как обычных программ!`;
      }
      
      alert(instructions);
    }
  };

  const handleIOSInstall = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS) {
      if (isSafari) {
        alert("Для установки приложения на iOS:\n\n1. Нажмите кнопку 'Поделиться' внизу экрана (📤)\n2. Прокрутите вниз и выберите 'На экран «Домой»'\n3. Нажмите 'Добавить' в правом верхнем углу\n\nПосле этого EVERLIV HEALTH появится на вашем главном экране!");
      } else {
        alert("Для лучшей работы на iOS рекомендуем открыть приложение в Safari, затем добавить на главный экран через кнопку 'Поделиться'.");
      }
    } else {
      // Not iOS, redirect to Android flow
      handleInstallPWA();
    }
  };

  const features = [
    {
      icon: Brain,
      title: "Анализ крови с ИИ",
      description: "Загрузите фото анализов и получите подробную расшифровку от искусственного интеллекта с рекомендациями",
      bgImage: aiBloodImage,
      color: "from-blue-600 to-indigo-700"
    },
    {
      icon: Activity,
      title: "Мониторинг здоровья",
      description: "Отслеживайте динамику биомаркеров, ведите дневник самочувствия и получайте персональные рекомендации",
      bgImage: healthMonitoringImage,
      color: "from-emerald-600 to-teal-700"
    },
    {
      icon: Stethoscope,
      title: "Консультации с ИИ",
      description: "Задавайте вопросы о здоровье и получайте ответы от медицинского ИИ-ассистента в любое время",
      bgImage: aiConsultationImage,
      color: "from-purple-600 to-violet-700"
    },
    {
      icon: TrendingUp,
      title: "Персональные цели",
      description: "Ставьте цели здоровья и получайте конкретные планы с добавками, диетой и рекомендациями",
      bgImage: personalGoalsImage,
      color: "from-orange-600 to-amber-700"
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Clean Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center text-white">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative animate-fadeInScale hero-logo">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-xl opacity-70 animate-pulseGlow"></div>
              <div className="relative p-6 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-2xl">
                <img src={logoImage} alt="EVERLIV HEALTH" className="w-16 h-16 drop-shadow-lg" />
              </div>
              <div className="absolute -top-2 -right-2 animate-smoothFloat">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Title with Animation */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4 animate-fadeInUp hero-title">
              <span className="bg-gradient-to-r from-white via-emerald-100 to-green-200 bg-clip-text text-transparent drop-shadow-2xl">
                EVERLIV
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-200 via-green-200 to-teal-200 bg-clip-text text-transparent">
                HEALTH
              </span>
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-emerald-400 to-green-500 mx-auto rounded-full mb-6 animate-fadeInScale hero-title"></div>
          </div>
          
          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-emerald-100 font-light mb-6 tracking-wide animate-fadeInUp hero-subtitle">
            Будущее персональной медицины
          </p>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed font-light animate-fadeInUp hero-subtitle">
            Революционная платформа с искусственным интеллектом для анализа здоровья. 
            Получайте профессиональные медицинские рекомендации и персональные планы оздоровления.
          </p>
          
          {/* PWA Install Section */}
          <div className="animate-fadeInUp hero-buttons space-y-6">
            {/* Install to Home Screen Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-lg border border-white/20 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
                <Monitor className="w-5 h-5 mr-2 text-emerald-300" />
                <span className="mr-2">Установите на главный экран</span>
                <Plus className="w-4 h-4 text-emerald-300" />
              </div>
            </div>
            
            {!isPWAInstalled && (
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button
                  onClick={handleInstallPWA}
                  size="lg"
                  className="group bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold h-16 px-10 rounded-2xl shadow-2xl border-0 min-w-[280px] transform hover:scale-105 transition-all duration-300 relative"
                  data-testid="button-install-android"
                >
                  {deferredPrompt && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                  <Download className="w-6 h-6 mr-4 group-hover:translate-y-1 transition-transform duration-300" />
                  {deferredPrompt ? 'Установить приложение' : 'Установить на устройство'}
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                
                <Button
                  onClick={handleIOSInstall}
                  size="lg"
                  className="group bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 font-bold h-16 px-10 rounded-2xl backdrop-blur-lg min-w-[280px] transform hover:scale-105 transition-all duration-300"
                  data-testid="button-install-ios"
                >
                  <Download className="w-6 h-6 mr-4 group-hover:translate-y-1 transition-transform duration-300" />
                  Скачать для iOS
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            )}
            
            {isPWAInstalled && (
              <div className="text-center animate-in fade-in-50 duration-1000">
                <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl mb-4">
                  <CheckCircle2 className="w-6 h-6 mr-3" />
                  Приложение успешно установлено
                </div>
                <p className="text-white/70 text-base">
                  Откройте EVERLIV HEALTH с главного экрана вашего устройства
                </p>
              </div>
            )}
            
            {/* Additional PWA Benefits */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-white/80 text-sm">
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-300" />
                Работает без интернета
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-300" />
                Быстрый доступ с экрана
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-300" />
                Уведомления о здоровье
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 bg-gradient-to-br from-slate-50 via-gray-100 to-blue-50 section-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg animate-fadeInDown">
              <Zap className="w-4 h-4 mr-2" />
              ВОЗМОЖНОСТИ ПЛАТФОРМЫ
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight animate-fadeInUp">
              Революционные
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"> технологии</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed animate-fadeInUp">
              Объединяем искусственный интеллект, медицинскую экспертизу и персональный подход 
              для создания будущего здравоохранения
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={`group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 h-[400px] animate-fadeInScale stagger-${index + 1}`}>
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${feature.bgImage})` }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-85 group-hover:opacity-90 transition-opacity duration-500`}></div>
                  
                  {/* Animated Elements */}
                  <div className="absolute inset-0">
                    <div className="absolute top-6 right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                    <div className="absolute bottom-8 left-8 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
                    <div>
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl mb-6 shadow-lg group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                        <Icon className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                        {feature.title}
                      </h3>
                    </div>
                    
                    <div>
                      <p className="text-white/90 text-lg leading-relaxed mb-6 group-hover:text-white transition-colors duration-300">
                        {feature.description}
                      </p>
                      
                      <div className="flex items-center text-white/80 group-hover:text-white font-semibold transition-all duration-300">
                        <span className="mr-2">Узнать больше</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Effects */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center bg-white rounded-2xl p-2 shadow-xl">
              <div className="flex items-center bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold">
                <PlayCircle className="w-5 h-5 mr-2" />
                Начать сейчас
              </div>
              <span className="px-6 py-3 text-slate-700 font-semibold">
                Установите приложение бесплатно
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section ref={securityRef} className="py-24 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 relative overflow-hidden section-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-lg animate-fadeInDown">
              <Shield className="w-4 h-4 mr-2" />
              МАКСИМАЛЬНАЯ ЗАЩИТА
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight animate-fadeInUp">
              Безопасность
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent"> данных</span>
            </h2>
            <p className="text-xl text-emerald-100 max-w-4xl mx-auto leading-relaxed animate-fadeInUp">
              Военный уровень шифрования и международные стандарты защиты 
              для вашей медицинской информации
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group relative">
                  <Card className={`relative p-8 text-center border-0 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 group animate-fadeInScale stagger-${index + 1}`}>
                    <div className="relative mb-8">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-100 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-emerald-100/80 text-lg leading-relaxed group-hover:text-emerald-100 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </Card>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-16">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mr-4" />
              <div className="text-left">
                <p className="text-white font-bold text-lg">100% конфиденциальность</p>
                <p className="text-emerald-200 text-sm">Ваши данные никогда не покидают защищённую среду</p>
              </div>
            </div>
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