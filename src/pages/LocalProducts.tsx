"use client";

import React, { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ShoppingCart, MapPin, Edit3, Save, Minus, Plus, Home, Upload, Image as ImageIcon } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';

const LocalProducts = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [products, setProducts] = useState([
    { id: 1, name: "Oignons Locaux", price: 800, unit: "kg", stock: 50, origin: "Ballou", image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 2, name: "Piment Rouge/Vert", price: 1500, unit: "kg", stock: 20, origin: "Ballou", image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 3, name: "Canne Verte", price: 500, unit: "unité", stock: 100, origin: "Ballou", image: "https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 4, name: "Salade Fraîche", price: 300, unit: "unité", stock: 40, origin: "Ballou", image: "https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 5, name: "Patate Douce", price: 600, unit: "kg", stock: 80, origin: "Ballou", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 6, name: "Gombo", price: 1000, unit: "kg", stock: 15, origin: "Ballou", image: "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?auto=format&fit=crop&q=80", quantity: 1 },
  ]);

  const updateQuantity = (id: number, delta: number) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, productId: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProducts(products.map(p => 
          p.id === productId ? { ...p, image: reader.result as string } : p
        ));
        showSuccess("Image mise à jour !");
      };
      reader.readAsDataURL(file);
    }
  };

  const addToCart = (product: any) => {
    const totalProductPrice = product.price * product.quantity;
    showSuccess(`${product.quantity} ${product.unit}(s) de ${product.name} sélectionné(s) !`);
    setTimeout(() => {
      navigate('/checkout', { state: { price: totalProductPrice, name: `${product.quantity}x ${product.name}` } });
    }, 1000);
  };

  const handlePriceChange = (id: number, newPrice: string) => {
    const price = parseInt(newPrice) || 0;
    setProducts(products.map(p => p.id === id ? { ...p, price } : p));
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
              <h1 className="text-3xl font-bold text-green-900">Produits Locaux de Ballou</h1>
              <p className="text-gray-600">Gérez vos produits et changez les images manuellement.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 bg-white p-3 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center space-x-2">
              <Switch id="edit-mode" checked={isEditMode} onCheckedChange={setIsEditMode} className="data-[state=checked]:bg-orange-500" />
              <Label htmlFor="edit-mode" className="text-sm font-medium flex items-center cursor-pointer">
                <Edit3 className="w-4 h-4 mr-1 text-orange-600" /> Mode Édition
              </Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group bg-white">
              <div className="relative h-48 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-white/90 text-green-800 backdrop-blur"><MapPin className="h-3 w-3 mr-1" /> {product.origin}</Badge>
                </div>
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-full flex items-center text-sm font-bold shadow-lg">
                      <Upload className="w-4 h-4 mr-2" /> Changer l'image
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, product.id)} />
                    </label>
                  </div>
                )}
              </div>
              <CardContent className="pt-4">
                <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                {isEditMode ? (
                  <div className="mt-2 space-y-1">
                    <Label className="text-xs text-orange-600 font-bold">Prix / {product.unit} (FCFA)</Label>
                    <Input type="number" value={product.price} onChange={(e) => handlePriceChange(product.id, e.target.value)} className="border-orange-200 h-9" />
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-2xl font-bold text-green-700">{product.price.toLocaleString()} FCFA <span className="text-sm font-normal text-gray-500">/ {product.unit}</span></p>
                    <div className="flex items-center gap-2 bg-stone-100 rounded-lg p-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => updateQuantity(product.id, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-bold text-sm min-w-[20px] text-center">{product.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => updateQuantity(product.id, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pb-4">
                <Button className={`w-full ${isEditMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`} onClick={() => isEditMode ? setIsEditMode(false) : addToCart(product)}>
                  {isEditMode ? <><Save className="mr-2 h-4 w-4" /> Enregistrer</> : <><ShoppingCart className="mr-2 h-4 w-4" /> Acheter ({(product.price * product.quantity).toLocaleString()} FCFA)</>}
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