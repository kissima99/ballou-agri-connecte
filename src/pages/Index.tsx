"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
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
  Headphones
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-green-900 text-white">
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80" 
            alt="Agriculture Ballou" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative px-4 mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 text-orange-400 mb-8 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            <Star className="h-3 w-3 fill-orange-400" /> Plateforme n°1 à Ballou
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
            BALLOU AGRI <span className="text-orange-500">CONNECT</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-green-100 max-w-3xl mx-auto leading-relaxed font-medium">
            L'excellence agricole de Ballou livrée à Dakar, et vos besoins essentiels de la capitale livrés chez vous en 24h.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-none h-16 px-10 text-xl font-black shadow-2xl transition-all hover:scale-105 rounded-2xl">
              <Link to="/local-products">Vendre mes produits</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-xl text-white border-white/20 hover:bg-white/20 h-16 px-10 text-xl font-black transition-all hover:scale-105 rounded-2xl">
              <Link to="/imported-products">Acheter de Dakar</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-24 container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Un écosystème complet</h2>
          <p className="text-gray-500 text-lg font-medium">Nous simplifions les échanges commerciaux entre la région de Tambacounda et la capitale.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-none shadow-sm bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 group rounded-[2.5rem] overflow-hidden">
            <CardContent className="pt-12 pb-12 px-10">
              <div className="rounded-3xl bg-green-100 w-20 h-20 flex items-center justify-center mb-8 group-hover:bg-green-600 group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                <Leaf className="h-10 w-10 text-green-600 group-hover:text-white" />
              </div>
              <h3 className="text-3xl font-black mb-4 text-gray-900">Produits de Ballou</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-medium">Riz de la vallée, Oignons, Sorgho et Patate douce. Le meilleur de notre terre expédié vers Dakar.</p>
              <Button asChild variant="ghost" className="p-0 h-auto font-black text-green-600 hover:text-green-700 hover:bg-transparent text-lg">
                <Link to="/local-products" className="flex items-center">Voir le catalogue <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 group rounded-[2.5rem] overflow-hidden border-t-8 border-t-blue-500">
            <CardContent className="pt-12 pb-12 px-10">
              <div className="rounded-3xl bg-blue-100 w-20 h-20 flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 -rotate-3 group-hover:rotate-0">
                <ShoppingBag className="h-10 w-10 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-3xl font-black mb-4 text-gray-900">Besoins de Dakar</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-medium">Pomme de terre, huile, lait, semences et produits frais. Tout ce dont vous avez besoin, livré à Ballou.</p>
              <Button asChild variant="ghost" className="p-0 h-auto font-black text-blue-600 hover:text-blue-700 hover:bg-transparent text-lg">
                <Link to="/imported-products" className="flex items-center">Commander <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 group rounded-[2.5rem] overflow-hidden border-t-8 border-t-orange-500">
            <CardContent className="pt-12 pb-12 px-10">
              <div className="rounded-3xl bg-orange-100 w-20 h-20 flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 rotate-6 group-hover:rotate-0">
                <Truck className="h-10 w-10 text-orange-600 group-hover:text-white" />
              </div>
              <h3 className="text-3xl font-black mb-4 text-gray-900">Suivi 24h Réel</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-medium">Suivez votre colis en temps réel. Départs réguliers : Mar/Jeu/Sam vers Ballou, Lun/Jeu vers Dakar.</p>
              <Button asChild variant="ghost" className="p-0 h-auto font-black text-orange-600 hover:text-orange-700 hover:bg-transparent text-lg">
                <Link to="/tracking" className="flex items-center">Suivre mon colis <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Support Section with Call Center Logo */}
      <section className="py-24 bg-stone-100 border-y">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row items-stretch">
            <div className="lg:w-1/2 bg-green-900 flex flex-col items-center justify-center p-20 text-white text-center">
              <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center mb-8 border-4 border-white/20">
                <Headphones className="w-24 h-24 text-orange-500" />
              </div>
              <h3 className="text-3xl font-black mb-4">CENTRE D'APPEL</h3>
              <p className="text-green-100 font-medium">BALLOU AGRI CONNECT</p>
              <div className="mt-8 bg-orange-500 px-6 py-2 rounded-full font-black text-sm animate-pulse">LIGNE DIRECTE</div>
            </div>
            <div className="lg:w-1/2 p-12 md:p-20 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-orange-600 mb-6 font-black uppercase tracking-widest text-sm">
                <HeartHandshake className="h-6 w-6" /> Service Client 24/7
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-[1.1]">Besoin d'aide pour votre commande ?</h2>
              <p className="text-gray-500 text-xl mb-10 font-medium leading-relaxed">Notre équipe locale est disponible à tout moment pour répondre à vos questions.</p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-center gap-4 bg-stone-50 p-6 rounded-[2rem] border border-stone-100 flex-1">
                  <div className="bg-green-100 p-4 rounded-2xl text-green-600"><PhoneCall className="h-8 w-8" /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Appelez-nous</p>
                    <p className="text-2xl font-black text-gray-900 leading-tight">78 225 45 48</p>
                    <p className="text-2xl font-black text-gray-900 leading-tight">77 459 76 41</p>
                    <p className="text-2xl font-black text-gray-900 leading-tight">78 325 52 47</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-stone-50 p-6 rounded-[2rem] border border-stone-100 flex-1">
                  <div className="bg-orange-100 p-4 rounded-2xl text-orange-600"><Clock className="h-8 w-8" /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Réponse sous</p>
                    <p className="text-2xl font-black text-gray-900">{'<'} 5 min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="h-12 w-12 text-green-600 mb-4" />
            <h4 className="font-black text-gray-900 mb-2">Paiement Sécurisé</h4>
            <p className="text-sm text-gray-500 font-medium">Wave & Orange Money</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Truck className="h-12 w-12 text-blue-600 mb-4" />
            <h4 className="font-black text-gray-900 mb-2">Livraison 24h</h4>
            <p className="text-sm text-gray-500 font-medium">Dakar ↔ Ballou</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="h-12 w-12 text-orange-600 mb-4" />
            <h4 className="font-black text-gray-900 mb-2">Qualité Garantie</h4>
            <p className="text-sm text-gray-500 font-medium">Produits frais & locaux</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Users className="h-12 w-12 text-purple-600 mb-4" />
            <h4 className="font-black text-gray-900 mb-2">Support Local</h4>
            <p className="text-sm text-gray-500 font-medium">Équipe basée à Ballou</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;