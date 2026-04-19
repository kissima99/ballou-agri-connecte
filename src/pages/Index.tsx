"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  Truck, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  PhoneCall, 
  HeartHandshake, 
  Clock,
  Star,
  CheckCircle2,
  Users,
  Headphones,
  Navigation,
  Bike,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

const motorcycleImg = "dyad-media://media/e-commerce-ballou/.dyad/media/b8530d84e9f7c05e101a5cbc360e8cd1.png";

const MotorcycleIcon = ({ className }: { className?: string }) => (
  <img src={motorcycleImg} alt="Thiak-Thiak" className={className} />
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
        <section className="relative py-24 md:py-40 overflow-hidden bg-green-950 text-white">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80" 
              alt="Agriculture Ballou" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-950/50 to-green-950"></div>
          
          <div className="container relative px-4 mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 text-orange-400 mb-8 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em]">
              <Star className="h-3 w-3 fill-orange-400" /> Plateforme n°1 à Ballou
            </div>
            <h1 className="text-6xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.85]">
              BALLOU AGRI <br/><span className="text-orange-500">CONNECT</span>
            </h1>
            <p className="text-xl md:text-3xl mb-12 text-green-100/80 max-w-4xl mx-auto leading-relaxed font-medium">
              L'excellence agricole de Ballou livrée à Dakar, et vos besoins essentiels de la capitale livrés chez vous en 24h.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-none h-20 px-12 text-2xl font-black shadow-2xl transition-all hover:scale-105 rounded-3xl">
                <Link to="/local-products">Vendre mes produits</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/5 backdrop-blur-xl text-white border-white/20 hover:bg-white/10 h-20 px-12 text-2xl font-black transition-all hover:scale-105 rounded-3xl">
                <Link to="/imported-products">Acheter de Dakar</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Thiak-Thiak Action */}
        <section className="py-12 container px-4 mx-auto -mt-20 relative z-10">
          <Card className="bg-white border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[3rem] overflow-hidden">
            <CardContent className="p-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-8">
                <div className="bg-orange-100 p-6 rounded-[2.5rem] border border-orange-200 shadow-inner">
                  <MotorcycleIcon className="w-24 h-24" />
                </div>
                <div>
                  <Badge className="bg-orange-100 text-orange-700 border-none mb-2 font-black px-3 py-1">SERVICE EXPRESS</Badge>
                  <h2 className="text-4xl font-black tracking-tight text-gray-900">Besoin d'un Thiak-Thiak ?</h2>
                  <p className="text-gray-500 text-lg font-medium">Commandez une course rapide à Ballou en un clic.</p>
                </div>
              </div>
              <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-white h-20 px-12 text-2xl font-black rounded-3xl shadow-xl w-full lg:w-auto">
                <Link to="/thiak-thiak">COMMANDER <Navigation className="ml-3 h-8 w-8" /></Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Main Features */}
        <section className="py-32 container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">Un écosystème complet</h2>
            <p className="text-gray-500 text-xl font-medium">Nous simplifions les échanges commerciaux entre la région de Tambacounda et la capitale.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Card className="border-none shadow-sm bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 group rounded-[3rem] overflow-hidden">
              <CardContent className="pt-16 pb-16 px-12">
                <div className="rounded-3xl bg-green-100 w-24 h-24 flex items-center justify-center mb-10 group-hover:bg-green-600 group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                  <Leaf className="h-12 w-12 text-green-600 group-hover:text-white" />
                </div>
                <h3 className="text-4xl font-black mb-6 text-gray-900">Produits de Ballou</h3>
                <p className="text-gray-500 mb-10 text-lg leading-relaxed font-medium">Riz de la vallée, Oignons, Sorgho et Patate douce. Le meilleur de notre terre expédié vers Dakar.</p>
                <Button asChild variant="ghost" className="p-0 h-auto font-black text-green-600 hover:text-green-700 hover:bg-transparent text-xl">
                  <Link to="/local-products" className="flex items-center">Voir le catalogue <ArrowRight className="ml-2 h-6 w-6" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 group rounded-[3rem] overflow-hidden border-t-8 border-t-blue-500">
              <CardContent className="pt-16 pb-16 px-12">
                <div className="rounded-3xl bg-blue-100 w-24 h-24 flex items-center justify-center mb-10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 -rotate-3 group-hover:rotate-0">
                  <ShoppingBag className="h-12 w-12 text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-4xl font-black mb-6 text-gray-900">Besoins de Dakar</h3>
                <p className="text-gray-500 mb-10 text-lg leading-relaxed font-medium">Pomme de terre, huile, lait, semences et produits frais. Tout ce dont vous avez besoin, livré à Ballou.</p>
                <Button asChild variant="ghost" className="p-0 h-auto font-black text-blue-600 hover:text-blue-700 hover:bg-transparent text-xl">
                  <Link to="/imported-products" className="flex items-center">Commander <ArrowRight className="ml-2 h-6 w-6" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 group rounded-[3rem] overflow-hidden border-t-8 border-t-orange-500">
              <CardContent className="pt-16 pb-16 px-12">
                <div className="rounded-3xl bg-orange-100 w-24 h-24 flex items-center justify-center mb-10 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 rotate-6 group-hover:rotate-0">
                  <Truck className="h-12 w-12 text-orange-600 group-hover:text-white" />
                </div>
                <h3 className="text-4xl font-black mb-6 text-gray-900">Suivi 24h Réel</h3>
                <p className="text-gray-500 mb-10 text-lg leading-relaxed font-medium">Suivez votre colis en temps réel. Départs réguliers : Mar/Jeu/Sam vers Ballou, Lun/Jeu vers Dakar.</p>
                <Button asChild variant="ghost" className="p-0 h-auto font-black text-orange-600 hover:text-orange-700 hover:bg-transparent text-xl">
                  <Link to="/tracking" className="flex items-center">Suivre mon colis <ArrowRight className="ml-2 h-6 w-6" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-32 bg-stone-100 border-y">
          <div className="container px-4 mx-auto">
            <div className="max-w-7xl mx-auto bg-white rounded-[4rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row items-stretch">
              <div className="lg:w-1/2 bg-green-950 flex flex-col items-center justify-center p-20 text-white text-center">
                <div className="w-56 h-56 bg-white/5 rounded-full flex items-center justify-center mb-10 border-8 border-white/10">
                  <Headphones className="w-32 h-32 text-orange-500" />
                </div>
                <h3 className="text-4xl font-black mb-4 tracking-tighter">CENTRE D'APPEL</h3>
                <p className="text-green-100/60 text-xl font-medium">BALLOU AGRI CONNECT</p>
                <div className="mt-10 bg-orange-500 px-8 py-3 rounded-full font-black text-sm animate-pulse tracking-widest">LIGNE DIRECTE</div>
              </div>
              <div className="lg:w-1/2 p-16 md:p-24 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-orange-600 mb-8 font-black uppercase tracking-[0.3em] text-sm">
                  <HeartHandshake className="h-6 w-6" /> Service Client 24/7
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-10 leading-[1.05] tracking-tight">Besoin d'aide pour votre commande ?</h2>
                <p className="text-gray-500 text-2xl mb-12 font-medium leading-relaxed">Notre équipe locale est disponible à tout moment pour répondre à vos questions.</p>
                
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="flex items-center gap-6 bg-stone-50 p-8 rounded-[3rem] border border-stone-100 flex-1">
                    <div className="bg-green-100 p-5 rounded-3xl text-green-600 shadow-sm"><PhoneCall className="h-10 w-10" /></div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Appelez-nous</p>
                      <p className="text-3xl font-black text-gray-900 leading-tight">78 225 45 48</p>
                      <p className="text-3xl font-black text-gray-900 leading-tight">77 459 76 41</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 bg-stone-50 p-8 rounded-[3rem] border border-stone-100 flex-1">
                    <div className="bg-orange-100 p-5 rounded-3xl text-orange-600 shadow-sm"><Clock className="h-10 w-10" /></div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Réponse sous</p>
                      <p className="text-4xl font-black text-gray-900">{'<'} 5 min</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-32 container px-4 mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                <ShieldCheck className="h-10 w-10 text-green-600 group-hover:text-white" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2">Paiement Sécurisé</h4>
              <p className="text-gray-500 font-medium">Wave & Orange Money</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <Truck className="h-10 w-10 text-blue-600 group-hover:text-white" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2">Livraison 24h</h4>
              <p className="text-gray-500 font-medium">Dakar ↔ Ballou</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                <CheckCircle2 className="h-10 w-10 text-orange-600 group-hover:text-white" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2">Qualité Garantie</h4>
              <p className="text-gray-500 font-medium">Produits frais & locaux</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                <Users className="h-10 w-10 text-purple-600 group-hover:text-white" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2">Support Local</h4>
              <p className="text-gray-500 font-medium">Équipe basée à Ballou</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;