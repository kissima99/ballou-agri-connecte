"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Home, Search, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const PurchaseHistory = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('purchase_history') || '[]');
    setHistory(savedHistory);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-5xl">
        <div className="flex items-center gap-4 mb-10">
          <Button asChild variant="outline" size="icon" className="rounded-full">
            <Link to="/"><Home className="h-4 w-4 text-green-700" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historique des Achats</h1>
            <p className="text-gray-600">Consultez vos commandes passées et téléchargez vos reçus.</p>
          </div>
        </div>

        {history.length === 0 ? (
          <Card className="border-none shadow-sm text-center py-20">
            <CardContent>
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun achat pour le moment</h3>
              <p className="text-gray-500 mb-6">Vos commandes apparaîtront ici une fois confirmées.</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/local-products">Commencer mes achats</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-bold text-green-700">{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{order.product}</TableCell>
                    <TableCell>{order.amount.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/tracking"><Search className="h-4 w-4 mr-1" /> Suivre</Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          <FileText className="h-4 w-4 mr-1" /> Reçu
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;