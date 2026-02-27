"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Home, Loader2, ExternalLink, MessageCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange'>('wave');

  const WAVE_LINK = "https://pay.wave.com/m/M_sn_4AZ6lkLNVqnh/c/sn/";

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCommander = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      showError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsProcessing(true);
    try {
      const orderId = `BAC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const totalAmount = totalPrice + 2000;
      
      const pendingOrder = {
        id: orderId,
        customer_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        amount: totalAmount,
        status: "Attente de validation admin",
        items: cart.map(i => ({ 
          id: i.id, 
          name: i.name, 
          quantity: i.quantity, 
          price: i.price, 
          unit: i.unit 
        })),
        user_id: user?.id || null,
        zone: "Dakar",
        is_new: true
      };

      const { error } = await supabase
        .from('orders')
        .insert([pendingOrder]);

      if (error) throw error;

      showSuccess("Commande enregistrée !");
      setIsRedirecting(true);
      clearCart();

      // Redirection vers le paiement
      if (paymentMethod === 'wave') {
        // Redirection immédiate vers le lien Wave fourni
        window.location.href = WAVE_LINK;
      } else {
        // Orange Money - redirection vers WhatsApp
        const phoneNumber = "782254548";
        const message = encodeURIComponent(`Bonjour, je souhaite payer ma commande ${orderId} d'un montant de ${totalAmount.toLocaleString()} FCFA via Orange Money.`);
        window.location.href = `https://wa.me/${phoneNumber}?text=${message}`;
      }

    } catch (error: any) {
      showError("Erreur lors de la création de la commande: " + error.message);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !isRedirecting) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container px-4 py-20 mx-auto text-center max-w-2xl">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-stone-100">
            <ShoppingCart className="w-20 h-20 text-stone-200 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
            <p className="text-gray-500 mb-8">Commencez vos achats pour voir vos produits ici.</p>
            <Button asChild className="bg-green-600 hover:bg-green-700 font-bold">
              <Link to="/local-products">Voir les produits</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] text-center p-10">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Redirection...</h2>
          <p className="text-gray-500 mb-8">Nous vous redirigeons vers la plateforme de paiement.</p>
          <Button asChild className="w-full h-14 font-bold rounded-2xl shadow-lg bg-blue-600 hover:bg-blue-700">
            <a href={paymentMethod === 'wave' ? WAVE_LINK : "#"}>
              CLIQUEZ ICI SI LA PAGE NE S'OUVRE PAS
            </a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="icon" className="rounded-full">
            <Link to="/"><Home className="h-4 w-4 text-green-700" /></Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Finaliser la commande</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Informations de livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="Votre nom" 
                    className="rounded-xl h-12" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    placeholder="78 123 45 67" 
                    className="rounded-xl h-12" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse de livraison *</Label>
                  <Input 
                    id="address" 
                    name="address"
                    placeholder="Votre adresse complète" 
                    className="rounded-xl h-12" 
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.direction}`} className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.quantity} x {item.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-700">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-green-900 text-white">
                <CardTitle className="text-xl">Total à payer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-bold">{totalPrice.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frais de livraison</span>
                  <span className="font-bold">2 000 FCFA</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-end">
                  <span className="font-bold text-gray-900">TOTAL</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-700">{(totalPrice + 2000).toLocaleString()} FCFA</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-6 pb-8">
                <div className="space-y-4 w-full">
                  <Label className="text-sm font-black uppercase tracking-widest text-gray-400">Moyen de paiement</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wave')}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === 'wave' 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                        : 'border-stone-100 bg-white hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xl">W</div>
                        <div className="text-left">
                          <p className="font-black text-blue-900">WAVE</p>
                          <p className="text-[10px] text-blue-600 font-bold">Paiement instantané</p>
                        </div>
                      </div>
                      {paymentMethod === 'wave' && <CheckCircle2 className="h-6 w-6 text-blue-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('orange')}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === 'orange' 
                        ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' 
                        : 'border-stone-100 bg-white hover:border-orange-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-xl">O</div>
                        <div className="text-left">
                          <p className="font-black text-orange-900">ORANGE MONEY</p>
                          <p className="text-[10px] text-orange-600 font-bold">Validation via WhatsApp</p>
                        </div>
                      </div>
                      {paymentMethod === 'orange' && <CheckCircle2 className="h-6 w-6 text-orange-600" />}
                    </button>
                  </div>
                </div>

                <Button 
                  onClick={handleCommander} 
                  disabled={isProcessing}
                  className={`w-full h-16 text-lg font-black shadow-xl rounded-2xl transition-all transform active:scale-95 ${
                    paymentMethod === 'wave' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      {paymentMethod === 'wave' ? <ExternalLink className="mr-2 h-6 w-6" /> : <MessageCircle className="mr-2 h-6 w-6" />}
                      PAYER {(totalPrice + 2000).toLocaleString()} FCFA
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;