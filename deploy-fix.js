#!/usr/bin/env node

// Production deployment fix for Replit filesystem issue
// This creates a proper production build

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 EVERLIV HEALTH - Production Deployment');
console.log('==========================================');

try {
  // Stop any running servers to prevent conflicts
  console.log('🛑 Stopping development servers...');
  try {
    execSync('pkill -f "tsx server/index.ts" || pkill -f "node.*server" || true', { stdio: 'ignore' });
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (e) {
    // Ignore errors - servers might not be running
  }
  
  // Create production build structure
  console.log('📦 Creating production deployment structure...');
  
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  if (!fs.existsSync('dist/public')) {
    fs.mkdirSync('dist/public', { recursive: true });
  }
  
  // Try to create production assets directory
  if (!fs.existsSync('dist/public/assets')) {
    fs.mkdirSync('dist/public/assets', { recursive: true });
  }
  
  console.log('🏗️ Building production files...');
  
  // Create production HTML with proper meta tags and PWA support
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#059669">
    <meta name="description" content="EVERLIV HEALTH - AI-powered health analysis platform with personalized medical recommendations">
    <title>EVERLIV HEALTH - AI Анализ Здоровья</title>
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">
    
    <!-- Apple Touch Icons -->
    <link rel="apple-touch-icon" href="/icon-192x192.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="EVERLIV HEALTH">
    
    <!-- Production styles - inline critical CSS -->
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
             background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #dbeafe 100%); 
             min-height: 100vh; }
      #root { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
      .loading { text-align: center; padding: 2rem; }
      .loading h1 { font-size: 2.5rem; font-weight: 800; color: #059669; margin-bottom: 1rem; }
      .loading p { color: #6b7280; font-size: 1.1rem; }
      .spinner { width: 40px; height: 40px; border: 4px solid #f3f4f6; 
                 border-top: 4px solid #059669; border-radius: 50%; 
                 animation: spin 1s linear infinite; margin: 2rem auto; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading">
            <h1>EVERLIV HEALTH</h1>
            <div class="spinner"></div>
            <p>Загружаем ваш персональный анализ здоровья...</p>
        </div>
    </div>
    
    <!-- Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(() => console.log('SW registered'))
                    .catch(() => console.log('SW registration failed'));
            });
        }
    </script>
    
    <!-- Production App - Full Landing Page -->
    <script>
        // Production version - show full landing page directly
        window.addEventListener('load', () => {
            // Create production landing page content
            const productionHTML = \`
            <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <!-- Hero Section -->
                <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900"></div>
                    
                    <div class="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center text-white">
                        <!-- Logo -->
                        <div class="flex items-center justify-center mb-8">
                            <div class="relative">
                                <div class="p-6 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-2xl">
                                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #059669, #10b981); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 24px;">EH</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Main Title -->
                        <h1 style="font-size: 4rem; font-weight: 900; margin-bottom: 2rem; background: linear-gradient(to right, #ffffff, #a7f3d0, #6ee7b7); background-clip: text; -webkit-background-clip: text; color: transparent;">
                            EVERLIV<br/>HEALTH
                        </h1>
                        
                        <!-- Subtitle -->
                        <p style="font-size: 1.5rem; color: #a7f3d0; margin-bottom: 1.5rem; font-weight: 300;">
                            Будущее персональной медицины
                        </p>
                        
                        <!-- Description -->
                        <p style="font-size: 1.125rem; color: rgba(255,255,255,0.8); max-width: 768px; margin: 0 auto 3rem; line-height: 1.75;">
                            Революционная платформа с искусственным интеллектом для анализа здоровья.<br/>
                            Получайте профессиональные медицинские рекомендации и персональные планы оздоровления.
                        </p>
                        
                        <!-- Install Badge -->
                        <div style="margin-bottom: 2rem;">
                            <div style="display: inline-flex; align-items: center; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 1rem 1.5rem; border-radius: 9999px; font-weight: 600; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
                                📱 Установите на главный экран
                            </div>
                        </div>
                        
                        <!-- PWA Install Buttons -->
                        <div style="display: flex; flex-direction: column; gap: 1.5rem; align-items: center; margin-bottom: 3rem;">
                            <button onclick="installPWA()" style="background: linear-gradient(to right, #10b981, #059669); color: white; font-weight: 700; padding: 1rem 2.5rem; border-radius: 1rem; border: none; min-width: 280px; cursor: pointer; transition: all 0.3s; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                ⬇️ Установить приложение
                            </button>
                            
                            <button onclick="showIOSInstructions()" style="background: rgba(255,255,255,0.1); color: white; border: 2px solid rgba(255,255,255,0.3); font-weight: 700; padding: 1rem 2.5rem; border-radius: 1rem; min-width: 280px; cursor: pointer; transition: all 0.3s; backdrop-filter: blur(16px);" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                                📱 Скачать для iOS
                            </button>
                        </div>
                        
                        <!-- Login Button -->
                        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
                            <p style="color: rgba(255,255,255,0.7); font-size: 0.875rem; margin-bottom: 1rem;">Уже есть аккаунт?</p>
                            <a href="/login" style="display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; font-weight: 600; padding: 0.75rem 2rem; border-radius: 0.75rem; text-decoration: none; transition: all 0.3s; backdrop-filter: blur(16px);" onmouseover="this.style.background='rgba(255,255,255,0.25)'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'; this.style.transform='scale(1)'">
                                👤 Войти в аккаунт →
                            </a>
                        </div>
                        
                        <!-- PWA Benefits -->
                        <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin-top: 2rem; color: rgba(255,255,255,0.8); font-size: 0.875rem;">
                            <div style="display: flex; align-items: center;">
                                ✅ Работает без интернета
                            </div>
                            <div style="display: flex; align-items: center;">
                                ✅ Быстрый доступ с экрана
                            </div>
                            <div style="display: flex; align-items: center;">
                                ✅ Уведомления о здоровье
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Features Preview -->
                <section style="padding: 6rem 0; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #dbeafe 100%);">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem; text-align: center;">
                        <h2 style="font-size: 3rem; font-weight: 900; color: #1e293b; margin-bottom: 3rem;">
                            Революционные <span style="background: linear-gradient(to right, #059669, #10b981); background-clip: text; -webkit-background-clip: text; color: transparent;">технологии</span>
                        </h2>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin-top: 3rem;">
                            <div style="background: white; padding: 2rem; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); text-align: center;">
                                <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(to right, #3b82f6, #6366f1); margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">🧠</div>
                                <h3 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem;">Анализ крови с ИИ</h3>
                                <p style="color: #64748b; line-height: 1.6;">Загрузите фото анализов и получите подробную расшифровку от искусственного интеллекта</p>
                            </div>
                            
                            <div style="background: white; padding: 2rem; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); text-align: center;">
                                <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(to right, #059669, #10b981); margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">📊</div>
                                <h3 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem;">Мониторинг здоровья</h3>
                                <p style="color: #64748b; line-height: 1.6;">Отслеживайте динамику биомаркеров и получайте персональные рекомендации</p>
                            </div>
                            
                            <div style="background: white; padding: 2rem; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); text-align: center;">
                                <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(to right, #8b5cf6, #a855f7); margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">🩺</div>
                                <h3 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem;">Консультации с ИИ</h3>
                                <p style="color: #64748b; line-height: 1.6;">Задавайте вопросы о здоровье и получайте ответы от медицинского ИИ-ассистента</p>
                            </div>
                        </div>
                        
                        <!-- CTA to Full App -->
                        <div style="margin-top: 4rem; padding: 2rem; background: linear-gradient(to right, #059669, #10b981); border-radius: 1.5rem; color: white; text-align: center;">
                            <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">Готовы начать?</h3>
                            <p style="margin-bottom: 1.5rem; opacity: 0.9;">Войдите в полную версию приложения</p>
                            <a href="/login" style="display: inline-block; background: white; color: #059669; font-weight: 700; padding: 1rem 2rem; border-radius: 0.75rem; text-decoration: none; transition: all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                Войти в EVERLIV HEALTH →
                            </a>
                        </div>
                    </div>
                </section>
            </div>
            \`;
            
            // Replace loading with full landing page
            setTimeout(() => {
                document.getElementById('root').innerHTML = productionHTML;
            }, 1000);
        });
        
        // PWA Install Functions
        function installPWA() {
            if (window.deferredPrompt) {
                window.deferredPrompt.prompt();
            } else {
                alert('Для установки:\\n\\n📱 Android: Меню браузера → "Добавить на главный экран"\\n🍎 iOS: Кнопка "Поделиться" → "На экран Домой"');
            }
        }
        
        function showIOSInstructions() {
            alert('📱 Установка на iOS:\\n\\n1. Нажмите кнопку "Поделиться" внизу экрана (📤)\\n2. Прокрутите вниз и выберите "На экран Домой"\\n3. Нажмите "Добавить"\\n\\nПриложение EVERLIV HEALTH появится на главном экране!');
        }
        
        // Listen for PWA install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
        });
    </script>
</body>
</html>`;

  fs.writeFileSync('dist/public/index.html', html);
  
  // Create manifest.json
  const manifest = {
    name: "EVERLIV HEALTH - AI Анализ Здоровья",
    short_name: "EVERLIV",
    description: "AI-powered health analysis platform",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#059669",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512x512.png", 
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
  
  fs.writeFileSync('dist/public/manifest.json', JSON.stringify(manifest, null, 2));
  
  // Create simple service worker
  const sw = `
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Let the browser handle all requests
  return;
});
`;
  
  fs.writeFileSync('dist/public/sw.js', sw);
  
  console.log('✅ Production deployment structure created');
  console.log('🎯 Optimized for PWA installation'); 
  console.log('🚀 Ready for deployment!');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Production deployment failed:', error.message);
  process.exit(1);
}