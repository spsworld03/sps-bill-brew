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
  
  // Add logo
  try {
    doc.addImage(logoUrl, "PNG", 15, 10, 30, 30);
  } catch (error) {
    console.error("Error adding logo:", error);
  }

  // Shop Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 107, 53); // Orange-red color
  doc.text("SPS SPORTS WEAR", 50, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text("Near HP Petrol Bunk (Erode Main Road)", 50, 27);
  doc.text("Nathakadaiyur, Kangayam (Po)", 50, 32);
  doc.text("Tiruppur (Dt) – 638108", 50, 37);
  doc.text("Phone: 9698786494", 50, 42);

  // Horizontal line
  doc.setDrawColor(255, 107, 53);
  doc.setLineWidth(0.5);
  doc.line(15, 48, 195, 48);

  // Bill Details
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Bill No: ${data.billNumber}`, 15, 58);
  doc.text(`Date: ${data.billDate}`, 15, 65);
  doc.text(`Payment: ${data.paymentMode}`, 15, 72);

  doc.text(`Customer: ${data.customerName}`, 120, 58);
  if (data.customerPhone) {
    doc.text(`Phone: ${data.customerPhone}`, 120, 65);
  }

  // Product Table
  const tableData = data.items.map((item) => [
    item.description,
    item.quantity.toString(),
    `₹${item.price.toFixed(2)}`,
    `₹${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 80,
    head: [["Description", "Quantity", "Unit Price", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [255, 107, 53],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 11,
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 40, halign: "right" },
    },
  });

  // Get the final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Summary
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
  
  doc.text(`Subtotal:`, 130, finalY);
  doc.text(`₹${subtotal.toFixed(2)}`, 180, finalY, { align: "right" });
  
  doc.text(`Shipping Charge:`, 130, finalY + 7);
  doc.text(`₹${data.shippingCharge.toFixed(2)}`, 180, finalY + 7, { align: "right" });
  
  doc.text(`Discount:`, 130, finalY + 14);
  doc.text(`-₹${data.discount.toFixed(2)}`, 180, finalY + 14, { align: "right" });

  // Total line
  doc.setLineWidth(0.3);
  doc.line(130, finalY + 18, 195, finalY + 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 107, 53);
  doc.text(`Total Payable:`, 130, finalY + 25);
  doc.text(`₹${data.totalAmount.toFixed(2)}`, 180, finalY + 25, { align: "right" });

  // Footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(0, 0, 0);
  doc.text("Thank you for shopping with SPS_WORLD", 105, 270, { align: "center" });

  // Save PDF
  doc.save(`Bill_${data.billNumber}_${data.customerName}.pdf`);
};
