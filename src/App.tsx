import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CartonTransfer from "./pages/CartonTransfer";
import SeniorConnect from "./pages/SeniorConnect";
import HandwrittenAssignments from "./pages/HandwrittenAssignments";
import LostAndFound from "./pages/LostAndFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/carton-transfer" element={<CartonTransfer />} />
          <Route path="/senior-connect" element={<SeniorConnect />} />
          <Route path="/handwritten-assignments" element={<HandwrittenAssignments />} />
          <Route path="/lost-and-found" element={<LostAndFound />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
