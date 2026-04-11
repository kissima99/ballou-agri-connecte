"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Bike,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      // Récupérer les commandes actives (non livrées)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .not('status', 'eq', 'Livré')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Récupérer les courses Thiak-Thiak
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

    // Real-time updates
    const ordersChannel = supabase.channel('admin-orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData()).subscribe();
    const ridesChannel = supabase.channel('admin-rides').on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => fetchData()).subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(ridesChannel);
    };
  }, [navigate]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      showSuccess(`Statut mis à jour : ${newStatus}`);
      fetchData();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm("Supprimer cette commande ?")) return;
    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      showSuccess("Commande supprimée");
      fetchData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <LayoutDashboard className="h-10 w-10 text-green-600" /> Administration
            </h1>
            <p className="text-gray-500 font-medium">Gestion centrale de Ballou Agri Connect</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="rounded-xl font-bold border-blue-200 text-blue-700">
              <Link to="/insights"><BarChart3 className="mr-2 h-4 w-4" /> Voir Insights</Link>
            </Button>
            <Button onClick={fetchData} variant="outline" className="rounded-xl font-bold">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Actualiser
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-none shadow-md bg-white rounded-3xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-2xl text-green-600"><Package className="h-8 w-8" /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Commandes Actives</p>
                <p className="text-3xl font-black">{orders.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white rounded-3xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-orange-100 p-4 rounded-2xl text-orange-600"><Bike className="h-8 w-8" /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Courses Thiak-Thiak</p>
                <p className="text-3xl font-black">{rides.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white rounded-3xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-2xl text-blue-600"><CreditCard className="h-8 w-8" /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">CA Total (Est.)</p>
                <p className="text-3xl font-black">{orders.reduce((acc, o) => acc + (o.amount || 0), 0).toLocaleString()} F</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid grid-cols-2 mb-8 bg-white p-1 rounded-2xl shadow-sm border h-14 max-w-md">
            <TabsTrigger value="orders" className="font-bold rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white">
              COMMANDES
            </TabsTrigger>
            <TabsTrigger value="rides" className="font-bold rounded-xl data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              THIAK-THIAK
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="border-b p-8">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <CardTitle className="text-xl">Gestion des Commandes</CardTitle>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Rechercher un client ou ID..." 
                      className="pl-10 rounded-xl border-stone-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-stone-50">
                    <TableRow>
                      <TableHead className="font-black text-[10px] uppercase px-8">ID / Date</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Client</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Montant</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Statut Actuel</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-right px-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-stone-50/50">
                        <TableCell className="px-8">
                          <div className="font-black text-gray-900">{order.id}</div>
                          <div className="text-[10px] text-gray-400 font-bold">{new Date(order.created_at).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-gray-900">{order.customer_name}</div>
                          <div className="text-xs text-gray-500">{order.phone}</div>
                        </TableCell>
                        <TableCell className="font-black text-green-700">{order.amount.toLocaleString()} F</TableCell>
                        <TableCell>
                          <Badge className={`border-none font-black text-[10px] ${
                            order.status === 'Payé' ? 'bg-green-100 text-green-700' : 
                            order.status === 'Expédié' ? 'bg-blue-100 text-blue-700' : 
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {order.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-[10px] font-black rounded-lg border-green-200 text-green-700"
                              onClick={() => updateOrderStatus(order.id, 'Payé')}
                              disabled={isUpdating === order.id}
                            >
                              PAYÉ
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-[10px] font-black rounded-lg border-blue-200 text-blue-700"
                              onClick={() => updateOrderStatus(order.id, 'Expédié')}
                              disabled={isUpdating === order.id}
                            >
                              EXPÉDIÉ
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-[10px] font-black rounded-lg border-gray-200 text-gray-700"
                              onClick={() => updateOrderStatus(order.id, 'Livré')}
                              disabled={isUpdating === order.id}
                            >
                              LIVRÉ
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => deleteOrder(order.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredOrders.length === 0 && (
                  <div className="p-20 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-stone-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold">Aucune commande active trouvée.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rides">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="p-8 border-b">
                <CardTitle className="text-xl">Courses Thiak-Thiak</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-stone-50">
                    <TableRow>
                      <TableHead className="font-black text-[10px] uppercase px-8">Service</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Trajet</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Client</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Prix</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-right px-8">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rides.map((ride) => (
                      <TableRow key={ride.id}>
                        <TableCell className="px-8">
                          <div className="flex items-center gap-2">
                            {ride.service_type === 'MOTO-TAXI' ? <Bike className="h-4 w-4 text-orange-600" /> : <Truck className="h-4 w-4 text-blue-600" />}
                            <span className="font-black text-xs">{ride.service_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-bold">{ride.pickup_location} → {ride.destination}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-medium">{ride.customer_name || 'Client'}</div>
                          <div className="text-[10px] text-gray-400">{ride.phone}</div>
                        </TableCell>
                        <TableCell className="font-black text-green-700">{ride.price} F</TableCell>
                        <TableCell className="text-right px-8">
                          <Badge className="border-none font-black text-[10px] uppercase">{ride.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;