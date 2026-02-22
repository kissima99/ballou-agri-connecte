"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, CreditCard, Banknote, ArrowRight, Mail, QrCode, Truck, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, useLocation } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const productPrice = location.state?.price || 0;
  const productName = location.state?.name || "Produit";
  const deliveryFee = 2000;
  const totalPrice = productPrice + deliveryFee;

  const [paymentMethod, setPaymentMethod] = useState("wave");
  const [isOrdered, setIsOrdered] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerifyPayment = () => {
    if (!hasPaid) {
      showError("Veuillez d'abord cocher la case de confirmation de transfert.");
      return;
    }
    setIsVerifying(true);
    // Simulation d'une vérification réseau
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      showSuccess("Paiement détecté ! Vous pouvez maintenant confirmer votre achat.");
    }, 2000);
  };

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified && paymentMethod !== 'cash') {
      showError("Veuillez vérifier votre paiement avant de confirmer.");
      return;
    }
    setIsOrdered(true);
    showSuccess("Commande confirmée ! Votre reçu a été envoyé par mail.");
  };

  const waveNumber = "782254548";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=tel:${waveNumber}`;

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container px-4 py-20 mx-auto text-center max-w-2xl">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-green-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Merci pour votre commande !</h1>
            <p className="text-gray-600 mb-8">
              Votre commande de <strong>{totalPrice.toLocaleString()} FCFA</strong> est en cours de traitement.
            </p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 w-full">
              Retour à l'accueil
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
        <h1 className="text-3xl font-bold text-green-900 mb-8">Finaliser mon achat</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-green-600" /> Informations de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input id="name" placeholder="Votre nom" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" placeholder="77 000 00 00" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse exacte à Ballou</Label>
                  <Input id="address" placeholder="Quartier, Maison..." required />
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

                {paymentMethod !== 'cash' && (
                  <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                      <div className="bg-white p-3 rounded-xl shadow-sm">
                        <img src={qrCodeUrl} alt="QR Code Wave" className="w-32 h-32" />
                      </div>
                      <div className="text-center md:text-left">
                        <h4 className="font-bold text-blue-900 flex items-center justify-center md:justify-start">
                          <QrCode className="mr-2 h-5 w-5" /> Scannez pour payer
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Envoyez <strong>{totalPrice.toLocaleString()} FCFA</strong> au <strong>{waveNumber}</strong>.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 border-t border-blue-200 pt-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="paid" checked={hasPaid} onCheckedChange={(checked) => setHasPaid(checked as boolean)} />
                        <label htmlFor="paid" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          J'ai effectué le transfert de {totalPrice.toLocaleString()} FCFA
                        </label>
                      </div>
                      
                      {!isVerified ? (
                        <Button 
                          onClick={handleVerifyPayment} 
                          disabled={!hasPaid || isVerifying}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {isVerifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Vérification...</> : "Vérifier mon paiement"}
                        </Button>
                      ) : (
                        <div className="bg-green-100 text-green-800 p-3 rounded-lg flex items-center justify-center font-bold">
                          <CheckCircle2 className="mr-2 h-5 w-5" /> Paiement vérifié
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-green-900 text-white sticky top-24">
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">{productName}</span>
                  <span>{productPrice.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70 flex items-center"><Truck className="mr-1 h-3 w-3" /> Livraison</span>
                  <span>{deliveryFee.toLocaleString()} FCFA</span>
                </div>
                <div className="border-t border-white/20 pt-4 flex justify-between font-bold text-2xl">
                  <span>Total</span>
                  <span className="text-orange-400">{totalPrice.toLocaleString()} FCFA</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleOrder} 
                  disabled={paymentMethod !== 'cash' && !isVerified}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white border-none h-14 text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmer l'achat <ArrowRight className="ml-2 h-5 w-5" />
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