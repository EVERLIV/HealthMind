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
    { label: "Шаги", value: "8,526", unit: "шагов", color: "text-blue-600" },
    { label: "Калории", value: "2,181", unit: "ккал", color: "text-orange-600" },
    { label: "Активность", value: "72", unit: "мин", color: "text-emerald-600" },
  ];
  
  return (
    <Card className="p-6 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl hover:scale-[1.01] relative overflow-hidden">
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-indigo-400/10 rounded-full blur-3xl"></div>
      
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-lg text-foreground">Активность</h3>
        </div>
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {(["today", "week"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs rounded-md transition-all font-semibold ${
                view === v 
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`button-activity-${v}`}
            >
              {v === "today" ? "Сегодня" : "Неделя"}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4 relative z-10">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 dark:hover:bg-black/20 transition-colors">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full shadow-lg ${
                metric.color === "text-blue-600" ? "bg-gradient-to-br from-blue-400 to-blue-600" :
                metric.color === "text-orange-600" ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                "bg-gradient-to-br from-emerald-400 to-emerald-600"
              }`} />
              <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`text-xl font-bold ${metric.color}`}>
                {metric.value}
              </span>
              <span className="text-xs text-muted-foreground font-medium">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Цель на сегодня</span>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">75%</span>
          </div>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm transition-all duration-500" style={{ width: "75%" }} />
        </div>
      </div>
    </Card>
  );
}