import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Home, Loader2, ExternalLink, MessageCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange'>('wave');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCommander = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      showError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsProcessing(true);
    try {
      const orderId = `BAC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const pendingOrder = {
        id: orderId,
        customer_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        amount: totalPrice + 2000,
        status: "Attente de validation admin",
        items: cart.map(i => ({ 
          id: i.id, 
          name: i.name, 
          quantity: i.quantity, 
          price: i.price, 
          unit: i.unit 
        })),
        user_id: user?.id || null,
        zone: "Dakar",
        is_new: true
      };

      const { error } = await supabase
        .from('orders')
        .insert([pendingOrder]);

      if (error) throw error;

      // Open payment link based on selected method
      if (paymentMethod === 'wave') {
        // Corrected Wave payment link
        const wavePaymentUrl = `https://pay.wave.com/m/M_sn_4AZ6lkLNVqnh/c/sn/?amount=${(totalPrice + 2000).toLocaleString().replace(/ /g, '')}&description=Commande%20Ballou%20Agri%20Connect%20${orderId}`;
        window.open(wavePaymentUrl, '_blank');
      } else {
        // Orange Money - open WhatsApp with pre-filled message
        const phoneNumber = "782254548";
        const message = encodeURIComponent(`Bonjour, je souhaite payer ma commande ${orderId} d'un montant de ${(totalPrice + 2000).toLocaleString()} FCFA via Orange Money.`);
        const orangeMoneyUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(orangeMoneyUrl, '_blank');
      }

      showSuccess("Commande créée ! Redirection vers le reçu...");
      clearCart();
      
      // Redirect to receipt page after a short delay
      setTimeout(() => {
        navigate(`/receipt/${orderId}`);
      }, 1000);
    } catch (error: any) {
      showError("Erreur lors de la création de la commande: " + error.message);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container px-4 py-20 mx-auto text-center max-w-2xl">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-stone-100">
            <ShoppingCart className="w-20 h-20 text-stone-200 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
            <p className="text-gray-500 mb-8">Commencez vos achats pour voir vos produits ici.</p>
            <Button asChild className="bg-green-600 hover:bg-green-700 font-bold">
              <Link to="/local-products">Voir les produits</Link>
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
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="icon" className="rounded-full">
            <Link to="/"><Home className="h-4 w-4 text-green-700" /></Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Commander</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Informations de livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="Votre nom" 
                    className="rounded-xl" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    placeholder="78 123 45 67" 
                    className="rounded-xl" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse de livraison *</Label>
                  <Input 
                    id="address" 
                    name="address"
                    placeholder="Votre adresse complète" 
                    className="rounded-xl" 
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Votre commande</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.direction}`} className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-700">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                        <p className="text-xs text-gray-400">{item.quantity} x {item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-xl">Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-bold">{totalPrice.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Livraison</span>
                  <span className="font-bold">2 000 FCFA</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-end">
                  <span className="font-bold text-gray-900">TOTAL</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-700">{(totalPrice + 2000).toLocaleString()} FCFA</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <div className="space-y-3 w-full">
                  <Label className="text-sm font-bold">Moyen de paiement</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={paymentMethod === 'wave' ? 'default' : 'outline'}
                      className={`h-12 ${paymentMethod === 'wave' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-200 text-blue-700'}`}
                      onClick={() => setPaymentMethod('wave')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" /> Wave
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === 'orange' ? 'default' : 'outline'}
                      className={`h-12 ${paymentMethod === 'orange' ? 'bg-orange-600 hover:bg-orange-700' : 'border-orange-200 text-orange-700'}`}
                      onClick={() => setPaymentMethod('orange')}
                    >
                      Orange Money
                    </Button>
                  </div>
                  {paymentMethod === 'orange' && (
                    <div className="bg-orange-50 p-3 rounded-lg text-sm text-orange-700">
                      Contactez-nous au <strong>782254548</strong> pour finaliser votre paiement Orange Money.
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleCommander} 
                  disabled={isProcessing}
                  className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg font-bold shadow-lg"
                >
                  {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MessageCircle className="mr-2 h-5 w-5" />}
                  Commander & Payer
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