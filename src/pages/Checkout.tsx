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
import { useCart } from '@/context/CartContext';
import { supabase } from "@/integrations/supabase/client";
import jsPDF from 'jspdf';
import { Save } from 'lucide-react';

interface LocalProduct {
  id: number;
  name: string;
  price: number;
  unit: string;
  origin: string;
  image: string;
  quantity: number;
  isKg?: boolean;
  basePriceSac?: number;
  pricePerKg?: number;
}

const initialProducts: LocalProduct[] = [
  { id: 1, name: "Riz de la vallée", price: 17500, unit: "sac", origin: "Ballou", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 2, name: "Oignon Local", price: 12000, unit: "sac", origin: "Ballou", image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 3, name: "Maïs", price: 500, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 4, name: "Piment rouge", price: 2000, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 5, name: "Piment vert", price: 1800, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 16, name: "Poivron vert", price: 1500, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1563565312-8335ff593d93?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 17, name: "Poivron Rouge", price: 2000, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1589483232748-515c025575bc?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 18, name: "Sucre Local", price: 25000, unit: "sac", origin: "Ballou", image: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 6, name: "Choux", price: 500, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 7, name: "Aubergine africaine", price: 1200, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 8, name: "Gombo", price: 1000, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 9, name: "Tomate", price: 1500, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 10, name: "Concombre", price: 400, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1449339854873-750e6df51301?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 11, name: "Salade", price: 300, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 12, name: "Patate douce", price: 10000, unit: "sac", origin: "Ballou", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 13, name: "Sorgho", price: 15000, unit: "sac", origin: "Ballou", image: "https://images.unsplash.com/photo-1623064037721-304163048228?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 14, name: "Citron", price: 100, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1585059895524-72359e06133a?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 15, name: "Arachide", price: 8000, unit: "sac", origin: "Ballou", image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 19, name: "Bissap Rouge", price: 1500, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 20, name: "Bissap Blanc", price: 1500, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1550583724-125581f77833?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 21, name: "Pain de singe", price: 2000, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80", quantity: 1 },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart, addToCart } = useCart();
  
  const [zone, setZone] = useState("dakar");
  const [paymentMethod, setPaymentMethod] = useState("wave");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isAuthorizedByAdmin, setIsAuthorizedByAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState<LocalProduct[]>(initialProducts);

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
      doc.text(`{(item.price * item.quantity).toLocaleString()} FCFA`, 170, y);
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

  const handleSync = async () => {
    setIsSaving(true);
    try {
      // Sauvegarde locale
      localStorage.setItem('local_products', JSON.stringify(products));

      // Synchronisation Supabase
      const productsToSync = products.map(p => ({
        id: String(p.id),
        name: p.name,
        price: p.price,
        image: p.image,
        unit: p.unit,
        origin: p.origin,
        category: 'local'
      }));

      const { error } = await supabase
        .from('products')
        .upsert(productsToSync, { onConflict: 'id' });

      if (error) throw error;

      setIsEditMode(false);
      showSuccess("Catalogue synchronisé avec Supabase !");
    } catch (err: any) {
      showError("Erreur de synchronisation : " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToCart = (product: LocalProduct) => {
    addToCart({
      id: `local-${product.id}-${product.unit}`,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      image: product.image,
      direction: 'Ballou -> Dakar',
      unit: product.unit
    });
    showSuccess(`${product.name} (${product.unit}) ajouté au panier !`);
  };

  const handleBuyNow = (product: LocalProduct) => {
    handleAddToCart(product);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-5xl">
        <div className="flex items-center gap-4 mb-10 gap-4">
          <Button asChild variant="outline" size="icon" className="rounded-full border-green-200">
            <Link to="/"><Home className="h-4 w-4 text-green-700" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-green-900 mb-4">Finaliser l'achat</h1>
            <p className="text-gray-500 font-medium">Votre panier est actuellement vide</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-stone-100/50 py-6">
                <CardTitle className="text-xl font-bold">Votre Panier</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">{item.direction}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-green-700 text-sm">{item.price.toLocaleString()} FCFA</p>
                        <p className="text-[10px] text-gray-400 font-medium">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-stone-100/50 py-6">
                <CardTitle className="text-xl font-bold">Informations de Livraison</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Adresse de Livraison</h4>
                      <p className="text-gray-500 font-medium">Ballou, Tambacounda, Sénégal</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-stone-100/50 py-6">
                <CardTitle className="text-xl font-bold">Informations de Paiement</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Méthode de Paiement</h4>
                      <p className="text-gray-500 font-medium">Veuillez sélectionner votre méthode de paiement</p>
                    </div>
                  </div>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="wave" id="wave" className="peer sr-only" />
                      <Label htmlFor="wave" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/50 border border-gray-200 rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        </div>
                        <span className="font-bold">Paiement Wave</span>
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="om" id="om" className="peer sr-only" />
                      <Label htmlFor="om" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                          <Lock className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="font-bold">Orange Money</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-stone-100/50 py-6">
                <CardTitle className="text-xl font-bold">Résumé de la Commande</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Articles</h4>
                        <p className="text-gray-500 font-medium">Votre panier</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Panier</h4>
                        <p className="text-gray-500 font-medium">Votre panier</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Livraison</h4>
                        <p className="text-gray-500 font-medium">Votre adresse</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Lock className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Paiement</h4>
                        <p className="text-gray-500 font-medium">Votre méthode</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Articles</span>
                    <span className="font-bold text-gray-900">{cart.length} items</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Prix des articles</span>
                    <span className="font-bold text-gray-900">{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Frais de livraison</span>
                    <span className="font-bold text-gray-900">{deliveryFee.toLocaleString()} FCFA</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-bold text-gray-900">TOTAL À PAYER</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-700">{finalTotal.toLocaleString()} FCFA</span>
                      <div className="bg-green-100 p-1 rounded-xl">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
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