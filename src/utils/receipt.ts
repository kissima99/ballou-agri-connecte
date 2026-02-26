import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface ReceiptData {
  id: string;
  customer: string;
  phone: string;
  address: string;
  amount: number;
  date: string;
  product: string;
  paymentMethod?: string;
}

/**
 * Génère un reçu PDF professionnel avec QR code, tableau des articles,
 * signature, couleurs et mise en page adaptée à l'application.
 * @param data Données du reçu
 */
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
    const accentColor = '#007bff';

    // En-tête avec logo placeholder
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
    doc.setFillColor(textColor);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(primaryColor);
    doc.text('BALLOU AGRI CONNECT', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.text('Plateforme d\'échange agricole', 105, 28, { align: 'center' });

    // Ligne décorative
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
    const formattedAmount = Math.round(data.amount).toLocaleString('fr-FR');
    doc.text(`${formattedAmount} FCFA`, 195, 100, { align: 'right' });

    // Ligne
    doc.setDrawColor(primaryColor);
    doc.line(15, 108, 195, 108);

    // QR code vers le suivi de commande
    const qrUrl = `https://ballouagriconnect.com/order/${data.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl);
    doc.addImage(qrCodeDataUrl, 'PNG', 10, 10, 100, 100);

    // Tableau des articles
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text('Articles commandés:', 15, 120);
    const productLines = data.product.split(',').map((item, index) => `${index + 1}. ${item}`);
    doc.setFontSize(10);
    productLines.forEach((line, index) => {
      doc.text(line, 15, 125 + index * 8);
    });

    // Ligne
    doc.setDrawColor(primaryColor);
    doc.line(15, 150, 195, 150);

    // Signature du client
    doc.setFontSize(11);
    doc.text('Signature du client:', 15, 160);
    doc.text('_______________________________', 15, 165);
    doc.text('Date:', 15, 170);
    doc.text(new Date().toLocaleDateString('fr-FR'), 15, 175);

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