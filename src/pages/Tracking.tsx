"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Truck, MapPin, CheckCircle2, Clock, CalendarDays, ArrowRightLeft, Loader2 } from 'lucide-react';
import { showError } from '@/utils/toast';
import { supabase } from "@/integrations/supabase/client";

const Tracking = () => {
  const [orderId, setOrderId] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!orderId) {
      showError("Veuillez entrer un numéro de commande.");
      return;
    }

    setIsSearching(true);
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        showError("Commande introuvable. Vérifiez votre numéro (ex: BAC-XXXXXX).");
        setTrackingData(null);
        return;
      }

      // Déterminer la direction basée sur les items ou par défaut
      // On regarde si un item contient "local" dans son ID (stocké dans le JSON items)
      const hasLocalItems = order.items?.some((item: any) => String(item.id).includes('local'));
      const direction = hasLocalItems ? "Ballou -> Dakar" : "Dakar -> Ballou";
      
      const status = order.status || "En attente";
      
      // Logique de complétion des étapes
      const getCompletion = (stepIndex: number) => {
        if (status === "Livré") return true;
        if (status === "En cours") return stepIndex <= 2;
        if (status === "Payé" || status.includes("validation")) return stepIndex <= 0;
        return false;
      };

      const steps = direction === "Dakar -> Ballou" 
        ? [
            { location: "Dakar - Entrepôt", status: "Colis Réceptionné", time: "Départ Programmé", completed: getCompletion(0) },
            { location: "Tambacounda", status: "En Transit", time: "En cours", completed: getCompletion(1) },
            { location: "Bakel", status: "Vérification Poste", time: "Bientôt", completed: getCompletion(2) },
            { location: "Ballou", status: "Livraison Finale", time: "Arrivée sous 24h", completed: getCompletion(3) },
          ]
        : [
            { location: "Ballou - Poste Locale", status: "Colis Réceptionné", time: "Expédié", completed: getCompletion(0) },
            { location: "Bakel", status: "Transit Régional", time: "Passage en cours", completed: getCompletion(1) },
            { location: "Tambacounda", status: "Transit National", time: "Bientôt", completed: getCompletion(2) },
            { location: "Dakar - Hub Central", status: "Livraison Finale", time: "Arrivée sous 24h", completed: getCompletion(3) },
          ];

      setTrackingData({
        id: order.id,
        status: status,
        direction: direction,
        steps: steps
      });
    } catch (err) {
      showError("Une erreur est survenue lors de la recherche.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Suivi de votre Colis</h1>
          <p className="text-gray-600">Entrez votre numéro de commande BAC-XXXXX pour voir l'état réel.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <Card className="border-l-4 border-l-blue-600 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center text-blue-800 uppercase tracking-wider font-bold">
                <Truck className="mr-2 h-4 w-4" /> DAKAR vers BALLOU
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                Mardi - Jeudi - Samedi
              </div>
              <p className="text-[11px] text-gray-500 mt-1 uppercase">Réception garantie sous 24h après expédition.</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center text-green-800 uppercase tracking-wider font-bold">
                <Truck className="mr-2 h-4 w-4" /> BALLOU vers DAKAR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <CalendarDays className="h-4 w-4 text-green-500" />
                Lundi - Jeudi
              </div>
              <p className="text-[11px] text-gray-500 mt-1 uppercase">Réception garantie sous 24h après expédition.</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 mb-12">
          <Input 
            placeholder="Ex: BAC-7F92A" 
            value={orderId}
            onChange={(e) => setOrderId(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-white border-green-200 focus-visible:ring-green-500 h-12 font-bold"
          />
          <Button onClick={handleSearch} disabled={isSearching} className="bg-green-600 hover:bg-green-700 h-12 px-8 font-bold shadow-lg">
            {isSearching ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
            RECHERCHER
          </Button>
        </div>

        {trackingData && (
          <Card className="border-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
            <CardHeader className="bg-green-700 text-white py-6">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Commande {trackingData.id}</CardTitle>
                  <div className="flex items-center mt-1 text-green-100 text-sm font-medium">
                    <ArrowRightLeft className="mr-2 h-4 w-4" /> {trackingData.direction}
                  </div>
                </div>
                <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/30 backdrop-blur-sm">
                  {trackingData.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-10 pb-10 bg-white">
              <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-1 before:bg-green-50">
                {trackingData.steps.map((step: any, index: number) => (
                  <div key={index} className="relative flex items-start ml-10 group">
                    <div className={`absolute -left-10 mt-1.5 h-6 w-6 rounded-full border-4 border-white shadow-md transition-all duration-300 ${step.completed ? 'bg-green-600 scale-110' : 'bg-gray-200'}`}>
                      {step.completed && <CheckCircle2 className="absolute -top-1 -left-1 h-6 w-6 text-green-600 bg-white rounded-full shadow-inner" />}
                    </div>
                    <div className={`flex-1 p-4 rounded-xl border transition-colors ${step.completed ? 'bg-green-50/50 border-green-100 group-hover:border-green-200' : 'bg-stone-50 border-stone-100'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={`font-bold text-base ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.location}</h4>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border uppercase ${step.completed ? 'text-green-600 bg-white border-green-100' : 'text-gray-400 bg-white border-gray-100'}`}>
                          <Clock className="mr-1 h-3 w-3 inline" /> {step.completed ? 'Validé' : step.time}
                        </span>
                      </div>
                      <p className={`text-sm ${step.completed ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{step.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Tracking;