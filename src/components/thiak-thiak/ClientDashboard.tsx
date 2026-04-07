"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Phone, Loader2, CheckCircle2, Banknote, Info, User as UserIcon } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const ClientDashboard = ({ user }: { user: any, profile: any }) => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const fetchActiveRide = async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('*, driver:driver_id(full_name, phone_number)')
        .eq('client_id', user.id)
        .in('status', ['pending', 'accepted', 'picked_up'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!error && data) setActiveRide(data);
    };

    fetchActiveRide();

    const channel = supabase
      .channel('client-rides')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides', filter: `client_id=eq.${user.id}` }, 
      () => {
        fetchActiveRide();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleRequestRide = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pickup || !destination) {
      showError("Veuillez remplir les lieux.");
      return;
    }

    if (!user && (!customerName || !customerPhone)) {
      showError("Veuillez remplir votre nom et téléphone.");
      return;
    }

    setIsSubmitting(true);
    try {
      const rideData = {
        client_id: user?.id || null,
        customer_name: user ? null : customerName,
        phone: user ? null : customerPhone,
        pickup_location: pickup,
        destination: destination,
        price: 500,
        status: 'pending'
      };

      const { error } = await supabase
        .from('rides')
        .insert([rideData]);

      if (error) throw error;
      
      showSuccess("Demande envoyée au Super Admin !");
      setPickup("");
      setDestination("");
      setCustomerName("");
      setCustomerPhone("");
      
      if (!user) {
        // Pour les anonymes, on affiche un message de confirmation spécial
        setActiveRide({ status: 'pending', pickup_location: pickup, destination: destination, is_anonymous: true });
      }
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (activeRide) {
    return (
      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="bg-orange-600 text-white p-8">
          <CardTitle className="flex items-center justify-between">
            <span>{activeRide.is_anonymous ? "Demande envoyée" : "Course en cours"}</span>
            <Badge className="bg-white/20 text-white border-white/30 uppercase text-[10px]">
              {activeRide.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-600"><MapPin className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">De : {activeRide.pickup_location}</p>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">À : {activeRide.destination}</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3 text-green-800">
            <Banknote className="h-5 w-5 shrink-0" />
            <p className="text-sm font-bold">Paiement : Cash après la course</p>
          </div>

          {activeRide.driver ? (
            <div className="p-6 border-2 border-green-100 rounded-3xl bg-green-50/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold text-green-600 uppercase mb-1">Chauffeur trouvé !</p>
                  <h3 className="text-xl font-black text-gray-900">{activeRide.driver.full_name || "Chauffeur Ballou"}</h3>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <Button asChild className="w-full h-14 bg-green-600 hover:bg-green-700 rounded-2xl font-bold text-lg shadow-lg">
                <a href={`tel:${activeRide.driver.phone_number}`}>
                  <Phone className="mr-2 h-6 w-6" /> APPELER LE CHAUFFEUR
                </a>
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="font-bold text-gray-900">
                {activeRide.is_anonymous 
                  ? "Le Super Admin a reçu votre demande. Un chauffeur va vous rappeler." 
                  : "Recherche d'un chauffeur..."}
              </p>
              {activeRide.is_anonymous && (
                <Button onClick={() => setActiveRide(null)} variant="outline" className="mt-6 rounded-xl">
                  Nouvelle demande
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
      <CardHeader className="bg-orange-900 text-white p-8">
        <CardTitle className="text-xl">Où allez-vous ?</CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Banknote className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">Tarif Ballou</span>
            </div>
            <p className="text-lg font-black text-gray-900">À partir de 500 FCFA</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Hors Ballou : À discuter</p>
          </div>
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Info className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">Paiement</span>
            </div>
            <p className="text-lg font-black text-gray-900">Cash après course</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Directement au livreur</p>
          </div>
        </div>

        <form onSubmit={handleRequestRide} className="space-y-6">
          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-4">
              <div className="space-y-2">
                <Label className="font-bold text-blue-900 flex items-center gap-2">
                  <UserIcon className="h-4 w-4" /> Votre Nom
                </Label>
                <Input 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  placeholder="Ex: Moussa" 
                  className="h-12 rounded-xl border-blue-200 bg-white" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-blue-900 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Votre Téléphone
                </Label>
                <Input 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  placeholder="Ex: 77 123 45 67" 
                  className="h-12 rounded-xl border-blue-200 bg-white" 
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Lieu de départ</Label>
            <Input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Ex: Marché de Ballou" className="h-14 rounded-2xl" required />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Destination</Label>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ex: Gare routière" className="h-14 rounded-2xl" required />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-orange-600 font-black text-xl rounded-2xl shadow-lg hover:bg-orange-700 transition-all">
            {isSubmitting ? <Loader2 className="animate-spin" /> : "COMMANDER LA COURSE"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientDashboard;