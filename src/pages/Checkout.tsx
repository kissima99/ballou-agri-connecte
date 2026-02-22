"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle2, CreditCard, Wallet, Banknote, ArrowRight, Mail } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("wave");
  const [isOrdered, setIsOrdered] = useState(false);
  const [email, setEmail] = useState("");

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdered(true);
    showSuccess("Commande confirmée ! Votre reçu a été envoyé par mail.");
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Merci pour votre commande !</h1>
            <p className="text-gray-600 mb-8">
              Votre commande est en cours de traitement. Un reçu PDF a été envoyé à <strong>{email}</strong>.
            </p>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-8 text-left">
              <p className="text-sm font-bold text-blue-900 mb-2">Prochaine étape :</p>
              <p className="text-sm text-blue-800">
                Si vous avez choisi Wave ou Orange Money, assurez-vous d'avoir effectué le transfert au <strong>78 225 45 48</strong>.
              </p>
            </div>
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
      <div className="container px-4 py-12 mx-auto max-w-4xl">
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
                  <Label htmlFor="email">Adresse Email (pour le reçu PDF)</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="votre@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse à Ballou</Label>
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
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <RadioGroupItem value="wave" id="wave" className="peer sr-only" />
                    <Label
                      htmlFor="wave"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold mb-2">W</div>
                      <span className="font-bold">Wave</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="om" id="om" className="peer sr-only" />
                    <Label
                      htmlFor="om"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold mb-2">OM</div>
                      <span className="font-bold">Orange Money</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                    <Label
                      htmlFor="cash"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500 cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold mb-2">
                        <Banknote className="h-6 w-6" />
                      </div>
                      <span className="font-bold">Cash</span>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="mt-6 p-4 bg-stone-100 rounded-xl border border-stone-200">
                  <p className="text-sm text-gray-700">
                    {paymentMethod === 'cash' 
                      ? "Le paiement se fera à la livraison en espèces." 
                      : `Veuillez effectuer le transfert au numéro suivant : `}
                    {paymentMethod !== 'cash' && <strong className="text-green-700">78 225 45 48</strong>}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-green-900 text-white">
              <CardHeader>
                <CardTitle>Résumé du panier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm opacity-80">
                  <span>Sous-total</span>
                  <span>15,000 FCFA</span>
                </div>
                <div className="flex justify-between text-sm opacity-80">
                  <span>Livraison</span>
                  <span>2,000 FCFA</span>
                </div>
                <div className="border-t border-white/20 pt-4 flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>17,000 FCFA</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleOrder} className="w-full bg-orange-500 hover:bg-orange-600 text-white border-none h-12 text-lg font-bold">
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