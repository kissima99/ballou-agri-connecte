"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Loader2, AlertCircle, Navigation, Map as MapIcon, Volume2, BellRing, BellOff } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// URL d'un son de notification plus percutant
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 16);
  return null;
}

const DriverDashboard = ({ user, profile: initialProfile }: { user: any, profile: any }) => {
  const [isAvailable, setIsAvailable] = useState(initialProfile?.is_available ?? true);
  const [pendingRides, setPendingRides] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialisation du son
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.load(); // Pré-chargement
  }, []);

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Recommencer au début
      audioRef.current.play().catch(e => {
        console.error("[Audio] Lecture bloquée par le navigateur", e);
        setAudioEnabled(false);
      });
    }
  };

  const enableAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current?.pause(); // Jouer et mettre en pause immédiatement pour "débloquer"
        setAudioEnabled(true);
        showSuccess("Alertes sonores activées !");
      }).catch(err => {
        showError("Impossible d'activer le son. Cliquez à nouveau.");
      });
    }
  };

  const fetchData = async () => {
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
    fetchData();

    const channel = supabase
      .channel('driver-realtime-alerts')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'rides' }, 
        (payload) => {
          if (payload.new.status === 'pending') {
            playNotification();
            showSuccess("NOUVELLE COURSE DISPONIBLE !");
            fetchData();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rides' },
        (payload) => {
          if (payload.new.status === 'pending' && payload.old.status !== 'pending') {
            playNotification();
            showSuccess("Une course est repassée en attente !");
          }
          fetchData();
        }
      )
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
    showSuccess(checked ? 'Vous êtes en ligne' : 'Vous êtes hors ligne');
  };

  if (loading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="animate-spin text-green-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Audio Activation Alert */}
      {!audioEnabled && (
        <Card className="border-none shadow-lg bg-orange-600 text-white rounded-2xl overflow-hidden animate-pulse">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BellOff className="h-6 w-6" />
              <p className="text-sm font-bold">Le son est désactivé par votre navigateur.</p>
            </div>
            <Button 
              onClick={enableAudio} 
              className="bg-white text-orange-600 hover:bg-stone-100 font-black rounded-xl h-10"
            >
              ACTIVER LE SON
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Profile & Availability */}
      <Card className="border-none shadow-md rounded-2xl bg-white">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Disponibilité</h3>
              <p className="text-[10px] text-gray-500">{isAvailable ? "En ligne" : "Hors ligne"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {audioEnabled && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={playNotification} 
                className="text-green-600 hover:bg-green-50"
                title="Tester le son"
              >
                <BellRing className="h-5 w-5" />
              </Button>
            )}
            <Switch checked={isAvailable} onCheckedChange={toggleAvailability} />
          </div>
        </CardContent>
      </Card>

      {/* Active Ride */}
      {activeRide && (
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden border-2 border-green-500">
          <CardHeader className="bg-green-600 text-white p-5">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2 uppercase tracking-wider font-black">Mission en cours</span>
              <Badge className="bg-white/20 text-white border-none text-[10px]">{activeRide.status.toUpperCase()}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {activeRide.pickup_lat && activeRide.pickup_lng ? (
              <div className="h-48 w-full rounded-2xl overflow-hidden border border-stone-100 shadow-inner relative z-0">
                <MapContainer
                  key={activeRide.id}
                  center={[activeRide.pickup_lat, activeRide.pickup_lng]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[activeRide.pickup_lat, activeRide.pickup_lng]}>
                    <Popup>{activeRide.customer_name}</Popup>
                  </Marker>
                  <ChangeView center={[activeRide.pickup_lat, activeRide.pickup_lng]} />
                </MapContainer>
              </div>
            ) : (
              <div className="bg-stone-50 border border-dashed border-stone-200 rounded-2xl p-6 text-center">
                <MapIcon className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-500">Pas de GPS disponible</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Client</p>
                  <h4 className="text-xl font-black text-gray-900">{activeRide.customer_name}</h4>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Prix</p>
                  <p className="text-xl font-black text-green-700">{activeRide.price} F</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-stone-50 p-4 rounded-2xl">
                <MapPin className="h-4 w-4 text-orange-500 shrink-0 mt-1" />
                <p className="text-sm font-bold text-gray-700">{activeRide.pickup_location} → {activeRide.destination}</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button asChild className="h-12 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-md">
                  <a href={`tel:${activeRide.phone}`}><Phone className="w-4 h-4 mr-2" /> APPELER LE CLIENT</a>
                </Button>
                {activeRide.status === 'accepted' && (
                  <Button onClick={() => updateStatus(activeRide.id, 'picked_up')} className="h-12 bg-orange-600 hover:bg-orange-700 rounded-xl font-bold">
                    CLIENT RÉCUPÉRÉ
                  </Button>
                )}
                {activeRide.status === 'picked_up' && (
                  <Button onClick={() => updateStatus(activeRide.id, 'completed')} className="h-12 bg-green-600 hover:bg-green-700 rounded-xl font-bold">
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
        <h3 className="text-lg font-black flex items-center gap-2 px-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Demandes en attente
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {pendingRides.length === 0 ? (
            <Card className="p-10 text-center border-none shadow-sm bg-white rounded-2xl">
              <p className="text-gray-400 text-sm font-medium">Aucune demande pour le moment.</p>
            </Card>
          ) : (
            pendingRides.map((ride) => (
              <Card key={ride.id} className="border-none shadow-md hover:shadow-lg transition-all rounded-2xl bg-white overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-orange-100 text-orange-700 border-none text-[10px] font-black">{ride.service_type}</Badge>
                        {ride.pickup_lat && <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-black">GPS</Badge>}
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{ride.pickup_location} → {ride.destination}</h4>
                    </div>
                    <p className="font-black text-lg text-green-700">{ride.price} F</p>
                  </div>
                  <Button
                    onClick={() => acceptRide(ride.id)}
                    disabled={!!activeRide}
                    className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl font-bold shadow-sm"
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