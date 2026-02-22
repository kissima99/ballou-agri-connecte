"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Package, Utensils, Sparkles, Sprout } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const ImportedProducts = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  const categories = [
    {
      id: "alimentaire",
      name: "Produits Alimentaires",
      icon: <Utensils className="w-4 h-4 mr-2" />,
      products: [
        { id: 101, name: "Pomme de terre", price: 12000, unit: "sac 25kg", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80" },
        { id: 102, name: "Oignon Importé", price: 10000, unit: "sac 25kg", image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80" },
        { id: 103, name: "Chips (Lot)", price: 5000, unit: "carton", image: "https://images.unsplash.com/photo-1566478431370-72257e39458a?auto=format&fit=crop&q=80" },
      ]
    },
    {
      id: "frais",
      name: "Produits Frais",
      icon: <Package className="w-4 h-4 mr-2" />,
      products: [
        { id: 201, name: "Poulet Frais", price: 3500, unit: "unité", image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80" },
        { id: 202, name: "Poissons Séchés", price: 2500, unit: "kg", image: "https://images.unsplash.com/photo-1534604973900-c41ab4c5d010?auto=format&fit=crop&q=80" },
        { id: 203, name: "Crème Glacée", price: 4500, unit: "bac 1L", image: "https://images.unsplash.com/photo-1501443762994-82bd5dabb892?auto=format&fit=crop&q=80" },
        { id: 204, name: "Fruits Mixtes", price: 3000, unit: "panier", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80" },
      ]
    },
    {
      id: "menager",
      name: "Produits Ménagers",
      icon: <Sparkles className="w-4 h-4 mr-2" />,
      products: [
        { id: 301, name: "Paquet Savon", price: 2500, unit: "lot de 10", image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&q=80" },
        { id: 302, name: "Savons Hygiène", price: 1200, unit: "unité", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80" },
      ]
    },
    {
      id: "semences",
      name: "Semences",
      icon: <Sprout className="w-4 h-4 mr-2" />,
      products: [
        { id: 401, name: "Semences Oignons", price: 5000, unit: "sachet", image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80" },
        { id: 402, name: "Semences Gombo", price: 3000, unit: "sachet", image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80" },
        { id: 403, name: "Semences Piment", price: 3500, unit: "sachet", image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&q=80" },
        { id: 404, name: "Semences Aubergine", price: 4000, unit: "sachet", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80" },
        { id: 405, name: "Semences Salade", price: 2500, unit: "sachet", image: "https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?auto=format&fit=crop&q=80" },
      ]
    }
  ];

  const addToCart = (product: any) => {
    setCartCount(prev => prev + 1);
    showSuccess(`${product.name} ajouté ! Redirection vers le paiement...`);
    setTimeout(() => navigate('/checkout'), 1500);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar cartCount={cartCount} />
      <div className="container px-4 py-12 mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-blue-900">Produits Importés de Dakar</h1>
          <p className="text-gray-600">Commandez vos besoins à Dakar et recevez-les à Ballou.</p>
        </div>

        <Tabs defaultValue="alimentaire" className="w-full">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-8 h-auto p-1 bg-blue-50">
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
                      <p className="text-2xl font-bold text-blue-700">{product.price.toLocaleString()} FCFA</p>
                      <p className="text-sm text-gray-500">Unité: {product.unit}</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => addToCart(product)}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> Commander
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