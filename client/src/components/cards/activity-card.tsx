import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Activity, TrendingUp } from "lucide-react";

interface ActivityMetric {
  label: string;
  value: string;
  unit: string;
  color: string;
}

export default function ActivityCard() {
  const [view, setView] = useState<"today" | "week">("today");
  
  const metrics: ActivityMetric[] = [
    { label: "Шаги", value: "8,526", unit: "шагов", color: "text-medical-blue" },
    { label: "Калории", value: "2,181", unit: "ккал", color: "text-warning-amber" },
    { label: "Активность", value: "72", unit: "мин", color: "text-trust-green" },
  ];
  
  return (
    <Card className="p-4 bg-white dark:bg-card border-0 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-medical-blue" />
          <h3 className="font-semibold text-foreground">Активность</h3>
        </div>
        <div className="flex space-x-1">
          {(["today", "week"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                view === v 
                  ? "bg-medical-blue text-white" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`button-activity-${v}`}
            >
              {v === "today" ? "Сегодня" : "Неделя"}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                metric.color === "text-medical-blue" ? "bg-medical-blue" :
                metric.color === "text-warning-amber" ? "bg-warning-amber" :
                "bg-trust-green"
              }`} />
              <span className="text-sm text-muted-foreground">{metric.label}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`text-lg font-semibold ${metric.color}`}>
                {metric.value}
              </span>
              <span className="text-xs text-muted-foreground">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Цель на сегодня</span>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-trust-green" />
            <span className="text-xs text-trust-green">75%</span>
          </div>
        </div>
        <div className="mt-2 w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-blue-gradient rounded-full" style={{ width: "75%" }} />
        </div>
      </div>
    </Card>
  );
}