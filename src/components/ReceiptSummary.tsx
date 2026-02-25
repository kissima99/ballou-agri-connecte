import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateReceipt } from '@/utils/receipt';

interface ReceiptData {
  id: string;
  customer: string;
  phone: string;
  address: string;
  amount: number;
  date: string;
  product: string;
}

const ReceiptSummary: React.FC<{ data: ReceiptData }> = ({ data }) => {
  const handleDownload = () => {
    generateReceipt(data);
    // Message de remerciement après téléchargement
    setTimeout(() => {
      alert('✅ Votre reçu a été téléchargé. Merci pour votre confiance et votre fidélité !');
    }, 100);
  };

  return (
    <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
      <CardHeader className="bg-green-700 text-white py-6">
        <CardTitle className="text-xl font-bold">Votre reçu de paiement</CardTitle>
        <p className="text-sm text-gray-500">Merci pour votre confiance et votre fidélité !</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Commande : <strong>{data.id}</strong></p>
          <p className="text-sm text-gray-500">Date : <strong>{data.date}</strong></p>
          <p className="text-sm text-gray-500">Client : <strong>{data.customer}</strong></p>
          <p className="text-sm text-gray-500">Téléphone : <strong>{data.phone}</strong></p>
          <p className="text-sm text-gray-500">Adresse : <strong>{data.address}</strong></p>
          <p className="text-sm text-gray-500">Montant : <strong>{data.amount.toLocaleString()} FCFA</strong></p>
          <p className="text-sm text-gray-500">Produits :</p>
          <p className="text-sm text-gray-500 indent-4">{data.product}</p>
        </div>
        <div className="text-center">
          <Button onClick={handleDownload} className="w-full bg-green-600 hover:bg-green-700 h-12 rounded-2xl font-bold shadow-lg">
            <Download className="mr-2 h-5 w-5" /> TÉLÉCHARGER LE REÇU
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptSummary;