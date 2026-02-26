import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle2, 
  Home,
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';

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
  const [confirmedOrderData, setConfirmedOrderData] = useState<any>(null);

  // Polling pour vérifier la validation admin
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentSent && !isAdminConfirmed && tempOrderId) {
      interval = setInterval(async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', tempOrderId)
          .single();
        
        if (!error && data && (data.status === 'Payé' || data.status === 'En cours' || data.status === 'Livré')) {
          setIsAdminConfirmed(true);
          setConfirmedOrderData(data);
          showSuccess("Paiement confirmé par l'administrateur !");
          clearInterval(interval);
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [paymentSent, isAdminConfirmed, tempOrderId]);

  const handleInitiatePayment = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      showError("Veuillez remplir vos informations de livraison.");
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
        zone: "Dakar",
        is_new: true
      };
      
      const { error } = await supabase
        .from('orders')
        .insert([pendingOrder]);

      if (error) throw error;
      
      setPaymentSent(true);
      showSuccess("Commande initialisée. En attente du transfert.");
    } catch (err: any) {
      showError("Erreur: " + err.message);
    } finally {
      setIsInitiating(false);
    }
  };

  const handleFinalConfirm = async () => {
    if (!confirmedOrderData) return;
    
    setIsProcessing(true);
    
    try {
      // Sauvegarder dans l'historique local
      const historyItem = {
        id: confirmedOrderData.id,
        customer_name: confirmedOrderData.customer_name,
        phone: confirmedOrderData.phone,
        address: confirmedOrderData.address,
        amount: confirmedOrderData.amount,
        status: confirmedOrderData.status,
        items: confirmedOrderData.items,
        date: new Date().toLocaleDateString('fr-FR'),
        product: confirmedOrderData.items.map((i: any) => `${i.name} (${i.quantity} ${i.unit})`).join(", ")
      };
      
      const existingHistory = JSON.parse(localStorage.getItem('purchase_history') || '[]');
      existingHistory.unshift(historyItem);
      localStorage.setItem('purchase_history', JSON.stringify(existingHistory));
      
      console.log('Commande sauvegardée dans l\'historique:', historyItem);
      console.log('Historique complet:', existingHistory);
      
      // Vider le panier
      clearCart();
      
      showSuccess("Commande confirmée ! Redirection vers l'historique...");
      setTimeout(() => {
        navigate('/history');
      }, 1500);
    } catch (err: any) {
      console.error("Erreur lors de la confirmation:", err);
      showError("Erreur lors de la confirmation.");
      setIsProcessing(false);
    }
  };

  const deliveryFee = 2000;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-5xl">
        <div className="flex items-center gap-4 mb-10">
          <Button asChild variant="outline" size="icon" className="rounded-full border-green-200">
            <Link to="/"><Home className="h-4 w-4 text-green-700" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-green-900">Finaliser l'achat</h1>
            <p className="text-gray-500 font-medium">Paiement sécurisé et confirmation automatique</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-stone-100/50 py-6">
                <CardTitle className="text-xl font-bold">1. Livraison</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-bold">Nom complet</Label>
                    <input 
                      id="name"
                      disabled={paymentSent}
                      className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 disabled:bg-stone-50"
                      placeholder="Votre nom"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-bold">Téléphone</Label>
                    <input 
                      id="phone"
                      type="tel" 
                      disabled={paymentSent}
                      className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 disabled:bg-stone-50"
                      placeholder="78 123 45 67"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="font-bold">Adresse</Label>
                  <textarea 
                    id="address"
                    disabled={paymentSent}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 disabled:bg-stone-50"
                    placeholder="Quartier, Rue..."
                    rows={2}
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
                {!paymentSent ? (
                  <div className="space-y-6">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4">
                      <div className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer ${paymentMethod === 'wave' ? 'border-blue-500 bg-blue-50' : 'border-stone-100'}`}>
                        <RadioGroupItem value="wave" id="wave" className="sr-only" />
                        <Label htmlFor="wave" className="flex items-center gap-3 cursor-pointer w-full">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">W</div>
                          <span className="font-bold text-sm">Wave</span>
                        </Label>
                      </div>
                      <div className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer ${paymentMethod === 'om' ? 'border-orange-500 bg-orange-50' : 'border-stone-100'}`}>
                        <RadioGroupItem value="om" id="om" className="sr-only" />
                        <Label htmlFor="om" className="flex items-center gap-3 cursor-pointer w-full">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">OM</div>
                          <span className="font-bold text-sm">Orange Money</span>
                        </Label>
                      </div>
                    </RadioGroup>
                    <Button onClick={handleInitiatePayment} disabled={isInitiating} className="w-full bg-green-600 hover:bg-green-700 h-12 rounded-xl font-bold">
                      {isInitiating ? <Loader2 className="h-5 w-5 animate-spin" /> : "VALIDER MES INFOS"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                    <div className="p-6 bg-stone-900 text-white rounded-2xl">
                      <h4 className="text-center font-bold mb-4 text-orange-400 uppercase tracking-widest text-xs">Instructions</h4>
                      {paymentMethod === 'wave' ? (
                        <Button asChild className="bg-blue-500 hover:bg-blue-600 w-full h-14 text-lg font-black rounded-xl">
                          <a href="https://pay.wave.com/m/M_sn_4AZ6lkLNVqnh/c/sn/" target="_blank" rel="noopener noreferrer">
                            PAYER VIA WAVE <ExternalLink className="ml-2 h-5 w-5" />
                          </a>
                        </Button>
                      ) : (
                        <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
                          <p className="text-sm text-gray-300 mb-2">Transférez le montant au :</p>
                          <p className="text-3xl font-black text-orange-500">78 225 45 48</p>
                        </div>
                      )}
                    </div>

                    <div className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${isAdminConfirmed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                      {isAdminConfirmed ? <CheckCircle2 className="h-8 w-8" /> : <RefreshCw className="h-8 w-8 animate-spin" />}
                      <div>
                        <p className="font-black text-sm">
                          {isAdminConfirmed ? "PAIEMENT REÇU !" : "ATTENTE DE VALIDATION ADMIN..."}
                        </p>
                        <p className="text-xs opacity-80">
                          {isAdminConfirmed ? "Votre commande est enregistrée." : "L'admin valide votre transfert en temps réel."}
                        </p>
                      </div>
                    </div>

                    {isAdminConfirmed && (
                      <Button 
                        onClick={handleFinalConfirm}
                        disabled={isProcessing}
                        className="w-full bg-orange-500 hover:bg-orange-600 h-12 rounded-xl font-bold shadow-lg"
                      >
                        {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "CONFIRMER LA COMMANDE"}
                      </Button>
                    )}
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
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Articles</span>
                    <span className="font-bold">{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Livraison</span>
                    <span className="font-bold">{deliveryFee.toLocaleString()} FCFA</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">TOTAL</span>
                    <span className="font-black text-2xl text-green-700">{finalTotal.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  <p>Paiement sécurisé via Wave ou Orange Money</p>
                  <p className="mt-1">Commande confirmée après validation admin</p>
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