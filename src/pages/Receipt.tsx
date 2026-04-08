import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, ArrowLeft, Download, Truck, ShieldCheck, Loader2 } from 'lucide-react';
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
          <title>Reçu - ${escapeHtml(order.id)}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
            .header { text-align: center; border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: 900; color: #16a34a; letter-spacing: -1px; }
            .logo span { color: #f97316; }
            .title { font-size: 22px; font-weight: bold; margin: 15px 0; text-transform: uppercase; }
            .tracking-box { background: #f8fafc; border: 2px dashed #cbd5e1; padding: 15px; text-align: center; margin-bottom: 30px; border-radius: 10px; }
            .tracking-code { font-size: 24px; font-weight: 900; color: #1e293b; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .info-section h3 { font-size: 14px; color: #64748b; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .info-section p { margin: 5px 0; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #f1f5f9; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #475569; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .total-row { font-size: 20px; font-weight: 900; text-align: right; margin-top: 30px; color: #16a34a; }
            .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; pt: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">BALLOU AGRI <span>CONNECT</span></div>
            <div class="title">Reçu de Commande Officiel</div>
            <p>Date : ${new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
          </div>

          <div class="tracking-box">
            <p style="margin:0; font-size:12px; font-weight:bold; color:#64748b;">CODE DE SUIVI (À utiliser sur le site)</p>
            <div class="tracking-code">${escapeHtml(order.id)}</div>
          </div>

          <div class="info-grid">
            <div class="info-section">
              <h3>Client</h3>
              <p>${escapeHtml(order.customer_name)}</p>
              <p>${escapeHtml(order.phone)}</p>
              <p>${escapeHtml(order.address)}</p>
            </div>
            <div class="info-section">
              <h3>Détails</h3>
              <p>Statut : ${escapeHtml(order.status)}</p>
              <p>Zone : ${escapeHtml(order.zone || 'Dakar')}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Produit</th>
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
                  <td style="text-align:right">${escapeHtml(item.price?.toLocaleString() || item.price)} FCFA</td>
                  <td style="text-align:right; font-weight:bold;">${escapeHtml(((item.price || 0) * (item.quantity || 0)).toLocaleString())} FCFA</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>

          <div class="total-row">
            TOTAL PAYÉ : ${escapeHtml(order.amount?.toLocaleString() || order.amount)} FCFA
          </div>

          <div class="footer">
            <p>Merci de faire confiance à Ballou Agri Connect.</p>
            <p>Suivez votre colis sur www.ballouagriconnect.com/tracking</p>
            <p>Contact Support : 78 225 45 48 / 77 459 76 41</p>
          </div>
        </body>
      </html>
    `;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(receiptContent);
      newWindow.document.close();
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><Loader2 className="animate-spin text-green-600 h-10 w-10" /></div>;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="font-bold"><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
          <Button onClick={generatePDF} className="bg-green-600 hover:bg-green-700 font-bold shadow-lg"><Download className="mr-2 h-4 w-4" /> Télécharger le Reçu (PDF)</Button>
        </div>

        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-green-900 text-white p-8 text-center">
            <ShieldCheck className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-black">REÇU DE COMMANDE</CardTitle>
            <p className="text-green-100 opacity-80">Commande confirmée le {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Votre Code de Suivi</p>
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{order.id}</h2>
              <Button asChild variant="link" className="text-orange-600 font-bold mt-2">
                <Link to="/tracking"><Truck className="mr-2 h-4 w-4" /> Suivre mon colis maintenant</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Destinataire</h3>
                <p className="font-bold text-gray-900 text-lg">{order.customer_name}</p>
                <p className="text-gray-600">{order.phone}</p>
                <p className="text-gray-600">{order.address}</p>
              </div>
              <div className="text-right md:text-left">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Détails</h3>
                <p className="font-bold text-gray-900">Statut : <Badge className="bg-green-100 text-green-700 border-none ml-2">{order.status}</Badge></p>
                <p className="text-gray-600 mt-1">Zone : {order.zone || 'Dakar'}</p>
              </div>
            </div>

            <div className="border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">Produit</th>
                    <th className="px-4 py-3 text-center font-bold">Qté</th>
                    <th className="px-4 py-3 text-right font-bold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-4 font-medium">{item.name}</td>
                      <td className="px-4 py-4 text-center">{item.quantity}</td>
                      <td className="px-4 py-4 text-right font-bold">{(item.price * item.quantity).toLocaleString()} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t-2 border-stone-100">
              <span className="text-xl font-black text-gray-900">TOTAL PAYÉ</span>
              <span className="text-3xl font-black text-green-700">{order.amount.toLocaleString()} FCFA</span>
            </div>
          </CardContent>
          <CardFooter className="bg-stone-50 p-6 text-center">
            <p className="text-xs text-gray-400 font-medium w-full">
              Conservez précieusement ce reçu. Pour toute question, contactez le support au 78 225 45 48.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Receipt;