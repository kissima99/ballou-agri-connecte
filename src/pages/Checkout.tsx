"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle2, CreditCard, Banknote, ArrowRight, Mail, QrCode, Truck, Loader2, Home, ExternalLink } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const productPrice = location.state?.price || 0;
  const productName = location.state?.name || "Produit";
  const deliveryFee = 2000;
  const totalPrice = productPrice + deliveryFee;

  const [paymentMethod, setPaymentMethod] = useState("wave");
  const [isOrdered, setIsOrdered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  const wavePaymentUrl = "https://pay.wave.com/m/M_sn_4AZ6lkLNVqnh/c/sn/";

  const handleVerifyPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      showSuccess("Paiement reçu ! Vous pouvez maintenant confirmer.");
    }, 3000);
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.address) {
      showError("Veuillez remplir toutes vos informations réelles.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulation d'envoi d'email via service tiers
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newOrderId = `BAC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    setOrderId(newOrderId);

    const history = JSON.parse(localStorage.getItem('purchase_history') || '[]');
    const newOrder = {
      id: newOrderId,
      date: new Date().toLocaleDateString('fr-FR'),
      product: productName,
      amount: totalPrice,
      status: "En attente",
      customer: formData.name,
      email: formData.email
    };
    localStorage.setItem('purchase_history', JSON.stringify([newOrder, ...history]));

    setIsSubmitting(false);
    setIsOrdered(true);
    showSuccess(`Commande confirmée ! Reçu envoyé à ${formData.email}.`);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wavePaymentUrl)}`;

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container px-4 py-20 mx-auto text-center max-w-2xl">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-green-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Commande Réussie !</h1>
            <p className="text-gray-600 mb-2">Numéro de commande : <span className="font-bold text-green-700">{orderId}</span></p>
            <p className="text-gray-600 mb-8">
              Un reçu PDF détaillé pour <strong>{totalPrice.toLocaleString()} FCFA</strong> a été envoyé à <strong>{formData.email}</strong>. Vérifiez vos spams si besoin.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/tracking')} className="bg-blue-600 hover:bg-blue-700 w-full">Suivre mon colis</Button>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">Retour à l'accueil</Button>
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
          <h1 className="text-3xl font-bold text-green-900">Finaliser mon achat</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-green-600" /> Informations réelles de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input id="name" placeholder="Votre nom" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" placeholder="77 000 00 00" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse Email (pour le reçu PDF)</Label>
                  <Input id="email" type="email" placeholder="votre@email.com" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse exacte à Ballou</Label>
                  <Input id="address" placeholder="Quartier, Maison..." required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-green-600" /> Méthode de paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(val) => { setPaymentMethod(val); setIsVerified(false); }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <RadioGroupItem value="wave" id="wave" className="peer sr-only" />
                    <Label htmlFor="wave" className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent cursor-pointer peer-data-[state=checked]:border-blue-500">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold mb-2">W</div>
                      <span className="font-bold">Wave</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="om" id="om" className="peer sr-only" />
                    <Label htmlFor="om" className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent cursor-pointer peer-data-[state=checked]:border-orange-500">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold mb-2">OM</div>
                      <span className="font-bold">Orange Money</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                    <Label htmlFor="cash" className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent cursor-pointer peer-data-[state=checked]:border-green-500">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold mb-2"><Banknote className="h-6 w-6" /></div>
                      <span className="font-bold">Cash</span>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'wave' && (
                  <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center animate-in zoom-in-95">
                    <QrCode className="mx-auto h-32 w-32 mb-4 text-blue-600" />
                    <p className="text-sm text-blue-700 mb-4">Payez via Wave puis revenez ici.</p>
                    <Button asChild className="bg-blue-600 w-full"><a href={wavePaymentUrl} target="_blank" rel="noopener noreferrer" onClick={() => setIsVerified(true)}>Ouvrir Wave <ExternalLink className="ml-2 h-4 w-4" /></a></Button>
                  </div>
                )}
                
                {paymentMethod === 'om' && (
                  <div className="mt-8 p-6 bg-orange-50 rounded-2xl border border-orange-100 text-center">
                    <p className="text-sm text-orange-700 mb-4">Envoyez <strong>{totalPrice.toLocaleString()} FCFA</strong> au <strong>78 225 45 48</strong>.</p>
                    <Button onClick={handleVerifyPayment} disabled={isVerifying} className="bg-orange-600 w-full">
                      {isVerifying ? <Loader2 className="animate-spin h-4 w-4" /> : "Vérifier mon transfert"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-green-900 text-white">
              <CardHeader><CardTitle>Résumé</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm"><span className="opacity-70">{productName}</span><span>{productPrice.toLocaleString()} FCFA</span></div>
                <div className="flex justify-between text-sm"><span className="opacity-70">Livraison</span><span>{deliveryFee.toLocaleString()} FCFA</span></div>
                <div className="border-t border-white/20 pt-4 flex justify-between font-bold text-2xl"><span>Total</span><span className="text-orange-400">{totalPrice.toLocaleString()} FCFA</span></div>
              </CardContent>
              <CardFooter>
                {(isVerified || paymentMethod === 'cash') ? (
                  <Button onClick={handleOrder} disabled={isSubmitting} className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg font-bold">
                    {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Traitement...</> : "Confirmer l'achat"}
                  </Button>
                ) : (
                  <div className="w-full p-4 bg-white/10 rounded-xl text-center text-xs opacity-60">En attente du paiement...</div>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;