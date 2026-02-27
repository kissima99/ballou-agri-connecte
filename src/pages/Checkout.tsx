"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, User, Phone, MapPin, Mail, CreditCard, Truck, CheckCircle2, Loader2 } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    email: '',
    zone: 'Ballou'
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      showError("Votre panier est vide");
      return;
    }

    if (!formData.customer_name || !formData.phone || !formData.address) {
      showError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsProcessing(true);

    try {
      // Generate order ID
      const orderId = 'BAC-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      
      // Prepare order items
      const orderItems = cart.map(item => ({
        product_id: String(item.id),
        product_name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.price,
        line_total: item.price * item.quantity
      }));

      // Insert order into Supabase
      const { error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            id: orderId,
            customer_name: formData.customer_name,
            phone: formData.phone,
            address: formData.address,
            zone: formData.zone,
            amount: totalPrice + 2000,
            status: 'Attente Paiement',
            items: orderItems,
            email: formData.email || null,
            user_id: (await supabase.auth.getUser()).data.user?.id || null
          }
        ]);

      if (orderError) throw orderError;

      // Show success and redirect to payment instructions
      showSuccess(`Commande ${orderId} créée avec succès!`);
      
      // Store order info for receipt page
      localStorage.setItem('last_order_id', orderId);
      
      // Clear cart
      clearCart();
      
      // Navigate to receipt page
      navigate(`/receipt/${orderId}`);

    } catch (error: any) {
      console.error('Order creation error:', error);
      showError("Erreur lors de la création de la commande: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container px-4 py-20 mx-auto text-center max-w-2xl">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-stone-100">
            <ShoppingCart className="w-20 h-20 text-stone-200 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Panier vide</h1>
            <p className="text-gray-500 mb-8">Ajoutez des produits avant de procéder au paiement.</p>
            <Button asChild className="bg-green-600 hover:bg-green-700 font-bold">
              <a href="/local-products">Voir les produits</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="icon" className="rounded-full">
            <a href="/cart"><ShoppingCart className="h-4 w-4 text-green-700" /></a>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Finaliser la commande</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-lg bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" /> Informations Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Nom complet *</Label>
                  <Input 
                    id="customer_name"
                    name="customer_name"
                    placeholder="Votre nom et prénom"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input 
                    id="phone"
                    name="phone"
                    placeholder="78 123 45 67"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse de livraison *</Label>
                  <Input 
                    id="address"
                    name="address"
                    placeholder="Quartier, Rue, Numéro..."
                    value={formData.address}
                    onChange={handleInputChange}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zone">Zone de livraison *</Label>
                  <select 
                    id="zone"
                    name="zone"
                    value={formData.zone}
                    onChange={(e) => setFormData({...formData, zone: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="Ballou">Ballou</option>
                    <option value="Dakar">Dakar</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-600" /> Mode de paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border-2 border-green-200 rounded-xl bg-green-50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">W</div>
                      <div>
                        <h4 className="font-bold text-green-800">Wave</h4>
                        <p className="text-xs text-green-600">Paiement mobile instantané</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Numéro: 78 225 45 48</p>
                  </div>
                  
                  <div className="p-4 border-2 border-orange-200 rounded-xl bg-orange-50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">OM</div>
                      <div>
                        <h4 className="font-bold text-orange-800">Orange Money</h4>
                        <p className="text-xs text-orange-600">Paiement mobile sécurisé</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Numéro: 78 225 45 48</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-white rounded-2xl sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} x {item.price.toLocaleString()} FCFA</p>
                      </div>
                      <span className="font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sous-total</span>
                    <span className="font-bold">{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Livraison</span>
                    <span className="font-bold">2 000 FCFA</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-end">
                    <span className="font-bold text-gray-900">TOTAL</span>
                    <div className="text-right">
                      <p className="text-2xl font-black text-green-700">{(totalPrice + 2000).toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg font-bold shadow-lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      TRAITEMENT...
                    </>
                  ) : (
                    <>
                      <Truck className="mr-2 h-5 w-5" />
                      COMMANDER
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-center text-gray-400 font-medium uppercase tracking-widest">
                  Paiement sécurisé via Wave ou Orange Money
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;