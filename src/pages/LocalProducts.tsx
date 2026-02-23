"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShoppingCart, MapPin, Edit3, Save, Minus, Plus, Home, Upload, PlusCircle } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

const LocalProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isEditMode, setIsEditMode] = useState(false);
  
  const initialProducts = [
    { id: 1, name: "Riz de la vallée", price: 17500, unit: "sac", origin: "Ballou", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 2, name: "Oignon Local", price: 12000, unit: "sac", origin: "Ballou", image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 3, name: "Maïs", price: 500, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 4, name: "Piment rouge", price: 2000, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 5, name: "Piment vert", price: 1800, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&q=80", quantity: 1 },
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
  ];

  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    const saved = localStorage.getItem('local_products');
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  const updateQuantity = (id: number, delta: number) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
    ));
  };

  const updatePrice = (id: number, newPrice: string) => {
    const price = parseInt(newPrice) || 0;
    setProducts(products.map(p => 
      p.id === id ? { ...p, price: price } : p
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, productId: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        const newProducts = products.map(p => 
          p.id === productId ? { ...p, image: base64Image } : p
        );
        setProducts(newProducts);
        localStorage.setItem('local_products', JSON.stringify(newProducts));
        showSuccess("Image enregistrée !");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('local_products', JSON.stringify(products));
    setIsEditMode(false);
    showSuccess("Catalogue local mis à jour !");
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: `local-${product.id}`,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      image: product.image,
      direction: 'Ballou -> Dakar',
      unit: product.unit
    });
    showSuccess(`${product.name} ajouté au panier !`);
  };

  const handleBuyNow = (product: any) => {
    handleAddToCart(product);
    navigate('/cart');
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
          <div className="flex items-center gap-3">
            {isEditMode && (
              <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 shadow-md h-9 px-4 text-sm font-bold">
                <Save className="w-4 h-4 mr-2" /> ENREGISTRER PRIX
              </Button>
            )}
            <div className="flex items-center space-x-3 bg-white p-2 px-3 rounded-xl shadow-sm border border-green-100">
              <Switch id="edit-mode" checked={isEditMode} onCheckedChange={setIsEditMode} className="data-[state=checked]:bg-orange-500 scale-90" />
              <Label htmlFor="edit-mode" className="text-xs font-medium flex items-center cursor-pointer">
                <Edit3 className="w-3.5 h-3.5 mr-1 text-orange-600" /> Mode Édition
              </Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group bg-white">
              <div className="relative h-36 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-white/90 text-green-800 backdrop-blur text-[10px] h-5 px-1.5">
                    <MapPin className="h-2.5 w-2.5 mr-1" /> {product.origin}
                  </Badge>
                </div>
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer bg-white text-gray-900 px-3 py-1.5 rounded-full flex items-center text-xs font-bold shadow-lg">
                      <Upload className="w-3.5 h-3.5 mr-1.5" /> Changer
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, product.id)} />
                    </label>
                  </div>
                )}
              </div>
              <CardContent className="pt-3 pb-2 px-4">
                <h3 className="font-bold text-sm text-gray-900 truncate">{product.name}</h3>
                <div className="mt-1 flex items-center justify-between">
                  <div>
                    {isEditMode ? (
                      <div className="flex items-center gap-1">
                        <Input 
                          type="number" 
                          value={product.price} 
                          onChange={(e) => updatePrice(product.id, e.target.value)}
                          className="h-7 w-20 text-xs font-bold px-1 border-orange-200 focus:border-orange-500"
                        />
                        <span className="text-[10px] font-bold">FCFA</span>
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-green-700 leading-none">{product.price.toLocaleString()} FCFA</p>
                    )}
                    <p className="text-[10px] text-gray-500 mt-1">/ {product.unit}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-100 rounded-lg p-0.5">
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => updateQuantity(product.id, -1)}>
                      <Minus className="h-2.5 w-2.5" />
                    </Button>
                    <span className="font-bold text-xs min-w-[15px] text-center">{product.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => updateQuantity(product.id, 1)}>
                      <Plus className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pb-3 pt-0 px-4 flex flex-col gap-2">
                <Button size="sm" variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-50 h-8 text-[10px] font-bold" onClick={() => handleAddToCart(product)}>
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> AJOUTER AU PANIER
                </Button>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 h-8 text-[10px] font-bold" onClick={() => handleBuyNow(product)}>
                  <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> ACHETER
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocalProducts;