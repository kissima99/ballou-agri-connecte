"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Loader2, AlertCircle, User, Save, CheckCircle2, Navigation } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MotorcycleIcon = ({ className }: { className?: string }) => (
  <img src="https://cdn-icons-png.flaticon.com/512/2830/2830305.png" alt="Moto" className={className} style={{ filter: 'hue-rotate(340deg) saturate(5)' }} />
);

const DriverDashboard = ({ user, profile: initialProfile }: { user: any, profile: any }) => {
  const [isAvailable, setIsAvailable] = useState(initialProfile?.is_available ?? true);
  const [fullName, setFullName] = useState(initialProfile?.full_name || "");
  const [phoneNumber, setPhoneNumber] = useState(initialProfile?.phone_number || "");
  const [pendingRides, setPendingRides] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fetchData = async () => {
    const { data: pending } = await supabase.from('rides').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    setPendingRides(pending || []);

    const { data: active } = await supabase.from('rides').select('*').eq('driver_id', user.id).in('status', ['accepted', 'picked_up']).maybeSingle();
    setActiveRide(active);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('driver-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user.id]);

  const acceptRide = async (rideId: string) => {
    try {
      const { error } = await supabase.from('rides').update({ driver_id: user.id, status: 'accepted' }).eq('id', rideId).eq('status', 'pending');
      if (error) throw error;
      showSuccess("Course acceptée !");
      fetchData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const updateStatus = async (rideId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('rides').update({ status: newStatus }).eq('id', rideId);
      if (error) throw error;
      showSuccess("Statut mis à jour.");
      fetchData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const toggleAvailability = async (checked: boolean) => {
    setIsAvailable(checked);
    await supabase.from('profiles').update({ is_available: checked }).eq('id', user.id);
    showSuccess(checked ? "En ligne" : "Hors ligne");
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-600" /></div>;

  return (
    <div className="space-y-8">
      {/* Profil Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-xl rounded-[2rem] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <MotorcycleIcon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900">Disponibilité</h3>
                <p className="text-xs text-gray-500">{isAvailable ? "Vous recevez des demandes" : "Vous êtes en pause"}</p>
              </div>
              <Switch checked={isAvailable} onCheckedChange={toggleAvailability} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Ride with Map */}
      {activeRide && (
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden border-4 border-green-500">
          <CardHeader className="bg-green-600 text-white p-6">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>COURSE EN COURS</span>
              <Badge className="bg-white/20 text-white border-none">{activeRide.status.toUpperCase()}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {activeRide.pickup_lat && activeRide.pickup_lng && (
              <div className="h-64 w-full rounded-3xl overflow-hidden border-2 border-stone-100 shadow-inner">
                <MapContainer center={[activeRide.pickup_lat, activeRide.pickup_lng]} zoom={16} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[activeRide.pickup_lat, activeRide.pickup_lng]}>
                    <Popup>Position du client : {activeRide.customer_name}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Client</p>
                <h4 className="text-2xl font-black text-gray-900">{activeRide.customer_name}</h4>
              </div>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold h-14 px-8">
                <a href={`tel:${activeRide.phone}`}><Phone className="w-5 h-5 mr-2" /> APPELER</a>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeRide.status === 'accepted' && (
                <Button onClick={() => updateStatus(activeRide.id, 'picked_up')} className="h-16 bg-blue-600 rounded-2xl font-black text-lg">CLIENT RÉCUPÉRÉ</Button>
              )}
              {activeRide.status === 'picked_up' && (
                <Button onClick={() => updateStatus(activeRide.id, 'completed')} className="h-16 bg-green-600 rounded-2xl font-black text-lg col-span-full">TERMINER LA COURSE</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Rides */}
      <div className="space-y-4">
        <h3 className="text-xl font-black flex items-center gap-2"><AlertCircle className="w-6 h-6 text-orange-500" /> Demandes à proximité</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingRides.map((ride) => (
            <Card key={ride.id} className="border-none shadow-md hover:shadow-xl transition-all rounded-[2rem] bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-gray-900 text-lg">{ride.pickup_location} → {ride.destination}</h4>
                    {ride.pickup_lat && <Badge className="bg-blue-100 text-blue-700 border-none mt-2">POSITION GPS DISPONIBLE</Badge>}
                  </div>
                  <p className="font-black text-2xl text-green-700">{ride.price} F</p>
                </div>
                <Button onClick={() => acceptRide(ride.id)} disabled={!!activeRide} className="w-full h-14 bg-green-600 rounded-2xl font-black text-lg">ACCEPTER</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;