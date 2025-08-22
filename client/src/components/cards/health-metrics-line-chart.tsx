import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Heart, Activity, Droplet } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MetricData {
  time: string;
  value: number;
}

interface HealthMetricsLineChartProps {
  title: string;
  icon: "heart" | "activity" | "blood";
  data?: MetricData[];
  color?: string;
  unit?: string;
}

export default function HealthMetricsLineChart({ 
  title, 
  icon, 
  data = generateSampleData(),
  color = "hsl(211, 100%, 50%)",
  unit = ""
}: HealthMetricsLineChartProps) {
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  
  const Icon = icon === "heart" ? Heart : icon === "activity" ? Activity : Droplet;
  
  function generateSampleData(): MetricData[] {
    return [
      { time: "Пн", value: 72 },
      { time: "Вт", value: 75 },
      { time: "Ср", value: 73 },
      { time: "Чт", value: 78 },
      { time: "Пт", value: 74 },
      { time: "Сб", value: 76 },
      { time: "Вс", value: 72 },
    ];
  }
  
  return (
    <Card className="p-4 bg-white dark:bg-card border-0 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-medical-blue" />
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <div className="flex space-x-1">
          {(["day", "week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                period === p 
                  ? "bg-medical-blue text-white" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`button-chart-${p}`}
            >
              {p === "day" ? "День" : p === "week" ? "Неделя" : "Месяц"}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="time" 
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              stroke="var(--border)"
            />
            <YAxis 
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              stroke="var(--border)"
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px"
              }}
              labelStyle={{ color: "var(--foreground)" }}
              formatter={(value: number) => [`${value}${unit}`, title]}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Среднее: 74.3{unit}</span>
        <span className="text-trust-green">В норме</span>
      </div>
    </Card>
  );
}