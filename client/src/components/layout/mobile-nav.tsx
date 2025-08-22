import { Bell, UserCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileNav() {
  return (
    <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-card-foreground">HealthAI</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              data-testid="button-notifications"
              variant="ghost" 
              size="sm" 
              className="p-2 rounded-lg hover:bg-accent"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button 
              data-testid="button-user-menu"
              variant="ghost" 
              size="sm" 
              className="p-2 rounded-lg hover:bg-accent"
            >
              <UserCircle className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
