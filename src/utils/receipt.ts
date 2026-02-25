import jsPDF from 'jspdf';

interface ReceiptData {
  id: string;
  customer: string;
  phone: string;
  address: string;
  amount: number;
  date: string;
  product: string;
}

export const generateReceipt = (data: ReceiptData) => {
  try {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`Commande #${data.id}`, 10, 10);
    doc.text(`Client : ${data.customer}`, 10, 20);
    doc.text(`Téléphone : ${data.phone}`, 10, 30);
    doc.text(`Adresse : ${data.address}`, 10, 40);
    doc.text(`Montant : ${data.amount.toLocaleString()} FCFA`, 10, 50);
    doc.text(`Date : ${data.date}`, 10, 60);
    doc.text(`Produits :`, 10, 70);
    const productLines = data.product.split(',').map((item, index) => `${index + 1}. ${item}`);
    productLines.forEach((line, index) => {
      doc.text(line, 10, 80 + index * 10);
    });
    // Ajout du message de remerciement
    doc.text('Merci pour votre confiance et votre fidélité !', 10, 95);
    doc.save('reçu_commande.pdf');
  } catch (error) {
    console.error('Erreur lors de la génération du reçu:', error);
    alert('Erreur lors de la génération du reçu. Veuillez réessayer.');
  }
};