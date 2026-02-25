"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  CreditCard, 
  ArrowRight, 
  MapPin, 
  ShoppingBag,
  Home,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("wave");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      showError("Veuillez remplir tous les champs.");
      return;
    }
    setIsProcessing(true);
    try {
      const orderId = `BAC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const newOrder = {
        id: orderId,
        customer: formData.name,
        phone: formData.phone,
        address: formData.address,
        amount: totalPrice + 2000,
        status: "Payé",
        date: new Date().toLocaleDateString(),
        product: cart.map(i => i.name).join(", "),
        isNew: true
      };
      const history = JSON.parse(localStorage.getItem('purchase_history') || '[]');
      localStorage.setItem('purchase_history', JSON.stringify([newOrder, ...history]));
      window.dispatchEvent(new Event('storage'));
      showSuccess("Commande enregistrée avec succès !");
      clearCart();
      setIsProcessing(false);
      navigate('/history');
    } catch (error) {
      showError("Erreur lors de l'enregistrement de la commande.");
      setIsProcessing(false);
    }
  };

  const deliveryFee = 2000;
  const finalTotal = totalPrice + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container px-4 py-20 mx-auto text-center max-w-2xl">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-stone-100">
            <ShoppingBag className="w-20 h-20 text-stone-200 mx-auto mb-6" />
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
        <div className="flex items-center gap-4 mb-10">
          <Button asChild variant="outline" size="icon" className="rounded-full border-green-200">
            <Link to="/"><Home className="h-4 w-4 text-green-700" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-green-900 mb-4">Finaliser l'achat</h1>
            <p className="text-gray-500 font-medium">Remplissez les informations pour compléter votre commande</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-stone-100/50 py-6">
                <CardTitle className="text-xl font-bold">Votre Panier</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">{item.direction}</p>
                        <p className="text-sm font-bold text-green-700">{item.price.toLocaleString()} FCFA <span className="text-[10px] text-gray-400 font-normal">/ {item.unit}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-gray-900">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-stone-100/50 py-6">
                <CardTitle className="text-xl font-bold">Informations de Livraison</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-bold text-gray-700">Nom complet</Label>
                    <input 
                      id="name"
                      type="text" 
                      className="w-full mt-1 px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Votre nom"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-bold text-gray-700">Téléphone</Label>
                    <input 
                      id="phone"
                      type="tel" 
                      className="w-full mt-1 px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="78 123 45 67"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="text-sm font-bold text-gray-700">Adresse de livraison</Label>
                  <textarea 
                    id="address"
                    className="w-full mt-1 px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Quartier, Rue, Numéro..."
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-stone-100/50 py-6">
                <CardTitle className="text-xl font-bold">Méthode de Paiement</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
                    <RadioGroupItem value="wave" id="wave" className="peer sr-only" />
                    <Label htmlFor="wave" className="flex-1 flex items-center gap-3 cursor-pointer">
                      <div className="w-8 h-8 bg-white/50 border border-gray-200 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">Wave</span>
                        <span className="text-xs text-gray-500">Paiement mobile instantané</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-orange-300 transition-colors">
                    <RadioGroupItem value="om" id="om" className="peer sr-only" />
                    <Label htmlFor="om" className="flex-1 flex items-center gap-3 cursor-pointer">
                      <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                        <Lock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">Orange Money</span>
                        <span className="text-xs text-gray-500">Paiement sécurisé Orange</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-green-700 text-white py-6">
                <CardTitle className="text-xl">Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Articles ({cart.length})</span>
                    <span className="font-bold">{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span className="font-bold">{deliveryFee.toLocaleString()} FCFA</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-900">TOTAL</span>
                    <span className="font-black text-2xl text-green-700">{finalTotal.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-green-800 text-sm">Paiement 100% sécurisé</span>
                  </div>
                  <p className="text-xs text-gray-600">Vos informations sont protégées par un cryptage de haut niveau.</p>
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full h-14 bg-orange-500 hover:bg-orange-600 rounded-2xl font-bold text-lg shadow-lg"
                >
                  {isProcessing ? (
                    <>Traitement en cours...</>
                  ) : (
                    <>CONFIRMER LA COMMANDE <ArrowRight className="ml-2 h-5 w-5" /></>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-400">
                  En validant, vous acceptez nos conditions de vente et de livraison.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;