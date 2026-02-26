import { jsPDF } from 'jspdf';

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
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Couleurs
    const primaryColor = '#16a34a'; // Vert Ballou
    const secondaryColor = '#f97316'; // Orange
    const textColor = '#212529';
    const lightGray = '#6c757d';

    // En-tête
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(primaryColor);
    doc.text('BALLOU AGRI CONNECT', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.text('BALLOU AGRI CONNECT', 105, 20, { align: 'center' });

    // Ligne
    doc.setLineWidth(0.5);
    doc.setDrawColor(primaryColor);
    doc.line(10, 35, 200, 35);

    // Informations de la commande
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text('Reçu de paiement', 15, 45);
    doc.setFontSize(10);
    doc.text(`N° Commande: ${data.id}`, 15, 52);
    doc.text(`Date: ${data.date}`, 15, 59);

    // Détails client
    doc.setFontSize(11);
    doc.text(`Client: ${data.customer}`, 15, 68);
    doc.text(`Téléphone: ${data.phone}`, 15, 75);
    doc.text(`Adresse: ${data.address}`, 15, 82);

    // Ligne
    doc.setDrawColor(primaryColor);
    doc.line(15, 90, 195, 90);

    // Montant
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.text('Montant total:', 15, 100);
    doc.setFontSize(18);
    doc.setTextColor('#d9534f');
    // Formatage correct du montant sans caractères spéciaux
    const formattedAmount = Math.round(data.amount).toLocaleString('fr-FR');
    doc.text(`${formattedAmount} FCFA`, 195, 100, { align: 'right' });

    // Ligne
    doc.setDrawColor(primaryColor);
    doc.line(15, 108, 195, 108);

    // Produits
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text('Produits commandés:', 15, 118);
    const productLines = data.product.split(',').map((item, index) => `${index + 1}. ${item}`);
    doc.setFontSize(10);
    productLines.forEach((line, index) => {
      doc.text(line, 15, 125 + index * 8);
    });

    // Message de remerciement
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.text('Merci pour votre confiance et votre fidélité !', 105, 200, { align: 'center' });

    // Pied de page
    doc.setFontSize(9);
    doc.setTextColor(lightGray);
    doc.text('BALLOU AGRI CONNECT - Plateforme d\'échange agricole', 105, 285, { align: 'center' });
    doc.text('www.ballouagriconnect.com', 105, 292, { align: 'center' });

    // Ligne de séparation du footer
    doc.setDrawColor(primaryColor);
    doc.line(10, 280, 200, 280);

    doc.save(`reçu_${data.id}.pdf`);
  } catch (error) {
    console.error('Erreur lors de la génération du reçu:', error);
    alert('Erreur lors de la génération du reçu. Veuillez réessayer.');
  }
};