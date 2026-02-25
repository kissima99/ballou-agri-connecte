import { jsPDF } from "jspdf";

export const generateReceipt = (order: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(22, 163, 74); // Green-600
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("BALLOU AGRI CONNECT", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.text("Reçu de Commande Officiel", 105, 30, { align: "center" });

  // Order Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`N° Commande: ${order.id}`, 20, 55);
  doc.text(`Date: ${order.date}`, 20, 62);
  doc.text(`Statut: PAYÉ & CONFIRMÉ`, 20, 69);

  // Customer Info
  doc.setFont("helvetica", "bold");
  doc.text("Informations Client:", 20, 85);
  doc.setFont("helvetica", "normal");
  doc.text(`Nom: ${order.customer}`, 20, 92);
  doc.text(`Téléphone: ${order.phone}`, 20, 99);
  doc.text(`Adresse: ${order.address}`, 20, 106);

  // Products Table Header
  doc.setFillColor(245, 245, 244); // Stone-100
  doc.rect(20, 120, 170, 10, 'F');
  doc.setFont("helvetica", "bold");
  doc.text("Détails des produits", 25, 127);
  
  // Products List
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const products = order.product.split(", ");
  let yPos = 140;
  products.forEach((p: string) => {
    doc.text(`• ${p}`, 25, yPos);
    yPos += 7;
  });

  // Total
  doc.setDrawColor(22, 163, 74);
  doc.line(20, yPos + 5, 190, yPos + 5);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL PAYÉ: ${order.amount.toLocaleString()} FCFA`, 190, yPos + 15, { align: "right" });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Merci de votre confiance. Ballou Agri Connect - L'excellence agricole.", 105, 280, { align: "center" });

  doc.save(`Recu_BAC_${order.id}.pdf`);
};