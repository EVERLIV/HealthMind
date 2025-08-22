import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Info } from "lucide-react";

interface AsklepiosScoreCardProps {
  score?: number;
  trend?: "up" | "down" | "stable";
}

export default function AsklepiosScoreCard({ score = 88, trend = "up" }: AsklepiosScoreCardProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  
  return (
    <Card className="p-6 bg-light-blue border-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Asklepios Score</h3>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Info className="w-4 h-4" />
        </button>
      </div>
      
      {/* Score Circle */}
      <div className="asklepios-score mb-6">
        <div 
          className="asklepios-score-circle"
          style={{ "--score": score } as React.CSSProperties}
        />
        <div className="asklepios-score-inner">
          <span className="text-5xl font-bold text-medical-blue">{score}</span>
          <span className="text-sm text-muted-foreground">out of 100</span>
        </div>
      </div>
      
      {/* Period Toggles */}
      <div className="flex justify-center mb-4">
        <div className="toggle-group">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`toggle-group-item ${
                period === p ? "toggle-group-item-active" : "text-muted-foreground"
              }`}
              data-testid={`button-period-${p}`}
            >
              {p === "daily" ? "День" : p === "weekly" ? "Неделя" : "Месяц"}
            </button>
          ))}
        </div>
      </div>
      
      {/* Trend Indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${
          trend === "up" ? "bg-trust-green" : 
          trend === "down" ? "bg-error-red" : 
          "bg-warning-amber"
        }`} />
        <span className="text-muted-foreground">
          {trend === "up" ? "Улучшение на 2%" : 
           trend === "down" ? "Снижение на 1%" : 
           "Стабильно"}
        </span>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Вы на правильном пути! Продолжайте в том же духе для улучшения здоровья.
        </p>
      </div>
    </Card>
  );
}