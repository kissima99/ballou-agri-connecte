"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Truck, MapPin, CheckCircle2, Clock, CalendarDays } from 'lucide-react';

const Tracking = () => {
  const [orderId, setOrderId] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);

  const handleSearch = () => {
    setTrackingData({
      id: orderId || "BAC-7892",
      status: "En transit (24h)",
      steps: [
        { location: "Dakar - Entrepôt", status: "Expédié", time: "Départ Programmé", completed: true },
        { location: "Tambacounda", status: "En transit", time: "En cours", completed: true },
        { location: "Bakel", status: "Prochaine étape", time: "Attendu", completed: false },
        { location: "Ballou", status: "Livraison finale", time: "Dans 24h max", completed: false },
      ]
    });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Suivi & Planning de Livraison</h1>
          <p className="text-gray-600">Les colis sont livrés en 24h selon le planning ci-dessous.</p>
        </div>

        {/* Schedule Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <Card className="border-l-4 border-l-blue-600 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center text-blue-800">
                <Truck className="mr-2 h-4 w-4" /> DAKAR vers BALLOU
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                Mardi - Jeudi - Samedi
              </div>
              <p className="text-xs text-gray-500 mt-1">Réception : 24h après le départ.</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center text-green-800">
                <Truck className="mr-2 h-4 w-4" /> BALLOU vers DAKAR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <CalendarDays className="h-4 w-4 text-green-500" />
                Lundi - Jeudi
              </div>
              <p className="text-xs text-gray-500 mt-1">Réception : 24h après le départ.</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 mb-12">
          <Input 
            placeholder="Ex: BAC-12345" 
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="bg-white border-green-200 focus-visible:ring-green-500"
          />
          <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
            <Search className="mr-2 h-4 w-4" /> Suivre
          </Button>
        </div>

        {trackingData && (
          <Card className="border-none shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="bg-green-600 text-white">
              <div className="flex justify-between items-center">
                <CardTitle>Commande {trackingData.id}</CardTitle>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {trackingData.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-green-500 before:via-green-200 before:to-transparent">
                {trackingData.steps.map((step: any, index: number) => (
                  <div key={index} className="relative flex items-start ml-10">
                    <div className={`absolute -left-10 mt-1.5 h-5 w-5 rounded-full border-4 border-white shadow ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {step.completed && <CheckCircle2 className="absolute -top-1 -left-1 h-5 w-5 text-green-500 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={`font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.location}</h4>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="mr-1 h-3 w-3" /> {step.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{step.status}</p>
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