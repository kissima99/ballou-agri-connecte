"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Sprout, Minus, Plus, Home, Apple, Upload, PlusCircle, Loader2, Zap, Save, Pencil, Sparkles } from 'lucide-react';
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
  created_at?: string;
}

const ImportedProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ImportedProduct[]>([]);

  const categories = [
    { id: "importes", name: "Importés", icon: <Package className="w-3.5 h-3.5 mr-1.5" /> },
    { id: "frais", name: "Frais", icon: <Apple className="w-3.5 h-3.5 mr-1.5" /> },
    { id: "semences", name: "Semences", icon: <Sprout className="w-3.5 h-3.5 mr-1.5" /> },
    { id: "electroniques", name: "Électronique", icon: <Zap className="w-3.5 h-3.5 mr-1.5" /> }
  ];

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('category', ['importes', 'frais', 'semences', 'electroniques'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formatted = data.map((p: any) => ({
          ...p,
          id: String(p.id),
          price: Number(p.price),
          quantity: 1,
          image: p.image || "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80"
        }));
        setProducts(formatted);
      }
    } catch (err: any) {
      showError("Erreur : " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      setIsSuperAdmin(await isCurrentUserSuperAdmin());
      await fetchProducts();
    };
    boot();
  }, []);

  const isNewProduct = (createdAt?: string) => {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
    return diffInDays < 7;
  };

  const updateQuantity = (id: string, delta: number) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
    ));
  };

  const updatePrice = (id: string, newPrice: string) => {
    if (!isSuperAdmin || !editMode) return;
    const price = parseInt(newPrice) || 0;
    setProducts(products.map(p =>
      p.id === id ? { ...p, price: price } : p
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    if (!isSuperAdmin || !editMode) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setProducts(products.map(p =>
          p.id === productId ? { ...p, image: base64Image } : p
        ));
        showSuccess("Image prête !");
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProduct = async (product: ImportedProduct) => {
    if (!isSuperAdmin || !editMode) return;
    setSavingKey(product.id);
    try {
      const { error } = await supabase
        .from('products')
        .upsert([{
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          unit: product.unit,
          category: product.category,
          updated_at: new Date().toISOString(),
        }]);

      if (error) throw error;
      showSuccess(`${product.name} enregistré !`);
    } catch (err: any) {
      showError("Erreur : " + err.message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleAddToCart = (product: ImportedProduct) => {
    addToCart({
      id: `imported-${product.id}`,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      image: product.image,
      direction: 'Dakar -> Ballou',
      unit: product.unit
    });
    showSuccess(`${product.name} ajouté !`);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="rounded-full border-blue-200">
              <Link to="/"><Home className="h-4 w-4 text-blue-700" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Dakar vers Ballou</h1>
              <p className="text-gray-600">Produits essentiels livrés chez vous.</p>
            </div>
          </div>
          {isSuperAdmin && (
            <Button
              variant={editMode ? "default" : "outline"}
              onClick={() => setEditMode(!editMode)}
              className={editMode ? "bg-orange-600 hover:bg-orange-700 text-white font-black" : "font-black"}
            >
              <Pencil className="w-4 h-4 mr-2" /> {editMode ? "Mode édition : ON" : "Mode édition"}
            </Button>
          )}
        </div>

        <Tabs defaultValue="importes" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1.5 bg-blue-100/50 rounded-2xl gap-2">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="py-3 text-xs md:text-sm font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl">
                {cat.icon} {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.filter(p => p.category === cat.id).map(product => (
                  <Card key={product.id} className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all bg-white group rounded-2xl relative">
                    {isNewProduct(product.created_at) && (
                      <Badge className="absolute top-3 right-3 z-10 bg-orange-500 text-white border-none font-black animate-pulse">
                        <Sparkles className="w-3 h-3 mr-1" /> NOUVEAU
                      </Badge>
                    )}
                    <div className="relative h-40 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      {isSuperAdmin && editMode && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                          <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-full flex items-center text-xs font-black shadow-2xl">
                            <Upload className="w-4 h-4 mr-2" /> IMAGE
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, product.id)} />
                          </label>
                        </div>
                      )}
                    </div>
                    <CardContent className="pt-4 pb-3 px-5">
                      <h3 className="font-bold text-base text-gray-900 truncate mb-1">{product.name}</h3>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          {isSuperAdmin && editMode ? (
                            <Input type="number" value={product.price} onChange={(e) => updatePrice(product.id, e.target.value)} className="h-8 w-full text-sm font-black" />
                          ) : (
                            <p className="text-xl font-black text-blue-700">{product.price.toLocaleString()} FCFA</p>
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
                      {isSuperAdmin && editMode && (
                        <Button onClick={() => saveProduct(product)} disabled={savingKey === product.id} className="w-full bg-orange-600 hover:bg-orange-700 h-10 text-[10px] font-black">
                          {savingKey === product.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} ENREGISTRER
                        </Button>
                      )}
                      <Button variant="outline" className="w-full border-blue-600 text-blue-700 h-10 text-[10px] font-black" onClick={() => handleAddToCart(product)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> AJOUTER AU PANIER
                      </Button>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-[10px] font-black" onClick={() => { handleAddToCart(product); navigate('/cart'); }}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> ACHETER MAINTENANT
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default ImportedProducts;