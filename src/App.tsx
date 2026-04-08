"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import LocalProducts from './pages/LocalProducts';
import ImportedProducts from './pages/ImportedProducts';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Receipt from './pages/Receipt';
import Tracking from './pages/Tracking';
import Feedback from './pages/Feedback';
import Insights from './pages/Insights';
import PurchaseHistory from './pages/PurchaseHistory';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import ThiakThiak from './pages/ThiakThiak';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/local-products" element={<LocalProducts />} />
        <Route path="/imported-products" element={<ImportedProducts />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/receipt/:orderId" element={<Receipt />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/purchase-history" element={<PurchaseHistory />} />
        <Route path="/login" element={<Login />} />
        <Route path="/thiak-thiak" element={<ThiakThiak />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <WhatsAppButton />
    </Router>
  );
}

export default App;