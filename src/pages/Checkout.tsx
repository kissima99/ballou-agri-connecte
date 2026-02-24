"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, CreditCard, Banknote, ArrowRight, Mail, QrCode, Loader2, Download, MapPin } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useCart } from '@/context/CartContext';

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
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  // Calcul dynamique des frais
  const zoneFees: Record<string, number> = {
    "dakar": 2000,
    "tamba": 3500,
    "bakel": 1500,
    "ballou": 500
  };

  const deliveryFee = zoneFees[zone] + (totalItems * 200); // 200 FCFA par article supplémentaire
  const finalTotal = totalPrice + deliveryFee;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.address) {
      showError("Veuillez remplir tous les champs.");
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newOrderId = `BAC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    setOrderId(newOrderId);

    const history = JSON.parse(localStorage.getItem('purchase_history') || '[]');
    const newOrder = {
      id: newOrderId,
      date: new Date().toLocaleDateString('fr-FR'),
      product: cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
      amount: finalTotal,
      status: "Payé",
      customer: formData.name,
      email: formData.email,
      phone: formData.phone,
      zone: zone,
      address: formData.address,
      isNew: true // Pour la notification admin
    };
    localStorage.setItem('purchase_history', JSON.stringify([newOrder, ...history]));

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
            <p className="text-gray-600 mb-8">Référence : <span className="font-bold text-green-700">{orderId}</span></p>
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
                    <Label htmlFor="phone">Téléphone</Label>
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
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-green-900 text-white">
              <CardHeader><CardTitle>Résumé du Paiement</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm"><span className="opacity-70">Articles ({totalItems})</span><span>{totalPrice.toLocaleString()} FCFA</span></div>
                <div className="flex justify-between text-sm"><span className="opacity-70">Livraison ({zone})</span><span>{deliveryFee.toLocaleString()} FCFA</span></div>
                <div className="border-t border-white/20 pt-4 flex justify-between font-bold text-2xl"><span>TOTAL</span><span className="text-orange-400">{finalTotal.toLocaleString()} FCFA</span></div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleOrder} disabled={isSubmitting} className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg font-bold">
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