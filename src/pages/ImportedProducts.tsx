"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Package, Sprout, Minus, Plus, Home, Apple, Edit3, Save, Upload } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';

const ImportedProducts = () => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);

  const initialCategories = [
    {
      id: "importes",
      name: "Importés",
      icon: <Package className="w-3.5 h-3.5 mr-1.5" />,
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
      name: "Frais",
      icon: <Apple className="w-3.5 h-3.5 mr-1.5" />,
      products: [
        { id: 206, name: "Fraise", price: 4500, unit: "barquette", image: "https://images.unsplash.com/photo-1464960726344-4861873193ec?auto=format&fit=crop&q=80", quantity: 1 },
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
      icon: <Sprout className="w-3.5 h-3.5 mr-1.5" />,
      products: [
        { id: 301, name: "Semence Oignon", price: 5000, unit: "sachet", image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 302, name: "Semence Salade", price: 2500, unit: "sachet", image: "https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 303, name: "Semence Choux", price: 3000, unit: "sachet", image: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 304, name: "Semence Gombo", price: 3500, unit: "sachet", image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 305, name: "Semence Carrotte", price: 4000, unit: "sachet", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 306, name: "Semence pastéque", price: 4500, unit: "sachet", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80", quantity: 1 },
      ]
    }
  ];

  const [categories, setCategories] = useState(initialCategories);

  useEffect(() => {
    const saved = localStorage.getItem('imported_categories');
    if (saved) setCategories(JSON.parse(saved));
  }, []);

  const updateQuantity = (catId: string, prodId: number, delta: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        products: cat.products.map(p => 
          p.id === prodId ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
        )
      };
    }));
  };

  const updatePrice = (catId: string, prodId: number, newPrice: string) => {
    const price = parseInt(newPrice) || 0;
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        products: cat.products.map(p => 
          p.id === prodId ? { ...p, price: price } : p
        )
      };
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, catId: string, productId: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        const newCats = categories.map(cat => {
          if (cat.id !== catId) return cat;
          return {
            ...cat,
            products: cat.products.map(p => 
              p.id === productId ? { ...p, image: base64Image } : p
            )
          };
        });
        setCategories(newCats);
        localStorage.setItem('imported_categories', JSON.stringify(newCats));
        showSuccess("Image enregistrée automatiquement !");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = () => {
    localStorage.setItem('imported_categories', JSON.stringify(categories));
    setIsEditMode(false);
    showSuccess("Toutes les modifications ont été sauvegardées !");
  };

  const addToCart = (product: any) => {
    const totalProductPrice = product.price * product.quantity;
    navigate('/checkout', { 
      state: { 
        price: totalProductPrice, 
        name: `${product.quantity}x ${product.name}`,
        direction: 'Dakar -> Ballou'
      } 
    });
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
              <p className="text-gray-600">Expédition de Dakar vers Ballou.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isEditMode && (
              <Button 
                onClick={handleSaveAll} 
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-xl h-10 px-6 text-sm font-bold animate-in fade-in zoom-in-95 relative z-20 cursor-pointer"
              >
                <Save className="w-4 h-4 mr-2" /> ENREGISTRER LES MODIFICATIONS
              </Button>
            )}
            <div className="flex items-center space-x-3 bg-white p-2 px-3 rounded-xl shadow-sm border border-blue-100 relative z-10">
              <Switch id="edit-mode-imported" checked={isEditMode} onCheckedChange={setIsEditMode} className="data-[state=checked]:bg-orange-500 scale-90" />
              <Label htmlFor="edit-mode-imported" className="text-xs font-medium flex items-center cursor-pointer">
                <Edit3 className="w-3.5 h-3.5 mr-1 text-orange-600" /> Mode Édition
              </Label>
            </div>
          </div>
        </div>

        <Tabs defaultValue="importes" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 h-auto p-1 bg-blue-50">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="py-2 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                {cat.icon} {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cat.products.map(product => (
                  <Card key={product.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all bg-white group">
                    <div className="relative h-32 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {isEditMode && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <label className="cursor-pointer bg-white text-gray-900 px-3 py-1.5 rounded-full flex items-center text-xs font-bold shadow-lg">
                            <Upload className="w-3.5 h-3.5 mr-1.5" /> Changer
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, cat.id, product.id)} />
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
                                onChange={(e) => updatePrice(cat.id, product.id, e.target.value)}
                                className="h-7 w-20 text-xs font-bold px-1 border-orange-200 focus:border-orange-500"
                              />
                              <span className="text-[10px] font-bold">FCFA</span>
                            </div>
                          ) : (
                            <p className="text-lg font-bold text-blue-700 leading-none">{product.price.toLocaleString()} FCFA</p>
                          )}
                          <p className="text-[10px] text-gray-500 mt-1 truncate max-w-[80px]">{product.unit}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-blue-50 rounded-lg p-0.5">
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => updateQuantity(cat.id, product.id, -1)}>
                            <Minus className="h-2.5 w-2.5" />
                          </Button>
                          <span className="font-bold text-xs min-w-[15px] text-center">{product.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => updateQuantity(cat.id, product.id, 1)}>
                            <Plus className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pb-3 pt-0 px-4">
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs font-bold" onClick={() => addToCart(product)}>
                        <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Acheter
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