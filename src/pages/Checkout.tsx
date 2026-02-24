"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, CreditCard, ArrowRight, Loader2, MapPin, ExternalLink, ShieldCheck, Lock, ShoppingBag } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useCart } from '@/context/CartContext';
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart, totalItems } = useCart();
  
  const [zone, setZone] = useState("dakar");
  const [paymentMethod, setPaymentMethod] = useState("wave");
  const [isOrdered, setIsOrdered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthorizedByAdmin, setIsAuthorizedByAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  useEffect(() => {
    const adminStatus = localStorage.getItem('is_super_admin') === 'true';
    setIsAdmin(adminStatus);

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showError("Veuillez vous connecter pour passer une commande.");
        navigate('/login');
      } else {
        setFormData(prev => ({ ...prev, email: session.user.email || "" }));
      }
    };
    checkAuth();
  }, [navigate]);

  const waveLink = "https://pay.wave.com/m/M_sn_4AZ6lkLNVqnh/c/sn/";

  const zoneFees: Record<string, number> = {
    "dakar": 2000,
    "tamba": 3500,
    "bakel": 1500,
    "ballou": 500
  };

  const deliveryFee = zoneFees[zone] + (totalItems * 200);
  const finalTotal = totalPrice + deliveryFee;

  const formatPricePDF = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
  };

  const generatePDF = (id: string, data: any) => {
    const doc = new jsPDF();
    doc.setFillColor(22, 101, 52);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("BALLOU AGRI CONNECT", 105, 25, { align: "center" });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`RECU DE COMMANDE : ${id}`, 20, 50);
    doc.text(`Date : ${new Date().toLocaleDateString()}`, 20, 60);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENT :", 20, 75);
    doc.setFont("helvetica", "normal");
    doc.text(`${data.name}`, 20, 82);
    doc.text(`${data.phone}`, 20, 89);
    doc.text(`${data.address} (${zone.toUpperCase()})`, 20, 96);
    doc.line(20, 105, 190, 105);
    doc.text("Produit", 20, 112);
    doc.text("Qté", 120, 112);
    doc.text("Prix", 150, 112);
    doc.line(20, 115, 190, 115);
    let y = 122;
    cart.forEach(item => {
      doc.text(item.name, 20, y);
      doc.text(item.quantity.toString(), 120, y);
      doc.text(formatPricePDF(item.price * item.quantity), 150, y);
      y += 10;
    });
    doc.line(20, y, 190, y);
    y += 10;
    doc.text("Sous-total :", 120, y);
    doc.text(formatPricePDF(totalPrice), 150, y);
    y += 10;
    doc.text("Livraison :", 120, y);
    doc.text(formatPricePDF(deliveryFee), 150, y);
    y += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL :", 120, y);
    doc.text(formatPricePDF(finalTotal), 150, y);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Merci de votre confiance en l'agriculture locale de Ballou.", 105, 280, { align: "center" });
    doc.save(`Recu_BAC-${id}.pdf`);
  };

  const handleVerifyPayment = async () => {
    if (!formData.phone) {
      showError("Veuillez entrer votre numéro de téléphone d'abord.");
      return;
    }
    if (!isAuthorizedByAdmin) {
      showError("En attente de l'autorisation de l'administrateur.");
      return;
    }
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsVerifying(false);
    setIsVerified(true);
    showSuccess("Paiement reçu et vérifié !");
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      showError("Veuillez d'abord vérifier votre paiement.");
      return;
    }
    setIsSubmitting(true);
    const newOrderId = Math.random().toString(36).substr(2, 5).toUpperCase();
    setOrderId(`BAC-${newOrderId}`);
    const history = JSON.parse(localStorage.getItem('purchase_history') || '[]');
    const newOrder = {
      id: `BAC-${newOrderId}`,
      date: new Date().toLocaleDateString('fr-FR'),
      product: cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
      amount: finalTotal,
      status: "Payé",
      customer: formData.name,
      email: formData.email,
      phone: formData.phone,
      zone: zone,
      address: formData.address,
      isNew: true
    };
    localStorage.setItem('purchase_history', JSON.stringify([newOrder, ...history]));
    generatePDF(newOrderId, formData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsOrdered(true);
    clearCart();
    showSuccess(`Commande confirmée !`);
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container px-4 py-20 mx-auto text-center max-w-2xl">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-green-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Achat Confirmé !</h1>
            <p className="text-gray-600 mb-8">Votre reçu PDF a été téléchargé. Référence : <span className="font-bold text-green-700">{orderId}</span></p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/tracking')} className="bg-blue-600 hover:bg-blue-700 w-full font-bold">Suivre mon colis</Button>
              <Button onClick={() => navigate('/')} variant="ghost" className="w-full">Retour à l'accueil</Button>
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
            <Link to="/cart"><ArrowRight className="h-4 w-4 rotate-180 text-green-700" /></Link>
          </Button>
          <h1 className="text-3xl font-bold text-green-900">Finaliser l'achat</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Liste des produits visuelle */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-stone-100/50">
                <CardTitle className="text-lg flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5 text-green-600" /> Récapitulatif des articles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-stone-100">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.direction}`} className="flex items-center gap-4 p-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{item.direction}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-green-700 text-sm">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                        <p className="text-[10px] text-gray-400 font-medium">Qté: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-green-600" /> Zone & Livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Zone de livraison</Label>
                  <Select value={zone} onValueChange={setZone}>
                    <SelectTrigger className="h-12 rounded-xl border-stone-200">
                      <SelectValue placeholder="Choisir votre zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dakar">Dakar (Capitale)</SelectItem>
                      <SelectItem value="tamba">Tambacounda (Région)</SelectItem>
                      <SelectItem value="bakel">Bakel (Ville)</SelectItem>
                      <SelectItem value="ballou">Ballou (Local)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input id="name" placeholder="Votre nom" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone (Wave/OM)</Label>
                    <Input id="phone" placeholder="78 225 45 48" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse exacte</Label>
                  <Input id="address" placeholder="Quartier, Rue, Maison..." required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-green-600" /> Paiement Sécurisé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </RadioGroup>

                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
                  <p className="text-sm text-blue-800 mb-4 font-medium">
                    Veuillez effectuer le transfert de <span className="font-bold">{finalTotal.toLocaleString()} FCFA</span>.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 h-12 font-bold">
                      <a href={waveLink} target="_blank" rel="noopener noreferrer">
                        PAYER AVEC WAVE <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>

                    {isAdmin && (
                      <div className="mt-4 p-4 bg-orange-100 rounded-xl border border-orange-200">
                        <p className="text-[10px] font-black text-orange-800 uppercase mb-2 flex items-center justify-center">
                          <ShieldCheck className="w-3 h-3 mr-1" /> Contrôle Super Admin
                        </p>
                        <Button 
                          type="button"
                          onClick={() => {
                            setIsAuthorizedByAdmin(!isAuthorizedByAdmin);
                            showSuccess(isAuthorizedByAdmin ? "Autorisation retirée" : "Autorisation accordée au client");
                          }}
                          className={`w-full h-10 text-xs font-bold ${isAuthorizedByAdmin ? 'bg-green-600' : 'bg-orange-600'}`}
                        >
                          {isAuthorizedByAdmin ? "ANNULER L'AUTORISATION" : "AUTORISER LA VÉRIFICATION"}
                        </Button>
                      </div>
                    )}

                    <div className="relative">
                      {!isAuthorizedByAdmin && !isVerified && (
                        <div className="absolute inset-0 bg-stone-100/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                          <p className="text-[10px] font-black text-gray-400 uppercase flex items-center">
                            <Lock className="w-3 h-3 mr-1" /> En attente d'autorisation admin
                          </p>
                        </div>
                      )}
                      <Button 
                        type="button"
                        onClick={handleVerifyPayment} 
                        disabled={isVerifying || isVerified || !isAuthorizedByAdmin}
                        className={`w-full h-12 font-bold ${isVerified ? 'bg-green-600' : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'}`}
                      >
                        {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : isVerified ? <><CheckCircle2 className="mr-2 h-5 w-5" /> PAIEMENT VÉRIFIÉ</> : "VÉRIFIER MON PAIEMENT"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-green-900 text-white">
              <CardHeader>
                <CardTitle>Résumé du Paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Articles ({totalItems})</span>
                  <span>{totalPrice.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Livraison ({zone})</span>
                  <span>{deliveryFee.toLocaleString()} FCFA</span>
                </div>
                <div className="border-t border-white/20 pt-4 flex justify-between font-bold text-2xl">
                  <span>TOTAL</span>
                  <span className="text-orange-400">{finalTotal.toLocaleString()} FCFA</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleOrder} 
                  disabled={!isVerified || isSubmitting} 
                  className={`w-full h-14 text-lg font-bold shadow-lg ${!isVerified ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "CONFIRMER L'ACHAT"}
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