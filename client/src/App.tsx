import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Biomarkers from "@/pages/biomarkers";
import Profile from "@/pages/profile";
import Recommendations from "@/pages/recommendations";
import HealthProfilePage from "@/pages/health-profile-page";
import ChatPage from "@/pages/chat";
import BloodAnalysisPage from "@/pages/blood-analysis";
import BloodAnalysesListPage from "@/pages/blood-analyses-list";
import BloodAnalysisDetailPage from "@/pages/blood-analysis-detail";
import ArticleDetail from "@/pages/article-detail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/blood-analysis" component={BloodAnalysisPage} />
      <Route path="/biomarkers" component={Biomarkers} />
      <Route path="/profile" component={Profile} />
      <Route path="/recommendations" component={Recommendations} />
      <Route path="/health-profile" component={HealthProfilePage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/blood-analyses" component={BloodAnalysesListPage} />
      <Route path="/blood-analyses/:id" component={BloodAnalysisDetailPage} />
      <Route path="/article/:id" component={ArticleDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
