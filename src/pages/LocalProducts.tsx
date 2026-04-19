"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, MapPin, Home, Loader2, Minus, Plus, Pencil, Sparkles, PlusCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { supabase, isCurrentUserSuperAdmin } from "@/integrations/supabase/client";

interface LocalProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  origin: string;
  image: string;
  quantity: number;
  created_at?: string;
}

const LocalProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<LocalProduct[]>([]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').eq('category', 'local').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setProducts(data.map((p: any) => ({ ...p, id: String(p.id), price: Number(p.price), quantity: 1, image: p.image || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80" })));
      }
    } catch (err: any) { showError(err.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    const boot = async () => {
      setIsSuperAdmin(await isCurrentUserSuperAdmin());
      await fetchProducts();
    };
    boot();
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p));
  };

  const handleAddToCart = (product: LocalProduct) => {
    addToCart({ id: `local-${product.id}`, name: product.name, price: product.price, quantity: product.quantity, image: product.image, direction: 'Ballou -> Dakar', unit: product.unit });
    showSuccess(`${product.name} ajouté !`);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container px-4 py-10 mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="rounded-xl h-10 w-10"><Link to="/"><Home className="h-4 w-4" /></Link></Button>
            <h1 className="text-2xl font-bold text-gray-900">Produits de Ballou</h1>
          </div>
          {isSuperAdmin && <Button variant={editMode ? "default" : "outline"} size="sm" onClick={() => setEditMode(!editMode)} className="rounded-lg font-bold"><Pencil className="w-3 h-3 mr-2" /> Éditer</Button>}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group border-none shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white">
                <div className="relative aspect-square overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <Badge className="absolute top-2 left-2 bg-white/90 text-gray-900 text-[8px] font-bold px-2 py-0.5 rounded-full border-none shadow-sm"><MapPin className="h-2 w-2 mr-1 text-orange-500" /> {product.origin}</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm text-gray-900 truncate mb-1">{product.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-lg font-black text-green-700">{product.price.toLocaleString()} F</span>
                    <span className="text-[10px] text-gray-400 font-medium">/ {product.unit}</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 mb-4 bg-stone-50 p-1 rounded-xl">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => updateQuantity(product.id, -1)}><Minus className="h-3 w-3" /></Button>
                    <span className="font-bold text-xs">{product.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => updateQuantity(product.id, 1)}><Plus className="h-3 w-3" /></Button>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" size="sm" className="w-full h-9 text-[10px] font-bold rounded-xl border-green-600 text-green-700 hover:bg-green-50" onClick={() => handleAddToCart(product)}>
                      <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> PANIER
                    </Button>
                    <Button size="sm" className="w-full h-9 text-[10px] font-bold rounded-xl bg-green-600 hover:bg-green-700" onClick={() => { handleAddToCart(product); navigate('/cart'); }}>
                      ACHETER
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LocalProducts;