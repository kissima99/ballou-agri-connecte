"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container px-4 py-12 mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <div className="bg-orange-100 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-orange-200">
            <MotorcycleIcon className="w-24 h-24" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900">ALLO THIAK-THIAK</h1>
          <p className="text-gray-500 font-medium text-xl mt-4">Le transport rapide et fiable à Ballou.</p>
        </div>

        {!user && (
          <div className="mb-12 bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-start gap-4 text-blue-800 shadow-sm">
            <Info className="h-6 w-6 shrink-0 mt-0.5" />
            <p className="text-lg font-medium">
              Vous n'êtes pas connecté. Vos commandes seront envoyées directement via <strong>WhatsApp</strong> pour une prise en charge immédiate.
            </p>
          </div>
        )}

        <Tabs defaultValue={profile?.role === 'driver' ? 'driver' : 'client'} className="w-full">
          <TabsList className="grid grid-cols-2 mb-12 bg-white p-2 rounded-[2rem] shadow-sm border h-16 max-w-2xl mx-auto">
            <TabsTrigger value="client" className="font-black text-sm rounded-2xl data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all">
              <User className="w-5 h-5 mr-2" /> COMMANDER UNE COURSE
            </TabsTrigger>
            <TabsTrigger value="driver" className="font-black text-sm rounded-2xl data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all">
              <ShieldCheck className="w-5 h-5 mr-2" /> ESPACE CHAUFFEUR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="client" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ClientDashboard user={user} profile={profile} />
          </TabsContent>

          <TabsContent value="driver" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {user ? (
              <DriverDashboard user={user} profile={profile} />
            ) : (
              <Card className="border-none shadow-2xl rounded-[3rem] p-16 text-center bg-white">
                <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                  <ShieldCheck className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-black mb-4 text-gray-900">Espace Chauffeur</h2>
                <p className="text-gray-500 mb-10 text-lg font-medium">Veuillez vous connecter pour accéder à vos courses et gérer votre disponibilité.</p>
                <Button asChild className="bg-green-600 hover:bg-green-700 h-16 px-12 font-black text-xl rounded-2xl shadow-xl">
                  <Link to="/login">SE CONNECTER</Link>
                </Button>
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