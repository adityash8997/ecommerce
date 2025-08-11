import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CartonTransfer from "./pages/CartonTransfer";
import SeniorConnect from "./pages/SeniorConnect";
import HandwrittenAssignments from "./pages/HandwrittenAssignments";
import LostAndFound from "./pages/LostAndFound";
import SplitSaathi from "./pages/SplitSaathi";
import GroupDashboard from "./pages/GroupDashboard";
import StudyMaterial from "./pages/StudyMaterial";
import BookBuyback from "./pages/BookBuyback";
import Celebrations from "./pages/Celebrations";
import PrintoutOnDemand from "./pages/PrintoutOnDemand";
import Meetups from "./pages/Meetups";
import CampusTourBooking from "./pages/CampusTourBooking";

console.log('App.tsx: PrintoutOnDemand imported:', PrintoutOnDemand);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/carton-transfer" element={<CartonTransfer />} />
          <Route path="/senior-connect" element={<SeniorConnect />} />
          <Route path="/handwritten-assignments" element={<HandwrittenAssignments />} />
          <Route path="/lost-and-found" element={<LostAndFound />} />
          <Route path="/split-saathi" element={<SplitSaathi />} />
          <Route path="/split-saathi/group/:groupId" element={<GroupDashboard />} />
          <Route path="/study-material" element={<StudyMaterial />} />
          <Route path="/book-buyback" element={<BookBuyback />} />
          <Route path="/celebrations" element={<Celebrations />} />
          <Route path="/printout-on-demand" element={<PrintoutOnDemand />} />
          <Route path="/meetups" element={<Meetups />} />
          <Route path="/campus-tour-booking" element={<CampusTourBooking />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
