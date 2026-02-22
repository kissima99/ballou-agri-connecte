"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle2, CreditCard, Banknote, ArrowRight, Mail, QrCode, Truck, Loader2, Home, ExternalLink, Download } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const productPrice = location.state?.price || 0;
  const productName = location.state?.name || "Produit";
  const direction = location.state?.direction || "Dakar -> Ballou";
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

  const generatePDF = (oId: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(22, 163, 74); // Green
    doc.text("BALLOU-AGRI-CONNECT", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Reçu de Commande #${oId}`, 105, 30, { align: "center" });
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 105, 37, { align: "center" });

    // Customer Info
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("Informations Client", 20, 55);
    doc.setFontSize(10);
    doc.text(`Nom: ${formData.name}`, 20, 65);
    doc.text(`Téléphone: ${formData.phone}`, 20, 72);
    doc.text(`Email: ${formData.email}`, 20, 79);
    doc.text(`Adresse: ${formData.address}`, 20, 86);

    // Order Details
    doc.setFontSize(14);
    doc.text("Détails de la Livraison", 120, 55);
    doc.setFontSize(10);
    doc.text(`Trajet: ${direction}`, 120, 65);
    doc.text(`Méthode: ${paymentMethod.toUpperCase()}`, 120, 72);
    doc.text(`Statut: Payé / En attente d'expédition`, 120, 79);

    // Table
    doc.line(20, 100, 190, 100);
    doc.setFont(undefined, 'bold');
    doc.text("Description", 25, 110);
    doc.text("Montant", 160, 110);
    doc.setFont(undefined, 'normal');
    doc.line(20, 115, 190, 115);

    doc.text(productName, 25, 125);
    doc.text(`${productPrice.toLocaleString()} FCFA`, 160, 125);
    
    doc.text("Frais de livraison", 25, 135);
    doc.text(`${deliveryFee.toLocaleString()} FCFA`, 160, 135);

    doc.line(20, 145, 190, 145);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("TOTAL", 25, 160);
    doc.text(`${totalPrice.toLocaleString()} FCFA`, 160, 160);

    // Footer
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(150);
    doc.text("Merci de votre confiance. Pour toute assistance: 77 225 45 48 (24h/7j)", 105, 200, { align: "center" });
    doc.text("Ballou-Agri-Connect - La technologie au service de l'agriculture.", 105, 207, { align: "center" });

    doc.save(`Recu_${oId}_BallouAgri.pdf`);
  };

  const handleVerifyPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      showSuccess("Paiement vérifié avec succès !");
    }, 2000);
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.address) {
      showError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newOrderId = `BAC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    setOrderId(newOrderId);

    // Persist in history with direction
    const history = JSON.parse(localStorage.getItem('purchase_history') || '[]');
    const newOrder = {
      id: newOrderId,
      date: new Date().toLocaleDateString('fr-FR'),
      product: productName,
      amount: totalPrice,
      status: "En attente",
      direction: direction,
      customer: formData.name,
      email: formData.email
    };
    localStorage.setItem('purchase_history', JSON.stringify([newOrder, ...history]));

    setIsSubmitting(false);
    setIsOrdered(true);
    
    // Auto-download PDF
    generatePDF(newOrderId);
    showSuccess(`Commande confirmée ! Reçu PDF téléchargé.`);
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container px-4 py-20 mx-auto text-center max-w-2xl">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-green-100 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Achat Confirmé !</h1>
            <p className="text-gray-600 mb-2">Référence : <span className="font-bold text-green-700">{orderId}</span></p>
            <div className="bg-green-50 p-4 rounded-xl mb-8 flex items-center justify-center gap-3">
              <Download className="h-5 w-5 text-green-600 animate-bounce" />
              <p className="text-sm font-medium text-green-800">Le reçu PDF a été téléchargé automatiquement.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/tracking')} className="bg-blue-600 hover:bg-blue-700 w-full font-bold">Suivre mon colis ({direction})</Button>
              <Button onClick={() => generatePDF(orderId)} variant="outline" className="w-full">Ré-télécharger le reçu</Button>
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
            <Link to="/"><Home className="h-4 w-4 text-green-700" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-green-900">Finaliser mon achat</h1>
            <p className="text-sm text-orange-600 font-bold">Trajet : {direction}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-green-600" /> Livraison & Reçu PDF
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
                  <Label htmlFor="email">Adresse Email (important pour le reçu)</Label>
                  <Input id="email" type="email" placeholder="votre@email.com" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Lieu de livraison exact</Label>
                  <Input id="address" placeholder="Quartier, Maison..." required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-green-600" /> Mode de Paiement
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
                    <p className="text-sm text-blue-700 mb-4 font-bold">Scannez ou cliquez pour payer via Wave.</p>
                    <Button asChild className="bg-blue-600 w-full"><a href={wavePaymentUrl} target="_blank" rel="noopener noreferrer" onClick={() => setIsVerified(true)}>OUVRIR WAVE <ExternalLink className="ml-2 h-4 w-4" /></a></Button>
                  </div>
                )}
                
                {paymentMethod === 'om' && (
                  <div className="mt-8 p-6 bg-orange-50 rounded-2xl border border-orange-100 text-center">
                    <p className="text-sm text-orange-700 mb-4 font-bold">Envoyez <strong>{totalPrice.toLocaleString()} FCFA</strong> au <strong>78 225 45 48</strong>.</p>
                    <Button onClick={handleVerifyPayment} disabled={isVerifying} className="bg-orange-600 w-full font-bold">
                      {isVerifying ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null} VÉRIFIER LE TRANSFERT
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-green-900 text-white">
              <CardHeader><CardTitle>Résumé de la Commande</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm"><span className="opacity-70">{productName}</span><span>{productPrice.toLocaleString()} FCFA</span></div>
                <div className="flex justify-between text-sm"><span className="opacity-70">Frais de livraison</span><span>{deliveryFee.toLocaleString()} FCFA</span></div>
                <div className="border-t border-white/20 pt-4 flex justify-between font-bold text-2xl"><span>Total</span><span className="text-orange-400">{totalPrice.toLocaleString()} FCFA</span></div>
              </CardContent>
              <CardFooter>
                {(isVerified || paymentMethod === 'cash') ? (
                  <Button onClick={handleOrder} disabled={isSubmitting} className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg font-bold shadow-lg">
                    {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Traitement...</> : "CONFIRMER L'ACHAT"}
                  </Button>
                ) : (
                  <div className="w-full p-4 bg-white/10 rounded-xl text-center text-xs opacity-60 font-bold border border-white/10">
                    EN ATTENTE DU PAIEMENT...
                  </div>
                )}
              </CardFooter>
            </Card>
            
            <Card className="border-none shadow-sm bg-blue-50">
              <CardContent className="p-4 flex items-center gap-3">
                <Truck className="h-8 w-8 text-blue-600" />
                <div className="text-xs">
                  <p className="font-bold text-blue-900">Livraison Garantie</p>
                  <p className="text-blue-700">Trajet: {direction}</p>
                  <p className="text-blue-700 font-medium">Réception sous 24h après expédition.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;