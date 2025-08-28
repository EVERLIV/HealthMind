import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
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

function Router() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Switch>
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/blood-analysis" component={() => <ProtectedRoute component={BloodAnalysisPage} />} />
      <Route path="/biomarkers" component={() => <ProtectedRoute component={Biomarkers} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/recommendations" component={() => <ProtectedRoute component={Recommendations} />} />
      <Route path="/ai-consultation" component={() => <ProtectedRoute component={AIConsultation} />} />
      <Route path="/health-profile" component={() => <ProtectedRoute component={HealthProfilePage} />} />
      <Route path="/chat" component={() => <ProtectedRoute component={ChatPage} />} />
      <Route path="/blood-analyses" component={() => <ProtectedRoute component={BloodAnalysesListPage} />} />
      <Route path="/blood-analyses/:id" component={() => <ProtectedRoute component={BloodAnalysisDetailPage} />} />
      <Route path="/article/:id" component={() => <ProtectedRoute component={ArticleDetail} />} />
      <Route path="/user-settings" component={() => <ProtectedRoute component={UserSettingsPage} />} />
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
