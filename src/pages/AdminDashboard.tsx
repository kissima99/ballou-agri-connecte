"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  Search,
  Loader2,
  RefreshCw,
  Trash2,
  Truck,
  MapPin,
  CheckCircle2,
  Package,
  Clock,
  CreditCard,
  Bike
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase, isCurrentUserSuperAdmin } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch orders (excluding completed ones)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .not('status', 'in', ['Livré', 'Payé']) // Exclude completed orders
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Fetch rides
      const { data: ridesData, error: ridesError } = await supabase
        .from('rides')
        .select('*')
        .order('created_at', { ascending: false });

      if (ridesError) throw ridesError;
      setRides(ridesData || []);
    } catch (err: any) {
      showError("Erreur lors du chargement : " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const isSuper = await isCurrentUserSuperAdmin();
      if (!isSuper) {
        showError("Accès réservé au Super Admin.");
        navigate('/');
        return;
      }
      await fetchData();
    };
    checkAuth();
  }, [navigate]);

  // Simple placeholder UI – replace with real admin UI later
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        {isLoading ? (
          <Loader2 className="animate-spin text-green-600" />
        ) : (
          <div>
            <p className="mb-2">Nombre de commandes actives : {orders.length}</p>
            <p className="mb-2">Nombre de courses : {rides.length}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;