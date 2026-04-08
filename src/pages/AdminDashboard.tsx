import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableRow } from "@/components/ui/table";
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
  Navigation,
  Banknote,
  Phone,
  AlertCircle
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { supabase, isCurrentUserSuperAdmin } from '@/integrations/supabase/client';

// Image de la moto de livraison rouge (Thiak-Thiak)
const MotorcycleIcon = ({ className }: { className?: string }) => (
  <img 
    src="https://cdn-icons-png.flaticon.com/512/2830/2830305.png" 
    alt="Moto Thiak-Thiak" 
    className={className}
    style={{ filter: 'hue-rotate(340deg) saturate(5)' }}
  />
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      // Use supabase client with preprod URL from env
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      const { data: ridesData, error: ridesError } = await supabase
        .from('rides')
        .select(`
          *,
          client:client_id(full_name, phone_number),
          driver:driver_id(full_name, phone_number)
        `)
        .order('created_at', { ascending: false });

      if (ridesError) throw ridesError;
      setRides(ridesData || []);

    } catch (err: any) {
      const message = err.message || "Problème de connexion";
      setDbError(message);
      showError("Erreur lors du chargement : " + message);
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

  // ... (rest of the component remains unchanged)
  // Ensure the UI renders the orders and rides tables as before
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto">
        {/* ... existing dashboard content ... */}
      </div>
    </div>
  );
};

export default AdminDashboard;