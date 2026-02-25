"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  ArrowRight, 
  Home,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Download,
  Loader2
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { generateReceipt } from '@/utils/receipt';
import { supabase } from "@/integrations/supabase/client";

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
  const [paymentSent, setPaymentSent] = useState(false);
  const [isAdminConfirmed, setIsAdminConfirmed] = useState(false);
  const [tempOrderId, setTempOrderId] = useState("");
  const [isInitiating, setIsInitiating] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentSent && !isAdminConfirmed && tempOrderId) {
      interval = setInterval(async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('status')
          .eq('id', tempOrderId)
          .single();
        
        if (!error && data && (data.status === 'Payé' || data.status === 'En cours' || data.status === 'Livré')) {
          setIsAdminConfirmed(true);
          showSuccess("Paiement confirmé par l'administrateur !");
          clearInterval(interval);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [paymentSent, isAdminConfirmed, tempOrderId]);

  const handleInitiatePayment = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      showError("Veuillez remplir vos informations de livraison avant de payer.");
      return;
    }
    
    setIsInitiating(true);
    const orderId = `BAC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    setTempOrderId(orderId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const pendingOrder = {
        id: orderId,
        customer_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        amount: totalPrice + 2000,
        status: "Attente Paiement",
        items: cart.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, unit: i.unit })),
        user_id: user?.id || null,
        zone: "Dakar", // Par défaut
        is_new: true
      };
      
      const { error } = await supabase
        .from('orders')
        .insert([pendingOrder]);

      if (error) throw error;
      
      // Sauvegarde locale pour compatibilité historique
      const history = JSON.parse(localStorage.getItem('purchase_history') || '[]');
      localStorage.setItem('purchase_history', JSON.stringify([{ ...pendingOrder, date: new Date().toLocaleDateString(), product: cart.map(i => i.name).join(", ") }, ...history]));
      window.dispatchEvent(new Event('storage'));
      
      setPaymentSent(true);
      showSuccess("Informations enregistrées. Veuillez procéder au transfert.");
    } catch (err: any) {
      showError("Erreur lors de l'initialisation: " + err.message);
    } finally {
      setIsInitiating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminConfirmed) return;

    setIsProcessing(true);
    try {
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', tempOrderId)
        .single();

      if (fetchError) throw fetchError;
      
      // Génération du reçu
      generateReceipt({
        id: orderData.id,
        customer: orderData.customer_name,
        phone: orderData.phone,
        address: orderData.address,
        amount: orderData.amount,
        date: new Date(orderData.created_at).toLocaleDateString(),
        product: orderData.items.map((i: any) => `${i.name} (${i.quantity} ${i.unit})`).join(", ")
      });
      
      showSuccess("Commande confirmée et reçu téléchargé !");
      clearCart();
      setIsProcessing(false);
      navigate('/history');
    } catch (error: any) {
      showError("Erreur lors de la confirmation: " + error.message);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
            <Button asChild className="bg-green-600 hover:bg-green-700 font-bold">
              <Link to="/local-products">Retour aux achats</Link>
            </Button>
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
            <p className="text-gray-500 font-medium">Suivez les étapes pour valider votre commande</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-stone-100/50 py-6">
                <CardTitle className="text-xl font-bold">1. Informations de Livraison</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-bold text-gray-700">Nom complet</Label>
                    <input 
                      id="name"
                      type="text" 
                      disabled={paymentSent}
                      className="w-full mt-1 px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-stone-50"
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
                      disabled={paymentSent}
                      className="w-full mt-1 px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-stone-50"
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
                    disabled={paymentSent}
                    className="w-full mt-1 px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-stone-50"
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
                <CardTitle className="text-xl font-bold">2. Paiement</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} disabled={paymentSent} className="space-y-3">
                  <div className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'wave' ? 'border-blue-500 bg-blue-50/30' : 'border-stone-100'}`}>
                    <RadioGroupItem value="wave" id="wave" className="peer sr-only" />
                    <Label htmlFor="wave" className="flex-1 flex items-center gap-3 cursor-pointer">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-black">W</div>
                      <div>
                        <span className="font-bold text-gray-900 block">Wave</span>
                        <span className="text-xs text-gray-500">Lien de paiement direct</span>
                      </div>
                    </Label>
                  </div>
                  <div className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'om' ? 'border-orange-500 bg-orange-50/30' : 'border-stone-100'}`}>
                    <RadioGroupItem value="om" id="om" className="peer sr-only" />
                    <Label htmlFor="om" className="flex-1 flex items-center gap-3 cursor-pointer">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-black">OM</div>
                      <div>
                        <span className="font-bold text-gray-900 block">Orange Money</span>
                        <span className="text-xs text-gray-500">Transfert manuel</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {!paymentSent ? (
                  <Button onClick={handleInitiatePayment} disabled={isInitiating} className="w-full bg-green-600 hover:bg-green-700 h-12 rounded-xl font-bold">
                    {isInitiating ? <Loader2 className="h-5 w-5 animate-spin" /> : "PROCÉDER AU PAIEMENT"}
                  </Button>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="p-6 bg-stone-900 text-white rounded-2xl shadow-inner">
                      <h4 className="text-center font-bold mb-4 text-orange-400 uppercase tracking-widest text-xs">Instructions de paiement</h4>
                      
                      {paymentMethod === 'wave' ? (
                        <div className="text-center space-y-4">
                          <p className="text-sm">Cliquez sur le lien ci-dessous pour payer via Wave :</p>
                          <Button asChild className="bg-blue-500 hover:bg-blue-600 w-full h-14 text-lg font-black rounded-xl">
                            <a href="https://pay.wave.com/m/M_sn_4AZ6lkLNVqnh/c/sn/" target="_blank" rel="noopener noreferrer">
                              PAYER AVEC WAVE <ExternalLink className="ml-2 h-5 w-5" />
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <p className="text-sm">Veuillez effectuer le transfert Orange Money au numéro suivant :</p>
                          <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                            <p className="text-3xl font-black text-orange-500 tracking-tighter">78 225 45 48</p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Nom: Kissima (Ballou Agri Connect)</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={`p-4 rounded-xl border flex items-center gap-3 ${isAdminConfirmed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                      {isAdminConfirmed ? <CheckCircle2 className="h-6 w-6" /> : <RefreshCw className="h-6 w-6 animate-spin" />}
                      <div className="flex-1">
                        <p className="text-sm font-bold">
                          {isAdminConfirmed ? "Paiement validé !" : "En attente de confirmation par l'administrateur..."}
                        </p>
                        {!isAdminConfirmed && <p className="text-[10px] opacity-80">Une fois le transfert fait, l'admin validera votre commande sous peu.</p>}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden sticky top-24">
              <CardHeader className="bg-green-700 text-white py-6">
                <CardTitle className="text-xl">Résumé</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Articles ({cart.length})</span>
                    <span className="font-bold">{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-bold">{deliveryFee.toLocaleString()} FCFA</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-900">TOTAL</span>
                    <span className="font-black text-2xl text-green-700">{finalTotal.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={!isAdminConfirmed || isProcessing}
                  className={`w-full h-16 rounded-2xl font-black text-lg shadow-lg transition-all ${
                    isAdminConfirmed 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  ) : (
                    <>CONFIRMER LA COMMANDE <ArrowRight className="ml-2 h-5 w-5" /></>
                  )}
                </Button>

                {isAdminConfirmed && (
                  <p className="text-[10px] text-center text-green-600 font-bold animate-pulse">
                    <Download className="h-3 w-3 inline mr-1" /> LE REÇU SERA TÉLÉCHARGÉ AUTOMATIQUEMENT
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;