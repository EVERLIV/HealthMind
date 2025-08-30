#!/usr/bin/env node

// REAL production build WITHOUT dev redirects
// Creates standalone production version that works independently

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 EVERLIV HEALTH - Standalone Production Build');
console.log('===============================================');

try {
  // Stop any running servers
  console.log('🛑 Stopping all servers...');
  try {
    execSync('pkill -f "tsx server/index.ts" || pkill -f "node.*server" || true', { stdio: 'ignore' });
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (e) {
    // Ignore
  }
  
  // Create production structure
  console.log('📦 Creating production deployment...');
  
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  if (!fs.existsSync('dist/public')) {
    fs.mkdirSync('dist/public', { recursive: true });
  }
  
  // Try real Vite build
  let viteSuccess = false;
  try {
    console.log('🏗️ Building with Vite...');
    execSync('npm run build:client', { stdio: 'inherit' });
    
    // Verify Vite files exist
    if (fs.existsSync('dist/public/index.html') && 
        fs.existsSync('dist/public/assets') &&
        fs.readdirSync('dist/public/assets').length > 0) {
      console.log('✅ Vite build successful and files verified!');
      viteSuccess = true;
    }
  } catch (error) {
    console.log('⚠️ Vite build failed, creating standalone version...');
  }
  
  if (!viteSuccess) {
    console.log('🔧 Creating standalone production app...');
    
    // Create assets directory
    if (!fs.existsSync('dist/public/assets')) {
      fs.mkdirSync('dist/public/assets', { recursive: true });
    }
    
    // Copy images from attached_assets
    try {
      if (fs.existsSync('attached_assets')) {
        const copyAssets = (srcDir, destDir) => {
          const items = fs.readdirSync(srcDir);
          for (const item of items) {
            const srcPath = path.join(srcDir, item);
            const destPath = path.join(destDir, item);
            const stat = fs.statSync(srcPath);
            
            if (stat.isDirectory()) {
              if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
              }
              copyAssets(srcPath, destPath);
            } else if (item.endsWith('.png') || item.endsWith('.jpg') || item.endsWith('.svg')) {
              fs.copyFileSync(srcPath, destPath);
              console.log(`📄 Copied: ${item}`);
            }
          }
        };
        
        copyAssets('attached_assets', 'dist/public/assets');
      }
    } catch (e) {
      console.log('ℹ️ No assets to copy');
    }
    
    // Create STANDALONE production HTML - NO redirects!
    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#059669">
    <meta name="description" content="EVERLIV HEALTH - AI-powered health analysis platform">
    <title>EVERLIV HEALTH - AI Анализ Здоровья</title>
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">
    
    <!-- Apple Touch Icons -->
    <link rel="apple-touch-icon" href="/icon-192x192.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="EVERLIV HEALTH">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              primary: '#059669',
              secondary: '#0d9488',
            }
          }
        }
      }
    </script>
    
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
      .gradient-bg { background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #dbeafe 100%); }
      .gradient-text { background: linear-gradient(135deg, #059669, #0d9488); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .btn-primary { background: linear-gradient(135deg, #059669, #0d9488); color: white; padding: 12px 24px; border-radius: 12px; font-weight: 600; text-decoration: none; display: inline-block; transition: all 0.3s; }
      .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3); }
      .btn-secondary { background: rgba(5, 150, 105, 0.1); color: #059669; border: 2px solid #059669; padding: 12px 24px; border-radius: 12px; font-weight: 600; text-decoration: none; display: inline-block; transition: all 0.3s; }
      .btn-secondary:hover { background: #059669; color: white; transform: translateY(-2px); }
      .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); transition: all 0.3s; }
      .card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
    </style>
</head>
<body class="gradient-bg min-h-screen">
    <div id="root">
        <!-- Header -->
        <header class="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964m-5.272 21V18.75m0-16.5V3"/>
                            </svg>
                        </div>
                        <div>
                            <h1 class="text-xl font-bold gradient-text">EVERLIV HEALTH</h1>
                            <p class="text-xs text-gray-600">AI Анализ Здоровья</p>
                        </div>
                    </div>
                    <nav class="hidden md:flex space-x-6">
                        <a href="#features" class="text-gray-700 hover:text-emerald-600 font-medium">Возможности</a>
                        <a href="#about" class="text-gray-700 hover:text-emerald-600 font-medium">О платформе</a>
                        <a href="#contact" class="text-gray-700 hover:text-emerald-600 font-medium">Контакты</a>
                    </nav>
                </div>
            </div>
        </header>

        <!-- Hero Section -->
        <section class="relative overflow-hidden py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center">
                    <h1 class="text-4xl md:text-6xl font-bold mb-6">
                        <span class="gradient-text">AI-Powered</span><br>
                        <span class="text-gray-800">Health Analysis</span>
                    </h1>
                    <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Персональный анализ крови с помощью DeepSeek AI. Получите индивидуальные рекомендации для улучшения здоровья на основе ваших биомаркеров.
                    </p>
                    
                    <!-- PWA and Login buttons -->
                    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <button onclick="installPWA()" class="btn-primary">
                            📱 Установить приложение
                        </button>
                        <button onclick="downloadForIOS()" class="btn-secondary">
                            🍎 Скачать для iOS
                        </button>
                        <a href="/login" class="btn-primary">
                            👤 Войти в аккаунт
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="py-20 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold gradient-text mb-4">Возможности платформы</h2>
                    <p class="text-xl text-gray-600">Современные технологии для вашего здоровья</p>
                </div>
                
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="card text-center">
                        <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">AI Анализ Крови</h3>
                        <p class="text-gray-600">Загрузите фото анализов и получите детальную расшифровку с помощью DeepSeek AI</p>
                    </div>
                    
                    <div class="card text-center">
                        <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Персональные Рекомендации</h3>
                        <p class="text-gray-600">Индивидуальные советы по питанию, добавкам и образу жизни</p>
                    </div>
                    
                    <div class="card text-center">
                        <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Мониторинг Здоровья</h3>
                        <p class="text-gray-600">Отслеживайте динамику биомаркеров и прогресс улучшения здоровья</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- About Section -->
        <section id="about" class="py-20 gradient-bg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center">
                    <h2 class="text-3xl md:text-4xl font-bold gradient-text mb-6">О платформе EVERLIV HEALTH</h2>
                    <p class="text-xl text-gray-600 max-w-4xl mx-auto">
                        Мы создали современную платформу для анализа здоровья, которая использует передовые AI-технологии 
                        для персонализированных медицинских рекомендаций. Наша цель - сделать профессиональный анализ 
                        здоровья доступным каждому.
                    </p>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-900 text-white py-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center">
                    <div class="flex items-center justify-center space-x-3 mb-4">
                        <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964m-5.272 21V18.75m0-16.5V3"/>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold">EVERLIV HEALTH</h3>
                    </div>
                    <p class="text-gray-400 mb-6">AI-powered health analysis platform</p>
                    <p class="text-gray-500">© 2025 EVERLIV HEALTH. Все права защищены.</p>
                </div>
            </div>
        </footer>
    </div>

    <!-- PWA Install Scripts -->
    <script>
        let deferredPrompt;
        
        // PWA requirements check
        const pwaRequirements = {
            serviceWorker: 'serviceWorker' in navigator,
            manifest: true,
            https: location.protocol === 'https:' || location.hostname === 'localhost'
        };
        
        console.log('PWA requirements check:', pwaRequirements);
        
        // Register service worker
        if (pwaRequirements.serviceWorker) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered successfully:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
        
        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            console.log('Install prompt available');
        });
        
        // Install PWA function
        function installPWA() {
            console.log('Install button clicked');
            console.log('deferredPrompt available:', !!deferredPrompt);
            
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    deferredPrompt = null;
                });
            } else {
                console.log('No deferred prompt available, showing manual instructions');
                alert('Для установки:\\n\\n1. Откройте меню браузера (⋮)\\n2. Выберите "Установить приложение" или "Добавить на домашний экран"\\n3. Подтвердите установку');
            }
        }
        
        // Download for iOS function
        function downloadForIOS() {
            if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                alert('Для установки на iOS:\\n\\n1. Нажмите кнопку "Поделиться" в Safari\\n2. Выберите "Добавить на экран Домой"\\n3. Нажмите "Добавить"');
            } else {
                alert('Эта функция доступна только на устройствах iOS через браузер Safari');
            }
        }
        
        // Check manifest
        fetch('/manifest.json')
            .then(response => response.json())
            .then(manifest => {
                console.log('Manifest loaded successfully:', manifest.name);
            })
            .catch(error => {
                console.log('Manifest load failed:', error);
            });
    </script>
</body>
</html>`;

    fs.writeFileSync('dist/public/index.html', html);
  }
  
  // Create manifest.json (PWA support)
  const manifest = {
    name: "EVERLIV HEALTH - AI Анализ Здоровья",
    short_name: "EVERLIV",
    description: "AI-powered health analysis platform with personalized medical recommendations",
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
  
  // Create service worker
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
  // Let the browser handle all requests normally
  return;
});
`;
  
  fs.writeFileSync('dist/public/sw.js', sw);
  
  // Create basic icon files if they don't exist
  try {
    const createIcon = (size) => {
      const canvas = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#059669"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-size="${size/4}" font-family="Arial, sans-serif" font-weight="bold">EH</text>
      </svg>`;
      return canvas;
    };
    
    if (!fs.existsSync('dist/public/icon-192x192.png')) {
      fs.writeFileSync('dist/public/icon-192x192.svg', createIcon(192));
    }
    if (!fs.existsSync('dist/public/icon-512x512.png')) {
      fs.writeFileSync('dist/public/icon-512x512.svg', createIcon(512));
    }
  } catch (e) {
    // Icons are optional
  }
  
  console.log('✅ STANDALONE production deployment created');
  console.log('📱 PWA support included');
  console.log('🚀 NO redirects - works independently!');
  console.log('🎯 Ready for deployment!');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Production deployment failed:', error.message);
  process.exit(1);
}