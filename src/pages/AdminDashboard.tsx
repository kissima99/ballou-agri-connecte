"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Navigation,
  Banknote,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucode-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { supabase, isCurrentUserSuperAdmin } from '@/integrations/supabase/client';

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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // --- COMMANDES (orders) ---
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // --- COURSES (rides) ---
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

  // --- ACTIONS SUR LES COMMANDES ---
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, is_new: false })
        .eq('id', orderId);

      if (error) throw error;
      showSuccess("Statut mis à jour !");
      await fetchData();
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
      showSuccess("Commande supprimée.");
      await fetchData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // --- ACTIONS SUR LES COURSES ---
  const acceptRide = async (rideId: string) => {
    const { error } = await supabase
      .from('rides')
      .update({ status: 'accepted' })
      .eq('id', rideId)
      .eq('status', 'pending');

    if (error) showError("Cette course n'est plus disponible.");
    else showSuccess("Course acceptée !");
    await fetchData();
  };

  const updateRideStatus = async (rideId: string, newStatus: string) => {
    const { error } = await supabase
      .from('rides')
      .update({ status: newStatus })
      .eq('id', rideId);

    if (error) showError(error.message);
    else showSuccess("Statut de la course mis à jour.");
    await fetchData();
  };

  const deleteRide = async (rideId: string) => {
    if (!window.confirm("Supprimer cette course ?")) return;
    const { error } = await supabase.from('rides').delete().eq('id', rideId);
    if (error) showError(error.message);
    else {
      showSuccess("Course supprimée.");
      await fetchData();
    }
  };

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRides = rides.filter(r =>
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto">
        {/* En‑tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-green-700" />
              Tableau de Bord Admin
            </h1>
            <p className="text-gray-500 font-medium">Gestion des commandes et des courses</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 rounded-xl"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={fetchData} variant="outline" className="rounded-xl">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Onglets : Gestion (fusion), Commandes, Courses */}
        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="mb-8 bg-white p-1 rounded-xl shadow-sm border">
            <TabsTrigger value="manage" className="font-bold">
              Gestion (Tout)
            </TabsTrigger>
            <TabsTrigger value="orders" className="font-bold">
              Commandes ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="rides" className="font-bold">
              Courses ({rides.length})
            </TabsTrigger>
          </TabsList>

          {/* ==== Onglet Gestion (fusion) ==== */}
          <TabsContent value="manage">
            {/* SECTION COMMANDES */}
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden mb-12">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-xl font-bold">Commandes</CardTitle>
              </CardHeader>
              <Table>
                <TableHeader className="bg-stone-50">
                  <TableRow>
                    <TableHead className="font-bold">ID / Date</TableHead>
                    <TableHead className="font-bold">Client</TableHead>
                    <TableHead className="font-bold">Montant</TableHead>
                    <TableHead className="font-bold">Statut</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-bold text-gray-900">{order.id}</div>
                        <div className="text-[10px] text-gray-400 uppercase">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">{order.phone}</div>
                      </TableCell>
                      <TableCell className="font-bold text-green-700">
                        {order.amount.toLocaleString()} F
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          order.status === 'Livré' ? 'bg-green-100 text-green-700' :
                          order.status === 'En cours' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg text-[10px] font-bold"
                          onClick={() => updateOrderStatus(order.id, 'En cours')}
                          disabled={isUpdating === order.id}
                        >
                          EXPÉDIER
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 rounded-lg text-[10px] font-bold bg-green-600"
                          onClick={() => updateOrderStatus(order.id, 'Livré')}
                          disabled={isUpdating === order.id}
                        >
                          LIVRER
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500"
                          onClick={() => deleteOrder(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* SECTION COURSES */}
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-orange-50">
                <CardTitle className="text-xl font-bold">Courses (Thiak‑Thiak)</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredRides.map(ride => (
                  <Card key={ride.id} className="border-none shadow-md hover:shadow-xl transition-all rounded-[2rem] bg-white overflow-hidden">
                    <CardHeader className={`${ride.status === 'completed' ? 'bg-stone-100' : 'bg-orange-50'} p-4`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {ride.service_type === 'MOTO-TAXI' ? (
                            <MotorcycleIcon className="h-5 w-5" />
                          ) : (
                            <Truck className="h-5 w-5 text-blue-600" />
                          )}
                          <span className="text-xs font-black uppercase">{ride.service_type}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold">{ride.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-orange-500 mt-1" />
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Trajet</p>
                          <p className="font-bold text-sm">{ride.pickup_location} → {ride.destination}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Client</p>
                          <p className="font-bold text-xs">{ride.customer_name || "Client"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Prix</p>
                          <p className="font-black text-orange-600">{ride.price} F</p>
                        </div>
                      </div>

                      {/* Actions rapides */}
                      <div className="flex gap-2 mt-4">
                        {ride.status === 'pending' && (
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => updateRideStatus(ride.id, 'accepted')}
                          >
                            Accepter
                          </Button>
                        )}
                        {ride.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => deleteRide(ride.id)}
                          >
                            Supprimer
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* ==== Onglet Commandes (existant) ==== */}
          <TabsContent value="orders">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
              <Table>
                <TableHeader className="bg-stone-50">
                  <TableRow>
                    <TableHead className="font-bold">ID / Date</TableHead>
                    <TableHead className="font-bold">Client</TableHead>
                    <TableHead className="font-bold">Montant</TableHead>
                    <TableHead className="font-bold">Statut</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-bold text-gray-900">{order.id}</div>
                        <div className="text-[10px] text-gray-400 uppercase">{new Date(order.created_at).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">{order.phone}</div>
                      </TableCell>
                      <TableCell className="font-bold text-green-700">{order.amount.toLocaleString()} F</TableCell>
                      <TableCell>
                        <Badge className={
                          order.status === 'Livré' ? 'bg-green-100 text-green-700' :
                          order.status === 'En cours' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-bold" onClick={() => updateOrderStatus(order.id, 'En cours')} disabled={isUpdating === order.id}>EXPÉDIER</Button>
                        <Button size="sm" className="h-8 rounded-lg text-[10px] font-bold bg-green-600" onClick={() => updateOrderStatus(order.id, 'Livré')} disabled={isUpdating === order.id}>LIVRER</Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteOrder(order.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ==== Onglet Courses (existant) ==== */}
          <TabsContent value="rides">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rides.map(ride => (
                <Card key={ride.id} className="border-none shadow-md rounded-[2rem] bg-white overflow-hidden">
                  <CardHeader className={`${ride.status === 'completed' ? 'bg-stone-100' : 'bg-orange-50'} p-4`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {ride.service_type === 'MOTO-TAXI' ? <MotorcycleIcon className="h-5 w-5" /> : <Truck className="h-5 w-5 text-blue-600" />}
                        <span className="text-xs font-black uppercase">{ride.service_type}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold">{ride.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-orange-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Trajet</p>
                        <p className="font-bold text-sm">{ride.pickup_location} → {ride.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Client</p>
                        <p className="font-bold text-xs">{ride.customer_name || "Client"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Prix</p>
                        <p className="font-black text-orange-600">{ride.price} F</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {ride.status === 'pending' && (
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => updateRideStatus(ride.id, 'accepted')}>Accepter</Button>
                      )}
                      {ride.status !== 'completed' && (
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => deleteRide(ride.id)}>Supprimer</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;