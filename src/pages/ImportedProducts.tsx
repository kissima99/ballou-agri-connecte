"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Package, Sprout, Minus, Plus, Home, Apple, Edit3, Save, Upload, PlusCircle, Scale } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

interface ImportedProduct {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
  isKg?: boolean;
  basePriceSac?: number;
  pricePerKg?: number;
}

interface Category {
  id: string;
  name: string;
  products: ImportedProduct[];
}

const ImportedProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isEditMode, setIsEditMode] = useState(false);

  const categoryIcons: Record<string, React.ReactNode> = {
    importes: <Package className="w-3.5 h-3.5 mr-1.5" />,
    frais: <Apple className="w-3.5 h-3.5 mr-1.5" />,
    semences: <Sprout className="w-3.5 h-3.5 mr-1.5" />
  };

  const initialCategories: Category[] = [
    {
      id: "importes",
      name: "Importés",
      products: [
        { id: 101, name: "Pomme de terre", price: 12000, unit: "sac 25kg", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 102, name: "Oignon Importé", price: 10000, unit: "sac 25kg", image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 118, name: "Nescafe importé", price: 3500, unit: "unité", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 119, name: "Couscous", price: 1000, unit: "unité", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 120, name: "Spaghetti", price: 500, unit: "unité", image: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 110, name: "Oeufs", price: 25000, unit: "carton", image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 111, name: "Sucre importé", price: 28000, unit: "sac", image: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&q=80", quantity: 1, isKg: false, basePriceSac: 28000, pricePerKg: 700 },
        { id: 114, name: "Chocolat Nutella", price: 3500, unit: "unité", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 115, name: "Mayonnaise", price: 2500, unit: "unité", image: "https://images.unsplash.com/photo-1585325701166-381996df2961?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 116, name: "Sac de savon Madar", price: 15000, unit: "sac", image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 117, name: "Sac de savon Sabar", price: 14500, unit: "sac", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 112, name: "Chips barbecue", price: 1000, unit: "unité", image: "https://images.unsplash.com/photo-1566478431373-7821e93ee6b2?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 113, name: "Chips boite", price: 1500, unit: "unité", image: "https://images.unsplash.com/photo-1613919113166-ca5978963843?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 103, name: "Bidon Huile 1L", price: 1500, unit: "unité", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 104, name: "Huile de palme 1L", price: 1800, unit: "unité", image: "https://images.unsplash.com/photo-1620706122100-616af41e0b97?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 105, name: "Sceau de pâte d'arachide", price: 4500, unit: "unité", image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 106, name: "Sac de Sel", price: 3500, unit: "sac", image: "https://images.unsplash.com/photo-1518110168401-f74b77f5aa14?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 107, name: "Sac de Lait en poudre", price: 25000, unit: "sac", image: "https://images.unsplash.com/photo-1550583724-125581f77833?auto=format&fit=crop&q=80", quantity: 1, isKg: false, basePriceSac: 25000, pricePerKg: 1200 },
        { id: 108, name: "Carton de lait liquide", price: 12000, unit: "carton", image: "https://images.unsplash.com/photo-1563636619-e9107da5a1bb?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 109, name: "Miel", price: 5000, unit: "litre", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80", quantity: 1 },
      ]
    },
    {
      id: "frais",
      name: "Frais",
      products: [
        { id: 210, name: "Banane", price: 1000, unit: "kg", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 211, name: "Pomme", price: 1500, unit: "kg", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 212, name: "Ananas", price: 1200, unit: "kg", image: "https://images.unsplash.com/photo-1550258114-b834e70e9be1?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 213, name: "Orange", price: 800, unit: "kg", image: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 214, name: "Mandarine", price: 900, unit: "kg", image: "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 215, name: "Raisin", price: 2500, unit: "kg", image: "https://images.unsplash.com/photo-1537640538966-79f369b41e8f?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 209, name: "Confumé frais", price: 2000, unit: "unité", image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 207, name: "Saucissons poulet", price: 2500, unit: "unité", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 208, name: "Saucissons viande", price: 2800, unit: "unité", image: "https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?auto=format&fit=crop&q=80", quantity: 1 },
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

  const [categories, setCategories] = useState<Category[]>(initialCategories);

  useEffect(() => {
    const saved = localStorage.getItem('imported_categories');
    if (saved) {
      try {
        const savedCats = JSON.parse(saved);
        const merged = initialCategories.map(cat => {
          const savedCat = savedCats.find((sc: any) => sc.id === cat.id);
          if (!savedCat) return cat;
          const mergedProducts = cat.products.map(p => {
            const savedP = savedCat.products.find((sp: any) => sp.id === p.id);
            return savedP ? { ...p, ...savedP } : p;
          });
          return { ...cat, products: mergedProducts };
        });
        setCategories(merged);
      } catch (e) {
        console.error("Erreur lecture localStorage", e);
      }
    }
  }, []);

  const toggleKg = (catId: string, prodId: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        products: cat.products.map(p => {
          if (p.id === prodId) {
            const newIsKg = !p.isKg;
            return {
              ...p,
              isKg: newIsKg,
              unit: newIsKg ? "kg" : "sac",
              price: newIsKg ? (p.pricePerKg || 1000) : (p.basePriceSac || 25000)
            };
          }
          return p;
        })
      };
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('imported_categories', JSON.stringify(categories));
      showSuccess("Catalogue mis à jour !");
      setIsEditMode(false);
    } catch (err) {
      showError("Erreur lors de l'enregistrement.");
    }
  };

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
        showSuccess("Image enregistrée !");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = (product: ImportedProduct) => {
    addToCart({
      id: `imported-${product.id}-${product.unit}`,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      image: product.image,
      direction: 'Dakar -> Ballou',
      unit: product.unit
    });
    showSuccess(`${product.name} (${product.unit}) ajouté au panier !`);
  };

  const handleBuyNow = (product: ImportedProduct) => {
    handleAddToCart(product);
    navigate('/cart');
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
              <p className="text-gray-600">Direction : <span className="font-bold text-orange-600">Dakar vers Ballou</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 z-50">
            {isEditMode && (
              <Button 
                type="button"
                onClick={handleSave} 
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-2xl h-11 px-8 text-sm font-black"
              >
                <Save className="w-5 h-5 mr-2" /> SAUVEGARDER LES PRIX
              </Button>
            )}
            <div className="flex items-center space-x-3 bg-white p-2.5 px-4 rounded-xl shadow-md border border-blue-200">
              <Switch 
                id="edit-mode-imported" 
                checked={isEditMode} 
                onCheckedChange={setIsEditMode} 
                className="data-[state=checked]:bg-orange-500" 
              />
              <Label htmlFor="edit-mode-imported" className="text-sm font-bold flex items-center cursor-pointer select-none">
                <Edit3 className="w-4 h-4 mr-2 text-orange-600" /> Mode Édition
              </Label>
            </div>
          </div>
        </div>

        <Tabs defaultValue="importes" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 h-auto p-1.5 bg-blue-100/50 rounded-2xl">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id} 
                className="py-3 text-sm font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all"
              >
                {categoryIcons[cat.id]} {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {cat.products.map(product => (
                  <Card key={product.id} className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all bg-white group rounded-2xl">
                    <div className="relative h-40 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {(product.id === 111 || product.id === 107) && (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className={`h-6 px-2 text-[10px] font-black shadow-lg ${product.isKg ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-white/90 text-orange-700 hover:bg-white'}`}
                            onClick={() => toggleKg(cat.id, product.id)}
                          >
                            <Scale className="h-3 w-3 mr-1.5" /> {product.isKg ? 'MODE SAC' : 'MODE KG'}
                          </Button>
                        )}
                      </div>
                      {isEditMode && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                          <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-full flex items-center text-xs font-black shadow-2xl transform hover:scale-105 active:scale-95 transition-all">
                            <Upload className="w-4 h-4 mr-2" /> CHANGER L'IMAGE
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, cat.id, product.id)} />
                          </label>
                        </div>
                      )}
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
                                onChange={(e) => updatePrice(cat.id, product.id, e.target.value)}
                                className="h-8 w-full text-sm font-black px-2 border-none bg-transparent focus-visible:ring-0"
                              />
                              <span className="text-[10px] font-black text-orange-700 pr-1">FCFA</span>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xl font-black text-blue-700 leading-none">{product.price.toLocaleString()} FCFA</p>
                            </div>
                          )}
                          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{product.unit}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-lg hover:bg-white hover:shadow-sm" 
                            onClick={() => updateQuantity(cat.id, product.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-black text-sm min-w-[20px] text-center">{product.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-lg hover:bg-white hover:shadow-sm" 
                            onClick={() => updateQuantity(cat.id, product.id, 1)}
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
                        className="w-full border-blue-600 text-blue-700 hover:bg-blue-50 h-10 text-[10px] font-black shadow-sm" 
                        onClick={() => handleAddToCart(product)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> AJOUTER AU PANIER
                      </Button>
                      <Button 
                        size="lg" 
                        className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-[10px] font-black shadow-md" 
                        onClick={() => handleBuyNow(product)}
                      >
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