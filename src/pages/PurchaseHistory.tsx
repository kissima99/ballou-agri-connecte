import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { ShoppingCart, Clock } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

const PurchaseHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err: any) {
        showError("Erreur lors du chargement de l'historique: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const generatePDF = async (order: any) => {
    try {
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
            
            <div class="total">
              TOTAL: ${order.amount.toLocaleString()} FCFA
            </div>
            
            <div class="footer">
              <p>Merci pour votre commande !</p>
              <p>Ballou Agri Connect - Votre partenaire agricole de confiance</p>
              <p>Contact: 78 225 45 48</p>
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
    } catch (err: any) {
      showError("Erreur lors de la génération du PDF: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container px-4 py-12 mx-auto">
        <h1 className="text-3xl font-bold text-green-900 mb-8">Mes Achats</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune commande trouvée</h2>
            <p className="text-gray-500">Commencez vos achats pour voir votre historique ici.</p>
            <Button asChild className="bg-green-600 hover:bg-green-700 mt-6 font-bold">
              <Link to="/local-products">Voir les produits</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any, index: number) => (
              <Card key={order.id} className="border-none shadow-xl">
                <CardHeader className="bg-green-700 text-white">
                  <CardTitle className="text-xl">Commande #{order.id}</CardTitle>
                  <div className="flex items-center gap-2 text-green-100 text-sm">
                    <Clock className="h-4 w-4" />
                    {new Date(order.created_at).toLocaleDateString('fr-FR')} à {new Date(order.created_at).toLocaleTimeString('fr-FR')}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Informations Client</h3>
                      <p className="text-sm text-gray-600"><strong>Nom:</strong> {order.customer_name}</p>
                      <p className="text-sm text-gray-600"><strong>Téléphone:</strong> {order.phone}</p>
                      <p className="text-sm text-gray-600"><strong>Adresse:</strong> {order.address}</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Détails Commande</h3>
                      <p className="text-sm text-gray-600"><strong>Statut:</strong> {order.status}</p>
                      <p className="text-sm text-gray-600"><strong>Montant Total:</strong> {order.amount.toLocaleString()} FCFA</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Produits Commandés</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-stone-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Produit</th>
                            <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Qté</th>
                            <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Prix</th>
                            <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items?.map((item: any, idx: number) => (
                            <tr key={idx} className="border-t">
                              <td className="px-4 py-3 text-sm">{item.name}</td>
                              <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-right">{item.price.toLocaleString()} FCFA</td>
                              <td className="px-4 py-3 text-sm text-right font-bold">{(item.price * item.quantity).toLocaleString()} FCFA</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center bg-stone-50 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {new Date(order.created_at).toLocaleTimeString('fr-FR')}
                  </div>
                  <Button onClick={() => generatePDF(order)} className="bg-green-600 hover:bg-green-700">
                    <Download className="mr-2 h-4 w-4" /> Télécharger Reçu
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