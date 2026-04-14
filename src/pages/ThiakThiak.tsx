"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ShieldCheck, Loader2, Info } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import ClientDashboard from '@/components/thiak-thiak/ClientDashboard';
import DriverDashboard from '@/components/thiak-thiak/DriverDashboard';

const motorcycleImg = "dyad-media://media/e-commerce-ballou/.dyad/media/b8530d84e9f7c05e101a5cbc360e8cd1.png";

const MotorcycleIcon = ({ className }: { className?: string }) => (
  <img 
    src={motorcycleImg} 
    alt="Moto Thiak-Thiak" 
    className={className}
  />
);

const ThiakThiak = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!error) setProfile(data);
      }
      setLoading(false);
    };

    fetchUserAndProfile();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <MotorcycleIcon className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-4xl font-black tracking-tighter">ALLO THIAK-THIAK</h1>
          <p className="text-gray-500 font-medium mt-2">Le transport rapide et fiable à Ballou.</p>
        </div>

        {!user && (
          <div className="mb-8 bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 text-blue-800">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              Vous n'êtes pas connecté. Vos commandes seront envoyées directement via <strong>WhatsApp</strong> pour une prise en charge immédiate.
            </p>
          </div>
        )}

        <Tabs defaultValue={profile?.role === 'driver' ? 'driver' : 'client'} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8 bg-white p-1 rounded-2xl shadow-sm border h-14">
            <TabsTrigger value="client" className="font-bold rounded-xl data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" /> COMMANDER
            </TabsTrigger>
            <TabsTrigger value="driver" className="font-bold rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <ShieldCheck className="w-4 h-4 mr-2" /> CHAUFFEUR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="client">
            <ClientDashboard user={user} profile={profile} />
          </TabsContent>

          <TabsContent value="driver">
            {user ? (
              <DriverDashboard user={user} profile={profile} />
            ) : (
              <Card className="border-none shadow-xl rounded-[2.5rem] p-12 text-center bg-white">
                <ShieldCheck className="w-16 h-16 text-green-600 mx-auto mb-6" />
                <h2 className="text-2xl font-black mb-4">Espace Chauffeur</h2>
                <p className="text-gray-500 mb-8">Veuillez vous connecter pour accéder à vos courses et gérer votre disponibilité.</p>
                <Button asChild className="bg-green-600 hover:bg-green-700 h-14 px-10 font-black rounded-2xl">
                  <a href="/login">SE CONNECTER</a>
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ThiakThiak;