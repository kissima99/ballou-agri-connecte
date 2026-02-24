"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutDashboard, PackageCheck, Clock, CheckCircle2, Search, Bell, Truck, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      showError("Erreur lors du chargement des commandes.");
    } else {
      setOrders(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem('is_super_admin') === 'true';
    if (!isAdmin) {
      showError("Accès réservé.");
      navigate('/');
      return;
    }
    fetchOrders();
  }, [navigate]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, is_new: false })
      .eq('id', id);

    if (error) {
      showError("Erreur de mise à jour.");
    } else {
      showSuccess(`Commande ${id} mise à jour.`);
      fetchOrders();
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3"><LayoutDashboard className="h-8 w-8 text-orange-600" /> Super Admin</h1>
          <Button onClick={fetchOrders} variant="outline" size="icon" className="rounded-full"><Bell className="h-5 w-5" /></Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-600" /></div>
        ) : (
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="border-b py-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">Commandes Synchronisées</CardTitle>
                <Input placeholder="Rechercher..." className="w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-stone-50">
                  <TableRow><TableHead className="pl-6">ID</TableHead><TableHead>Client</TableHead><TableHead>Zone</TableHead><TableHead>Montant</TableHead><TableHead>Statut</TableHead><TableHead className="text-right pr-6">Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className={order.is_new ? 'bg-orange-50/30' : ''}>
                      <TableCell className="font-black text-orange-600 pl-6">{order.id}</TableCell>
                      <TableCell className="font-bold">{order.customer_name}</TableCell>
                      <TableCell><Badge variant="outline">{order.zone}</Badge></TableCell>
                      <TableCell className="font-bold">{order.amount.toLocaleString()} FCFA</TableCell>
                      <TableCell><Badge className={order.status === 'Payé' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}>{order.status}</Badge></TableCell>
                      <TableCell className="text-right pr-6">
                        {order.status === 'Payé' && <Button onClick={() => updateOrderStatus(order.id, 'En cours')} size="sm" className="bg-blue-600">EXPÉDIER</Button>}
                        {order.status === 'En cours' && <Button onClick={() => updateOrderStatus(order.id, 'Livré')} size="sm" className="bg-green-600">LIVRER</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;