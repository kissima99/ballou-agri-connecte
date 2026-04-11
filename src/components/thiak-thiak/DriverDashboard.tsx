"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Phone, 
  Loader2, 
  AlertCircle, 
  Banknote, 
  Truck, 
  User, 
  Save, 
  CheckCircle2,
  History
} from 'lucide-react';
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

const DriverDashboard = ({ user, profile: initialProfile }: { user: any, profile: any }) => {
  const [profile, setProfile] = useState(initialProfile);
  const [isAvailable, setIsAvailable] = useState(initialProfile?.is_available ?? true);
  const [fullName, setFullName] = useState(initialProfile?.full_name || "");
  const [phoneNumber, setPhoneNumber] = useState(initialProfile?.phone_number || "");
  const [completedRidesCount, setCompletedRidesCount] = useState(0);
  
  const [pendingRides, setPendingRides] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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

    const { count } = await supabase
      .from('rides')
      .select('*', { count: 'exact', head: true })
      .eq('driver_id', user.id)
      .eq('status', 'completed');
    
    setCompletedRidesCount(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('driver-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user.id]);

  const acceptRide = async (rideId: string) => {
    try {
      const { error } = await supabase
        .from('rides')
        .update({ 
          driver_id: user.id, 
          status: 'accepted' 
        })
        .eq('id', rideId)
        .eq('status', 'pending');

      if (error) throw error;
      showSuccess("Course acceptée !");
      fetchData();
    } catch (err: any) {
      showError("Erreur SQL : " + err.message);
    }
  };

  const updateStatus = async (rideId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('rides')
        .update({ status: newStatus })
        .eq('id', rideId);

      if (error) throw error;
      showSuccess("Statut mis à jour.");
      fetchData();
    } catch (err: any) {
      showError("Erreur SQL : " + err.message);
    }
  };

  const toggleAvailability = async (checked: boolean) => {
    setIsAvailable(checked);
    const { error } = await supabase.from('profiles').update({ is_available: checked }).eq('id', user.id);
    if (error) showError("Erreur SQL : " + error.message);
    else showSuccess(checked ? "Vous êtes EN LIGNE" : "Vous êtes HORS LIGNE");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone_number: phoneNumber })
        .eq('id', user.id);

      if (error) throw error;
      showSuccess("Profil mis à jour !");
    } catch (err: any) {
      showError("Erreur SQL : " + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-600" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
          <CardHeader className="bg-stone-50 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" /> Mon Profil Chauffeur
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-bold text-gray-700">Prénom & Nom</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex: Moussa Diop" className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold text-gray-700">Téléphone</Label>
                  <Input id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Ex: 77 123 45 67" className="rounded-xl h-12" />
                </div>
              </div>
              <Button type="submit" disabled={isSavingProfile} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 rounded-xl font-bold">
                {isSavingProfile ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} ENREGISTRER
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <MotorcycleIcon className={`w-10 h-10 ${isAvailable ? '' : 'grayscale opacity-50'}`} />
              </div>
              <h3 className="font-black text-gray-900 mb-1">Statut</h3>
              <Badge className={`mb-4 border-none ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>{isAvailable ? "EN LIGNE" : "HORS LIGNE"}</Badge>
              <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl w-full justify-center">
                <span className="text-xs font-bold text-gray-500">DISPONIBILITÉ</span>
                <Switch checked={isAvailable} onCheckedChange={toggleAvailability} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {activeRide && (
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden border-4 border-green-500">
          <CardHeader className="bg-green-600 text-white p-6">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MotorcycleIcon className="w-6 h-6 bg-white p-1 rounded" />
                <span>COURSE EN COURS</span>
              </div>
              <Badge className="bg-white/20 text-white border-none uppercase text-[10px]">{activeRide.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Client</p>
                <h4 className="text-2xl font-black text-gray-900">{activeRide.customer_name || "Client Ballou"}</h4>
              </div>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold h-14 px-8 shadow-lg">
                <a href={`tel:${activeRide.phone}`}><Phone className="w-5 h-5 mr-2" /> APPELER</a>
              </Button>
            </div>
            <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
              <MapPin className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Trajet</p>
                <p className="font-bold text-gray-900">{activeRide.pickup_location} → {activeRide.destination}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeRide.status === 'accepted' && (
                <Button onClick={() => updateStatus(activeRide.id, 'picked_up')} className="h-16 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-lg shadow-lg">CLIENT RÉCUPÉRÉ</Button>
              )}
              {activeRide.status === 'picked_up' && (
                <Button onClick={() => updateStatus(activeRide.id, 'completed')} className="h-16 bg-green-600 hover:bg-green-700 rounded-2xl font-black text-lg shadow-lg col-span-full">TERMINER LA COURSE</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-black flex items-center gap-2"><AlertCircle className="w-6 h-6 text-orange-500" /> Demandes ({pendingRides.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingRides.map((ride) => (
            <Card key={ride.id} className="border-none shadow-md hover:shadow-xl transition-all rounded-[2rem] bg-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-gray-400">{ride.service_type}</span>
                    <h4 className="font-black text-gray-900 text-lg">{ride.pickup_location} → {ride.destination}</h4>
                  </div>
                  <p className="font-black text-2xl text-green-700">{ride.price} F</p>
                </div>
                <Button onClick={() => acceptRide(ride.id)} disabled={!!activeRide} className="w-full h-14 bg-green-600 hover:bg-green-700 rounded-2xl font-black text-lg shadow-lg">ACCEPTER</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;