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
  Filter,
  Eye,
  Truck,
  X
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const AdminDashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  const loadOrders = () => {
    const history = JSON.parse(localStorage.getItem('purchase_history') || '[]');
    setOrders(history);
    
    // Compter les nouvelles commandes (isNew: true)
    const newCount = history.filter((o: any) => o.isNew).length;
    setNewOrdersCount(newCount);
  };

  useEffect(() => {
    loadOrders();
    
    // Écouter les changements de localStorage pour les nouvelles commandes
    const handleStorageChange = () => loadOrders();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateOrderStatus = (id: string, newStatus: string) => {
    const updatedOrders = orders.map(order => 
      order.id === id ? { ...order, status: newStatus, isNew: false } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('purchase_history', JSON.stringify(updatedOrders));
    setNewOrdersCount(prev => Math.max(0, prev - 1));
    showSuccess(`Commande ${id} mise à jour : ${newStatus}`);
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
    pending: orders.filter(o => o.status === "Payé").length,
    shipped: orders.filter(o => o.status === "En cours").length,
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
              Super Admin - BALLOU AGRI CONNECT
            </h1>
            <p className="text-gray-500 font-medium">Gestion des flux et traitement des commandes</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button 
                variant="outline" 
                onClick={clearNotifications}
                className={`rounded-full h-12 w-12 p-0 border-orange-200 bg-white ${newOrdersCount > 0 ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
              >
                <Bell className={`h-6 w-6 ${newOrdersCount > 0 ? 'text-orange-600 animate-swing' : 'text-gray-400'}`} />
                {newOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                    {newOrdersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</p>
                  <h3 className="text-3xl font-black text-gray-900">{stats.total}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-2xl"><PackageCheck className="text-blue-600 h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">À Traiter</p>
                  <h3 className="text-3xl font-black text-orange-600">{stats.pending}</h3>
                </div>
                <div className="bg-orange-100 p-3 rounded-2xl"><Clock className="text-orange-600 h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">En Transit</p>
                  <h3 className="text-3xl font-black text-blue-600">{stats.shipped}</h3>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl"><Truck className="text-blue-600 h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Livrées</p>
                  <h3 className="text-3xl font-black text-green-600">{stats.completed}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-2xl"><CheckCircle2 className="text-green-600 h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
          <CardHeader className="border-b bg-stone-50/50 py-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <CardTitle className="text-xl font-bold">Commandes Récentes</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Rechercher (ID, Nom, Tel)..." 
                    className="pl-10 h-10 rounded-xl border-stone-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex bg-stone-100 p-1 rounded-xl">
                  <Button 
                    variant={filterStatus === 'all' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setFilterStatus('all')}
                    className="text-[10px] font-bold h-8"
                  >TOUT</Button>
                  <Button 
                    variant={filterStatus === 'Payé' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setFilterStatus('Payé')}
                    className="text-[10px] font-bold h-8"
                  >PAYÉ</Button>
                  <Button 
                    variant={filterStatus === 'En cours' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setFilterStatus('En cours')}
                    className="text-[10px] font-bold h-8"
                  >TRANSIT</Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-stone-50">
                <TableRow className="hover:bg-transparent border-stone-100">
                  <TableHead className="font-bold text-gray-900 py-4 pl-6">ID</TableHead>
                  <TableHead className="font-bold text-gray-900">Client</TableHead>
                  <TableHead className="font-bold text-gray-900">Zone</TableHead>
                  <TableHead className="font-bold text-gray-900">Montant</TableHead>
                  <TableHead className="font-bold text-gray-900">Statut</TableHead>
                  <TableHead className="font-bold text-gray-900 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-20 text-gray-400 font-medium">Aucune commande trouvée.</TableCell></TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className={`border-stone-50 hover:bg-stone-50/50 transition-colors ${order.isNew ? 'bg-orange-50/30' : ''}`}>
                      <TableCell className="font-black text-orange-600 pl-6">
                        {order.id}
                        {order.isNew && <span className="ml-2 inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{order.customer}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{order.phone || order.email}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="uppercase text-[9px] font-bold">{order.zone || 'Dakar'}</Badge></TableCell>
                      <TableCell className="font-bold text-gray-900">{order.amount.toLocaleString()} FCFA</TableCell>
                      <TableCell>
                        <Badge className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider border-none ${
                          order.status === 'Payé' ? 'bg-orange-100 text-orange-700' :
                          order.status === 'En cours' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          {order.status === 'Payé' && (
                            <Button onClick={() => updateOrderStatus(order.id, 'En cours')} className="bg-blue-600 hover:bg-blue-700 h-8 px-3 text-[10px] font-bold rounded-lg">EXPÉDIER</Button>
                          )}
                          {order.status === 'En cours' && (
                            <Button onClick={() => updateOrderStatus(order.id, 'Livré')} className="bg-green-600 hover:bg-green-700 h-8 px-3 text-[10px] font-bold rounded-lg">LIVRER</Button>
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