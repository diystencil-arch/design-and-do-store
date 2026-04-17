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
import LoginPage from "./pages/LoginPage";
import WoodPage from "./pages/WoodPage";
import AcrylicPage from "./pages/AcrylicPage";
import NotFound from "./pages/NotFound";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            <Route path="/login" element={<LoginPage />} />
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
  </QueryClientProvider>
);

export default App;
