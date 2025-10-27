import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface BillItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface BillData {
  billNumber: string;
  billDate: string;
  customerName: string;
  customerPhone?: string;
  paymentMode: string;
  items: BillItem[];
  shippingCharge: number;
  discount: number;
  totalAmount: number;
}

export const generateBillPDF = async (data: BillData, logoUrl: string) => {
  const doc = new jsPDF();
  
  // Set page background color (light gray)
  doc.setFillColor(249, 250, 251);
  doc.rect(0, 0, 210, 297, 'F');
  
  // Header card with white background
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 10, 190, 45, 3, 3, 'F');
  
  // Add logo
  try {
    doc.addImage(logoUrl, "PNG", 15, 15, 30, 30);
  } catch (error) {
    console.error("Error adding logo:", error);
  }

  // Shop Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138); // Dark blue
  doc.text("SPS SPORTS WEAR", 105, 25, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  doc.text("📍 Near HP Petrol Bunk (Erode Main Road)", 105, 32, { align: "center" });
  doc.text("Nathakadaiyur, Kangayam (Po), Tiruppur (Dt) – 638108", 105, 37, { align: "center" });
  doc.text("📞 +91 9698786494", 105, 42, { align: "center" });

  // Bill Details Card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 60, 90, 32, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("🧾 Bill Details", 15, 68);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(9);
  doc.text(`Bill No: ${data.billNumber}`, 15, 75);
  doc.text(`Date: ${data.billDate}`, 15, 81);
  doc.text(`💳 Payment: ${data.paymentMode}`, 15, 87);

  // Customer Details Card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(105, 60, 95, 32, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("👤 Customer Details", 110, 68);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(9);
  doc.text(`Name: ${data.customerName}`, 110, 75);
  if (data.customerPhone) {
    doc.text(`📱 Phone: ${data.customerPhone}`, 110, 81);
  }

  // Product Table Card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 97, 190, 0, 3, 3, 'F');

  // Product Table
  const tableData = data.items.map((item) => [
    item.description,
    item.quantity.toString(),
    `₹${item.price.toFixed(2)}`,
    `₹${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 100,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      halign: "center",
      valign: "middle",
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [55, 65, 81],
    },
    columnStyles: {
      0: { cellWidth: 90, halign: "left" },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 37, halign: "right" },
      3: { cellWidth: 38, halign: "right" },
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: 10, right: 10 },
  });

  // Get the final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 5;

  // Summary Card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, finalY, 190, 45, 3, 3, 'F');

  // Summary Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  
  const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
  const summaryX = 140;
  const valueX = 192;
  
  doc.text("Subtotal:", summaryX, finalY + 10);
  doc.text(`₹${subtotal.toFixed(2)}`, valueX, finalY + 10, { align: "right" });
  
  doc.text("Shipping Charge:", summaryX, finalY + 17);
  doc.text(`₹${data.shippingCharge.toFixed(2)}`, valueX, finalY + 17, { align: "right" });
  
  doc.text("Discount:", summaryX, finalY + 24);
  doc.text(`-₹${data.discount.toFixed(2)}`, valueX, finalY + 24, { align: "right" });

  // Total line separator
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(140, finalY + 28, 195, finalY + 28);

  // Total Payable Box with colored background
  doc.setFillColor(37, 99, 235); // Bright blue
  doc.roundedRect(135, finalY + 31, 60, 11, 2, 2, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("💰 Total Payable:", 140, finalY + 38);
  doc.text(`₹${data.totalAmount.toFixed(2)}`, valueX, finalY + 38, { align: "right" });

  // Footer Section
  const footerY = finalY + 55;
  
  // Thank you message
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("Thank you for shopping with SPS_SPORTS_WEAR", 105, footerY, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(75, 85, 99);
  doc.text("Visit again!", 105, footerY + 5, { align: "center" });

  // Social Media Section
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  
  // Instagram
  doc.setTextColor(193, 53, 132); // Instagram pink
  doc.text("📷 Instagram:", 60, footerY + 13);
  doc.setTextColor(75, 85, 99);
  doc.text("@sps_sports_wears", 85, footerY + 13);
  
  // WhatsApp
  doc.setTextColor(34, 197, 94); // WhatsApp green
  doc.text("💬 WhatsApp:", 60, footerY + 19);
  doc.setTextColor(75, 85, 99);
  doc.text("+91 9698786494", 85, footerY + 19);

  // Bottom border line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(15, footerY + 25, 195, footerY + 25);

  // Save PDF
  doc.save(`Bill_${data.billNumber}_${data.customerName}.pdf`);
};
