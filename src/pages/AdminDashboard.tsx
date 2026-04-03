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
  Loader2,
  RefreshCw,
  Trash2,
  CheckCircle,
  Truck,
  CreditCard,
  Calendar
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { supabase, isCurrentUserSuperAdmin } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      showError("Erreur lors du chargement des commandes.");
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
      await fetchOrders();
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

      showSuccess(`Commande ${id} : Statut mis à jour vers "${newStatus}"`);
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus, is_new: false } : o));
    } catch (err: any) {
      showError("Erreur lors de la mise à jour du statut.");
    } finally {
      setIsUpdating(null);
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
      setOrders(orders.filter(o => o.id !== id));
    } catch (err: any) {
      showError("Erreur lors de la suppression de la commande.");
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.phone && order.phone.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-orange-600" />
              Gestion des Commandes
            </h1>
            <p className="text-gray-500 font-medium">Validez les étapes de livraison et gérez les flux.</p>
          </div>
          <Button variant="outline" onClick={fetchOrders} className="rounded-xl h-12 px-6 font-bold border-stone-200 bg-white" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RefreshCw className="h-5 w-5 mr-2" />}
            ACTUALISER
          </Button>
        </div>

        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2rem]">
          <CardHeader className="border-b bg-stone-50/50 py-6 px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <CardTitle className="text-xl font-bold text-gray-800">Liste des Transactions</CardTitle>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par ID, Nom ou Tel..."
                  className="pl-10 h-11 rounded-xl border-stone-200 bg-white focus-visible:ring-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-stone-50">
                  <TableRow className="hover:bg-transparent border-stone-100">
                    <TableHead className="font-black text-gray-900 py-5 pl-8">COMMANDE</TableHead>
                    <TableHead className="font-black text-gray-900">CLIENT</TableHead>
                    <TableHead className="font-black text-gray-900">MONTANT</TableHead>
                    <TableHead className="font-black text-gray-900">STATUT ACTUEL</TableHead>
                    <TableHead className="font-black text-gray-900 text-right pr-8">ACTIONS DE VALIDATION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto" /></TableCell></TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-20 text-gray-400 font-medium">Aucune commande trouvée.</TableCell></TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className={`border-stone-50 hover:bg-stone-50/30 transition-colors ${order.is_new ? 'bg-orange-50/40' : ''}`}>
                        <TableCell className="pl-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-black text-orange-600 text-base">{order.id}</span>
                            <span className="text-[10px] text-gray-400 flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" /> {new Date(order.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{order.customer_name}</span>
                            <span className="text-xs text-gray-500 font-medium">{order.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-black text-gray-900">{order.amount.toLocaleString()} FCFA</TableCell>
                        <TableCell>
                          <Badge className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider border-none ${
                            (order.status === 'Attente Paiement' || order.status === 'Attente de validation admin') ? 'bg-red-100 text-red-700' :
                            order.status === 'Payé' ? 'bg-orange-100 text-orange-700' :
                            order.status === 'En cours' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={isUpdating === order.id}
                              onClick={() => updateOrderStatus(order.id, 'Payé')} 
                              className={`rounded-xl h-9 px-3 font-bold transition-all ${order.status === 'Payé' ? 'bg-orange-600 text-white border-orange-600' : 'hover:border-orange-500 hover:text-orange-600'}`}
                            >
                              <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Payé
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={isUpdating === order.id}
                              onClick={() => updateOrderStatus(order.id, 'En cours')} 
                              className={`rounded-xl h-9 px-3 font-bold transition-all ${order.status === 'En cours' ? 'bg-blue-600 text-white border-blue-600' : 'hover:border-blue-500 hover:text-blue-600'}`}
                            >
                              <Truck className="w-3.5 h-3.5 mr-1.5" /> En cours
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={isUpdating === order.id}
                              onClick={() => updateOrderStatus(order.id, 'Livré')} 
                              className={`rounded-xl h-9 px-3 font-bold transition-all ${order.status === 'Livré' ? 'bg-green-600 text-white border-green-600' : 'hover:border-green-500 hover:text-green-600'}`}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Livré
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteOrder(order.id)} 
                              className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;