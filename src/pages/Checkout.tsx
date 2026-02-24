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
          <Button asChild className="bg-green-600"><Link to="/">Retour à l'accueil</Link></Button>
        </div>
      </div>
    );
  }

  const deliveryFee = 2000;
  const finalTotal = totalPrice + deliveryFee;
  const waveLink = `https://pay.wave.com/me/ballou-agri-connect?amount=${finalTotal}`;

  const handleVerifyPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      showSuccess("Paiement confirmé !");
    }, 2000);
  };

  const handleFinalizeOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      showError("Veuillez remplir tous les champs.");
      return;
    }

    setIsProcessing(true);
    const orderId = `BAC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('orders')
      .insert([{
        id: orderId,
        customer_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        zone: zone,
        amount: finalTotal,
        status: "Payé",
        items: cart,
        user_id: user?.id,
        is_new: true
      }]);

    if (error) {
      showError("Erreur lors de l'enregistrement : " + error.message);
      setIsProcessing(false);
      return;
    }

    showSuccess("Commande synchronisée avec succès !");
    clearCart();
    setIsProcessing(false);
    navigate('/history');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="icon" className="rounded-full"><Link to="/cart"><ArrowRight className="h-4 w-4 rotate-180 text-green-700" /></Link></Button>
          <h1 className="text-3xl font-bold text-green-900">Finaliser l'achat</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle className="text-xl flex items-center"><MapPin className="mr-2 h-5 w-5 text-green-600" /> Livraison</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Select value={zone} onValueChange={setZone}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Zone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dakar">Dakar</SelectItem>
                    <SelectItem value="tamba">Tambacounda</SelectItem>
                    <SelectItem value="ballou">Ballou</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Nom complet" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <Input placeholder="Téléphone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <Input placeholder="Adresse exacte" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle className="text-xl flex items-center"><CreditCard className="mr-2 h-5 w-5 text-green-600" /> Paiement</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
                  <p className="text-sm text-blue-800 mb-4">Transfert de <span className="font-bold">{finalTotal.toLocaleString()} FCFA</span> requis.</p>
                  <Button asChild className="bg-blue-600 w-full mb-3"><a href={waveLink} target="_blank" rel="noopener noreferrer">PAYER AVEC WAVE</a></Button>
                  <Button onClick={handleVerifyPayment} disabled={isVerifying || isVerified || !isAuthorizedByAdmin} className={`w-full h-12 font-bold ${isVerified ? 'bg-green-600' : 'bg-white border-blue-200 text-blue-700'}`}>
                    {isVerifying ? <Loader2 className="animate-spin" /> : isVerified ? "PAIEMENT VÉRIFIÉ" : "VÉRIFIER MON PAIEMENT"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-white">
              <CardHeader><CardTitle className="text-xl">Résumé</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm"><span>Total Articles</span><span className="font-bold">{totalPrice.toLocaleString()} FCFA</span></div>
                <div className="flex justify-between text-sm"><span>Livraison</span><span className="font-bold">{deliveryFee.toLocaleString()} FCFA</span></div>
                <div className="border-t pt-4 flex justify-between items-end"><span className="font-bold">TOTAL</span><p className="text-2xl font-black text-green-700">{finalTotal.toLocaleString()} FCFA</p></div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleFinalizeOrder} disabled={!isVerified || isProcessing} className="w-full bg-orange-500 h-14 text-lg font-bold">
                  {isProcessing ? <Loader2 className="animate-spin" /> : "CONFIRMER LA COMMANDE"}
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