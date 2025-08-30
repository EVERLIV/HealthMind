import { useEffect, useState } from 'react';
import { Heart, Activity } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 z-50 flex items-center justify-center animate-fadeOut">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="flex items-center justify-center space-x-2 animate-pulse">
              <Heart className="w-8 h-8 text-white" />
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-wider animate-fadeInScale">
            EVERLIV HEALTH
          </h1>
          <div className="w-32 h-1 bg-white/30 mx-auto mt-4 rounded-full">
            <div className="w-full h-full bg-white rounded-full animate-slideInRight"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="flex items-center justify-center space-x-2 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
        </div>
        
        <h1 className="text-4xl font-bold text-white tracking-wider animate-fadeInScale">
          EVERLIV HEALTH
        </h1>
        
        <p className="text-white/80 mt-2 text-lg animate-fadeInUp delay-300">
          AI-Powered Health Analysis
        </p>
        
        <div className="w-32 h-1 bg-white/30 mx-auto mt-6 rounded-full overflow-hidden">
          <div className="w-full h-full bg-white rounded-full animate-slideInRight"></div>
        </div>
      </div>
    </div>
  );
}