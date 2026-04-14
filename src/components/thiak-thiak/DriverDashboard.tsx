"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Loader2, AlertCircle, Navigation, Map as MapIcon } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Copy the transparent motorcycle image to src/assets/motorcycle.png
// Then import it normally (Vite will handle the asset)
import motorcycleImg from '@/assets/motorcycle.png';

// Fix for default marker icons in Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to update map view
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 16);
  return null;
}

// Icon for the motorcycle using the imported transparent image
const MotorcycleIcon = ({ className }: { className?: string }) => (
  <img src={motorcycleImg} alt="Moto" className={className} style={{ filter: 'hue-rotate(340deg) saturate(5)' }} />
);

const DriverDashboard = ({ user, profile: initialProfile }: { user: any, profile: any }) => {
  const [isAvailable, setIsAvailable] = useState(initialProfile?.is_available ?? true);
  const [pendingRides, setPendingRides] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // Get pending rides
    const { data: pending } = await supabase
      .from('rides')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setPendingRides(pending || []);

    // Get active ride for this driver
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
    fetchData();

    // Listen for real-time updates on rides
    const channel = supabase
      .channel('driver-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  const acceptRide = async (rideId: string) => {
    try {
      const { error } = await supabase
        .from('rides')
        .update({ driver_id: user.id, status: 'accepted' })
        .eq('id', rideId)
        .eq('status', 'pending');

      if (error) throw error;
      showSuccess('Course acceptée !');
      fetchData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const updateStatus = async (rideId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('rides')
        .update({ status: newStatus })
        .eq('id', rideId);

      if (error) throw error;
      showSuccess('Statut mis à jour.');
      fetchData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const toggleAvailability = async (checked: boolean) => {
    setIsAvailable(checked);
    await supabase.from('profiles').update({ is_available: checked }).eq('id', user.id);
    showSuccess(checked ? 'Vous êtes maintenant en ligne' : 'Vous êtes maintenant hors ligne');
  };

  if (loading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="animate-spin text-green-600" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Profile & Availability */}
      <Card className="border-none shadow-xl rounded-[2rem] bg-white">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <MotorcycleIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-gray-900">Ma Disponibilité</h3>
              <p className="text-xs text-gray-500">{isAvailable ? "En ligne - Prêt à rouler" : "Hors ligne - En pause"}</p>
            </div>
          </div>
          <Switch checked={isAvailable} onCheckedChange={toggleAvailability} />
        </CardContent>
      </Card>

      {/* Active Ride */}
      {activeRide && (
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden border-4 border-green-500 animate-in fade-in zoom-in duration-300">
          <CardHeader className="bg-green-600 text-white p-6">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2"><Navigation className="h-5 w-5" /> MISSION EN COURS</span>
              <Badge className="bg-white/20 text-white border-none font-black">{activeRide.status.toUpperCase()}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* GPS Map */}
            {activeRide.pickup_lat && activeRide.pickup_lng ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
                  <span>Position GPS du client</span>
                  <Badge variant="outline" className="text-[10px] border-green-200 text-green-700">PRÉCIS</Badge>
                </div>
                <div className="h-64 w-full rounded-3xl overflow-hidden border-2 border-stone-100 shadow-inner relative z-0">
                  <MapContainer
                    key={activeRide.id}
                    center={[activeRide.pickup_lat, activeRide.pickup_lng]}
                    zoom={16}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[activeRide.pickup_lat, activeRide.pickup_lng]}>
                      <Popup>Client : {activeRide.customer_name}</Popup>
                    </Marker>
                    <ChangeView center={[activeRide.pickup_lat, activeRide.pickup_lng]} />
                  </MapContainer>
                </div>
              </div>
            ) : (
              <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl p-8 text-center">
                <MapIcon className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-500">Pas de coordonnées GPS</p>
                <p className="text-xs text-gray-400">Utilisez l'adresse textuelle ci-dessous.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</p>
                  <h4 className="text-2xl font-black text-gray-900">{activeRide.customer_name}</h4>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-orange-500 shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trajet</p>
                    <p className="font-bold text-gray-700">{activeRide.pickup_location} <span className="text-orange-500">→</span> {activeRide.destination}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-3">
                <Button asChild size="lg" className="h-16 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-lg shadow-lg">
                  <a href={`tel:${activeRide.phone}`}>
                    <Phone className="w-6 h-6 mr-2" />
                    APPELER LE CLIENT
                  </a>
                </Button>
                {activeRide.status === 'accepted' && (
                  <Button onClick={() => updateStatus(activeRide.id, 'picked_up')} className="h-16 bg-orange-600 hover:bg-orange-700 rounded-2xl font-black text-lg">
                    CLIENT RÉCUPÉRÉ
                  </Button>
                )}
                {activeRide.status === 'picked_up' && (
                  <Button onClick={() => updateStatus(activeRide.id, 'completed')} className="h-16 bg-green-600 hover:bg-green-700 rounded-2xl font-black text-lg">
                    TERMINER LA COURSE
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Rides */}
      <div className="space-y-4">
        <h3 className="text-xl font-black flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-orange-500" />
          Demandes à proximité
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingRides.length === 0 ? (
            <Card className="col-span-full p-12 text-center border-none shadow-sm bg-white rounded-3xl">
              <p className="text-gray-400 font-medium">Aucune demande en attente pour le moment.</p>
            </Card>
          ) : (
            pendingRides.map((ride) => (
              <Card key={ride.id} className="border-none shadow-md hover:shadow-xl transition-all rounded-[2rem] bg-white overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-orange-100 text-orange-700 border-none text-[10px] font-black">{ride.service_type}</Badge>
                        {ride.pickup_lat && <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-black">GPS</Badge>}
                      </div>
                      <h4 className="font-black text-gray-900 text-lg leading-tight">{ride.pickup_location} <span className="text-orange-500">→</span> {ride.destination}</h4>
                    </div>
                    <p className="font-black text-2xl text-green-700">{ride.price} F</p>
                  </div>
                  <Button
                    onClick={() => acceptRide(ride.id)}
                    disabled={!!activeRide}
                    className="w-full h-14 bg-green-600 hover:bg-green-700 rounded-2xl font-black text-lg shadow-md group-hover:scale-[1.02] transition-transform"
                  >
                    ACCEPTER LA COURSE
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;