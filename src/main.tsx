"use client";

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';
import { CartProvider } from './context/CartContext';
import { Toaster } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CartProvider>
      <App />
      <Toaster position="top-center" />
    </CartProvider>
  </React.StrictMode>
);