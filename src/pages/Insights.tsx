"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, Truck, ArrowUpRight, MapPin } from 'lucide-react';

const Insights = () => {
  // Données basées sur un volume mensuel réaliste pour Ballou
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
            <h1 className="text-3xl font-black text-gray-900">Analyses & Performances</h1>
            <p className="text-gray-500 font-medium">Suivi en temps réel de l'économie locale de Ballou</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Données à jour : Aujourd'hui</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="border-none shadow-sm bg-white group hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-2xl group-hover:bg-green-600 transition-colors">
                  <TrendingUp className="text-green-600 h-6 w-6 group-hover:text-white" />
                </div>
                <Badge className="bg-green-50 text-green-700 border-none text-[10px] font-bold">+12.5%</Badge>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chiffre d'Affaires</p>
              <h3 className="text-2xl font-black text-gray-900">4,210,000 FCFA</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white group hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-2xl group-hover:bg-blue-600 transition-colors">
                  <Users className="text-blue-600 h-6 w-6 group-hover:text-white" />
                </div>
                <Badge className="bg-blue-50 text-blue-700 border-none text-[10px] font-bold">+84</Badge>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Utilisateurs Actifs</p>
              <h3 className="text-2xl font-black text-gray-900">1,842</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white group hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-2xl group-hover:bg-orange-600 transition-colors">
                  <ShoppingBag className="text-orange-600 h-6 w-6 group-hover:text-white" />
                </div>
                <Badge className="bg-orange-50 text-orange-700 border-none text-[10px] font-bold">+15%</Badge>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Commandes / Mois</p>
              <h3 className="text-2xl font-black text-gray-900">528</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white group hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-2xl group-hover:bg-purple-600 transition-colors">
                  <Truck className="text-purple-600 h-6 w-6 group-hover:text-white" />
                </div>
                <Badge className="bg-purple-50 text-purple-700 border-none text-[10px] font-bold">98%</Badge>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Taux de Livraison</p>
              <h3 className="text-2xl font-black text-gray-900">24h Garanti</h3>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-green-600" /> Croissance des Ventes (FCFA)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorLocal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area type="monotone" dataKey="local" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorLocal)" />
                  <Area type="monotone" dataKey="imported" stroke="#2563eb" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Répartition par Secteur</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="250">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-3 mt-6 px-4">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index]}} />
                      <span className="text-sm font-bold text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Insights;