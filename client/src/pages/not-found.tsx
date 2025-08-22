import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="eva-page flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="eva-card-elevated p-8 text-center eva-fade-in">
          <div className="w-16 h-16 eva-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">404</h1>
          <h2 className="text-xl font-semibold text-foreground mb-4">Страница не найдена</h2>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Извините, запрашиваемая страница не существует. Возможно, она была перемещена или удалена.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => navigate("/")}
              className="eva-btn-primary eva-btn-lg w-full"
            >
              <Home className="w-5 h-5 mr-2" />
              На главную
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="eva-btn-secondary eva-btn-lg w-full"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Назад
            </Button>
          </div>
        </div>

        {/* EVA Branding */}
        <div className="text-center mt-6 opacity-60">
          <p className="text-xs text-muted-foreground">
            Powered by EVA Health System
          </p>
        </div>
      </div>
    </div>
  );
}