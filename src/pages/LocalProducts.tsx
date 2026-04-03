"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, MapPin, Home, Upload, PlusCircle, Loader2, Save, Minus, Plus, Pencil, Sparkles, Trash2 } from 'lucide-react';
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
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<LocalProduct[]>([]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'local')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formatted = data.map((p: any) => ({
          ...p,
          id: String(p.id),
          price: Number(p.price),
          quantity: 1,
          image: p.image || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80"
        }));
        setProducts(formatted);
      }
    } catch (err: any) {
      showError("Erreur lors du chargement : " + err.message);
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

  const addNewProduct = () => {
    const newProd: LocalProduct = {
      id: `temp-${Date.now()}`,
      name: "Nouveau Produit",
      price: 0,
      unit: "kg",
      origin: "Ballou",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80",
      quantity: 1
    };
    setProducts([newProd, ...products]);
    showSuccess("Nouveau produit ajouté à la liste. N'oubliez pas d'enregistrer !");
  };

  const updateProductField = (id: string, field: keyof LocalProduct, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProductField(productId, 'image', reader.result as string);
        showSuccess("Image chargée !");
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProduct = async (product: LocalProduct) => {
    setSavingProductId(product.id);
    try {
      const isNew = product.id.startsWith('temp-');
      const payload: any = {
        name: product.name,
        price: product.price,
        image: product.image,
        unit: product.unit,
        origin: product.origin,
        category: 'local',
        updated_at: new Date().toISOString(),
      };

      if (!isNew) {
        payload.id = product.id;
      }

      const { data, error } = await supabase
        .from('products')
        .upsert([payload])
        .select();

      if (error) throw error;
      
      showSuccess(`${product.name} enregistré avec succès !`);
      if (isNew) fetchProducts(); // Refresh to get real IDs
    } catch (err: any) {
      showError("Erreur : " + err.message);
    } finally {
      setSavingProductId(null);
    }
  };

  const deleteProduct = async (id: string) => {
    if (id.startsWith('temp-')) {
      setProducts(products.filter(p => p.id !== id));
      return;
    }

    if (!window.confirm("Supprimer ce produit définitivement ?")) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      showSuccess("Produit supprimé.");
    } catch (err: any) {
      showError("Erreur lors de la suppression.");
    }
  };

  const handleAddToCart = (product: LocalProduct) => {
    addToCart({
      id: `local-${product.id}`,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      image: product.image,
      direction: 'Ballou -> Dakar',
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
            <Button asChild variant="outline" size="icon" className="rounded-full border-green-200">
              <Link to="/"><Home className="h-4 w-4 text-green-700" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-green-900">Produits Locaux</h1>
              <p className="text-gray-600">Direction : <span className="font-bold text-orange-600">Ballou vers Dakar</span></p>
            </div>
          </div>
          {isSuperAdmin && (
            <div className="flex gap-2">
              {editMode && (
                <Button onClick={addNewProduct} className="bg-green-600 hover:bg-green-700 text-white font-black">
                  <PlusCircle className="w-4 h-4 mr-2" /> AJOUTER UN PRODUIT
                </Button>
              )}
              <Button
                variant={editMode ? "default" : "outline"}
                onClick={() => setEditMode(!editMode)}
                className={editMode ? "bg-orange-600 hover:bg-orange-700 text-white font-black" : "font-black"}
              >
                <Pencil className="w-4 h-4 mr-2" /> {editMode ? "Mode édition : ON" : "Mode édition"}
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
            <p className="text-gray-500 font-medium">Chargement...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all group bg-white rounded-2xl relative">
                {isNewProduct(product.created_at) && (
                  <Badge className="absolute top-3 right-3 z-10 bg-orange-500 text-white border-none font-black animate-pulse">
                    <Sparkles className="w-3 h-3 mr-1" /> NOUVEAU
                  </Badge>
                )}
                <div className="relative h-40 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {editMode ? (
                      <Input 
                        value={product.origin} 
                        onChange={(e) => updateProductField(product.id, 'origin', e.target.value)}
                        className="h-6 w-24 text-[10px] bg-white/90 font-bold"
                        placeholder="Origine"
                      />
                    ) : (
                      <Badge className="bg-white/90 text-green-800 backdrop-blur text-[10px] h-5 px-2 font-bold shadow-sm">
                        <MapPin className="h-3 w-3 mr-1" /> {product.origin}
                      </Badge>
                    )}
                  </div>
                  {isSuperAdmin && editMode && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] gap-2">
                      <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-full flex items-center text-xs font-black shadow-2xl">
                        <Upload className="w-4 h-4 mr-2" /> IMAGE
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, product.id)} />
                      </label>
                      <Button variant="destructive" size="icon" className="rounded-full" onClick={() => deleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardContent className="pt-4 pb-3 px-5">
                  {editMode ? (
                    <Input 
                      value={product.name} 
                      onChange={(e) => updateProductField(product.id, 'name', e.target.value)}
                      className="h-8 mb-2 font-bold"
                    />
                  ) : (
                    <h3 className="font-bold text-base text-gray-900 truncate mb-1">{product.name}</h3>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      {editMode ? (
                        <div className="flex flex-col gap-1">
                          <Input
                            type="number"
                            value={product.price}
                            onChange={(e) => updateProductField(product.id, 'price', parseInt(e.target.value) || 0)}
                            className="h-8 w-full text-sm font-black"
                          />
                          <Input 
                            value={product.unit} 
                            onChange={(e) => updateProductField(product.id, 'unit', e.target.value)}
                            className="h-6 text-[10px]"
                            placeholder="Unité (ex: kg)"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-xl font-black text-green-700">{product.price.toLocaleString()} FCFA</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{product.unit}</p>
                        </>
                      )}
                    </div>
                    {!editMode && (
                      <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateProductField(product.id, 'quantity', Math.max(1, product.quantity - 1))}><Minus className="h-3 w-3" /></Button>
                        <span className="font-black text-sm">{product.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateProductField(product.id, 'quantity', product.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pb-4 pt-0 px-5 flex flex-col gap-2">
                  {isSuperAdmin && editMode && (
                    <Button onClick={() => saveProduct(product)} disabled={savingProductId === product.id} className="w-full bg-orange-600 hover:bg-orange-700 h-10 text-[10px] font-black">
                      {savingProductId === product.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} ENREGISTRER
                    </Button>
                  )}
                  {!editMode && (
                    <>
                      <Button variant="outline" className="w-full border-green-600 text-green-700 h-10 text-[10px] font-black" onClick={() => handleAddToCart(product)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> AJOUTER AU PANIER
                      </Button>
                      <Button className="w-full bg-green-600 hover:bg-green-700 h-10 text-[10px] font-black" onClick={() => { handleAddToCart(product); navigate('/cart'); }}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> ACHETER MAINTENANT
                      </Button>
                    </>
                  )}
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