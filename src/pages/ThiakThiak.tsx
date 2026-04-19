"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ShieldCheck, Loader2, Info, Bike } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import ClientDashboard from '@/components/thiak-thiak/ClientDashboard';
import DriverDashboard from '@/components/thiak-thiak/DriverDashboard';

const MotorcycleIcon = ({ className }: { className?: string }) => (
  <Bike className={className} />
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
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
      setLoading(false);
    };
    fetchUserAndProfile();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container px-4 py-10 mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="bg-orange-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-orange-600">
            <MotorcycleIcon className="w-12 h-12" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">ALLO THIAK-THIAK</h1>
          <p className="text-gray-500 font-medium text-sm mt-2">Le transport rapide et fiable à Ballou.</p>
        </div>

        {!user && (
          <div className="mb-8 bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 text-blue-800">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">Connectez-vous pour un suivi précis, ou commandez via WhatsApp.</p>
          </div>
        )}

        <Tabs defaultValue={profile?.role === 'driver' ? 'driver' : 'client'} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8 bg-white p-1 rounded-xl shadow-sm border h-12 max-w-md mx-auto">
            <TabsTrigger value="client" className="font-bold text-xs rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              COMMANDER
            </TabsTrigger>
            <TabsTrigger value="driver" className="font-bold text-xs rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white">
              CHAUFFEUR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="client"><ClientDashboard user={user} profile={profile} /></TabsContent>
          <TabsContent value="driver">
            {user ? <DriverDashboard user={user} profile={profile} /> : (
              <Card className="border-none shadow-xl rounded-3xl p-12 text-center bg-white">
                <ShieldCheck className="w-12 h-12 text-green-600 mx-auto mb-6" />
                <h2 className="text-xl font-bold mb-4">Espace Chauffeur</h2>
                <Button asChild className="bg-green-600 hover:bg-green-700 h-12 px-8 font-bold rounded-xl"><Link to="/login">SE CONNECTER</Link></Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default ThiakThiak;