import { Link, useLocation } from "wouter";
import { Home, BarChart3, BriefcaseMedical, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Главная" },
  { path: "/statistics", icon: BarChart3, label: "Статистика" },
  { path: "/biomarkers", icon: BriefcaseMedical, label: "Биомаркеры" },
  { path: "/profile", icon: User, label: "Профиль" },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <button 
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={cn(
                    "flex flex-col items-center py-2 px-3 transition-colors",
                    isActive ? "text-medical-blue" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
