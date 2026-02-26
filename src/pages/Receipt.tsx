import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { showError } from '@/utils/toast';

const Receipt = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err: any) {
        showError("Commande introuvable");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const generatePDF = () => {
    if (!order) return;

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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement du reçu...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="container px-4 py-20 mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Commande non trouvée</h1>
          <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container px-4 py-12 mx-auto max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Reçu de Commande</h1>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="bg-green-700 text-white">
            <CardTitle className="text-xl">Reçu #{order.id}</CardTitle>
            <p className="text-green-100">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
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

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">TOTAL</span>
                <span className="text-2xl font-black text-green-700">{order.amount.toLocaleString()} FCFA</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between bg-stone-50 border-t">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button onClick={generatePDF} className="bg-green-600 hover:bg-green-700">
              <Printer className="mr-2 h-4 w-4" /> Imprimer / PDF
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Receipt;