import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ShoppingCart, Clock, LogIn, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { showError } from '@/utils/toast';

const PurchaseHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUserAndFetchOrders = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!user) {
          setLoading(false);
          return;
        }

        // On filtre explicitement par user_id pour la sécurité
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err: any) {
        showError("Erreur lors du chargement de l'historique: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetchOrders();
  }, []);

  const generatePDF = (order: any) => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reçu - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #16a34a; }
            .title { font-size: 20px; margin: 10px 0; }
            .info { margin: 20px 0; }
            .info p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f1f5f9; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">BALLOU AGRI CONNECT</div>
            <div class="title">REÇU DE COMMANDE</div>
            <div>Commande #${order.id}</div>
            <div>Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')}</div>
          </div>
          <div class="info">
            <p><strong>Client:</strong> ${order.customer_name}</p>
            <p><strong>Téléphone:</strong> ${order.phone}</p>
            <p><strong>Adresse:</strong> ${order.address}</p>
            <p><strong>Statut:</strong> ${order.status}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items ? order.items.map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price.toLocaleString()} FCFA</td>
                  <td>${(item.price * item.quantity).toLocaleString()} FCFA</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>
          <div class="total">TOTAL: ${order.amount.toLocaleString()} FCFA</div>
          <div class="footer">
            <p>Merci pour votre confiance !</p>
            <p>Ballou Agri Connect - 78 225 45 48</p>
          </div>
        </body>
      </html>
    `;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(receiptContent);
      newWindow.document.close();
      newWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Chargement de vos achats...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="container px-4 py-20 mx-auto text-center max-w-md">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-4">Identifiez-vous</h1>
            <p className="text-gray-500 mb-8">Connectez-vous pour accéder à l'historique de vos commandes en toute sécurité.</p>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700 h-14 rounded-2xl font-bold text-lg">
              <Link to="/login">Se connecter</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-green-900">Mes Achats</h1>
            <p className="text-gray-500 font-medium">Historique personnel de vos commandes</p>
          </div>
          <Button asChild variant="outline" className="rounded-xl border-green-200 text-green-700 font-bold">
            <Link to="/">Retour</Link>
          </Button>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-stone-100">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune commande trouvée</h2>
            <p className="text-gray-500">Vous n'avez pas encore passé de commande avec ce compte.</p>
            <Button asChild className="bg-green-600 hover:bg-green-700 mt-8 h-12 px-8 rounded-xl font-bold">
              <Link to="/local-products">Découvrir nos produits</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="border-none shadow-lg rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="bg-green-700 text-white p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl font-black">Commande #{order.id}</CardTitle>
                      <div className="flex items-center gap-2 text-green-100 text-xs mt-1 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(order.created_at).toLocaleDateString('fr-FR')} à {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30 backdrop-blur-sm">
                      {order.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Livraison</h3>
                      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        <p className="text-sm font-bold text-gray-900">{order.customer_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{order.phone}</p>
                        <p className="text-sm text-gray-600">{order.address}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Paiement</h3>
                      <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                        <p className="text-2xl font-black text-green-700">{order.amount.toLocaleString()} FCFA</p>
                        <p className="text-[10px] font-bold text-green-600 uppercase mt-1">Total TTC</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Articles</h3>
                    <div className="border border-stone-100 rounded-2xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-stone-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase">Produit</th>
                            <th className="px-4 py-3 text-center text-[10px] font-black text-gray-500 uppercase">Qté</th>
                            <th className="px-4 py-3 text-right text-[10px] font-black text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {order.items?.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                              <td className="px-4 py-3 text-sm font-bold text-gray-900">{item.name}</td>
                              <td className="px-4 py-3 text-sm text-center text-gray-600">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-right font-black text-green-700">{(item.price * item.quantity).toLocaleString()} FCFA</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-stone-50/50 border-t border-stone-100 p-6 flex justify-end">
                  <Button onClick={() => generatePDF(order)} className="bg-green-600 hover:bg-green-700 h-12 px-6 rounded-xl font-bold shadow-md">
                    <Download className="mr-2 h-4 w-4" /> Télécharger le Reçu
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;