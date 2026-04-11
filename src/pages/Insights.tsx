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
  const [salesData, setSalesData] = useState([]); // Dynamic sales data

  useEffect(() => {
    const boot = async () => {
      const superAdmin = await isCurrentUserSuperAdmin();
      setIsSuperAdmin(superAdmin);

      if (superAdmin) {
        const { data, error } = await supabase
          .from('orders')
          .select('amount,created_at')
          .order('created_at', { ascending: false })
          .limit(12);

        if (!error) {
          const formatted = data.map((order: any) => ({
            name: new Date(order.created_at).toLocaleDateString('fr-FR').split('/')[1],
            amount: order.amount || 0,
          }));
          setSalesData(formatted);
        }
      }
    };
    void boot();
  }, []);

  // Simple placeholder UI – replace with real charts later
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Insights</h1>
        <p>Nombre de ventes récentes : {salesData.length}</p>
        {salesData.map((s, i) => (
          <div key={i} className="mb-2">
            <strong>Mois {s.name}:</strong> {s.amount.toLocaleString()} FCFA
          </div>
        ))}
      </div>
    </div>
  );
};

export default Insights;