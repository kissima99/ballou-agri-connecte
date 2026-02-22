"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Truck, ShoppingBag, ArrowRight, ShieldCheck, PhoneCall, HeartHandshake, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-green-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80" 
            alt="Agriculture" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative px-4 mx-auto text-center">
          <Badge className="bg-orange-500 text-white mb-6 px-4 py-1 text-sm font-bold border-none shadow-lg">Plateforme n°1 à Ballou</Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Connecter Ballou au Monde</h1>
          <p className="text-xl mb-10 text-green-100 max-w-2xl mx-auto leading-relaxed">
            Écoulez vos produits locaux vers Dakar ou commandez vos besoins essentiels en toute sécurité avec un suivi en temps réel.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-none h-14 px-8 text-lg font-bold shadow-xl transition-all hover:scale-105">
              <Link to="/local-products">Vendre mes produits</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur text-white border-white/20 hover:bg-white/20 h-14 px-8 text-lg font-bold transition-all hover:scale-105">
              <Link to="/imported-products">Commander de Dakar</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Support Banner */}
      <div className="bg-orange-500 text-white py-4">
        <div className="container px-4 mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
          <div className="flex items-center gap-3">
            <PhoneCall className="h-6 w-6 animate-pulse" />
            <span className="font-bold text-lg">Support 24/7 : 77 225 45 48</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6" />
            <span className="font-medium">Assistance garantie jour et nuit</span>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <section className="py-20 container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
            <CardContent className="pt-8 pb-8 px-8">
              <div className="rounded-2xl bg-green-100 w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                <Leaf className="h-8 w-8 text-green-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Produits de Ballou</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Soutenez les agriculteurs locaux. Riz, Oignon, Sorgho et Patate douce livrés vers Dakar.</p>
              <Button asChild variant="ghost" className="p-0 h-auto font-bold text-green-600 hover:text-green-700 hover:bg-transparent">
                <Link to="/local-products">Vendre ou Acheter <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group border-t-4 border-t-blue-500">
            <CardContent className="pt-8 pb-8 px-8">
              <div className="rounded-2xl bg-blue-100 w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <ShoppingBag className="h-8 w-8 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Besoins de Dakar</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Pomme de terre, huile, lait, semences et fraises fraîches livrés directement à Ballou.</p>
              <Button asChild variant="ghost" className="p-0 h-auto font-bold text-blue-600 hover:text-blue-700 hover:bg-transparent">
                <Link to="/imported-products">Commander <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group border-t-4 border-t-orange-500">
            <CardContent className="pt-8 pb-8 px-8">
              <div className="rounded-2xl bg-orange-100 w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                <Truck className="h-8 w-8 text-orange-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Suivi 24h Garanti</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Suivez votre colis de Dakar à Ballou (Mar/Jeu/Sam) ou de Ballou à Dakar (Lun/Jeu).</p>
              <Button asChild variant="ghost" className="p-0 h-auto font-bold text-orange-600 hover:text-orange-700 hover:bg-transparent">
                <Link to="/tracking">Suivre mon colis <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-20 bg-stone-100 border-y">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-orange-600 mb-4 font-bold uppercase tracking-wider text-sm">
                <HeartHandshake className="h-5 w-5" /> Service Support 24/7
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">Besoin d'aide pour votre commande ?</h2>
              <p className="text-gray-600 text-lg mb-8">Notre équipe est disponible à tout moment pour répondre à vos questions sur les livraisons, les paiements ou les produits.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-2xl font-bold text-green-700">
                  <div className="bg-green-100 p-3 rounded-2xl"><PhoneCall className="h-8 w-8" /></div>
                  Appelez le : 77 225 45 48
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 bg-stone-50 p-6 rounded-2xl border-2 border-dashed border-stone-200 text-center">
              <p className="text-sm font-bold text-gray-400 mb-4 uppercase">Temps de réponse</p>
              <div className="text-5xl font-black text-orange-500 mb-2">{'<'} 5 min</div>
              <p className="text-xs text-gray-500 font-medium">Réponse instantanée par appel ou WhatsApp</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;