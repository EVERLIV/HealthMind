import { Bell, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoUrl from '@assets/logo_1756364617629.png';

export default function MobileNav() {
  return (
    <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <img src={logoUrl} alt="EVERLIV HEALTH" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <div className="text-lg font-bold text-card-foreground tracking-wide">EVERLIV HEALTH</div>
              <div className="text-xs text-muted-foreground font-medium">Get your health in order</div>
            </div>
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
