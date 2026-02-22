"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Package, Utensils, Sparkles, Sprout, Minus, Plus, Home, Droplets, Beef, Apple } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';

const ImportedProducts = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([
    {
      id: "importes",
      name: "Produits Importés",
      icon: <Package className="w-4 h-4 mr-2" />,
      products: [
        { id: 101, name: "Pomme de terre", price: 12000, unit: "sac 25kg", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 102, name: "Oignon Importé", price: 10000, unit: "sac 25kg", image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 103, name: "Bidon Huile 1L", price: 1500, unit: "unité", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 104, name: "Huile de palme 1L", price: 1800, unit: "unité", image: "https://images.unsplash.com/photo-1620706122100-616af41e0b97?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 105, name: "Sceau de pâte d'arachide", price: 4500, unit: "unité", image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 106, name: "Sac de Sel", price: 3500, unit: "sac", image: "https://images.unsplash.com/photo-1518110168401-f74b77f5aa14?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 107, name: "Sac de Lait en poudre", price: 25000, unit: "sac", image: "https://images.unsplash.com/photo-1550583724-125581f77833?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 108, name: "Carton de lait liquide", price: 12000, unit: "carton", image: "https://images.unsplash.com/photo-1563636619-e9107da5a1bb?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 109, name: "Miel", price: 5000, unit: "litre", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80", quantity: 1 },
      ]
    },
    {
      id: "frais",
      name: "Produits Frais",
      icon: <Apple className="w-4 h-4 mr-2" />,
      products: [
        { id: 201, name: "Poulet frais", price: 3500, unit: "unité", image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 202, name: "Poissons Séchée", price: 2500, unit: "kg", image: "https://images.unsplash.com/photo-1534604973900-c41ab4c5d010?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 203, name: "Fruit mixte", price: 4000, unit: "panier", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 204, name: "Citron", price: 1000, unit: "filet", image: "https://images.unsplash.com/photo-1585059895524-72359e06133a?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 205, name: "Feuille de menthe", price: 200, unit: "botte", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80", quantity: 1 },
      ]
    },
    {
      id: "semences",
      name: "Semences",
      icon: <Sprout className="w-4 h-4 mr-2" />,
      products: [
        { id: 301, name: "Semence Oignon", price: 5000, unit: "sachet", image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 302, name: "Semence Salade", price: 2500, unit: "sachet", image: "https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 303, name: "Semence Choux", price: 3000, unit: "sachet", image: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 304, name: "Semence Gombo", price: 3500, unit: "sachet", image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 305, name: "Semence Carrotte", price: 4000, unit: "sachet", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 306, name: "Semence pastéque", price: 4500, unit: "sachet", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80", quantity: 1 },
      ]
    }
  ]);

  const updateQuantity = (catId: string, prodId: number, delta: number) => {
    setCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        products: cat.products.map(p => 
          p.id === prodId ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
        )
      };
    }));
  };

  const addToCart = (product: any) => {
    const totalProductPrice = product.price * product.quantity;
    showSuccess(`${product.quantity} ${product.unit}(s) de ${product.name} sélectionné(s) !`);
    setTimeout(() => {
      navigate('/checkout', { state: { price: totalProductPrice, name: `${product.quantity}x ${product.name}` } });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Button asChild variant="outline" size="icon" className="rounded-full border-blue-200">
            <Link to="/"><Home className="h-4 w-4 text-blue-700" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Produits Importés & Frais</h1>
            <p className="text-gray-600">Commandez vos besoins à Dakar et recevez-les à Ballou.</p>
          </div>
        </div>

        <Tabs defaultValue="importes" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 h-auto p-1 bg-blue-50">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                {cat.icon} {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.products.map(product => (
                  <Card key={product.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all bg-white">
                    <div className="h-40 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-2xl font-bold text-blue-700">{product.price.toLocaleString()} FCFA</p>
                        <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => updateQuantity(cat.id, product.id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-bold text-sm min-w-[20px] text-center">{product.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => updateQuantity(cat.id, product.id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">Unité: {product.unit}</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => addToCart(product)}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> Acheter ({(product.price * product.quantity).toLocaleString()} FCFA)
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