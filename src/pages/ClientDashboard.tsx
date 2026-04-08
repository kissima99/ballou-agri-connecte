"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';
import { Truck, User, CheckCircle2, History, Loader2, MapPin, Phone, Banknote, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MotorcycleIcon = ({ className }: { className?: string }) => (
  <img 
    src="https://cdn-icons-png.flaticon.com/512/2830/2830305.png" 
    alt="Moto Thiak-Thiak" 
    className={className}
    style={{ filter: 'hue-rotate(340deg) saturate(5)' }}
  />
);

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rides, setRides] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserAndRides = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('rides')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });
        
        if (!error) setRides(data || []);
      }
      setIsLoading(false);
    };

    fetchUserAndRides();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container px-4 py-20 mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Veuillez vous connecter</h1>
          <Button onClick={() => navigate('/login')}>Se connecter</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Mon Espace Client</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <Tabs defaultValue="rides" className="w-full">
          <TabsList className="mb-8 bg-white p-1 rounded-2xl shadow-sm border h-14">
            <TabsTrigger value="rides" className="font-bold rounded-xl px-8 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <MotorcycleIcon className="w-5 h-5 mr-2" /> MES COURSES ({rides.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="font-bold rounded-xl px-8 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" /> HISTORIQUE
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rides">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rides.length === 0 ? (
                <Card className="col-span-full p-12 text-center border-none shadow-sm">
                  <p className="text-gray-500 font-medium">Vous n'avez pas encore de courses.</p>
                  <Button onClick={() => navigate('/thiak-thiak')} className="mt-4 bg-orange-600">Commander une course</Button>
                </Card>
              ) : (
                rides.map((ride) => (
                  <Card key={ride.id} className="border-none shadow-md rounded-[2rem] overflow-hidden bg-white">
                    <CardHeader className="bg-stone-50 p-5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {ride.service_type === 'MOTO-TAXI' ? <MotorcycleIcon className="h-6 w-6" /> : <Truck className="h-6 w-6 text-blue-600" />}
                          <span className="text-xs font-black uppercase">{ride.service_type}</span>
                        </div>
                        <Badge className="bg-orange-100 text-orange-700 border-none text-[10px] font-black uppercase">
                          {ride.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-orange-500 mt-1" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-black uppercase">Trajet</p>
                          <p className="font-bold text-sm">{ride.pickup_location} → {ride.destination}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                          <Clock className="h-3 w-3" /> {new Date(ride.created_at).toLocaleDateString()}
                        </div>
                        <p className="font-black text-lg text-green-700">{ride.price.toLocaleString()} F</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-12 text-center border-none shadow-sm">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">L'historique détaillé sera bientôt disponible.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-bold ${className}`}>
    {children}
  </span>
);

export default ClientDashboard;