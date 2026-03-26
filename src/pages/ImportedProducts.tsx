import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Package, Sprout, Minus, Plus, Home, Apple, Upload, PlusCircle, Scale, Loader2, Zap, Save, Pencil } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { supabase, isCurrentUserSuperAdmin } from "@/integrations/supabase/client";

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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const canEdit = isSuperAdmin && editMode;

  const categoryIcons: Record<string, React.ReactNode> = {
    importes: <Package className="w-3.5 h-3.5 mr-1.5" />,
    frais: <Apple className="w-3.5 h-3.5 mr-1.5" />,
    semences: <Sprout className="w-3.5 h-3.5 mr-1.5" />,
    electroniques: <Zap className="w-3.5 h-3.5 mr-1.5" />
  };

  const initialCategories: Category[] = [
    {
      id: "importes",
      name: "Importés",
      products: [
        { id: 101, name: "Pomme de terre", price: 12000, unit: "sac 25kg", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 102, name: "Oignon Importé", price: 10000, unit: "sac 25kg", image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 131, name: "CHIPS PRINGLES", price: 2500, unit: "boite", image: "https://images.unsplash.com/photo-1566478431373-7821e93ee6b2?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 132, name: "CHIPS BARBECUE", price: 1500, unit: "paquet", image: "https://images.unsplash.com/photo-1566478431373-7821e93ee6b2?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 133, name: "BEURRE JADIDA", price: 1800, unit: "pot", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 134, name: "CAFE MAXWELLE 25 STICKS", price: 3500, unit: "paquet", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 135, name: "SIROP ORANGE", price: 2500, unit: "bouteille", image: "https://images.unsplash.com/photo-1600271886399-0e752047959f?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 118, name: "Nescafe importé", price: 3500, unit: "unité", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 119, name: "Couscous", price: 1000, unit: "unité", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 120, name: "Spaghetti", price: 500, unit: "unité", image: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 127, name: "Vermicelles 500g", price: 500, unit: "paquet", image: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 129, name: "QUAKER 500g", price: 2500, unit: "boite", image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 130, name: "Huile d'Olive 1L", price: 6500, unit: "bouteille 1L", image: "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 128, name: "Ketchup", price: 1500, unit: "bouteille", image: "https://images.unsplash.com/photo-1604909053197-8e4753c3a2a6?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 110, name: "Oeufs", price: 25000, unit: "carton", image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 111, name: "Sucre importé", price: 28000, unit: "sac", image: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&q=80", quantity: 1, isKg: false, basePriceSac: 28000, pricePerKg: 700 },
        { id: 114, name: "Chocolat Nutella", price: 3500, unit: "unité", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 115, name: "Mayonnaise", price: 2500, unit: "unité", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 116, name: "Sac de savon Madar", price: 15000, unit: "sac", image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 117, name: "Sac savon SABA", price: 14500, unit: "sac", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 121, name: "Coffee matte", price: 2500, unit: "unité", image: "https://images.unsplash.com/photo-1583431023233-1f3f3a3bb483?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 122, name: "Lait Dano", price: 1500, unit: "unité", image: "https://images.unsplash.com/photo-1583431023233-1f3f3a3bb483?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 123, name: "Lait Kanja", price: 1800, unit: "unité", image: "https://images.unsplash.com/photo-1583431023233-1f3f3a3bb483?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 124, name: "Nestle NIDO", price: 2800, unit: "unité", image: "https://images.unsplash.com/photo-1583431023233-1f3f3a3bb483?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 125, name: "Boite Cerelac", price: 2000, unit: "unité", image: "https://images.unsplash.com/photo-1583431023233-1f3f3a3bb483?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 126, name: "Pacque BRIDEL", price: 1200, unit: "unité", image: "https://images.unsplash.com/photo-1583431023233-1f3f3a3bb483?auto=format&fit=crop&q=80", quantity: 1 },
      ]
    },
    {
      id: "frais",
      name: "Frais",
      products: [
        { id: 210, name: "Banane", price: 1000, unit: "kg", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 216, name: "Avocat", price: 1500, unit: "kg", image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 211, name: "Pomme", price: 1500, unit: "kg", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 212, name: "Ananas", price: 1200, unit: "kg", image: "https://images.unsplash.com/photo-1550258114-b834e70e9be1?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 213, name: "Orange", price: 800, unit: "kg", image: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 214, name: "Mandarine", price: 900, unit: "kg", image: "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 215, name: "Raisin", price: 2500, unit: "kg", image: "https://images.unsplash.com/photo-1537640538966-79f369b41e8f?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 209, name: "Confumé frais", price: 2000, unit: "kg", image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 207, name: "Saucissons poulet", price: 2500, unit: "unité", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 208, name: "Saucissons viande", price: 2800, unit: "unité", image: "https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 206, name: "Fraise", price: 4500, unit: "barquette", image: "https://images.unsplash.com/photo-1464960726344-4861873193ec?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 201, name: "Poulet frais", price: 3500, unit: "unité", image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 202, name: "Poissons Séchée", price: 2500, unit: "kg", image: "https://images.unsplash.com/photo-1534604973900-c41ab4c5d010?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 203, name: "Fruit mixte", price: 4000, unit: "panier", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 204, name: "Citron", price: 1000, unit: "kg", image: "https://images.unsplash.com/photo-1585059895524-72359e06133a?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 205, name: "Feuille de menthe", price: 200, unit: "botte", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 301, name: "Jus Casamançaise BOUYE", price: 2500, unit: "bouteille", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 302, name: "Jus Casamançaise DITAX", price: 2500, unit: "bouteille", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 303, name: "Jus Casamançaise NECTAR ORANGE", price: 2500, unit: "bouteille", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 304, name: "Jus Casamançaise TROPICAL", price: 2500, unit: "bouteille", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 305, name: "Jus Casamançaise BISSAP MENTHE", price: 2500, unit: "bouteille", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 306, name: "Jus Casamançaise ANANAS", price: 2500, unit: "bouteille", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 307, name: "Jus Casamançaise GINGEMBRE", price: 2500, unit: "bouteille", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 308, name: "DON SIMON COCKTAIL", price: 2000, unit: "bouteille", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 309, name: "DON SIMON ORANGE", price: 2000, unit: "bouteille", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 310, name: "JUS BOLE MANGUE", price: 2000, unit: "bouteille", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 311, name: "JUS BOLE TROPICAL", price: 2000, unit: "bouteille", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 312, name: "NETTO BISCOTTES 6 CEREALES 300G", price: 1500, unit: "paquet", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80", quantity: 1 },
      ]
    },
    {
      id: "semences",
      name: "Semences",
      products: [
        { id: 401, name: "Semence Oignon", price: 5000, unit: "sachet", image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 402, name: "Semence Salade", price: 2500, unit: "sachet", image: "https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 403, name: "Semence Choux", price: 3000, unit: "sachet", image: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 404, name: "Semence Gombo", price: 3500, unit: "sachet", image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 405, name: "Semence Carotte", price: 4000, unit: "sachet", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 406, name: "Semence pastéque", price: 4500, unit: "sachet", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 407, name: "Semence piment", price: 3500, unit: "sachet", image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 408, name: "Semence Concombre", price: 3000, unit: "sachet", image: "https://images.unsplash.com/photo-1449339854873-750e6df51301?auto=format&fit=crop&q=80", quantity: 1 },
      ]
    },
    {
      id: "electroniques",
      name: "Matériel Électronique",
      products: [
        { id: 501, name: "Chauffe-Eau", price: 25000, unit: "unité", image: "https://images.unsplash.com/photo-1585130401366-fe05a8d813c4?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 502, name: "Mixeur Fruits", price: 15000, unit: "unité", image: "https://images.unsplash.com/photo-1570222020676-00dc3d170412?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 503, name: "Mixeur Légumes", price: 12000, unit: "unité", image: "https://images.unsplash.com/photo-1585238341267-1cfec2046a55?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 504, name: "Ventilateur", price: 18000, unit: "unité", image: "https://images.unsplash.com/photo-1618944847023-38aa001235f0?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 505, name: "TV SMART", price: 150000, unit: "unité", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80", quantity: 1 },
        { id: 506, name: "Réfrigérateur", price: 200000, unit: "unité", image: "https://images.unsplash.com/photo-1571175432270-e8a1f5ad05bb?auto=format&fit=crop&q=80", quantity: 1 },
      ]
    }
  ];

  const [categories, setCategories] = useState<Category[]>(initialCategories);

  useEffect(() => {
    const boot = async () => {
      setIsSuperAdmin(await isCurrentUserSuperAdmin());
    };
    void boot();
  }, []);

  useEffect(() => {
    const fetchAllImported = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('category', ['importes', 'frais', 'semences', 'electroniques']);

        if (error) throw error;

        if (data && data.length > 0) {
          const merged = initialCategories.map(cat => {
            const catProducts = data.filter((dp: any) => dp.category === cat.id);
            const mergedProducts = cat.products.map(p => {
              const dbP = catProducts.find((dp: any) => dp.id === String(p.id));
              return dbP ? { ...p, ...dbP, price: Number(dbP.price), quantity: 1 } : p;
            });
            return { ...cat, products: mergedProducts };
          });
          setCategories(merged);
        }
      } catch (e) {
        console.error("Erreur lecture Supabase", e);
      }
    };
    fetchAllImported();
  }, []);

  const toggleKg = (catId: string, prodId: number) => {
    if (!canEdit) return;
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
    if (!canEdit) return;
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
    if (!canEdit) return;
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
        showSuccess("Image prête pour enregistrement !");
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProduct = async (cat: Category, product: ImportedProduct) => {
    if (!canEdit) return;

    const key = `${cat.id}-${product.id}`;
    setSavingKey(key);
    try {
      const payload = {
        id: String(product.id),
        name: product.name,
        price: product.price,
        image: product.image,
        unit: product.unit,
        category: cat.id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('products')
        .upsert([payload], { onConflict: 'id' });

      if (error) throw error;
      showSuccess(`${product.name} enregistré !`);
    } catch (err: any) {
      showError("Enregistrement refusé (droits insuffisants) : " + err.message);
    } finally {
      setSavingKey(null);
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
              <h1 className="text-3xl font-bold text-blue-900 mb-4">Dakar vers Ballou</h1>
              <p className="text-gray-600">Direction : <span className="font-bold text-orange-600">Dakar vers Ballou</span></p>
            </div>
          </div>

          {isSuperAdmin && (
            <div className="flex items-center gap-3 z-50">
              <Button
                type="button"
                variant={editMode ? "default" : "outline"}
                onClick={() => setEditMode((v) => !v)}
                className={editMode ? "bg-orange-600 hover:bg-orange-700 text-white h-11 px-6 text-sm font-black" : "h-11 px-6 text-sm font-black"}
              >
                <Pencil className="w-4 h-4 mr-2" />
                {editMode ? "Mode édition : ON" : "Mode édition"}
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="importes" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1.5 bg-blue-100/50 rounded-2xl gap-2">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="py-3 text-xs md:text-sm font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all">
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
                        {(product.id === 111 || product.id === 107) && canEdit && (
                          <Button size="sm" variant="secondary" className={`h-6 px-2 text-[10px] font-black shadow-lg ${product.isKg ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-white/90 text-orange-700 hover:bg-white'}`} onClick={() => toggleKg(cat.id, product.id)}>
                            <Scale className="h-3 w-3 mr-1.5" /> {product.isKg ? 'MODE SAC' : 'MODE KG'}
                          </Button>
                        )}
                      </div>
                      {canEdit && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                          <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-full flex items-center text-xs font-black shadow-2xl transform hover:scale-105 active:scale-95 transition-all">
                            <Upload className="w-4 w-4 mr-2" /> CHANGER L'IMAGE
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, cat.id, product.id)} />
                          </label>
                        </div>
                      )}
                    </div>
                    <CardContent className="pt-4 pb-3 px-5">
                      <h3 className="font-bold text-base text-gray-900 truncate mb-1">{product.name}</h3>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          {canEdit ? (
                            <div className="flex items-center gap-1.5 bg-orange-50 p-1 rounded-lg border border-orange-100">
                              <Input type="number" value={product.price} onChange={(e) => updatePrice(cat.id, product.id, e.target.value)} className="h-8 w-full text-sm font-black px-2 border-none bg-transparent focus-visible:ring-0" />
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
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white hover:shadow-sm" onClick={() => updateQuantity(cat.id, product.id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-black text-sm min-w-[20px] text-center">{product.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white hover:shadow-sm" onClick={() => updateQuantity(cat.id, product.id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pb-4 pt-0 px-5 flex flex-col gap-2">
                      {canEdit && (
                        <Button type="button" onClick={() => saveProduct(cat, product)} disabled={savingKey === `${cat.id}-${product.id}`} className="w-full bg-orange-600 hover:bg-orange-700 h-10 text-[10px] font-black shadow-md">
                          {savingKey === `${cat.id}-${product.id}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          ENREGISTRER
                        </Button>
                      )}
                      <Button size="lg" variant="outline" className="w-full border-blue-600 text-blue-700 hover:bg-blue-50 h-10 text-[10px] font-black shadow-sm" onClick={() => handleAddToCart(product)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> AJOUTER AU PANIER
                      </Button>
                      <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-[10px] font-black shadow-md" onClick={() => handleBuyNow(product)}>
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