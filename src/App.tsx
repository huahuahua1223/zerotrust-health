import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { ThemeProvider } from "next-themes";
import { wagmiConfig } from "@/config/wagmi";
import { I18nProvider } from "@/locales";
import { MainLayout } from "@/components/layout";

// Pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import MyPolicies from "./pages/MyPolicies";
import MyClaims from "./pages/MyClaims";
import SubmitClaim from "./pages/SubmitClaim";
import InsurerDashboard from "./pages/insurer/Dashboard";
import InsurerProducts from "./pages/insurer/Products";
import InsurerClaims from "./pages/insurer/Claims";
import AdminRoles from "./pages/admin/Roles";
import AdminSystem from "./pages/admin/System";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<MainLayout />}>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />

                  {/* User Routes */}
                  <Route path="/my-policies" element={<MyPolicies />} />
                  <Route path="/my-claims" element={<MyClaims />} />
                  <Route path="/claim/new" element={<SubmitClaim />} />

                  {/* Insurer Routes */}
                  <Route path="/insurer/dashboard" element={<InsurerDashboard />} />
                  <Route path="/insurer/products" element={<InsurerProducts />} />
                  <Route path="/insurer/claims" element={<InsurerClaims />} />

                  {/* Admin Routes */}
                  <Route path="/admin/roles" element={<AdminRoles />} />
                  <Route path="/admin/system" element={<AdminSystem />} />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
