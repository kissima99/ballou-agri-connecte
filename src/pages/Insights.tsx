"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp, BarChart3, Star, Calendar } from 'lucide-react';
import { supabase, isCurrentUserSuperAdmin } from "@/integrations/supabase/client";

const Insights = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const boot = async () => {
      const superAdmin = await isCurrentUserSuperAdmin();
      setIsSuperAdmin(superAdmin);

      if (superAdmin) {
        const { data, error } = await supabase
          .from('feedbacks')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error) setFeedbacks(data || []);
      }
    };

    void boot();
  }, []);

  const salesData = [
    { name: 'Jan', local: 450000, imported: 320000 },
    { name: 'Fév', local: 520000, imported: 380000 },
    { name: 'Mar', local: 680000, imported: 410000 },
    { name: 'Avr', local: 890000, imported: 450000 },
    { name: 'Mai', local: 750000, imported: 520000 },
    { name: 'Juin', local: 920000, imported: 580000 },
  ];

  const categoryData = [
    { name: 'Riz & Céréales', value: 45 },
    { name: 'Légumes Frais', value: 30 },
    { name: 'Produits Importés', value: 25 },
  ];

  const COLORS = ['#16a34a', '#f97316', '#2563eb'];

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-7 w-7 text-green-700" />
              Analyses & Performances
            </h1>
            <p className="text-gray-500 font-medium">Suivi en temps réel de l'économie de Ballou</p>
          </div>
        </div>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="mb-8 bg-white p-1 rounded-xl shadow-sm border">
            <TabsTrigger value="stats" className="font-bold">Statistiques</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="feedbacks" className="font-bold">Avis Clients ({feedbacks.length})</TabsTrigger>}
          </TabsList>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 p-3 rounded-2xl"><TrendingUp className="text-green-600 h-6 w-6" /></div>
                    <Badge className="bg-green-50 text-green-700 border-none text-[10px] font-bold">+12.5%</Badge>
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chiffre d'Affaires</p>
                  <h3 className="text-2xl font-black text-gray-900">0 FCFA</h3>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                <CardHeader><CardTitle className="text-lg font-bold">Croissance des Ventes</CardTitle></CardHeader>
                <CardContent className="h-[350px] pt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="local" stroke="#16a34a" strokeWidth={3} fill="#16a34a" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                <CardHeader><CardTitle className="text-lg font-bold">Répartition</CardTitle></CardHeader>
                <CardContent className="h-[350px] pt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={110}>
                        {categoryData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="feedbacks" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feedbacks.length === 0 ? (
                  <p className="text-gray-500 font-medium">Aucun avis pour le moment.</p>
                ) : (
                  feedbacks.map((fb) => (
                    <Card key={fb.id} className="border-none shadow-md bg-white rounded-3xl overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-black">
                              {fb.user_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{fb.user_name}</h4>
                              <div className="flex items-center gap-1 text-orange-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < fb.rating ? 'fill-orange-500' : 'text-gray-200'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold text-gray-400">
                            <Calendar className="w-3 h-3 mr-1" /> {new Date(fb.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed italic">"{fb.comment}"</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Insights;