import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import SplashScreen from "@/components/SplashScreen";
import Dashboard from "@/pages/dashboard";
import Biomarkers from "@/pages/biomarkers";
import Profile from "@/pages/profile";
import AIConsultation from "@/pages/deepseek-consultation";
import Recommendations from "@/pages/recommendations";
import HealthProfilePage from "@/pages/health-profile-page";
import ChatPage from "@/pages/chat";
import BloodAnalysisPage from "@/pages/blood-analysis";
import BloodAnalysesListPage from "@/pages/blood-analyses-list";
import BloodAnalysisDetailPage from "@/pages/blood-analysis-detail";
import ArticleDetail from "@/pages/article-detail";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import UserSettingsPage from "@/pages/user-settings";

// Protected route wrapper
function ProtectedRoute({ component: Component }: { component: React.FC }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <Component />;
}

// Home route with PWA redirect logic
function HomeRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [showSplash, setShowSplash] = useState(false);
  
  useEffect(() => {
    // Check if PWA is installed (running in standalone mode)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isPWA) {
      // Show splash screen for PWA
      setShowSplash(true);
    }
  }, []);
  
  const handleSplashComplete = () => {
    setShowSplash(false);
    // Redirect based on auth status
    if (isAuthenticated) {
      setLocation('/app/dashboard');
    } else {
      setLocation('/login');
    }
  };
  
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }
  
  // If not PWA, show landing page
  return <LandingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      {/* Redirects for old URLs */}
      <Route path="/article/:id">
        {(params) => <Redirect to={`/app/article/${params.id}`} />}
      </Route>
      <Route path="/health-profile">
        <Redirect to="/app/health-profile" />
      </Route>
      <Route path="/dashboard">
        <Redirect to="/app/dashboard" />
      </Route>
      <Route path="/app">
        <Redirect to="/app/dashboard" />
      </Route>
      <Route path="/app/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/app/blood-analysis" component={() => <ProtectedRoute component={BloodAnalysisPage} />} />
      <Route path="/app/biomarkers" component={() => <ProtectedRoute component={Biomarkers} />} />
      <Route path="/app/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/app/recommendations" component={() => <ProtectedRoute component={Recommendations} />} />
      <Route path="/app/ai-consultation" component={() => <ProtectedRoute component={AIConsultation} />} />
      <Route path="/app/health-profile" component={() => <ProtectedRoute component={HealthProfilePage} />} />
      <Route path="/app/chat" component={() => <ProtectedRoute component={ChatPage} />} />
      <Route path="/app/blood-analyses" component={() => <ProtectedRoute component={BloodAnalysesListPage} />} />
      <Route path="/app/blood-analyses/:id" component={() => <ProtectedRoute component={BloodAnalysisDetailPage} />} />
      <Route path="/app/article/:id" component={() => <ProtectedRoute component={ArticleDetail} />} />
      <Route path="/app/user-settings" component={() => <ProtectedRoute component={UserSettingsPage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
