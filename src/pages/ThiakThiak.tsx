"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import ClientDashboard from '@/components/thiak-thiak/ClientDashboard';
import DriverDashboard from '@/components/thiak-thiak/DriverDashboard';
import { showError } from '@/utils/toast';

// Image de la moto de livraison rouge (Thiak-Thiak)
const MotorcycleIcon = ({ className }: { className?: string }) => (
  <img 
    src="https://cdn-icons-png.flaticon.com/512/2830/2830305.png" 
    alt="Moto Thiak-Thiak" 
    className={className}
    style={{ filter: 'hue-rotate(340deg) saturate(5)' }}
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

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container px-4 py-20 mx-auto text-center max-w-md">
          <Card className="border-none shadow-2xl rounded-[2.5rem] p-8">
            <MotorcycleIcon className="w-24 h-24 mx-auto mb-6" />
            <h1 className="text-3xl font-black mb-4">Allo Thiak-Thiak</h1>
            <a href="/login" className="block w-full bg-orange-600 text-white font-black py-4 rounded-2xl">SE CONNECTER</a>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <MotorcycleIcon className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-4xl font-black tracking-tighter">ALLO THIAK-THIAK</h1>
        </div>

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
            <DriverDashboard user={user} profile={profile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ThiakThiak;