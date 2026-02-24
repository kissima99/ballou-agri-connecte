"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle2, 
  CreditCard, 
  ArrowRight, 
  Loader2, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  Lock, 
  ShoppingBag,
  FileText,
  Home
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useCart } from '@/context/CartContext';
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  
  const [zone, setZone] = useState("dakar");
  const [paymentMethod, setPaymentMethod] = useState("wave");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isAuthorizedByAdmin, setIsAuthorizedByAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    const adminStatus = localStorage.getItem('is_super_admin') === 'true';
    setIsAdmin(adminStatus);
    // For demo purposes, if not admin, we auto-authorize after 2 seconds
    if (!adminStatus) {
      const timer = setTimeout(() => setIsAuthorizedByAdmin(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setIsAuthorizedByAdmin(true);
    }
  }, []);

  if (cart.length === 0 && !isVerified) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container px-4 py-20 mx-auto text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
          <Button asChild className="bg-green-600">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  const deliveryFee = 2000;
  const finalTotal = totalPrice + deliveryFee;
  const waveLink = `https://pay.wave.com/me/ballou-agri-connect?amount=${finalTotal}`;

  const handleVerifyPayment = () => {
    setIsVerifying(true);
    // Simulate network delay
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      showSuccess("Paiement confirmé par le système !");
    }, 2000);
  };

  const generateReceipt = (orderId: string) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("BALLOU AGRI CONNECT", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Reçu de Commande: ${orderId}`, 20, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Client: ${formData.name}`, 20, 60);
    doc.text(`Téléphone: ${formData.phone}`, 20, 70);
    doc.text(`Adresse: ${formData.address} (${zone})`, 20, 80);
    
    doc.line(20, 90, 190, 90);
    doc.text("Produits", 20, 100);
    doc.text("Total", 170, 100);
    
    let y = 110;
    cart.forEach(item => {
      doc.text(`${item.name} x${item.quantity}`, 20, y);
      doc.text(`${(item.price * item.quantity).toLocaleString()} FCFA`, 170, y);
      y += 10;
    });
    
    doc.line(20, y, 190, y);
    doc.text("Frais de livraison", 20, y + 10);
    doc.text(`${deliveryFee.toLocaleString()} FCFA`, 170, y + 10);
    doc.setFontSize(14);
    doc.text("TOTAL PAYÉ", 20, y + 25);
    doc.text(`${finalTotal.toLocaleString()} FCFA`, 170, y + 25);
    
    doc.save(`recu-${orderId}.pdf`);
  };

  const handleFinalizeOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      showError("Veuillez remplir tous les champs de livraison.");
      return;
    }

    setIsProcessing(true);
    const orderId = `BAC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const newOrder = {
      id: orderId,
      customer: formData.name,
      phone: formData.phone,
      address: formData.address,
      zone: zone,
      amount: finalTotal,
      status: "Payé",
      date: new Date().toLocaleDateString(),
      product: cart.map(i => i.name).join(", "),
      isNew: true
    };

    // Save to history
    const history = JSON.parse(localStorage.getItem('purchase_history') || '[]');
    localStorage.setItem('purchase_history', JSON.stringify([newOrder, ...history]));

    // Trigger storage event for admin dashboard
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      generateReceipt(orderId);
      showSuccess("Commande validée avec succès !");
      clearCart();
      setIsProcessing(false);
      navigate('/history');
    }, 1500);
  };

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Card className="border-none shadow-lg bg-white sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">Résumé Final</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Articles ({cart.length})</span>
                  <span className="font-bold">{totalPrice.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Livraison ({zone})</span>
                  <span className="font-bold">{deliveryFee.toLocaleString()} FCFA</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-end">
                  <span className="font-bold text-gray-900">TOTAL À PAYER</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-700">{finalTotal.toLocaleString()} FCFA</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  onClick={handleFinalizeOrder} 
                  disabled={!isVerified || isProcessing}
                  className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg font-bold shadow-lg disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><FileText className="mr-2 h-5 w-5" /> CONFIRMER LA COMMANDE</>}
                </Button>
                <p className="text-[10px] text-center text-gray-400 font-medium uppercase tracking-widest">
                  Un reçu PDF sera généré automatiquement
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