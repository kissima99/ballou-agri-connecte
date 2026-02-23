"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, Home, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container px-4 py-20 mx-auto text-center max-w-2xl">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-stone-100">
            <ShoppingCart className="w-20 h-20 text-stone-200 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
            <p className="text-gray-500 mb-8">Commencez vos achats pour voir vos produits ici.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-green-600 hover:bg-green-700 font-bold">
                <Link to="/local-products">Produits Locaux</Link>
              </Button>
              <Button asChild variant="outline" className="border-blue-200 text-blue-700 font-bold">
                <Link to="/imported-products">Produits de Dakar</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="icon" className="rounded-full">
            <Link to="/"><Home className="h-4 w-4 text-green-700" /></Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Mon Panier ({totalItems})</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={`${item.id}-${item.direction}`} className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-4 flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Truck className="h-3 w-3 text-orange-500" />
                      <span className="text-[10px] font-bold text-orange-600 uppercase">{item.direction}</span>
                    </div>
                    <p className="text-sm font-bold text-green-700 mt-1">{item.price.toLocaleString()} FCFA <span className="text-[10px] text-gray-400 font-normal">/ {item.unit}</span></p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-xl">Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-bold">{totalPrice.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Livraison (estimée)</span>
                  <span className="font-bold">2 000 FCFA</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-end">
                  <span className="font-bold text-gray-900">TOTAL</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-700">{(totalPrice + 2000).toLocaleString()} FCFA</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate('/checkout')} className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg font-bold shadow-lg">
                  COMMANDER <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
            <p className="text-[10px] text-center text-gray-400 font-medium uppercase tracking-widest">Paiement sécurisé via Wave ou Orange Money</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;