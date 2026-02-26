import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const History = () => {
  const history = JSON.parse(localStorage.getItem('purchase_history') || '[]');
  
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container px-4 py-12 mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-green-900 mt-10">Historique des commandes</h1>
        
        <div className="space-y-8">
          {history.map((item: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 mb-4 shadow-lg">
              <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-green-700 text-white py-4">
                  <CardTitle className="text-xl">Commande #{item.id}</CardTitle>
                </CardHeader>
                
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Date: {item.date}</span>
                    <span>Montant: {item.amount} FCFA</span>
                  </div>
                  
                  <div className="space-y-2">
                    <p><strong>Client:</strong> {item.customer_name}</p>
                    <p><strong>Adresse:</strong> {item.address}</p>
                    <p><strong>Produits:</strong> {item.product}</p>
                  </div>
                  
                  <div className="text-center mt-4">
                    <Button 
                      onClick={() => viewReceipt(item.id)}
                      className="bg-green-600 hover:bg-green-700 h-12 rounded-lg font-bold"
                    >
                      <Download className="mr-2 h-5 w-5" /> Voir le reçu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const viewReceipt = (orderId: string) => {
  alert(`Reçu pour la commande #${orderId} est disponible.`);
};

export default History;