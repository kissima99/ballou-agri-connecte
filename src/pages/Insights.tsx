"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  BarChart3, 
  ShoppingBag, 
  Bike, 
  ArrowUpRight, 
  RefreshCw,
  Calendar,
  Banknote
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { supabase, isCurrentUserSuperAdmin } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

const Insights = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCA: 0,
    totalOrders: 0,
    totalRides: 0,
    avgOrderValue: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Récupérer les commandes
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('amount, created_at')
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      // 2. Récupérer les courses Thiak-Thiak
      const { data: rides, error: ridesError } = await supabase
        .from('rides')
        .select('price, created_at')
        .order('created_at', { ascending: true });

      if (ridesError) throw ridesError;

      // Calcul des statistiques globales
      const totalOrdersCA = orders?.reduce((acc, o) => acc + (Number(o.amount) || 0), 0) || 0;
      const totalRidesCA = rides?.reduce((acc, r) => acc + (Number(r.price) || 0), 0) || 0;
      const totalCA = totalOrdersCA + totalRidesCA;
      const totalCount = (orders?.length || 0) + (rides?.length || 0);

      setStats({
        totalCA,
        totalOrders: orders?.length || 0,
        totalRides: rides?.length || 0,
        avgOrderValue: totalCount > 0 ? Math.round(totalCA / totalCount) : 0
      });

      // Préparation des données pour le graphique (7 derniers jours)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        return {
          date: format(date, 'yyyy-MM-dd'),
          label: format(date, 'dd MMM', { locale: fr }),
          ca: 0,
          ventes: 0
        };
      }).reverse();

      // Agrégation des commandes par jour
      orders?.forEach(order => {
        const orderDate = format(new Date(order.created_at), 'yyyy-MM-dd');
        const dayData = last7Days.find(d => d.date === orderDate);
        if (dayData) {
          dayData.ca += Number(order.amount) || 0;
          dayData.ventes += 1;
        }
      });

      // Agrégation des courses par jour
      rides?.forEach(ride => {
        const rideDate = format(new Date(ride.created_at), 'yyyy-MM-dd');
        const dayData = last7Days.find(d => d.date === rideDate);
        if (dayData) {
          dayData.ca += Number(ride.price) || 0;
          dayData.ventes += 1;
        }
      });

      setChartData(last7Days);
    } catch (error) {
      console.error("Erreur lors de la récupération des insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <TrendingUp className="h-10 w-10 text-green-600" /> Insights & Performance
            </h1>
            <p className="text-gray-500 font-medium">Analyse en temps réel de l'activité Ballou Agri Connect</p>
          </div>
          <Button onClick={fetchData} variant="outline" className="rounded-xl font-bold bg-white shadow-sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Actualiser
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-2xl text-green-600"><Banknote className="h-6 w-6" /></div>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-none text-[10px] font-black">TOTAL CA</Badge>
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.totalCA.toLocaleString()} F</p>
              <p className="text-xs text-gray-400 font-bold mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" /> Cumul global
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><ShoppingBag className="h-6 w-6" /></div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none text-[10px] font-black">COMMANDES</Badge>
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-gray-400 font-bold mt-1">Produits vendus</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-2xl text-orange-600"><Bike className="h-6 w-6" /></div>
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-none text-[10px] font-black">COURSES</Badge>
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.totalRides}</p>
              <p className="text-xs text-gray-400 font-bold mt-1">Thiak-Thiak effectués</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-2xl text-purple-600"><BarChart3 className="h-6 w-6" /></div>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-none text-[10px] font-black">PANIER MOYEN</Badge>
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.avgOrderValue.toLocaleString()} F</p>
              <p className="text-xs text-gray-400 font-bold mt-1">Par transaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart */}
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white mb-10">
          <CardHeader className="p-8 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black">Évolution du Chiffre d'Affaires</CardTitle>
              <p className="text-sm text-gray-400 font-medium">7 derniers jours (Commandes + Courses)</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
              <Calendar className="h-4 w-4" /> {format(subDays(new Date(), 6), 'dd MMM')} - {format(new Date(), 'dd MMM')}
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Chiffre d\'Affaires']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ca" 
                    stroke="#16a34a" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorCa)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Chart: Volume of Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-lg rounded-[2rem] bg-white overflow-hidden">
            <CardHeader className="p-6 border-b">
              <CardTitle className="text-lg font-black">Volume de Ventes</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="ventes" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg rounded-[2rem] bg-green-900 text-white overflow-hidden flex flex-col justify-center p-10">
            <h3 className="text-2xl font-black mb-4">Résumé de l'activité</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-green-100 font-medium">Performance Hebdomadaire</span>
                <span className="font-black text-xl text-orange-500">+{Math.round(stats.totalCA / 4).toLocaleString()} F / sem</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-green-100 font-medium">Taux de conversion Thiak-Thiak</span>
                <span className="font-black text-xl text-green-400">Élevé</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-100 font-medium">Objectif mensuel</span>
                <span className="font-black text-xl">En cours...</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Badge = ({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: string }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${className}`}>
    {children}
  </span>
);

export default Insights;