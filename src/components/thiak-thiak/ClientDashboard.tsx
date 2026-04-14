"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Phone, Loader2, CheckCircle2, Info, User as UserIcon, Truck, LocateFixed } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

// Import Leaflet components
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
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

const motorcycleImg = "dyad-media://media/e-commerce-ballou/.dyad/media/b8530d84e9f7c05e101a5cbc360e8cd1.png";

const WotoroIcon = ({ className }: { className?: string }) => <Truck className={className} />;
const MotorcycleIcon = ({ className }: { className?: string }) => (
  <img src={motorcycleImg} alt="Moto" className={className} />
);

// Component to update map view
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 16);
  return null;
}

const ClientDashboard = ({ user }: { user: any, profile: any }) => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [serviceType, setServiceType] = useState<"MOTO-TAXI" | "WOTORO-TIGUI">("MOTO-TAXI");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);
  
  // GPS State
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

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
    const channel = supabase.channel('client-rides').on('postgres_changes', { event: '*', schema: 'public', table: 'rides', filter: `client_id=eq.${user.id}` }, () => fetchActiveRide()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const handleGetLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      showError("La géolocalisation n'est pas supportée par votre navigateur.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation([position.coords.latitude, position.coords.longitude]);
        setIsLocating(false);
        showSuccess("Position récupérée avec succès !");
      },
      (error) => {
        showError("Impossible de récupérer votre position. Vérifiez vos permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleRequestRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !destination || !customerPhone) {
      showError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsSubmitting(true);
    try {
      const rideData = {
        client_id: user?.id || null,
        customer_name: customerName || (user ? user.email?.split('@')[0] : "Client"),
        phone: customerPhone,
        pickup_location: pickup,
        destination: destination,
        service_type: serviceType,
        price: serviceType === "MOTO-TAXI" ? 300 : 1000,
        status: 'pending',
        pickup_lat: location ? location[0] : null,
        pickup_lng: location ? location[1] : null
      };

      const { error } = await supabase.from('rides').insert([rideData]);
      if (error) throw error;
      
      showSuccess("Demande envoyée !");
      setPickup("");
      setDestination("");
      setActiveRide({ ...rideData, status: 'pending' });
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
            <div className="flex items-center gap-3">
              {activeRide.service_type === "MOTO-TAXI" ? <MotorcycleIcon className="w-8 h-8 bg-white p-1 rounded-lg" /> : <WotoroIcon className="w-8 h-8 bg-white p-1 rounded-lg text-orange-600" />}
              <span>{activeRide.service_type}</span>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 uppercase text-[10px]">{activeRide.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-white animate-pulse">
              <Phone className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-blue-900">Veuillez patienter</h3>
            <p className="text-blue-700 font-medium">Un chauffeur va vous appeler sur le <strong>{activeRide.phone}</strong>.</p>
          </div>

          {activeRide.driver && (
            <div className="p-6 border-2 border-green-100 rounded-3xl bg-green-50/30">
              <h3 className="text-xl font-black text-gray-900 mb-4">{activeRide.driver.full_name || "Chauffeur Ballou"}</h3>
              <Button asChild className="w-full h-14 bg-green-600 hover:bg-green-700 rounded-2xl font-bold text-lg shadow-lg">
                <a href={`tel:${activeRide.driver.phone_number}`}><Phone className="mr-2 h-6 w-6" /> APPELER LE CHAUFFEUR</a>
              </Button>
            </div>
          )}
          <Button onClick={() => setActiveRide(null)} variant="ghost" className="w-full text-gray-400 text-xs font-bold">RETOUR</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
      <CardHeader className="bg-orange-900 text-white p-8">
        <CardTitle className="text-xl">Réserver un transport GPS</CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button type="button" onClick={() => setServiceType("MOTO-TAXI")} className={`flex flex-col items-center p-6 rounded-[2rem] border-2 transition-all ${serviceType === "MOTO-TAXI" ? "border-orange-600 bg-orange-50 shadow-lg" : "border-stone-100 bg-white"}`}>
            <div className={`p-4 rounded-2xl mb-3 ${serviceType === "MOTO-TAXI" ? "bg-orange-600 text-white" : "bg-stone-100 text-stone-400"}`}><MotorcycleIcon className="w-10 h-10" /></div>
            <span className="font-black text-sm">MOTO-TAXI</span>
          </button>
          <button type="button" onClick={() => setServiceType("WOTORO-TIGUI")} className={`flex flex-col items-center p-6 rounded-[2rem] border-2 transition-all ${serviceType === "WOTORO-TIGUI" ? "border-blue-600 bg-blue-50 shadow-lg" : "border-stone-100 bg-white"}`}>
            <div className={`p-4 rounded-2xl mb-3 ${serviceType === "WOTORO-TIGUI" ? "bg-blue-600 text-white" : "bg-stone-100 text-stone-400"}`}><WotoroIcon className="w-10 h-10" /></div>
            <span className="font-black text-sm">WOTORO-TIGUI</span>
          </button>
        </div>

        <form onSubmit={handleRequestRide} className="space-y-6">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-gray-700">Ma position GPS</Label>
              <Button type="button" onClick={handleGetLocation} disabled={isLocating} variant="outline" size="sm" className="rounded-xl border-orange-200 text-orange-700">
                {isLocating ? <Loader2 className="animate-spin h-4 w-4" /> : <LocateFixed className="h-4 w-4 mr-2" />} 
                {location ? "Mettre à jour" : "Me localiser"}
              </Button>
            </div>
            
            {location && (
              <div className="h-48 w-full rounded-xl overflow-hidden border border-stone-200">
                <MapContainer center={location} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={location} />
                  <ChangeView center={location} />
                </MapContainer>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-gray-700">Votre Nom</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ex: Moussa" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-orange-700">Votre Téléphone *</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Ex: 77 123 45 67" className="h-12 rounded-xl border-orange-200" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Lieu de départ (Texte)</Label>
            <Input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Ex: Marché de Ballou" className="h-14 rounded-2xl" required />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Destination</Label>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ex: Gare routière" className="h-14 rounded-2xl" required />
          </div>

          <Button type="submit" disabled={isSubmitting} className={`w-full h-16 font-black text-xl rounded-2xl shadow-lg ${serviceType === "MOTO-TAXI" ? "bg-orange-600" : "bg-blue-600"}`}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : `COMMANDER ${serviceType}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientDashboard;