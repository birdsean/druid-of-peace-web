import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Game from "@/pages/game";
import Map from "@/pages/map";
import Inventory from "@/pages/inventory";
import Skills from "@/pages/skills";
import MainMenu from "@/pages/main-menu";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={MainMenu} />
      <Route path="/map" component={Map} />
      <Route path="/game" component={Game} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/skills" component={Skills} />
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
