"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Home, Loader2, ExternalLink, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [orderCreated, setOrderCreated] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");
  const [user, setUser] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange'>('wave');

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

  const getWaveUrl = (orderId: string) => {
    const totalAmount = totalPrice + 2000;
    // Utilisation du lien exact fourni par l'utilisateur sans le slash final avant les paramètres
    return `https://pay.wave.com/m/M_sn_4AZ6lkLNVqnh/c/sn?amount=${totalAmount}&description=Commande-${orderId}`;
  };

  const getOrangeUrl = (orderId: string) => {
    const totalAmount = totalPrice + 2000;
    const phoneNumber = "782254548";
    const message = encodeURIComponent(`Bonjour, je souhaite payer ma commande ${orderId} d'un montant de ${totalAmount.toLocaleString()} FCFA via Orange Money.`);
    return `https://wa.me/${phoneNumber}?text=${message}`;
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

      setLastOrderId(orderId);
      setOrderCreated(true);
      showSuccess("Commande enregistrée ! Redirection vers le paiement...");

      const targetUrl = paymentMethod === 'wave' ? getWaveUrl(orderId) : getOrangeUrl(orderId);
      
      // On vide le panier
      clearCart();
      
      // Redirection immédiate
      window.location.href = targetUrl;

    } catch (error: any) {
      showError("Erreur lors de la création de la commande: " + error.message);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !orderCreated) {
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

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container px-4 py-20 mx-auto text-center max-w-2xl">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-green-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">Commande Enregistrée !</h1>
            <p className="text-gray-600 mb-8 font-medium">
              Votre commande <span className="text-orange-600 font-bold">#{lastOrderId}</span> a été créée. 
              Si vous n'avez pas été redirigé automatiquement, cliquez sur le bouton ci-dessous pour payer.
            </p>
            <Button 
              asChild 
              className={`w-full h-16 text-lg font-black rounded-2xl shadow-xl mb-4 ${
                paymentMethod === 'wave' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              <a href={paymentMethod === 'wave' ? getWaveUrl(lastOrderId) : getOrangeUrl(lastOrderId)}>
                {paymentMethod === 'wave' ? <ExternalLink className="mr-2 h-6 w-6" /> : <MessageCircle className="mr-2 h-6 w-6" />}
                PAYER MAINTENANT
              </a>
            </Button>
            <Button asChild variant="ghost" className="text-gray-500 font-bold">
              <Link to="/">Retour à l'accueil</Link>
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
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-blue-700 font-medium leading-tight">
                    Une fois le paiement effectué sur Wave, votre commande sera automatiquement validée par notre équipe.
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;