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
  doc.text("Near HP Petrol Bunk (Erode Main Road)", 105, 32, { align: "center" });
  doc.text("Nathakadaiyur, Kangayam (Po), Tiruppur (Dt) - 638108", 105, 37, { align: "center" });
  doc.text("Phone: +91 9698786494", 105, 42, { align: "center" });

  // Bill Details Card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 60, 90, 32, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("Bill Details", 15, 68);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(9);
  doc.text(`Bill No: ${data.billNumber}`, 15, 75);
  doc.text(`Date: ${data.billDate}`, 15, 81);
  doc.text(`Payment Mode: ${data.paymentMode}`, 15, 87);

  // Customer Details Card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(105, 60, 95, 32, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("Customer Details", 110, 68);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(9);
  doc.text(`Name: ${data.customerName}`, 110, 75);
  if (data.customerPhone) {
    doc.text(`Phone: ${data.customerPhone}`, 110, 81);
  }

  // Product Table Card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 97, 190, 0, 3, 3, 'F');

  // Product Table
  const tableData = data.items.map((item) => [
    item.description,
    item.quantity.toString(),
    item.price.toFixed(2),
    item.total.toFixed(2),
  ]);

  autoTable(doc, {
    startY: 100,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      halign: "center",
      valign: "middle",
      cellPadding: 6,
      lineWidth: 0.1,
      lineColor: [203, 213, 225],
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: [55, 65, 81],
      lineWidth: 0.1,
      lineColor: [229, 231, 235],
    },
    columnStyles: {
      0: { cellWidth: 85, halign: "left" },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 40, halign: "right" },
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: 10, right: 10 },
  });

  // Get the final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Summary Card with better spacing
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, finalY, 190, 50, 3, 3, 'F');

  // Summary Details - properly aligned
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  
  const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
  const labelX = 130;
  const valueX = 195;
  
  // Subtotal
  doc.text("Subtotal:", labelX, finalY + 12);
  doc.text(subtotal.toFixed(2), valueX, finalY + 12, { align: "right" });
  
  // Shipping Charge
  doc.text("Shipping Charge:", labelX, finalY + 20);
  const shippingText = data.shippingCharge > 0 ? data.shippingCharge.toFixed(2) : "Free Shipping";
  doc.text(shippingText, valueX, finalY + 20, { align: "right" });
  
  // Discount
  doc.text("Discount:", labelX, finalY + 28);
  const discountText = data.discount > 0 ? data.discount.toFixed(2) : "Standard Price";
  doc.text(discountText, valueX, finalY + 28, { align: "right" });

  // Total line separator
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(130, finalY + 33, 195, finalY + 33);

  // Total Payable Box with colored background
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(125, finalY + 37, 70, 11, 2, 2, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("Total Payable:", 130, finalY + 44);
  doc.text(data.totalAmount.toFixed(2), 192, finalY + 44, { align: "right" });

  // Footer Section
  const footerY = finalY + 60;
  
  // Top border line for footer
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(15, footerY - 3, 195, footerY - 3);
  
  // Thank you message
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("Thank you for shopping with SPS SPORTS WEAR", 105, footerY + 6, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(75, 85, 99);
  doc.text("Visit again!", 105, footerY + 13, { align: "center" });

  // Social Media Section - Side by Side (Centered)
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  const socialY = footerY + 22;
  const centerX = 105;
  
  // Instagram (left side)
  doc.setTextColor(193, 53, 132);
  doc.setFont("helvetica", "bold");
  doc.text("Instagram:", centerX - 40, socialY);
  doc.setTextColor(55, 65, 81);
  doc.setFont("helvetica", "normal");
  doc.text("@sps_sports_wears", centerX - 24, socialY);
  
  // WhatsApp (right side)
  doc.setTextColor(34, 197, 94);
  doc.setFont("helvetica", "bold");
  doc.text("WhatsApp:", centerX + 8, socialY);
  doc.setTextColor(55, 65, 81);
  doc.setFont("helvetica", "normal");
  doc.text("+91 9698786494", centerX + 25, socialY);

  // Full Address - Centered
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Near HP Petrol Bunk (Erode Main Road), Nathakadaiyur,", 105, socialY + 8, { align: "center" });
  doc.text("Kangayam (Po), Tiruppur (Dt) - 638108", 105, socialY + 13, { align: "center" });

  // Save PDF
  doc.save(`Bill_${data.billNumber}_${data.customerName}.pdf`);
};
