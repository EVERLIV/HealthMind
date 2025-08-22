import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import type { HealthMetrics } from "@shared/schema";

interface HealthMetricsCardProps {
  metrics?: HealthMetrics;
}

export default function HealthMetricsCard({ metrics }: HealthMetricsCardProps) {
  if (!metrics) {
    return (
      <Card className="shadow-sm border border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Последние показатели</CardTitle>
            <BarChart3 className="w-5 h-5 text-medical-blue" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Нет данных о показателях здоровья</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Последние показатели</CardTitle>
          <BarChart3 className="w-5 h-5 text-medical-blue" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-medical-blue" data-testid="metric-heart-rate">
              {metrics.heartRate}
            </div>
            <div className="text-xs text-muted-foreground">ЧСС</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-trust-green" data-testid="metric-blood-pressure">
              {metrics.bloodPressureSystolic}/{metrics.bloodPressureDiastolic}
            </div>
            <div className="text-xs text-muted-foreground">Давление</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-amber" data-testid="metric-temperature">
              {metrics.temperature}°
            </div>
            <div className="text-xs text-muted-foreground">Температура</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
