import { Toast } from "@/components/ui/toast";
import { Toast as Sonner } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Tracking from "./pages/Tracking";
import LocalProducts from "./pages/LocalProducts";
import ImportedProducts from "./pages/ImportedProducts";
import Insights from "./pages/Insights";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import PurchaseHistory from "./pages/PurchaseHistory";
import AdminDashboard from "./pages/AdminDashboard";
import Feedback from "./pages/Feedback";
import Login from "./pages/Login";
import WhatsAppButton from "./components/WhatsAppButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toast />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/local-products" element={<LocalProducts />} />
            <Route path="/imported-products" element={<ImportedProducts />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/history" element={<PurchaseHistory />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WhatsAppButton />
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;