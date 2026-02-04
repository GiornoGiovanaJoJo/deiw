import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";
import jsPDF from "npm:jspdf@4.0.0";
import { formatDate } from "npm:date-fns@3.6.0";
import { de } from "npm:date-fns@3.6.0/locale";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const {
      projektId,
      projektName,
      projektNummer,
      status,
      prioritaet,
      budget,
      startdatum,
      enddatum,
      adresse,
      beschreibung,
      kunde,
      etappen,
      etappenAbgeschlossen,
      totalEtappen,
      dokumenteCount,
    } = payload;

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text with line breaks
    const addWrappedText = (text, x, y, maxWidth, fontSize = 10) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + lines.length * (fontSize * 0.35);
    };

    // Header
    doc.setFillColor(25, 118, 210); // Blue
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    doc.text("PROJEKTBERICHT", margin, 15);

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text(projektNummer, margin, 28);

    // Add current date
    doc.setFontSize(10);
    const heute = formatDate(new Date(), "dd.MM.yyyy", { locale: de });
    doc.text(`Generiert am: ${heute}`, pageWidth - margin - 50, 28);

    yPosition = 50;

    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text(projektName, margin, yPosition);
    yPosition += 12;

    // Status badges
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Status: ${status}`, margin, yPosition);
    doc.text(`Priorität: ${prioritaet}`, margin + 50, yPosition);
    yPosition += 8;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Section 1: Projekt-Details
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Projekt-Details", margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    const details = [
      ["Projektnummer:", projektNummer],
      ["Projektname:", projektName],
      ["Status:", status],
      ["Priorität:", prioritaet],
    ];

    if (kunde) {
      details.push(["Kunde:", kunde.firma]);
    }

    if (adresse) {
      details.push(["Adresse:", adresse]);
    }

    if (startdatum) {
      details.push([
        "Startdatum:",
        formatDate(new Date(startdatum), "dd.MM.yyyy", { locale: de }),
      ]);
    }

    if (enddatum) {
      details.push([
        "Enddatum:",
        formatDate(new Date(enddatum), "dd.MM.yyyy", { locale: de }),
      ]);
    }

    if (budget) {
      details.push(["Budget:", `${budget.toLocaleString("de-DE")} €`]);
    }

    details.forEach(([label, value]) => {
      doc.setFont(undefined, "bold");
      doc.text(label, margin, yPosition);
      doc.setFont(undefined, "normal");
      yPosition = addWrappedText(value, margin + 50, yPosition, contentWidth - 50, 10);
      yPosition += 2;
    });

    yPosition += 4;

    // Section 2: Beschreibung (falls vorhanden)
    if (beschreibung) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("Beschreibung", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      yPosition = addWrappedText(beschreibung, margin, yPosition, contentWidth, 10);
      yPosition += 6;
    }

    // Section 3: Fortschritt
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Projektfortschritt", margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    const completionPercentage =
      totalEtappen > 0 ? Math.round((etappenAbgeschlossen / totalEtappen) * 100) : 0;

    doc.text(
      `Etappen: ${etappenAbgeschlossen}/${totalEtappen} abgeschlossen (${completionPercentage}%)`,
      margin,
      yPosition
    );
    yPosition += 6;

    // Progress bar
    const barWidth = contentWidth / 2;
    const barHeight = 5;
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPosition, barWidth, barHeight);

    const filledWidth = (barWidth * completionPercentage) / 100;
    doc.setFillColor(76, 175, 80); // Green
    doc.rect(margin, yPosition, filledWidth, barHeight, "F");

    yPosition += 10;

    // Section 4: Zusammenfassung
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Zusammenfassung", margin, yPosition);
    yPosition += 8;

    const summary = [
      `Gesamtetappen: ${totalEtappen}`,
      `Abgeschlossene Etappen: ${etappenAbgeschlossen}`,
      `Anhängte Dokumente: ${dokumenteCount}`,
    ];

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    summary.forEach((item) => {
      doc.text(`• ${item}`, margin + 5, yPosition);
      yPosition += 6;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Seite ${doc.internal.getPages().length} von ${doc.internal.getPages().length}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    // Save to file
    const pdfData = doc.output("arraybuffer");

    return new Response(pdfData, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${projektNummer}_Bericht.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});