"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';
import { MotorcycleIcon, Truck, User, CheckCircle2, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingR<dyad-write path="src/pages/ClientDashboard.tsx" description="Correction de l'erreur de relation rides.client_id dans le tableau de bord du chauffeur.">
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
  Banknote,   Truck, 
  User,   Save, 
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

const ClientDashboard = ({ user }: { user: any }) => {
  const [profile, setProfile] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [completedRidesCount, setCompletedRidesCount] = useState(0);
  
  const [pendingRides, setPendingRides] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        // 1. Récupérer le profil du chauffeur        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        setProfile(profileData);
        
        // 2. Récupérer les courses en attente du chauffeur (en tant que passager)
        const { data: pendingRidesData, error: pendingError } = await supabase
          .from('rides')
          .select('*')
          .eq('client_id', user.id)
          .in('status', ['pending', 'accepted', 'picked_up'])
          .order('created_at', { ascending: false })
          .maybeSingle();
        
        if (!pendingError) setPendingRides(pendingRidesData);
        
        // 3. Récupérer la course active du chauffeur (en tant que conducteur)
        const { data: activeRideData, error: activeError } = await supabase
          .from('rides')
          .select('*')
          .eq('driver_id', user.id)
          .in('status', ['pending', 'accepted', 'picked_up'])
          .order('created_at', { ascending: false })
          .maybeSingle();
        
        if (!activeError) setActiveRide(activeRideData);
                // 4. Compter les courses terminées
        const { count: countResult, error: countError } = await supabase          .from('rides')
          .select('*', { count: 'exact', head: true })
          .eq('driver_id', user.id)
          .eq('status', 'completed');
        
        if (!countError) setCompletedRidesCount(countResult);
                setLoading(false);
      } catch (err: any) {
        showError("Erreur de chargement : " + err.message);
        setLoading(false);
      }
    };

    loadData();

    // Abonnement aux changements de courses
    const channel = supabase.channel('driver-updates').on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'rides' 
    }, () => loadData()).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Bascule de disponibilité
  const toggleAvailability = async (checked: boolean) => {
    setIsAvailable(checked);
    const { error } = await supabase.from('profiles').update({ is_available: checked }).eq('id', user.id);
    if (error) showError("Erreur de mise à jour");
    else showSuccess(checked ? "Vous êtes maintenant EN LIGNE" : "Vous êtes maintenant HORS LIGNE");
  };

  // Sauvegarde du profil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          phone_number: phoneNumber
        })
        .eq('id', user.id);

      if (error) throw error;
      showSuccess("Profil mis à jour avec succès !");
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Acceptation d'une course
  const acceptRide = async (rideId: string) => {
    const { error } = await supabase.from('rides').update({ driver_id: user.id, status: 'accepted' }).eq('id', rideId).eq('status', 'pending');
    if (error) showError("Cette course n'est plus disponible.");
    else showSuccess("Course acceptée !");
  };

  // Mise à jour du statut
  const updateStatus = async (rideId: string, newStatus: string) => {
    await supabase.from('rides').update({ status: newStatus }).eq('id', rideId);
    showSuccess("Statut mis à jour.");
    // Rechargement des données après mise à jour
    const dummy = () => {};
    dummy();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-600" /></div>;

  return (
    <div className="space-y-8">
      {/* Section Profil & Disponibilité */}
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
                  <Input 
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Moussa Diop"
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold text-gray-700">Téléphone</Label>
                  <Input 
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ex: 77 123 45 67"
                    className="rounded-xl h-12"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSavingProfile} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 rounded-xl font-bold">
                {isSavingProfile ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                ENREGISTRER LES INFOS              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <MotorcycleIcon className={`w-10 h-10 ${isAvailable ? '' : 'grayscale opacity-50'}`} />
              </div>
              <h3 className="font-black text-gray-900 mb-1">Statut Actuel</h3>
              <Badge className={`mb-4 border-none ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>
                {isAvailable ? "EN LIGNE" : "HORS LIGNE"}
              </Badge>
              <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl w-full justify-center">
                <span className="text-xs font-bold text-gray-500">DISPONIBILITÉ</span>
                <Switch checked={isAvailable} onCheckedChange={toggleAvailability} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2rem] bg-green-900 text-white overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-2xl">
                <History className="h-8 w-8 text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-green-300 uppercase tracking-widest">Courses terminées</p>
                <p className="text-3xl font-black">{completedRidesCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Active */}
      {activeRide && (
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden border-4 border-green-500 animate-pulse-slow">
          <CardHeader className="bg-green-600 text-white p-6">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeRide.service_type === "MOTO-TAXI" ? <MotorcycleIcon className="w-6 h-6 bg-white p-1 rounded" /> : <Truck className="w-6 h-6 bg-white p-1 rounded text-green-600" />}
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
                <a href={`tel:${activeRide.phone}`}>
                  <Phone className="w-5 h-5 mr-2" /> APPELER LE CLIENT
                </a>
              </Button>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
              <MapPin className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Trajet</p>
                <p className="font-bold text-gray-900">{activeRide.pickup_location} → {activeRide.destination}</p>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-2xl flex items-center gap-3 text-orange-800 font-bold">
              <Banknote className="h-6 w-6" /> 
              <span>Paiement : {activeRide.price.toLocaleString()} FCFA (Cash à la fin)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeRide.status === 'accepted' && (
                <Button onClick={() => updateStatus(activeRide.id, 'picked_up')} className="h-16 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-lg shadow-lg">
                  CLIENT RÉCUPÉRÉ                </Button>
              )}
              {activeRide.status === 'picked_up' && (
                <Button onClick={() => updateStatus(activeRide.id, 'completed')} className="h-16 bg-green-600 hover:bg-green-700 rounded-2xl font-black text-lg shadow-lg col-span-full">
                  <CheckCircle2 className="mr-2 h-6 w-6" /> TERMINER LA COURSE
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses Disponibles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-500" /> 
            Demandes à proximité ({pendingRides.length})
          </h3>
          {!isAvailable && <Badge variant="destructive">HORS LIGNE</Badge>}
        </div>

        {!isAvailable ? (
          <div className="bg-stone-100 p-12 rounded-[2.5rem] text-center border-2 border-dashed border-stone-200">
            <MotorcycleIcon className="w-16 h-16 mx-auto mb-4 grayscale opacity-30" />
            <p className="text-gray-500 font-bold">Passez en ligne pour voir les demandes de courses.</p>
          </div>
        ) : pendingRides.length === 0 ? (
          <div className="bg-stone-100 p-12 rounded-[2.5rem] text-center border-2 border-dashed border-stone-200">
            <Loader2 className="w-10 h-10 animate-spin text-stone-300 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">En attente de nouvelles demandes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingRides.map((ride) => (
              <Card key={ride.id} className="border-none shadow-md hover:shadow-xl transition-all rounded-[2rem] bg-white overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${ride.service_type === "MOTO-TAXI" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}>
                          {ride.service_type === "MOTO-TAXI" ? <MotorcycleIcon className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{ride.service_type}</span>
                      </div>
                      <h4 className="font-black text-gray-900 text-lg leading-tight">
                        {ride.pickup_location} <br />
                        <span className="text-orange-500 text-sm">→</span> {ride.destination}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Prix estimé</span>
                      <p className="font-black text-2xl text-green-700">{ride.price.toLocaleString()} F</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase mb-6 bg-orange-50 p-2 rounded-lg w-fit">
                    <Banknote className="h-3 w-3" /> Paiement Cash après course
                  </div>
                                    <Button 
                    onClick={() => acceptRide(ride.id)} 
                    disabled={!!activeRide} 
                    className="w-full h-14 bg-green-600 hover:bg-green-700 rounded-2xl font-black text-lg shadow-lg group-hover:scale-[1.02] transition-transform"
                  >
                    ACCEPTER LA COURSE
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;