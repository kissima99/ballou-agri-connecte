import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, ArrowLeft, Download, Truck, ShieldCheck, Loader2, FileText } from 'lucide-react';
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

  const downloadPDF = () => {
    if (!order) return;
    
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
            @media print { .no-print { display: none; } }
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
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
    }
  };

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><Loader2 className="animate-spin text-green-600 h-10 w-10" /></div>;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-3xl">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="font-bold w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
          </Button>
          <Button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700 font-black shadow-xl w-full sm:w-auto h-12 px-8 rounded-xl">
            <Download className="mr-2 h-5 w-5" /> TÉLÉCHARGER LE REÇU (PDF)
          </Button>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-green-900 text-white p-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/20">
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight">REÇU DE COMMANDE</CardTitle>
            <p className="text-green-100 opacity-80 text-sm">Généré le {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl p-8 text-center">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Code de Suivi Unique</p>
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{order.id}</h2>
              <div className="mt-4">
                <Button asChild variant="link" className="text-orange-600 font-bold">
                  <Link to="/tracking"><Truck className="mr-2 h-4 w-4" /> Suivre mon colis en temps réel</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Destinataire</h3>
                <div>
                  <p className="font-black text-gray-900 text-lg">{order.customer_name}</p>
                  <p className="text-gray-600 font-medium">{order.phone}</p>
                  <p className="text-gray-600 text-sm">{order.address}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Détails Livraison</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Statut :</span>
                    <Badge className="bg-green-100 text-green-700 border-none font-black text-[10px]">{order.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Zone :</span>
                    <span className="font-bold text-gray-900">{order.zone || 'Dakar'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-4 py-4 text-left font-black text-gray-600">Produit</th>
                    <th className="px-4 py-4 text-center font-black text-gray-600">Qté</th>
                    <th className="px-4 py-4 text-right font-black text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-gray-800">{item.name}</td>
                      <td className="px-4 py-4 text-center font-medium">{item.quantity}</td>
                      <td className="px-4 py-4 text-right font-black text-green-700">{(item.price * item.quantity).toLocaleString()} F</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-end pt-6 border-t-2 border-stone-100">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Montant Total Payé</span>
              <span className="text-4xl font-black text-green-700 tracking-tighter">{order.amount.toLocaleString()} FCFA</span>
            </div>
          </CardContent>
          
          <CardFooter className="bg-stone-50 p-8 flex flex-col items-center text-center gap-4">
            <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
              <ShieldCheck className="h-5 w-5" /> Paiement sécurisé via Wave / Orange Money
            </div>
            <p className="text-[10px] text-gray-400 font-medium max-w-md">
              Conservez ce reçu. Il est indispensable pour toute réclamation ou pour le retrait de votre colis au point de livraison.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Receipt;