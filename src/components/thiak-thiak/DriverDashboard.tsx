"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Phone, Loader2, AlertCircle, Banknote, Truck } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const MotorcycleIcon = ({ className }: { className?: string }) => (
  <img 
    src="https://cdn-icons-png.flaticon.com/512/2830/2830305.png" 
    alt="Moto Thiak-Thiak" 
    className={className}
    style={{ filter: 'hue-rotate(340deg) saturate(5)' }}
  />
);

const DriverDashboard = ({ user, profile }: { user: any, profile: any }) => {
  const [isAvailable, setIsAvailable] = useState(profile?.is_available ?? true);
  const [pendingRides, setPendingRides] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRides = async () => {
    // On récupère les données sans jointure pour éviter l'erreur de relation
    const { data: pending } = await supabase
      .from('rides')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    setPendingRides(pending || []);

    const { data: active } = await supabase
      .from('rides')
      .select('*')
      .eq('driver_id', user.id)
      .in('status', ['accepted', 'picked_up'])
      .maybeSingle();
    
    setActiveRide(active);
    setLoading(false);
  };

  useEffect(() => {
    fetchRides();
    const channel = supabase.channel('driver-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => fetchRides()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user.id]);

  const toggleAvailability = async (checked: boolean) => {
    setIsAvailable(checked);
    await supabase.from('profiles').update({ is_available: checked }).eq('id', user.id);
    showSuccess(checked ? "En ligne !" : "Hors ligne.");
  };

  const acceptRide = async (rideId: string) => {
    const { error } = await supabase.from('rides').update({ driver_id: user.id, status: 'accepted' }).eq('id', rideId).eq('status', 'pending');
    if (error) showError("Indisponible.");
    else showSuccess("Acceptée !");
  };

  const updateStatus = async (rideId: string, newStatus: string) => {
    await supabase.from('rides').update({ status: newStatus }).eq('id', rideId);
    showSuccess("Mis à jour.");
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg rounded-3xl bg-white">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MotorcycleIcon className={`w-8 h-8 ${isAvailable ? '' : 'grayscale opacity-50'}`} />
            <h3 className="font-black">Mode Travail</h3>
          </div>
          <Switch checked={isAvailable} onCheckedChange={toggleAvailability} />
        </CardContent>
      </Card>

      {activeRide && (
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden border-2 border-green-500">
          <CardHeader className="bg-green-600 text-white p-6">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeRide.service_type === "MOTO-TAXI" ? <MotorcycleIcon className="w-6 h-6 bg-white p-1 rounded" /> : <Truck className="w-6 h-6 bg-white p-1 rounded text-green-600" />}
                <span>{activeRide.service_type}</span>
              </div>
              <Badge className="bg-white/20 text-white border-none">{activeRide.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between">
              <h4 className="text-xl font-black">{activeRide.customer_name || "Client"}</h4>
              <Button asChild variant="outline"><a href={`tel:${activeRide.phone}`}><Phone className="w-4 h-4 mr-2" /> Appeler</a></Button>
            </div>
            <div className="bg-orange-50 p-3 rounded-xl flex items-center gap-2 text-orange-700 font-bold text-sm">
              <Banknote className="h-4 w-4" /> Paiement Cash à la fin
            </div>
            <div className="grid grid-cols-2 gap-3">
              {activeRide.status === 'accepted' && <Button onClick={() => updateStatus(activeRide.id, 'picked_up')} className="bg-blue-600">RÉCUPÉRÉ</Button>}
              {activeRide.status === 'picked_up' && <Button onClick={() => updateStatus(activeRide.id, 'completed')} className="bg-green-600 col-span-2">TERMINER</Button>}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-black flex items-center gap-2"><AlertCircle className="w-5 h-5 text-orange-500" /> Disponibles ({pendingRides.length})</h3>
        {isAvailable && pendingRides.map((ride) => (
          <Card key={ride.id} className="border-none shadow-md rounded-3xl bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between mb-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    {ride.service_type === "MOTO-TAXI" ? <MotorcycleIcon className="w-4 h-4" /> : <Truck className="w-4 h-4 text-blue-600" />}
                    <span className="text-xs font-black uppercase text-gray-400">{ride.service_type}</span>
                  </div>
                  <span className="font-bold">{ride.pickup_location} → {ride.destination}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase">Prix</span>
                  <p className="font-black text-orange-600">{ride.price} F</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase mb-4">
                <Banknote className="h-3 w-3" /> Paiement Cash après course
              </div>
              <Button onClick={() => acceptRide(ride.id)} disabled={!!activeRide} className="w-full bg-green-600 font-black">ACCEPTER</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DriverDashboard;