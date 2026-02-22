"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, AlertTriangle, MapPin } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const LocalProducts = () => {
  const [cartCount, setCartCount] = useState(0);

  const products = [
    { id: 1, name: "Riz de la Vallée", price: 15000, stock: 10, origin: "Ballou", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80" },
    { id: 2, name: "Oignons Frais", price: 5000, stock: 0, origin: "Ballou", image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80" },
    { id: 3, name: "Maïs Local", price: 8000, stock: 25, origin: "Ballou", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80" },
    { id: 4, name: "Gombo", price: 2000, stock: 5, origin: "Ballou", image: "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?auto=format&fit=crop&q=80" },
  ];

  const addToCart = (product: any) => {
    if (product.stock > 0) {
      setCartCount(prev => prev + 1);
      showSuccess(`${product.name} ajouté au panier !`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar cartCount={cartCount} />
      <div className="container px-4 py-12 mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold text-green-900">Produits Locaux de Ballou</h1>
            <p className="text-gray-600">Soutenez l'économie locale en achetant directement aux agriculteurs.</p>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 px-4 py-1">
            {products.length} Produits disponibles
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-white/90 text-green-800 backdrop-blur flex items-center">
                    <MapPin className="h-3 w-3 mr-1" /> {product.origin}
                  </Badge>
                </div>
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-4 py-1">Rupture de stock</Badge>
                  </div>
                )}
              </div>
              <CardContent className="pt-4">
                <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                <p className="text-2xl font-bold text-green-700 mt-2">{product.price.toLocaleString()} FCFA</p>
                <p className="text-sm text-gray-500 mt-1">Stock: {product.stock} unités</p>
              </CardContent>
              <CardFooter className="pb-4">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  disabled={product.stock === 0}
                  onClick={() => addToCart(product)}
                >
                  {product.stock === 0 ? (
                    <><AlertTriangle className="mr-2 h-4 w-4" /> M'alerter</>
                  ) : (
                    <><ShoppingCart className="mr-2 h-4 w-4" /> Ajouter</>
                  )}
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