"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Truck, CheckCircle2, Clock, CalendarDays, ArrowRightLeft, Loader2 } from 'lucide-react';
import { showError } from '@/utils/toast';
import { supabase } from "@/integrations/supabase/client";

type OrderRow = {
  id: string;
  status: string;
  zone: string;
  created_at: string;
};

type TrackingStep = {
  title: string;
  description: string;
  completed: boolean;
};

const Tracking = () => {
  const [orderId, setOrderId] = useState("");
  const [trackingData, setTrackingData] = useState<{
    id: string;
    statusLabel: string;
    direction: string;
    steps: TrackingStep[];
    createdAtLabel: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const buildSteps = (order: OrderRow) => {
    const direction = order.zone === "Ballou" ? "Ballou → Dakar" : "Dakar → Ballou";

    const isPaid = ["Payé", "En cours", "Livré"].includes(order.status);
    const isShipped = ["En cours", "Livré"].includes(order.status);
    const isDelivered = order.status === "Livré";

    const steps: TrackingStep[] = [
      {
        title: "Commande enregistrée",
        description: "Votre commande a été reçue et est en attente de traitement.",
        completed: true,
      },
      {
        title: "Paiement validé",
        description: "Le paiement a été confirmé et la commande passe à l'étape suivante.",
        completed: isPaid,
      },
      {
        title: "Colis expédié",
        description: `Votre colis a quitté le point de départ (${direction}).`,
        completed: isShipped,
      },
      {
        title: "Livraison",
        description: "Le colis est livré au destinataire.",
        completed: isDelivered,
      },
    ];

    const statusLabel =
      order.status === "Attente Paiement" || order.status === "Attente de validation admin"
        ? "En attente de paiement"
        : order.status === "Payé"
          ? "Paiement validé"
          : order.status === "En cours"
            ? "En transit"
            : "Livré";

    return {
      id: order.id,
      statusLabel,
      direction,
      steps,
      createdAtLabel: new Date(order.created_at).toLocaleDateString('fr-FR'),
    };
  };

  const handleSearch = async () => {
    const trimmed = orderId.trim();
    if (!trimmed) {
      showError("Veuillez entrer un numéro de commande.");
      return;
    }

    setIsLoading(true);
    setTrackingData(null);

    try {
      // Recherche insensible à la casse pour supporter tous les formats
      const { data, error } = await supabase
        .from('orders')
        .select('id,status,zone,created_at')
        .ilike('id', trimmed)
        .maybeSingle();

      if (error || !data) {
        showError("Commande introuvable. Vérifiez votre numéro.");
        return;
      }

      setTrackingData(buildSteps(data as OrderRow));
    } catch (err) {
      showError("Une erreur est survenue lors de la recherche.");
    } finally {
      setIsLoading(false);
    }
  };

  const activeIndex = trackingData ? trackingData.steps.findIndex((s) => !s.completed) : -1;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Suivi de votre Colis</h1>
          <p className="text-gray-600">Entrez votre numéro de commande pour voir toutes les étapes.</p>
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
            onChange={(e) => setOrderId(e.target.value)}
            className="bg-white border-green-200 focus-visible:ring-green-500 h-12 font-bold"
          />
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 h-12 px-8 font-bold shadow-lg"
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
            RECHERCHER
          </Button>
        </div>

        {trackingData && (
          <Card className="border-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
            <CardHeader className="bg-green-700 text-white py-6">
              <div className="flex justify-between items-center">
                <div className="max-w-[70%]">
                  <CardTitle className="text-xl truncate">Commande {trackingData.id}</CardTitle>
                  <div className="flex items-center mt-1 text-green-100 text-sm font-medium">
                    <ArrowRightLeft className="mr-2 h-4 w-4" /> {trackingData.direction}
                    <span className="mx-2 opacity-60">•</span>
                    <span>{trackingData.createdAtLabel}</span>
                  </div>
                </div>
                <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/30 backdrop-blur-sm">
                  {trackingData.statusLabel}
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-10 pb-10 bg-white">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-1 before:bg-green-50">
                {trackingData.steps.map((step, index) => {
                  const isActive = activeIndex === index;
                  const isDone = step.completed;

                  return (
                    <div key={index} className="relative flex items-start ml-10">
                      <div
                        className={
                          "absolute -left-10 mt-1.5 h-6 w-6 rounded-full border-4 border-white shadow-md transition-all duration-300 " +
                          (isDone ? "bg-green-600 scale-110" : isActive ? "bg-orange-500" : "bg-gray-200")
                        }
                      >
                        {isDone && (
                          <CheckCircle2 className="absolute -top-1 -left-1 h-6 w-6 text-green-600 bg-white rounded-full shadow-inner" />
                        )}
                      </div>

                      <div
                        className={
                          "flex-1 p-4 rounded-xl border transition-colors " +
                          (isDone
                            ? "bg-green-50/50 border-green-100"
                            : isActive
                              ? "bg-orange-50 border-orange-100"
                              : "bg-stone-50 border-stone-100")
                        }
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h4
                            className={
                              "font-bold text-base " +
                              (isDone ? "text-gray-900" : isActive ? "text-gray-900" : "text-gray-400")
                            }
                          >
                            {step.title}
                          </h4>
                          <span
                            className={
                              "text-[10px] font-bold px-2 py-1 rounded-full border uppercase " +
                              (isDone
                                ? "text-green-600 bg-white border-green-100"
                                : isActive
                                  ? "text-orange-600 bg-white border-orange-100"
                                  : "text-gray-400 bg-white border-gray-100")
                            }
                          >
                            <Clock className="mr-1 h-3 w-3 inline" /> {isDone ? "Validé" : isActive ? "En cours" : "À venir"}
                          </span>
                        </div>
                        <p className={"text-sm " + (isDone ? "text-green-700 font-medium" : isActive ? "text-orange-700" : "text-gray-400")}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Tracking;