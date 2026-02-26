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
  Loader2,
  Check,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { generateReceipt } from '@/utils/receipt';
import { sendEmail } from '@/utils/email';

// Define the correct type for receipt data
interface ReceiptData {
  id: string;
  date: string;
  status: string;
  customer_name: string;
  phone: string;
  address: string;
  email: string;
  amount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "" // Added email field
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
    if (!formData.name || !formData.phone || !formData.address || !formData.email) {
      showError("Veuillez remplir toutes vos informations de livraison, y compris l'e-mail.");
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
        email: formData.email, // Store email with the order
        amount: totalPrice + 2000,
        status: "Attente de validation admin",
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

  const handleConfirmOrder = async () => {
    if (!confirmedOrderData) return;
    
    setIsProcessing(true);
    
    try {
      // Create proper ReceiptData object matching the interface
      const receiptData: ReceiptData = {
        id: confirmedOrderData.id,
        date: new Date().toISOString(),
        status: confirmedOrderData.status,
        customer_name: confirmedOrderData.customer_name,
        phone: confirmedOrderData.phone,
        address: confirmedOrderData.address,
        email: confirmedOrderData.email, // Include email in receipt data
        amount: confirmedOrderData.amount,
        items: confirmedOrderData.items.map((i: any) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      };
      
      // Generate PDF and send email with it
      const pdfPath = await generateReceipt(receiptData);
      await sendEmail(
        receiptData.email,
        "Votre reçu de commande",
        "Veuillez trouver ci-joint votre reçu de commande.",
        pdfPath
      );
      
      showSuccess("Commande confirmée ! Votre reçu a été envoyé à votre e-mail.");
      clearCart();
      navigate('/history');
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
                {/* Added email field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold">E-mail</Label>
                  <input 
                    id="email"
                    type="email" 
                    disabled={paymentSent}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 disabled:bg-stone-50"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-stone-100/50 py-6">
                <CardTitle className="text-xl font-bold">2. Paiement</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* ... existing payment method radio buttons ... */}
                
                {/* Updated confirmation button */}
                {isAdminConfirmed && (
                  <Button 
                    onClick={handleConfirmOrder}
                    disabled={isProcessing}
                    className="w-full bg-orange-500 hover:bg-orange-600 h-12 rounded-xl font-bold shadow-lg"
                  >
                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "CONFIRMER LA COMMANDE"}
                  </Button>
                )}

                {/* ... existing payment instructions ... */}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden sticky top-24">
              <CardHeader className="bg-green-700 text-white py-6">
                <CardTitle className="text-xl">Résumé</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* ... existing summary content ... */}
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