import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './globals.css';
import { CartProvider } from './context/CartContext';
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from '@vercel/analytics/react';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <CartProvider>
        <App />
        <Analytics />
        <Toaster position="top-center" />
      </CartProvider>
    </React.StrictMode>
  );
}