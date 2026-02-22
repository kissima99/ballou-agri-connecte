"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Truck, MapPin, CheckCircle2, Clock } from 'lucide-react';

const Tracking = () => {
  const [orderId, setOrderId] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);

  const handleSearch = () => {
    // Simulation de données
    setTrackingData({
      id: orderId || "BAC-7892",
      status: "En route",
      steps: [
        { location: "Dakar - Entrepôt", status: "Expédié", time: "12 Mai, 08:30", completed: true },
        { location: "Tambacounda", status: "En transit", time: "13 Mai, 14:20", completed: true },
        { location: "Bakel", status: "Arrivé au centre", time: "14 Mai, 09:15", completed: false },
        { location: "Ballou", status: "Livraison finale", time: "Prévu 15 Mai", completed: false },
      ]
    });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Suivi de Livraison</h1>
          <p className="text-gray-600">Entrez votre numéro de commande pour suivre votre colis de Dakar à Ballou.</p>
        </div>

        <div className="flex gap-2 mb-12">
          <Input 
            placeholder="Ex: BAC-123456" 
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="bg-white border-green-200 focus-visible:ring-green-500"
          />
          <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
            <Search className="mr-2 h-4 w-4" /> Suivre
          </Button>
        </div>

        {trackingData && (
          <Card className="border-none shadow-lg overflow-hidden">
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
              
              <div className="mt-10 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center">
                <Truck className="h-10 w-10 text-blue-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Estimation de livraison</p>
                  <p className="text-xs text-blue-700">Votre colis est actuellement entre Tambacounda et Bakel.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Tracking;