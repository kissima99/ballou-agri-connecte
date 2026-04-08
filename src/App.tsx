import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Tracking from "@/pages/Tracking";
import LocalProducts from "@/pages/LocalProducts";
import ImportedProducts from "@/pages/ImportedProducts";
import Insights from "@/pages/Insights";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Receipt from "@/pages/Receipt";
import AdminDashboard from "@/pages/AdminDashboard";
import Feedback from "@/pages/Feedback";
import Login from "@/pages/Login";
import WhatsAppButton from "@/components/WhatsAppButton";
import PurchaseHistory from "@/pages/PurchaseHistory";
import ProtectedRoute from "@/components/ProtectedRoute";
import ThiakThiak from "@/pages/ThiakThiak";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
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
            <Route path="/receipt/:orderId" element={<Receipt />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/purchase-history" element={<PurchaseHistory />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WhatsAppButton />
          <Analytics />
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;