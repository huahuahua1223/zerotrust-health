import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { InsurerGuard, AdminGuard } from "@/components/guards";
import { MainLayout } from "@/components/layout";
import { RequiredNetworkGate } from "@/components/web3/RequiredNetworkGate";
import { Web3Provider } from "@/providers/Web3Provider";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import MyPolicies from "./pages/MyPolicies";
import PolicyDetail from "./pages/PolicyDetail";
import MyClaims from "./pages/MyClaims";
import ClaimDetail from "./pages/ClaimDetail";
import SubmitClaim from "./pages/SubmitClaim";
import InsurerDashboard from "./pages/insurer/Dashboard";
import InsurerProducts from "./pages/insurer/Products";
import InsurerCreateProduct from "./pages/insurer/CreateProduct";
import InsurerClaims from "./pages/insurer/Claims";
import InsurerClaimDetail from "./pages/insurer/ClaimDetail";
import AdminRoles from "./pages/admin/Roles";
import AdminSystem from "./pages/admin/System";
import NotFound from "./pages/NotFound";

const App = () => (
  <Web3Provider>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RequiredNetworkGate>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/my-policies" element={<MyPolicies />} />
                <Route path="/my-policies/:id" element={<PolicyDetail />} />
                <Route path="/my-claims" element={<MyClaims />} />
                <Route path="/claims/:id" element={<ClaimDetail />} />
                <Route path="/claim/new" element={<SubmitClaim />} />
                <Route
                  path="/insurer/dashboard"
                  element={
                    <InsurerGuard>
                      <InsurerDashboard />
                    </InsurerGuard>
                  }
                />
                <Route
                  path="/insurer/products"
                  element={
                    <InsurerGuard>
                      <InsurerProducts />
                    </InsurerGuard>
                  }
                />
                <Route
                  path="/insurer/products/new"
                  element={
                    <InsurerGuard>
                      <InsurerCreateProduct />
                    </InsurerGuard>
                  }
                />
                <Route
                  path="/insurer/claims"
                  element={
                    <InsurerGuard>
                      <InsurerClaims />
                    </InsurerGuard>
                  }
                />
                <Route
                  path="/insurer/claims/:id"
                  element={
                    <InsurerGuard>
                      <InsurerClaimDetail />
                    </InsurerGuard>
                  }
                />
                <Route
                  path="/admin/roles"
                  element={
                    <AdminGuard>
                      <AdminRoles />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/system"
                  element={
                    <AdminGuard>
                      <AdminSystem />
                    </AdminGuard>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </RequiredNetworkGate>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </Web3Provider>
);

export default App;
