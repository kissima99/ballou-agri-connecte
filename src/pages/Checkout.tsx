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
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  RefreshCw
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
  const [paymentSent, setPaymentSent] = useState(false);
  const [isAdminConfirmed, setIsAdminConfirmed] = useState(false);
  const [tempOrderId, setTempOrderId] = useState("");

  // Simuler la vérification du statut admin toutes les 5 secondes si le paiement est envoyé
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentSent && !isAdminConfirmed && tempOrderId) {
      interval = setInterval(() => {
        const history = JSON.parse(localStorage.getItem('purchase_history') || '[]');
        const order = history.find((o: any) => o.id === tempOrderId);
        if (order && order.paymentValidated) {
          setIsAdminConfirmed(true);
          showSuccess("Paiement confirmé par l'administrateur !");
          clearInterval(interval);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [paymentSent, isAdminConfirmed, tempOrderId]);

  const handleInitiatePayment = () => {
    if (!formData.name || !formData.phone || !formData.address) {
      showError("Veuillez remplir vos informations de livraison avant de payer.");
      return;
    }
    
    const orderId = `BAC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    setTempOrderId(orderId);
    
    // Créer une commande temporaire "En attente de paiement" pour l'admin
    const pendingOrder = {
      id: orderId,
      customer: formData.name,
      phone: formData.phone,
      address: formData.address,
      amount: totalPrice + 2000,
      status: "Attente Paiement",
      paymentValidated: false,
      date: new Date().toLocaleDateString(),
      product: cart.map(i => i.name).join(", "),
      isNew: true,
      method: paymentMethod
    };
    
    const history = JSON.parse(localStorage.getItem('purchase_history') || '[]');
    localStorage.setItem('purchase_history', JSON.stringify([pendingOrder, ...history]));
    window.dispatchEvent(new Event('storage'));
    
    setPaymentSent(true);
    showSuccess("Informations enregistrées. Veuillez procéder au transfert.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminConfirmed) return;

    setIsProcessing(true);
    try {
      // Mettre à jour le statut final de la commande
      const history = JSON.parse(localStorage.getItem('purchase_history') || '[]');
      const updatedHistory = history.map((o: any) => 
        o.id === tempOrderId ? { ...o, status: "Payé" } : o
      );
      localStorage.setItem('purchase_history', JSON.stringify(updatedHistory));
      window.dispatchEvent(new Event('storage'));
      
      showSuccess("Commande confirmée !");
      clearCart();
      setIsProcessing(false);
      navigate('/history');
    } catch (error) {
      showError("Erreur lors de la confirmation.");
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
            <p className="text-gray-500 font-medium">Suivez les étapes pour valider votre commande</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de Livraison */}
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

            {/* Méthode de Paiement */}
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
                  <Button onClick={handleInitiatePayment} className="w-full bg-green-600 hover:bg-green-700 h-12 rounded-xl font-bold">
                    PROCÉDER AU PAIEMENT
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

                {!isAdminConfirmed && paymentSent && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-[10px] text-blue-700 font-medium">
                      Le bouton de confirmation s'activera automatiquement dès que l'administrateur aura reçu et validé votre transfert.
                    </p>
                  </div>
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