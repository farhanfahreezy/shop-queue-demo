"use client";

import jsPDF from "jspdf";

export interface QueueTicketData {
  name: string;
  queueNumber: number;
  date: string;
  shopName?: string;
}

export function generateQueueTicketPDF(data: QueueTicketData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 120], // Thermal printer size (80mm width)
  });

  // Set font
  doc.setFont("helvetica");

  // Header - Shop Name
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.shopName || "Shoppotastic", 40, 20, { align: "center" });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Queue Ticket", 40, 28, { align: "center" });

  // Divider line
  doc.setLineWidth(0.5);
  doc.line(10, 32, 70, 32);

  // Queue Number (Large)
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text(`#${data.queueNumber}`, 40, 50, { align: "center" });

  // Customer Name
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Customer:", 10, 65);
  doc.setFont("helvetica", "normal");
  doc.text(data.name, 10, 72);

  // Date and Time
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Date & Time:", 10, 82);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(data.date).toLocaleString(), 10, 87);

  // Instructions
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Please keep this ticket and wait", 40, 98, { align: "center" });
  doc.text("for your number to be called.", 40, 103, { align: "center" });

  // Footer
  doc.setFontSize(8);
  doc.text("Thank you for choosing Shoppotastic!", 40, 115, {
    align: "center",
  });

  // Generate filename
  const filename = `queue-ticket-${data.queueNumber}-${data.name.replace(
    /\s+/g,
    "-"
  )}.pdf`;

  // Download the PDF
  doc.save(filename);
}
