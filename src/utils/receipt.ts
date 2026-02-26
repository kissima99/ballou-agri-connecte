import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

interface ReceiptData {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  amount: number;
  status: string;
  items: ReceiptItem[];
  date: string;
}

/**
 * Génère un reçu PDF professionnel avec le design de l'application
 * @param data Données de la commande
 */
export const generateReceipt = async (data: ReceiptData) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Couleurs de l'application
    const primaryColor = '#16a34a'; // Vert Ballou
    const secondaryColor = '#f97316'; // Orange
    const textColor = '#212529';
    const lightGray = '#6c757d';

    // En-tête avec fond vert
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    
    // Logo et titre
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor('#FFFFFF');
    doc.text('BALLOU AGRI CONNECT', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.text('Plateforme d\'échange agricole', 105, 30, { align: 'center' });

    // Ligne de séparation
    doc.setLineWidth(1);
    doc.setDrawColor(primaryColor);
    doc.line(10, 45, 200, 45);

    // Informations de la commande
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(textColor);
    doc.text(`N° Commande: ${data.id}`, 15, 55);
    doc.text(`Date: ${data.date}`, 15, 62);
    doc.text(`Statut: ${data.status}`, 15, 69);

    // Détails client
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('Informations Client:', 15, 80);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Nom: ${data.customer_name}`, 15, 87);
    doc.text(`Téléphone: ${data.phone}`, 15, 94);
    doc.text(`Adresse: ${data.address}`, 15, 101);

    // Ligne
    doc.setDrawColor(primaryColor);
    doc.line(15, 110, 195, 110);

    // Tableau des articles
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('Articles commandés:', 15, 120);
    
    // En-têtes du tableau
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');
    doc.text('Article', 15, 128);
    doc.text('Qté', 100, 128);
    doc.text('Prix', 120, 128);
    doc.text('Total', 160, 128);
    
    // Ligne sous les en-têtes
    doc.setLineWidth(0.5);
    doc.setDrawColor(lightGray);
    doc.line(15, 130, 195, 130);

    // Contenu du tableau
    doc.setFont('Helvetica', 'normal');
    let yPosition = 138;
    data.items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      doc.text(item.name, 15, yPosition);
      doc.text(item.quantity.toString(), 100, yPosition);
      doc.text(`${item.price.toLocaleString()} FCFA`, 120, yPosition);
      doc.text(`${itemTotal.toLocaleString()} FCFA`, 160, yPosition);
      yPosition += 8;
    });

    // Ligne après le tableau
    doc.setDrawColor(primaryColor);
    doc.line(15, yPosition + 2, 195, yPosition + 2);

    // Montant total
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text('MONTANT TOTAL:', 15, yPosition + 12);
    doc.setFontSize(18);
    doc.setTextColor('#d9534f');
    doc.text(`${data.amount.toLocaleString()} FCFA`, 195, yPosition + 12, { align: 'right' });

    // QR Code pour suivi
    const qrUrl = `https://ballouagriconnect.com/order/${data.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl);
    doc.addImage(qrCodeDataUrl, 'PNG', 150, yPosition + 20, 40, 40);

    // Pied de page
    doc.setFontSize(9);
    doc.setTextColor(lightGray);
    doc.text('BALLOU AGRI CONNECT - Plateforme d\'échange agricole', 105, 280, { align: 'center' });
    doc.text('www.ballouagriconnect.com', 105, 287, { align: 'center' });
    doc.text('Tél: 78 225 45 48', 105, 294, { align: 'center' });

    // Télécharger le PDF
    doc.save(`reçu_${data.id}.pdf`);
  } catch (error) {
    console.error('Erreur lors de la génération du reçu:', error);
    alert('Erreur lors de la génération du reçu. Veuillez réessayer.');
  }
};