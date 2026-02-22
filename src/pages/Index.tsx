"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Truck, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-green-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80" 
            alt="Agriculture" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative px-4 mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Connecter Ballou au Monde Agricole</h1>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
            La plateforme unique pour écouler vos produits locaux et commander vos besoins depuis Dakar en toute sécurité.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-none">
              <Link to="/local-products">Vendre mes produits</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur text-white border-white/20 hover:bg-white/20">
              <Link to="/imported-products">Commander de Dakar</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mb-4">
                <Leaf className="text-green-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Produits Locaux</h3>
              <p className="text-gray-600 mb-4">Soutenez les agriculteurs de Ballou en achetant directement leurs récoltes fraîches.</p>
              <Link to="/local-products" className="text-green-600 font-medium flex items-center hover:underline">
                Voir le marché <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                <ShoppingBag className="text-blue-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Produits importé de Dakar vers Ballou</h3>
              <p className="text-gray-600 mb-4">Commandez n'importe quel produit à Dakar et faites-vous livrer directement à Ballou.</p>
              <Link to="/imported-products" className="text-blue-600 font-medium flex items-center hover:underline">
                Commander <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="rounded-full bg-orange-100 w-12 h-12 flex items-center justify-center mb-4">
                <Truck className="text-orange-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Suivi en Temps Réel</h3>
              <p className="text-gray-600 mb-4">Suivez votre colis étape par étape, du départ de Dakar jusqu'à votre porte à Ballou.</p>
              <Link to="/tracking" className="text-orange-600 font-medium flex items-center hover:underline">
                Suivre mon colis <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-12 bg-stone-100">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">Paiements Sécurisés</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-2">W</div>
              <span className="text-sm font-medium">Wave</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-2">OM</div>
              <span className="text-sm font-medium">Orange Money</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-2">C</div>
              <span className="text-sm font-medium">Cash</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;