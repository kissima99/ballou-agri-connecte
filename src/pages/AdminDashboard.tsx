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
  PackageCheck, 
  Clock, 
  CheckCircle2, 
  Search, 
  Bell,
  Truck,
  CreditCard,
  Check
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  useEffect(() => {
    const isAdmin = localStorage.getItem('is_super_admin') === 'true';
    if (!isAdmin) {
      showError("Accès réservé au Super Admin.");
      navigate('/');
      return;
    }

    const loadOrders = () => {
      const history = JSON.parse(localStorage.getItem('purchase_history') || '[]');
      setOrders(history);
      const newCount = history.filter((o: any) => o.isNew).length;
      setNewOrdersCount(newCount);
    };

    loadOrders();
    window.addEventListener('storage', loadOrders);
    return () => window.removeEventListener('storage', loadOrders);
  }, [navigate]);

  const updateOrderStatus = (id: string, newStatus: string) => {
    const updatedOrders = orders.map(order => 
      order.id === id ? { ...order, status: newStatus, isNew: false } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('purchase_history', JSON.stringify(updatedOrders));
    window.dispatchEvent(new Event('storage'));
    showSuccess(`Commande ${id} mise à jour : ${newStatus}`);
  };

  const validatePayment = (id: string) => {
    const updatedOrders = orders.map(order => 
      order.id === id ? { ...order, paymentValidated: true, isNew: false } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('purchase_history', JSON.stringify(updatedOrders));
    window.dispatchEvent(new Event('storage'));
    showSuccess(`Paiement validé pour la commande ${id}`);
  };

  const clearNotifications = () => {
    const updatedOrders = orders.map(o => ({ ...o, isNew: false }));
    setOrders(updatedOrders);
    localStorage.setItem('purchase_history', JSON.stringify(updatedOrders));
    setNewOrdersCount(0);
    showSuccess("Notifications effacées");
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.phone && order.phone.includes(searchTerm));
    
    const matchesFilter = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: orders.length,
    pendingPayment: orders.filter(o => o.status === "Attente Paiement").length,
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
            <p className="text-gray-500 font-medium">Gestion des flux et validation des paiements</p>
          </div>
          <Button 
            variant="outline" 
            onClick={clearNotifications}
            className={`rounded-full h-12 w-12 p-0 border-orange-200 bg-white relative ${newOrdersCount > 0 ? 'ring-2 ring-orange-500' : ''}`}
          >
            <Bell className={`h-6 w-6 ${newOrdersCount > 0 ? 'text-orange-600 animate-swing' : 'text-gray-400'}`} />
            {newOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                {newOrdersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Stats Grid */}
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

        {/* Orders Table */}
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
                  <TableHead className="font-bold text-gray-900">Méthode</TableHead>
                  <TableHead className="font-bold text-gray-900">Montant</TableHead>
                  <TableHead className="font-bold text-gray-900">Statut</TableHead>
                  <TableHead className="font-bold text-gray-900 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-20 text-gray-400 font-medium">Aucune commande.</TableCell></TableRow>
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
                      <TableCell>
                        <Badge variant="outline" className="uppercase text-[9px] font-bold">
                          {order.method === 'wave' ? 'Wave' : 'Orange Money'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-gray-900">{order.amount.toLocaleString()} FCFA</TableCell>
                      <TableCell>
                        <Badge className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider border-none ${
                          order.status === 'Attente Paiement' ? 'bg-red-100 text-red-700' :
                          order.status === 'Payé' ? 'bg-orange-100 text-orange-700' :
                          order.status === 'En cours' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          {order.status === 'Attente Paiement' && !order.paymentValidated && (
                            <Button onClick={() => validatePayment(order.id)} className="bg-red-600 hover:bg-red-700 h-8 px-3 text-[10px] font-bold rounded-lg">
                              <Check className="w-3 h-3 mr-1" /> VALIDER PAIEMENT
                            </Button>
                          )}
                          {order.status === 'Payé' && (
                            <Button onClick={() => updateOrderStatus(order.id, 'En cours')} className="bg-blue-600 hover:bg-blue-700 h-8 px-3 text-[10px] font-bold rounded-lg">
                              <Truck className="w-3 h-3 mr-1" /> EXPÉDIER
                            </Button>
                          )}
                          {order.status === 'En cours' && (
                            <Button onClick={() => updateOrderStatus(order.id, 'Livré')} className="bg-green-600 hover:bg-green-700 h-8 px-3 text-[10px] font-bold rounded-lg">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> LIVRER
                            </Button>
                          )}
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