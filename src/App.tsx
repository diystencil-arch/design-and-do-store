import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Index from "./pages/Index";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import ShippingPage from "./pages/ShippingPage";
import ReturnsPage from "./pages/ReturnsPage";
import AboutPage from "./pages/AboutPage";
import ToolsPage from "./pages/ToolsPage";
import StencilsPage from "./pages/StencilsPage";
import SvgPage from "./pages/SvgPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import FreebiePage from "./pages/FreebiePage";
import BlogPage from "./pages/BlogPage";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";
import DownloadPage from "./pages/DownloadPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import WoodPage from "./pages/WoodPage";
import AcrylicPage from "./pages/AcrylicPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSubscribers from "./pages/admin/AdminSubscribers";
import AdminStats from "./pages/admin/AdminStats";
import AdminMarketing from "./pages/admin/AdminMarketing";
import AdminFinances from "./pages/admin/AdminFinances";
import AdminHelp from "./pages/admin/AdminHelp";
import NotFound from "./pages/NotFound";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CurrencyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Header />
            <CartDrawer />
            <main className="min-h-[60vh]">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/stencils" element={<StencilsPage />} />
                <Route path="/wood" element={<WoodPage />} />
                <Route path="/acrylic" element={<AcrylicPage />} />
                <Route path="/svg" element={<SvgPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/freebie" element={<FreebiePage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/download" element={<DownloadPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
                <Route path="/admin/blog" element={<AdminBlog />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/subscribers" element={<AdminSubscribers />} />
                <Route path="/admin/stats" element={<AdminStats />} />
                <Route path="/admin/marketing" element={<AdminMarketing />} />
                <Route path="/admin/finances" element={<AdminFinances />} />
                <Route path="/admin/help" element={<AdminHelp />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <WhatsAppButton />
          </BrowserRouter>
        </TooltipProvider>
      </CurrencyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
