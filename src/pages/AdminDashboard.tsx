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
  CheckCircle2,
  Package,
  Clock,
  CreditCard,
  Bike
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { supabase, isCurrentUserSuperAdmin } from '@/integrations/supabase/client';

const MotorcycleIcon = ({ className }: { className?: string }) => (
  <Bike className={className} />
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, is_new: false })
        .eq('id', orderId);

      if (error) throw error;
      
      // Mise à jour locale immédiate
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showSuccess(`Commande ${orderId} : ${newStatus}`);
    } catch (err: any) {
      showError("Erreur de mise à jour : " + err.message);
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer définitivement cette commande ?")) return;
    
    setIsUpdating(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      
      // Suppression locale immédiate pour que la ligne disparaisse
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showSuccess("Commande supprimée.");
    } catch (err: any) {
      showError("Erreur lors de la suppression : " + err.message);
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteRide = async (rideId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette course ?")) return;
    
    setIsUpdating(rideId);
    try {
      const { error } = await supabase
        .from('rides')
        .delete()
        .eq('id', rideId);

      if (error) throw error;
      
      // Suppression locale immédiate
      setRides(prev => prev.filter(r => r.id !== rideId));
      showSuccess("Course supprimée.");
    } catch (err: any) {
      showError("Erreur lors de la suppression : " + err.message);
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRides = rides.filter(r => 
    (r.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.pickup_location.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-green-700" />
              Tableau de Bord Admin
            </h1>
            <p className="text-gray-500 font-medium">Gestion des flux Ballou Agri Connect</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-10 rounded-xl border-stone-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={fetchData} variant="outline" className="rounded-xl border-stone-200 bg-white">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="mb-8 bg-white p-1 rounded-2xl shadow-sm border h-14">
            <TabsTrigger value="orders" className="font-bold rounded-xl px-8 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" /> COMMANDES ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="rides" className="font-bold rounded-xl px-8 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <MotorcycleIcon className="w-5 h-5 mr-2" /> THIAK-THIAK ({rides.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-stone-50">
                    <TableRow>
                      <TableHead className="font-bold text-gray-600 px-6">ID / Date</TableHead>
                      <TableHead className="font-bold text-gray-600">Client</TableHead>
                      <TableHead className="font-bold text-gray-600">Montant</TableHead>
                      <TableHead className="font-bold text-gray-600">Statut</TableHead>
                      <TableHead className="font-bold text-gray-600 text-right px-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20 text-gray-400 font-medium">Aucune commande trouvée.</TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-stone-50/50 transition-colors">
                          <TableCell className="px-6">
                            <div className="font-bold text-gray-900">{order.id}</div>
                            <div className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR')}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-gray-800">{order.customer_name}</div>
                            <div className="text-xs text-gray-500">{order.phone}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-black text-green-700">{order.amount.toLocaleString()} F</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`border-none font-bold text-[10px] px-3 py-1 rounded-full ${
                              order.status === 'Livré' ? 'bg-green-100 text-green-700' : 
                              order.status === 'Expédié' ? 'bg-blue-100 text-blue-700' : 
                              order.status === 'Payé' ? 'bg-purple-100 text-purple-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right px-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-9 rounded-xl text-[10px] font-black border-purple-200 text-purple-700 hover:bg-purple-50"
                                onClick={() => updateOrderStatus(order.id, 'Payé')}
                                disabled={isUpdating === order.id}
                              >
                                <CreditCard className="h-3 w-3 mr-1" /> PAYÉ
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-9 rounded-xl text-[10px] font-black border-blue-200 text-blue-700 hover:bg-blue-50"
                                onClick={() => updateOrderStatus(order.id, 'Expédié')}
                                disabled={isUpdating === order.id}
                              >
                                <Truck className="h-3 w-3 mr-1" /> EXPÉDIER
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-9 rounded-xl text-[10px] font-black bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => updateOrderStatus(order.id, 'Livré')}
                                disabled={isUpdating === order.id}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" /> LIVRER
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl flex items-center justify-center"
                                onClick={() => deleteOrder(order.id)}
                                disabled={isUpdating === order.id}
                              >
                                {isUpdating === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="rides" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRides.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-[2rem] text-gray-400 font-medium">Aucune course enregistrée.</div>
              ) : (
                filteredRides.map((ride) => (
                  <Card key={ride.id} className="border-none shadow-lg rounded-[2rem] overflow-hidden bg-white group">
                    <CardHeader className={`${ride.status === 'completed' ? 'bg-stone-100' : 'bg-orange-50'} p-5`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <MotorcycleIcon className="h-6 w-6" />
                          <span className="text-xs font-black uppercase tracking-tighter">{ride.service_type}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black border-stone-300 uppercase">{ride.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><MapPin className="h-4 w-4" /></div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Trajet</p>
                          <p className="font-bold text-sm text-gray-900">{ride.pickup_location} <span className="text-orange-500">→</span> {ride.destination}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                        <div>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Client</p>
                          <p className="font-bold text-xs text-gray-800">{ride.customer_name || "Client Anonyme"}</p>
                          <p className="text-[10px] text-gray-500">{ride.phone || "Pas de tel"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Prix</p>
                          <p className="font-black text-lg text-orange-600">{ride.price.toLocaleString()} F</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                          <Clock className="h-3 w-3" /> {new Date(ride.created_at).toLocaleDateString()}
                        </div>
                        <Button 
                          variant="destructive"
                          size="sm"
                          className="h-9 rounded-xl text-[10px] font-black bg-red-600 hover:bg-red-700"
                          onClick={() => deleteRide(ride.id)}
                          disabled={isUpdating === ride.id}
                        >
                          {isUpdating === ride.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Trash2 className="h-3 w-3 mr-1" />}
                          SUPPRIMER
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;