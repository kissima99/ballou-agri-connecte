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
  Phone
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { supabase, isCurrentUserSuperAdmin } from "@/integrations/supabase/client";

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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      const { data: ridesData, error: ridesError } = await supabase
        .from('rides')
        .select('*, client:client_id(full_name, phone_number), driver:driver_id(full_name, phone_number)')
        .order('created_at', { ascending: false });

      if (ridesError) throw ridesError;
      setRides(ridesData || []);

    } catch (err: any) {
      showError("Impossible de charger les données.");
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

  const updateOrderStatus = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, is_new: false })
        .eq('id', id);

      if (error) throw error;
      showSuccess(`Statut mis à jour : ${newStatus}`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus, is_new: false } : o));
    } catch (err: any) {
      showError("Échec de la mise à jour.");
    } finally {
      setIsUpdating(null);
    }
  };

  const updateRideStatus = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    try {
      const { error } = await supabase
        .from('rides')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      showSuccess(`Course mise à jour : ${newStatus}`);
      setRides(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err: any) {
      showError("Échec de la mise à jour.");
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm(`Supprimer la commande ${id} ?`)) return;
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      setOrders(orders.filter(o => o.id !== id));
      showSuccess("Supprimé.");
    } catch (err) { showError("Erreur."); }
  };

  const deleteRide = async (id: string) => {
    if (!window.confirm(`Supprimer cette course ?`)) return;
    try {
      const { error } = await supabase.from('rides').delete().eq('id', id);
      if (error) throw error;
      setRides(rides.filter(r => r.id !== id));
      showSuccess("Supprimé.");
    } catch (err) { showError("Erreur."); }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredRides = rides.filter(ride =>
    ride.pickup_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ride.customer_name && ride.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (ride.client?.full_name && ride.client.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-orange-600" />
              Tableau de Bord Admin
            </h1>
            <p className="text-gray-500 font-medium">Gestion centralisée des commandes et des courses.</p>
          </div>
          <Button variant="outline" onClick={fetchData} className="rounded-xl h-12 px-6 font-bold border-stone-200 bg-white" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RefreshCw className="h-5 w-5 mr-2" />}
            ACTUALISER
          </Button>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid grid-cols-2 mb-8 bg-white p-1 rounded-2xl shadow-sm border h-14 max-w-md">
            <TabsTrigger value="orders" className="font-bold rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Truck className="w-4 h-4 mr-2" /> COMMANDES ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="rides" className="font-bold rounded-xl data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <MotorcycleIcon className="w-6 h-6 mr-2" /> THIAK-THIAK ({rides.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              className="pl-12 h-14 rounded-2xl border-none shadow-sm bg-white text-lg font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <TabsContent value="orders">
            <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-stone-50">
                    <TableRow className="hover:bg-transparent border-stone-100">
                      <TableHead className="font-black text-gray-900 py-5 pl-8">COMMANDE</TableHead>
                      <TableHead className="font-black text-gray-900">CLIENT</TableHead>
                      <TableHead className="font-black text-gray-900">MONTANT</TableHead>
                      <TableHead className="font-black text-gray-900">STATUT</TableHead>
                      <TableHead className="font-black text-gray-900 text-right pr-8">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="h-10 w-10 animate-spin text-green-600 mx-auto" /></TableCell></TableRow>
                    ) : filteredOrders.map((order) => (
                      <TableRow key={order.id} className={`border-stone-50 ${order.is_new ? 'bg-orange-50/40' : ''}`}>
                        <TableCell className="pl-8 py-5">
                          <span className="font-black text-orange-600">{order.id}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold">{order.customer_name}</span>
                            <span className="text-xs text-gray-500">{order.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-black">{order.amount?.toLocaleString()} F</TableCell>
                        <TableCell>
                          <Badge className="rounded-full px-3 py-1 text-[10px] font-black uppercase">{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'Payé')} className="rounded-xl h-9">Payé</Button>
                            <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'En cours')} className="rounded-xl h-9">En cours</Button>
                            <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'Livré')} className="rounded-xl h-9">Livré</Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteOrder(order.id)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rides">
            <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-stone-50">
                    <TableRow className="hover:bg-transparent border-stone-100">
                      <TableHead className="font-black text-gray-900 py-5 pl-8">TRAJET</TableHead>
                      <TableHead className="font-black text-gray-900">CLIENT / CHAUFFEUR</TableHead>
                      <TableHead className="font-black text-gray-900">PRIX / PAIEMENT</TableHead>
                      <TableHead className="font-black text-gray-900">STATUT</TableHead>
                      <TableHead className="font-black text-gray-900 text-right pr-8">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto" /></TableCell></TableRow>
                    ) : filteredRides.map((ride) => (
                      <TableRow key={ride.id} className="border-stone-50">
                        <TableCell className="pl-8 py-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                              <MapPin className="h-3 w-3 text-red-500" /> {ride.pickup_location}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                              <Navigation className="h-3 w-3 text-green-500" /> {ride.destination}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-gray-400 uppercase">Client</span>
                              <span className="font-bold text-sm">
                                {ride.customer_name || ride.client?.full_name || "Anonyme"}
                              </span>
                              <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {ride.phone || ride.client?.phone_number || "N/A"}
                              </span>
                            </div>
                            {ride.driver && (
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-green-600 uppercase">Chauffeur</span>
                                <span className="font-bold text-sm">{ride.driver.full_name}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-black text-orange-600">À partir de {ride.price} F</span>
                            <div className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase">
                              <Banknote className="h-2.5 w-2.5" /> Cash après course
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                            ride.status === 'pending' ? 'bg-red-100 text-red-700' :
                            ride.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>{ride.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => updateRideStatus(ride.id, 'completed')} className="rounded-xl h-9">Terminer</Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteRide(ride.id)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                          </div>
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