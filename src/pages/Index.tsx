"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Truck, ShoppingBag, ArrowRight, ShieldCheck, PhoneCall, HeartHandshake, Clock, Star, CheckCircle2, Users, Headphones, Navigation, Bike } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

const MotorcycleIcon = ({ className }: { className?: string }) => (
  <Bike className={className} />
);

const Index = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden bg-green-950 text-white">
          <div className="absolute inset-0 opacity-10">
            <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80" alt="Agriculture" className="w-full h-full object-cover" />
          </div>
          <div className="container relative px-4 mx-auto text-center">
            <Badge className="bg-orange-500/20 text-orange-400 mb-6 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-500/30">
              <Star className="h-3 w-3 mr-2 fill-orange-400" /> Plateforme n°1 à Ballou
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              BALLOU AGRI <span className="text-orange-500">CONNECT</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 text-green-100/80 max-w-2xl mx-auto font-medium">
              L'excellence agricole de Ballou livrée à Dakar, et vos besoins essentiels livrés chez vous en 24h.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 h-14 px-8 text-lg font-bold rounded-2xl shadow-xl">
                <Link to="/local-products">Vendre mes produits</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/5 text-white border-white/20 hover:bg-white/10 h-14 px-8 text-lg font-bold rounded-2xl">
                <Link to="/imported-products">Acheter de Dakar</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Thiak-Thiak */}
        <section className="py-8 container px-4 mx-auto -mt-12 relative z-10">
          <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-4 rounded-2xl text-orange-600">
                  <MotorcycleIcon className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Besoin d'un Thiak-Thiak ?</h2>
                  <p className="text-gray-500 text-sm">Course rapide à Ballou en un clic.</p>
                </div>
              </div>
              <Button asChild className="bg-orange-600 hover:bg-orange-700 h-12 px-8 font-bold rounded-xl shadow-lg w-full md:w-auto">
                <Link to="/thiak-thiak">COMMANDER <Navigation className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Features */}
        <section className="py-20 container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Produits de Ballou", desc: "Riz, Oignons, Sorgho expédiés vers Dakar.", icon: <Leaf className="h-8 w-8" />, color: "green", link: "/local-products" },
              { title: "Besoins de Dakar", desc: "Huile, lait, semences livrés à Ballou.", icon: <ShoppingBag className="h-8 w-8" />, color: "blue", link: "/imported-products" },
              { title: "Suivi 24h Réel", desc: "Suivez votre colis en temps réel.", icon: <Truck className="h-8 w-8" />, color: "orange", link: "/tracking" }
            ].map((f, i) => (
              <Card key={i} className="border-none shadow-sm bg-white hover:shadow-md transition-all rounded-3xl p-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${f.color}-100 text-${f.color}-600`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm mb-6">{f.desc}</p>
                <Button asChild variant="link" className={`p-0 text-${f.color}-600 font-bold`}>
                  <Link to={f.link}>Découvrir <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;