"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShoppingCart, MapPin, Edit3, Save, Minus, Plus, Home, Upload, PlusCircle, Scale, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

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

const LocalProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initialProducts: LocalProduct[] = [
    { id: 1, name: "Riz de la vallée", price: 17500, unit: "sac", origin: "Ballou", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80", quantity: 1, isKg: false, basePriceSac: 17500, pricePerKg: 400 },
    { id: 2, name: "Oignon Local", price: 12000, unit: "sac", origin: "Ballou", image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 3, name: "Maïs", price: 500, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 4, name: "Piment rouge", price: 2000, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 5, name: "Piment vert", price: 1800, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 16, name: "Poivron vert", price: 1500, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1563565312-8335ff593d93?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 17, name: "Poivron Rouge", price: 2000, unit: "kg", origin: "Ballou", image: "https://images.unsplash.com/photo-1589483232748-515c025575bc?auto=format&fit=crop&q=80", quantity: 1 },
    { id: 18, name: "Sucre Local", price: 25000, unit: "sac", origin: "Ballou", image: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&q=80", quantity: 1, isKg: false, basePriceSac: 25000, pricePerKg: 600 },
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

  const [products, setProducts] = useState<LocalProduct[]>(initialProducts);

  useEffect(() => {
    const saved = localStorage.getItem('local_products');
    if (saved) {
      try {
        const savedProducts = JSON.parse(saved);
        const merged = initialProducts.map(p => {
          const savedP = savedProducts.find((sp: any) => sp.id === p.id);
          return savedP ? { ...p, ...savedP } : p;
        });
        setProducts(merged);
      } catch (e) {
        console.error("Erreur lecture localStorage", e);
      }
    }
  }, []);

  const toggleKg = (id: number) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const newIsKg = !p.isKg;
        return {
          ...p,
          isKg: newIsKg,
          unit: newIsKg ? "kg" : "sac",
          price: newIsKg ? (p.pricePerKg || 500) : (p.basePriceSac || 17500)
        };
      }
      return p;
    }));
  };

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

  const handleSave = () => {
    setIsSaving(true);
    try {
      // Sauvegarde locale uniquement
      localStorage.setItem('local_products', JSON.stringify(products));
      showSuccess("Prix sauvegardés localement !");
      setIsEditMode(false);
    } catch (err: any) {
      showError("Erreur de sauvegarde locale : " + err.message);
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
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-2xl h-11 px-8 text-sm font-black"
              >
                {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 w-5 mr-2" />} 
                SAUVEGARDER
              </Button>
            )}
            <div className="flex items-center space-x-3 bg-white p-2.5 px-4 rounded-xl shadow-md border border-green-200">
              <Switch 
                id="edit-mode-local" 
                checked={isEditMode} 
                onCheckedChange={setIsEditMode} 
                className="data-[state=checked]:bg-orange-500" 
              />
              <Label htmlFor="edit-mode-local" className="text-sm font-bold flex items-center cursor-pointer select-none">
                <Edit3 className="w-4 h-4 mr-2 text-orange-600" /> Mode Édition
              </Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all group bg-white rounded-2xl">
              <div className="relative h-40 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <Badge className="bg-white/90 text-green-800 backdrop-blur text-[10px] h-5 px-2 font-bold shadow-sm">
                    <MapPin className="h-3 w-3 mr-1" /> {product.origin}
                  </Badge>
                  {(product.id === 1 || product.id === 18) && (
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className={`h-6 px-2 text-[10px] font-black shadow-lg ${product.isKg ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-white/90 text-orange-700 hover:bg-white'}`}
                      onClick={() => toggleKg(product.id)}
                    >
                      <Scale className="h-3 w-3 mr-1.5" /> {product.isKg ? 'MODE SAC' : 'MODE KG'}
                    </Button>
                  )}
                </div>
              </div>
              <CardContent className="pt-4 pb-3 px-5">
                <h3 className="font-bold text-base text-gray-900 truncate mb-1">{product.name}</h3>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    {isEditMode ? (
                      <div className="flex items-center gap-1.5 bg-orange-50 p-1 rounded-lg border border-orange-100">
                        <Input 
                          type="number" 
                          value={product.price} 
                          onChange={(e) => updatePrice(product.id, e.target.value)}
                          className="h-8 w-full text-sm font-black px-2 border-none bg-transparent focus-visible:ring-0"
                        />
                        <span className="text-[10px] font-black text-orange-700 pr-1">FCFA</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xl font-black text-green-700 leading-none">{product.price.toLocaleString()} FCFA</p>
                      </div>
                    )}
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{product.unit}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-lg hover:bg-white hover:shadow-sm" 
                      onClick={() => updateQuantity(product.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-black text-sm min-w-[20px] text-center">{product.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-lg hover:bg-white hover:shadow-sm" 
                      onClick={() => updateQuantity(product.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pb-4 pt-0 px-5 flex flex-col gap-2">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full border-green-600 text-green-700 hover:bg-green-50 h-10 text-[10px] font-black shadow-sm" 
                  onClick={() => handleAddToCart(product)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> AJOUTER AU PANIER
                </Button>
                <Button 
                  size="lg" 
                  className="w-full bg-green-600 hover:bg-green-700 h-10 text-[10px] font-black shadow-md" 
                  onClick={() => handleBuyNow(product)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" /> ACHETER MAINTENANT
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