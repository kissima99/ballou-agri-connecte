import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ShoppingCart, Clock, FileText, ChevronRight } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { showError } from '@/utils/toast';
import Navbar from '@/components/Navbar';

const escapeHtml = (value: unknown) => {
  const s = String(value ?? "");
  return s
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const PurchaseHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

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

    fetchOrders();
  }, [navigate]);

  const downloadPDF = (order: any) => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Reçu Ballou Agri Connect - ${escapeHtml(order.id)}</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.6; padding: 40px; }
            .container { max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 30px; border-radius: 10px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; color: #16a34a; }
            .logo span { color: #f97316; }
            .receipt-title { font-size: 20px; font-weight: bold; text-transform: uppercase; margin: 0; }
            .tracking-section { background: #f8fafc; border: 2px dashed #cbd5e1; padding: 15px; text-align: center; margin-bottom: 30px; border-radius: 8px; }
            .tracking-label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
            .tracking-code { font-size: 22px; font-weight: 900; color: #1e293b; letter-spacing: 2px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
            .details-box h3 { font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
            .details-box p { margin: 3px 0; font-size: 14px; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; color: #475569; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .total-section { margin-top: 30px; text-align: right; border-top: 2px solid #16a34a; pt: 15px; }
            .total-label { font-size: 14px; font-weight: bold; color: #64748b; }
            .total-amount { font-size: 24px; font-weight: 900; color: #16a34a; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">BALLOU AGRI <span>CONNECT</span></div>
              <div class="receipt-title">REÇU OFFICIEL</div>
            </div>
            <div class="tracking-section">
              <div class="tracking-label">Code de Suivi Colis</div>
              <div class="tracking-code">${escapeHtml(order.id)}</div>
            </div>
            <div class="details-grid">
              <div class="details-box">
                <h3>Informations Client</h3>
                <p>${escapeHtml(order.customer_name)}</p>
                <p>${escapeHtml(order.phone)}</p>
                <p>${escapeHtml(order.address)}</p>
              </div>
              <div class="details-box">
                <h3>Détails Commande</h3>
                <p>Date : ${new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                <p>Statut : ${escapeHtml(order.status)}</p>
                <p>Zone : ${escapeHtml(order.zone || 'Dakar')}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Désignation du Produit</th>
                  <th style="text-align:center">Qté</th>
                  <th style="text-align:right">Prix Unitaire</th>
                  <th style="text-align:right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items ? order.items.map((item: any) => `
                  <tr>
                    <td>${escapeHtml(item.name)}</td>
                    <td style="text-align:center">${escapeHtml(item.quantity)}</td>
                    <td style="text-align:right">${escapeHtml(item.price?.toLocaleString() || item.price)} F</td>
                    <td style="text-align:right; font-weight:bold;">${escapeHtml(((item.price || 0) * (item.quantity || 0)).toLocaleString())} F</td>
                  </tr>
                `).join('') : ''}
              </tbody>
            </table>
            <div class="total-section">
              <span class="total-label">MONTANT TOTAL PAYÉ :</span><br/>
              <span class="total-amount">${escapeHtml(order.amount?.toLocaleString() || order.amount)} FCFA</span>
            </div>
            <div class="footer">
              <p>Merci de votre confiance. Ce document sert de preuve d'achat officielle.</p>
              <p>Ballou Agri Connect - www.ballouagriconnect.com - Contact : 78 225 45 48</p>
            </div>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">Chargement de vos achats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Mes Achats</h1>
            <p className="text-gray-500 font-medium">Historique complet de vos commandes Ballou Agri Connect</p>
          </div>
          <div className="hidden sm:block">
            <Badge className="bg-green-100 text-green-700 border-none px-4 py-2 rounded-full font-black">
              {orders.length} COMMANDE{orders.length > 1 ? 'S' : ''}
            </Badge>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="border-none shadow-xl rounded-[2.5rem] p-20 text-center bg-white">
            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart className="w-12 h-12 text-stone-200" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Aucune commande pour le moment</h2>
            <p className="text-gray-500 mb-10 max-w-md mx-auto font-medium">
              Vous n'avez pas encore effectué d'achats sur la plateforme. Découvrez nos produits locaux dès maintenant !
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700 h-14 px-10 font-black rounded-2xl shadow-lg">
              <Link to="/local-products">VOIR LES PRODUITS</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order: any) => (
              <Card key={order.id} className="border-none shadow-md hover:shadow-xl transition-all rounded-[2rem] bg-white overflow-hidden group">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 bg-stone-50 p-8 flex flex-col justify-center items-center text-center border-r border-stone-100">
                    <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Commande</div>
                    <div className="text-xl font-black text-gray-900 mb-4">{order.id}</div>
                    <Badge className={`border-none font-black text-[10px] px-3 py-1 rounded-full ${
                      order.status === 'Livré' ? 'bg-green-100 text-green-700' : 
                      order.status === 'Expédié' ? 'bg-blue-100 text-blue-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div className="flex items-center gap-3 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-bold">{new Date(order.created_at).toLocaleDateString('fr-FR')} à {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Total payé</p>
                        <p className="text-2xl font-black text-green-700">{order.amount.toLocaleString()} F</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      {order.items?.slice(0, 2).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-stone-50/50 p-3 rounded-xl">
                          <span className="font-bold text-gray-700">{item.name} <span className="text-stone-400 font-medium">x{item.quantity}</span></span>
                          <span className="font-black text-gray-900">{(item.price * item.quantity).toLocaleString()} F</span>
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-xs text-stone-400 font-bold pl-3">+ {order.items.length - 2} autres produits...</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => downloadPDF(order)} className="bg-green-600 hover:bg-green-700 rounded-xl font-black text-xs h-10 px-6 shadow-md">
                        <Download className="mr-2 h-4 w-4" /> TÉLÉCHARGER LE REÇU
                      </Button>
                      <Button asChild variant="outline" className="border-stone-200 rounded-xl font-black text-xs h-10 px-6">
                        <Link to={`/receipt/${order.id}`}>VOIR LES DÉTAILS <ChevronRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;