"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Search,
  Bell,
  Loader2,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { supabase, isCurrentUserSuperAdmin } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedOrders = data.map((o: any) => ({
          id: o.id,
          customer: o.customer_name,
          phone: o.phone,
          address: o.address,
          amount: o.amount,
          status: o.status,
          isNew: o.is_new,
          created_at: o.created_at
        }));
        setOrders(formattedOrders);
        setNewOrdersCount(formattedOrders.filter((o: any) => o.isNew).length);
      }
    } catch (err: any) {
      console.error("Admin fetch error:", err);
      showError("Accès refusé ou erreur lors du chargement des commandes.");
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      const isSuperAdmin = await isCurrentUserSuperAdmin();
      if (!isSuperAdmin) {
        showError("Accès réservé au Super Admin.");
        navigate('/');
        return;
      }

      await fetchOrders();

      const channel = supabase
        .channel('admin_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          fetchOrders();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanupPromise = boot();
    return () => {
      void cleanupPromise;
    };
  }, [navigate]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, is_new: false })
        .eq('id', id);

      if (error) throw error;

      showSuccess(`Commande ${id} mise à jour.`);
      fetchOrders();
    } catch (err: any) {
      showError("Erreur de mise à jour.");
    }
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement la commande ${id} ?`)) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showSuccess(`Commande ${id} supprimée avec succès.`);
      fetchOrders();
    } catch (err: any) {
      showError("Erreur lors de la suppression de la commande.");
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.phone && order.phone.includes(searchTerm))
  );

  const stats = {
    total: orders.length,
    pendingPayment: orders.filter(o => o.status === "Attente Paiement" || o.status === "Attente de validation admin").length,
    pendingShipment: orders.filter(o => o.status === "Payé").length,
    completed: orders.filter(o => o.status === "Livré").length,
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-orange-600" />
              Super Admin
            </h1>
            <p className="text-gray-500 font-medium">Gestion des commandes</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchOrders}
              className="rounded-xl border-stone-200 bg-white h-12 px-6 font-bold"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RefreshCw className="h-5 w-5 mr-2" />}
              RAFRAÎCHIR
            </Button>
            <div className="relative">
              <Button variant="outline" className="rounded-xl h-12 w-12 p-0 border-stone-200 bg-white">
                <Bell className={`h-6 w-6 ${newOrdersCount > 0 ? 'text-orange-600 animate-pulse' : 'text-gray-400'}`} />
                {newOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                    {newOrdersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</p>
              <h3 className="text-3xl font-black text-gray-900">{stats.total}</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Attente Paiement</p>
              <h3 className="text-3xl font-black text-red-600">{stats.pendingPayment}</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">À Expédier</p>
              <h3 className="text-3xl font-black text-orange-600">{stats.pendingShipment}</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Livrées</p>
              <h3 className="text-3xl font-black text-green-600">{stats.completed}</h3>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
          <CardHeader className="border-b bg-stone-50/50 py-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <CardTitle className="text-xl font-bold">Commandes Récentes</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10 h-10 rounded-xl border-stone-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-stone-50">
                <TableRow className="hover:bg-transparent border-stone-100">
                  <TableHead className="font-bold text-gray-900 py-4 pl-6">ID</TableHead>
                  <TableHead className="font-bold text-gray-900">Client</TableHead>
                  <TableHead className="font-bold text-gray-900">Montant</TableHead>
                  <TableHead className="font-bold text-gray-900">Statut</TableHead>
                  <TableHead className="font-bold text-gray-900 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-gray-400 font-medium">Aucune commande trouvée.</TableCell></TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className={`border-stone-50 hover:bg-stone-50/50 transition-colors ${order.isNew ? 'bg-orange-50/30' : ''}`}>
                      <TableCell className="font-black text-orange-600 pl-6">{order.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{order.customer}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{order.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-gray-900">{order.amount.toLocaleString()} FCFA</TableCell>
                      <TableCell>
                        <Badge className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider border-none ${
                          (order.status === 'Attente Paiement' || order.status === 'Attente de validation admin') ? 'bg-red-100 text-red-700' :
                          order.status === 'Payé' ? 'bg-orange-100 text-orange-700' :
                          order.status === 'En cours' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => updateOrderStatus(order.id, 'Payé')} className="rounded-xl">Payé</Button>
                          <Button variant="outline" size="sm" onClick={() => updateOrderStatus(order.id, 'En cours')} className="rounded-xl">En cours</Button>
                          <Button variant="outline" size="sm" onClick={() => updateOrderStatus(order.id, 'Livré')} className="rounded-xl">Livré</Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteOrder(order.id)} className="rounded-xl">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;