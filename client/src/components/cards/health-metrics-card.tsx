import { Card } from "@/components/ui/card";
import { Heart, Activity, Thermometer } from "lucide-react";
import type { HealthMetrics } from "@shared/schema";

interface HealthMetricsCardProps {
  metrics?: HealthMetrics;
}

export default function HealthMetricsCard({ metrics }: HealthMetricsCardProps) {
  if (!metrics) {
    return (
      <Card className="p-4 bg-light-blue border-0">
        <h3 className="font-semibold text-foreground mb-3">Последние показатели</h3>
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-sm">Нет данных о показателях здоровья</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white dark:bg-card border-0 shadow-sm">
      <h3 className="font-semibold text-foreground mb-4">Последние показатели</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-light-blue rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-4 h-4 text-medical-blue" />
            <span className="text-xs text-trust-green">↑ 2%</span>
          </div>
          <div className="text-2xl font-bold text-foreground" data-testid="metric-heart-rate">
            {metrics.heartRate}
          </div>
          <div className="text-xs text-muted-foreground">ЧСС (уд/мин)</div>
        </div>
        
        <div className="bg-light-blue rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-4 h-4 text-trust-green" />
            <span className="text-xs text-muted-foreground">—</span>
          </div>
          <div className="text-2xl font-bold text-foreground" data-testid="metric-blood-pressure">
            {metrics.bloodPressureSystolic}/{metrics.bloodPressureDiastolic}
          </div>
          <div className="text-xs text-muted-foreground">Давление</div>
        </div>
        
        <div className="bg-light-blue rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <Thermometer className="w-4 h-4 text-warning-amber" />
            <span className="text-xs text-trust-green">ОК</span>
          </div>
          <div className="text-2xl font-bold text-foreground" data-testid="metric-temperature">
            {metrics.temperature}°
          </div>
          <div className="text-xs text-muted-foreground">Температура</div>
        </div>
      </div>
    </Card>
  );
}
