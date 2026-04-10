"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Loader2,
  Badge,
} from "lucide-react";
import { showError } from "@/utils/toast";
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
  const channelRef = useRef<any>(null);

  const buildSteps = (order: OrderRow) => {
    const direction = order.zone === "Ballou" ? "Ballou → Dakar" : "Dakar → Ballou";

    const isPaid = ["Payé", "Expédié", "Livré"].includes(order.status);
    const isShipped = ["Expédié", "Livré"].includes(order.status);
    const isDelivered = order.status === "Livré";

    const steps: TrackingStep[] = [
      {
        title: "Commande enregistrée",
        description: "Votre commande a été reçue et est en attente de traitement.",
        completed: true,
      },
      {
        title: "Paiement validé",
        description: "Le paiement a été confirmé par l'administrateur.",
        completed: isPaid,
      },
      {
        title: "Colis expédié",
        description: `Votre colis a quitté le point de départ (${direction}).`,
        completed: isShipped,
      },
      {
        title: "Livraison effectuée",
        description: "Le colis a été remis au destinataire avec succès.",
        completed: isDelivered,
      },
    ];

    return {
      id: order.id,
      statusLabel: order.status,
      direction,
      steps,
      createdAtLabel: new Date(order.created_at).toLocaleDateString("fr-FR"),
    };
  };

  const fetchOrder = async (id: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select("id,status,zone,created_at")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      showError("Commande introuvable. Vérifiez votre numéro.");
      return null;
    }
    return data as OrderRow;
  };

  const handleSearch = async () => {
    const trimmed = orderId.trim();
    if (!trimmed) {
      showError("Veuillez entrer un numéro de commande.");
      return;
    }

    setIsLoading(true);
    setTrackingData(null);

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const order = await fetchOrder(trimmed);
    if (order) {
      setTrackingData(buildSteps(order));

      const channel = supabase
        .channel(`order-updates-${order.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `id=eq.${order.id}`,
          },
          async () => {
            const updated = await fetchOrder(order.id);
            if (updated) setTrackingData(buildSteps(updated));
          }
        )
        .subscribe();

      channelRef.current = channel;
    }

    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const activeIndex =
    trackingData?.steps.findIndex((s) => !s.completed) ?? -1;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-4">
            Suivi de votre Colis
          </h1>
          <p className="text-gray-500 font-medium">
            Entrez votre numéro de commande pour voir l'avancement en temps réel.
          </p>
        </div>

        <div className="flex gap-2 mb-12">
          <Input
            placeholder="Ex: BAC-7F92A"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="bg-white border-green-200 focus-visible:ring-green-500 h-14 font-bold rounded-2xl shadow-sm"
          />
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 h-14 px-8 font-black rounded-2xl shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Search className="mr-2 h-5 w-5" />
            )}
            RECHERCHER
          </Button>
        </div>

        {trackingData && (
          <Card className="border-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500 rounded-[2.5rem]">
            <CardHeader className="bg-green-900 text-white py-8 px-10">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-black">
                    Commande {trackingData.id}
                  </CardTitle>
                  <div className="flex items-center mt-2 text-green-100 text-sm font-bold">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />{" "}
                    {trackingData.direction}
                    <span className="mx-3 opacity-40">|</span>
                    <span>{trackingData.createdAtLabel}</span>
                  </div>
                </div>
                <Badge className="bg-orange-500 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border-none shadow-lg">
                  {trackingData.statusLabel}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-12 pb-12 px-10 bg-white">
              <div className="relative space-y-10 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-1 before:bg-stone-100">
                {trackingData.steps.map((step, index) => {
                  const isActive = activeIndex === index;
                  const isDone = step.completed;

                  return (
                    <div key={index} className="relative flex items-start ml-10">
                      <div
                        className={
                          "absolute -left-10 mt-1.5 h-6 w-6 rounded-full border-4 border-white shadow-md transition-all duration-500 " +
                          (isDone
                            ? "bg-green-600 scale-110"
                            : isActive
                            ? "bg-orange-500 animate-pulse"
                            : "bg-stone-200")
                        }
                      >
                        {isDone && (
                          <CheckCircle2 className="absolute -top-1 -left-1 h-6 w-6 text-green-600 bg-white rounded-full" />
                        )}
                      </div>

                      <div
                        className={
                          "flex-1 p-6 rounded-3xl border transition-all duration-300 " +
                          (isDone
                            ? "bg-green-50/30 border-green-100"
                            : isActive
                            ? "bg-orange-50 border-orange-100 shadow-md"
                            : "bg-stone-50/50 border-stone-100 opacity-60")
                        }
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4
                            className={
                              "font-black text-lg " +
                              (isDone
                                ? "text-gray-900"
                                : isActive
                                ? "text-gray-900"
                                : "text-gray-400")
                            }
                          >
                            {step.title}
                          </h4>
                          {isDone && (
                            <Badge className="bg-green-600 text-white text-[10px] font-black">
                              TERMINÉ
                            </Badge>
                          )}
                        </div>
                        <p
                          className={
                            "text-sm font-medium " +
                            (isDone
                              ? "text-green-700"
                              : isActive
                              ? "text-orange-700"
                              : "text-gray-400")
                          }
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