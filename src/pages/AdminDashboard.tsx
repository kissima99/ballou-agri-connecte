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
  Trash2,
  CheckCircle,
  Truck,
  CreditCard
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
      showError("Erreur lors du chargement des commandes.");
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
    };
    boot();
  }, [navigate]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, is_new: false })
        .eq('id', id);

      if (error) throw error;

      showSuccess(`Commande ${id} passée en statut : ${newStatus}`);
      // Mise à jour locale pour éviter un rechargement complet
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus, isNew: false } : o));
    } catch (err: any) {
      showError("Erreur de mise à jour.");
    }
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm(`Supprimer définitivement la commande ${id} ?`)) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showSuccess(`Commande ${id} supprimée.`);
      setOrders(orders.filter(o => o.id !== id));
    } catch (err: any) {
      showError("Erreur lors de la suppression.");
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              Super Admin
            </h1>
            <p className="text-gray-500 font-medium">Gestion des flux et commandes</p>
          </div>
          <Button variant="outline" onClick={fetchOrders} className="rounded-xl h-12 px-6 font-bold" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RefreshCw className="h-5 w-5 mr-2" />}
            ACTUALISER
          </Button>
        </div>

        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
          <CardHeader className="border-b bg-stone-50/50 py-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <CardTitle className="text-xl font-bold">Toutes les commandes</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ID, Nom ou Téléphone..."
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
                  <TableHead className="font-bold text-gray-900 py-4 pl-6">ID / DATE</TableHead>
                  <TableHead className="font-bold text-gray-900">CLIENT</TableHead>
                  <TableHead className="font-bold text-gray-900">MONTANT</TableHead>
                  <TableHead className="font-bold text-gray-900">STATUT</TableHead>
                  <TableHead className="font-bold text-gray-900 text-right pr-6">ACTIONS DE STATUT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-gray-400 font-medium">Aucune commande.</TableCell></TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className={`border-stone-50 hover:bg-stone-50/50 transition-colors ${order.isNew ? 'bg-orange-50/30' : ''}`}>
                      <TableCell className="pl-6">
                        <div className="flex flex-col">
                          <span className="font-black text-orange-600">{order.id}</span>
                          <span className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'Payé')} 
                            className={`rounded-xl h-9 px-3 font-bold ${order.status === 'Payé' ? 'bg-orange-50 border-orange-500 text-orange-700' : ''}`}
                          >
                            <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Payé
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'En cours')} 
                            className={`rounded-xl h-9 px-3 font-bold ${order.status === 'En cours' ? 'bg-blue-50 border-blue-500 text-blue-700' : ''}`}
                          >
                            <Truck className="w-3.5 h-3.5 mr-1.5" /> En cours
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'Livré')} 
                            className={`rounded-xl h-9 px-3 font-bold ${order.status === 'Livré' ? 'bg-green-50 border-green-500 text-green-700' : ''}`}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Livré
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteOrder(order.id)} className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50">
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