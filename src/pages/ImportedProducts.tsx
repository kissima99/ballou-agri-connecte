"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Sprout, Minus, Plus, Home, Apple, Loader2, Zap, PlusCircle, Pencil } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { supabase, isCurrentUserSuperAdmin } from "@/integrations/supabase/client";

interface ImportedProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
  category: string;
}

const ImportedProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ImportedProduct[]>([]);

  const categories = [
    { id: "importes", name: "Importés", icon: <Package className="w-3 h-3 mr-1.5" /> },
    { id: "frais", name: "Frais", icon: <Apple className="w-3 h-3 mr-1.5" /> },
    { id: "semences", name: "Semences", icon: <Sprout className="w-3 h-3 mr-1.5" /> },
    { id: "electroniques", name: "Électro", icon: <Zap className="w-3 h-3 mr-1.5" /> }
  ];

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').in('category', ['importes', 'frais', 'semences', 'electroniques']).order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setProducts(data.map((p: any) => ({ ...p, id: String(p.id), price: Number(p.price), quantity: 1, image: p.image || "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80" })));
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

  const handleAddToCart = (product: ImportedProduct) => {
    addToCart({ id: `imported-${product.id}`, name: product.name, price: product.price, quantity: product.quantity, image: product.image, direction: 'Dakar -> Ballou', unit: product.unit });
    showSuccess(`${product.name} ajouté !`);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container px-4 py-10 mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="rounded-xl h-10 w-10"><Link to="/"><Home className="h-4 w-4" /></Link></Button>
            <h1 className="text-2xl font-bold text-gray-900">Acheter de Dakar</h1>
          </div>
          {isSuperAdmin && <Button variant={editMode ? "default" : "outline"} size="sm" onClick={() => setEditMode(!editMode)} className="rounded-lg font-bold"><Pencil className="w-3 h-3 mr-2" /> Éditer</Button>}
        </div>

        <Tabs defaultValue="importes" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1 bg-blue-50 rounded-xl gap-1">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="py-2 text-[10px] font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
                {cat.icon} {cat.name.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id}>
              {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.filter(p => p.category === cat.id).map((product) => (
                    <Card key={product.id} className="group border-none shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white">
                      <div className="relative aspect-square overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-sm text-gray-900 truncate mb-1">{product.name}</h3>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-lg font-black text-blue-700">{product.price.toLocaleString()} F</span>
                          <span className="text-[10px] text-gray-400 font-medium">/ {product.unit}</span>
                        </div>
                        
                        <div className="flex items-center justify-between gap-2 mb-4 bg-stone-50 p-1 rounded-xl">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => updateQuantity(product.id, -1)}><Minus className="h-3 w-3" /></Button>
                          <span className="font-bold text-xs">{product.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => updateQuantity(product.id, 1)}><Plus className="h-3 w-3" /></Button>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          <Button variant="outline" size="sm" className="w-full h-9 text-[10px] font-bold rounded-xl border-blue-600 text-blue-700 hover:bg-blue-50" onClick={() => handleAddToCart(product)}>
                            <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> PANIER
                          </Button>
                          <Button size="sm" className="w-full h-9 text-[10px] font-bold rounded-xl bg-blue-600 hover:bg-blue-700" onClick={() => { handleAddToCart(product); navigate('/cart'); }}>
                            ACHETER
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default ImportedProducts;