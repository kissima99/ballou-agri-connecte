"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShoppingCart, MapPin, Edit3, Save, Minus, Plus, Home, Upload, PlusCircle, Scale, Loader2, CloudUpload } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { supabase } from "@/integrations/supabase/client";

interface LocalProduct {
  id: string | number;
  name: string;
  price: number;
  unit: string;
  origin: string;
  image: string;
  quantity: number;
  is_kg?: boolean;
  base_price_sac?: number;
  price_per_kg?: number;
  category?: string;
}

const INITIAL_LOCAL_PRODUCTS: LocalProduct[] = [
  { id: 1, name: "Riz de la Vallée", price: 17500, unit: "sac 25kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80", quantity: 1, is_kg: false, base_price_sac: 17500, price_per_kg: 800 },
  { id: 2, name: "Oignons Frais", price: 9000, unit: "sac 25kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80", quantity: 1, is_kg: false, base_price_sac: 9000, price_per_kg: 500 },
  { id: 3, name: "Maïs Jaune", price: 12000, unit: "sac 50kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80", quantity: 1 },
  { id: 4, name: "Patate Douce", price: 8500, unit: "sac", origin: "Ballou", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80", quantity: 1 },
];

const LocalProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isEditMode, setIsEditMode] = useState(false);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'local');
      
      if (error) throw error;

      if (data && data.length > 0) {
        setProducts(data.map(p => ({ ...p, quantity: 1 })));
      } else {
        setProducts(INITIAL_LOCAL_PRODUCTS);
      }
    } catch (err) {
      console.error(err);
      setProducts(INITIAL_LOCAL_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      for (const product of products) {
        const { error } = await supabase
          .from('products')
          .upsert({
            name: product.name,
            price: product.price,
            unit: product.unit,
            image: product.image,
            category: 'local',
            origin: product.origin,
            is_kg: product.is_kg,
            base_price_sac: product.base_price_sac,
            price_per_kg: product.price_per_kg
          }, { onConflict: 'name' });
        
        if (error) throw error;
      }
      setIsEditMode(false);
      showSuccess("Catalogue synchronisé avec succès !");
      fetchProducts();
    } catch (error: any) {
      showError("Erreur de synchronisation : " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = (id: string | number, delta: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p));
  };

  const updatePrice = (id: string | number, newPrice: string) => {
    const price = parseInt(newPrice) || 0;
    setProducts(products.map(p => p.id === id ? { ...p, price: price } : p));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, productId: string | number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setProducts(products.map(p => p.id === productId ? { ...p, image: base64Image } : p));
      };
      reader.readAsDataURL(file);
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
    showSuccess(`${product.name} ajouté au panier !`);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="rounded-full border-green-200">
              <Link to="/"><Home className="h-4 w-4 text-green-700" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-green-900">Produits Locaux</h1>
              <p className="text-gray-600">Direction : <span className="font-bold text-orange-600">Ballou vers Dakar</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 z-50">
            {isEditMode && (
              <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white shadow-2xl h-11 px-8 text-sm font-black">
                <CloudUpload className="w-5 h-5 mr-2" /> SYNCHRONISER VERS LE CLOUD
              </Button>
            )}
            <div className="flex items-center space-x-3 bg-white p-2.5 px-4 rounded-xl shadow-md border border-green-200">
              <Switch id="edit-mode-local" checked={isEditMode} onCheckedChange={setIsEditMode} className="data-[state=checked]:bg-orange-500" />
              <Label htmlFor="edit-mode-local" className="text-sm font-bold flex items-center cursor-pointer select-none">
                <Edit3 className="w-4 h-4 mr-2 text-orange-600" /> Mode Édition
              </Label>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all group bg-white rounded-2xl">
                <div className="relative h-40 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <Badge className="bg-white/90 text-green-800 backdrop-blur text-[10px] h-5 px-2 font-bold shadow-sm">
                      <MapPin className="h-3 w-3 mr-1" /> {product.origin}
                    </Badge>
                  </div>
                  {isEditMode && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                      <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-full flex items-center text-xs font-black shadow-2xl transform hover:scale-105 active:scale-95 transition-all">
                        <Upload className="w-4 h-4 mr-2" /> CHANGER L'IMAGE
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, product.id)} />
                      </label>
                    </div>
                  )}
                </div>
                <CardContent className="pt-4 pb-3 px-5">
                  <h3 className="font-bold text-base text-gray-900 truncate mb-1">{product.name}</h3>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      {isEditMode ? (
                        <Input type="number" value={product.price} onChange={(e) => updatePrice(product.id, e.target.value)} className="h-8 w-full text-sm font-black" />
                      ) : (
                        <p className="text-xl font-black text-green-700">{product.price.toLocaleString()} FCFA</p>
                      )}
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{product.unit}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(product.id, -1)}><Minus className="h-3 w-3" /></Button>
                      <span className="font-black text-sm">{product.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(product.id, 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pb-4 pt-0 px-5 flex flex-col gap-2">
                  <Button size="lg" variant="outline" className="w-full border-green-600 text-green-700 h-10 text-[10px] font-black" onClick={() => handleAddToCart(product)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> AJOUTER AU PANIER
                  </Button>
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 h-10 text-[10px] font-black" onClick={() => { handleAddToCart(product); navigate('/cart'); }}>
                    <ShoppingCart className="mr-2 h-4 w-4" /> ACHETER MAINTENANT
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalProducts;