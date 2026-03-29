import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PublicLayout } from "./components/layouts/PublicLayout";
import { AppLayout } from "./components/layouts/AppLayout";
import { ProtectedRoute } from "./components/layouts/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/app/DashboardPage";
import SearchPage from "./pages/app/SearchPage";
import LeadsPage from "./pages/app/LeadsPage";
import CreditsPage from "./pages/app/CreditsPage";
import SettingsPage from "./pages/app/SettingsPage";
import PaymentSuccessPage from "./pages/app/PaymentSuccessPage";
import PaymentErrorPage from "./pages/app/PaymentErrorPage";
import PaymentPendingPage from "./pages/app/PaymentPendingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/planos" element={<PricingPage />} />
              <Route path="/como-funciona" element={<HowItWorksPage />} />
              <Route path="/contato" element={<ContactPage />} />
              <Route path="/termos-de-uso" element={<TermsPage />} />
              <Route path="/politica-de-privacidade" element={<PrivacyPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="busca" element={<SearchPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="creditos" element={<CreditsPage />} />
                <Route path="configuracoes" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
