import jsPDF from "jspdf";
import { CanvasPhase } from "@/hooks/useStartupCanvas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StartupCanvasPDFOptions {
  cohortName: string;
  phases: CanvasPhase[];
  totalCompletedDays: number;
  totalDays: number;
}

// Color palette
const COLORS = {
  purple: { r: 147, g: 51, b: 234 },
  purpleLight: { r: 243, g: 232, b: 255 },
  purpleDark: { r: 88, g: 28, b: 135 },
  green: { r: 34, g: 197, b: 94 },
  gray: { r: 107, g: 114, b: 128 },
  grayLight: { r: 249, g: 250, b: 251 },
  grayDark: { r: 55, g: 65, b: 81 },
  white: { r: 255, g: 255, b: 255 },
};

export const generateStartupCanvasPDF = async (options: StartupCanvasPDFOptions): Promise<jsPDF> => {
  const { cohortName, phases, totalCompletedDays, totalDays } = options;
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const addNewPage = () => {
    doc.addPage();
    currentY = margin;
  };

  const checkPageBreak = (neededHeight: number): boolean => {
    if (currentY + neededHeight > pageHeight - 15) {
      addNewPage();
      return true;
    }
    return false;
  };

  // Helper to wrap text
  const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text, maxWidth);
  };

  // Draw phase badge
  const drawPhaseBadge = (x: number, y: number, phaseNumber: number, phaseName: string) => {
    doc.setFillColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
    doc.roundedRect(x, y, 8, 8, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text(String(phaseNumber), x + 4, y + 5.5, { align: "center" });
    
    doc.setTextColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
    doc.setFontSize(8);
    doc.text(phaseName, x + 11, y + 5.5);
  };

  // ===== COVER PAGE =====
  
  // Full header gradient simulation
  doc.setFillColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
  doc.rect(0, 0, pageWidth, 70, "F");

  // Logo circle
  doc.setFillColor(255, 255, 255, 0.2);
  doc.circle(pageWidth / 2, 28, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("🏗️", pageWidth / 2, 32, { align: "center" });

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("CONSTRUÇÃO DA STARTUP", pageWidth / 2, 52, { align: "center" });

  // Cohort name
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(cohortName, pageWidth / 2, 62, { align: "center" });

  // Progress card
  currentY = 80;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, currentY, contentWidth, 35, 3, 3, "F");
  
  // Add shadow effect
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, currentY, contentWidth, 35, 3, 3, "S");

  const progressPercent = totalDays > 0 ? Math.round((totalCompletedDays / totalDays) * 100) : 0;
  
  // Progress title and number
  doc.setTextColor(COLORS.grayDark.r, COLORS.grayDark.g, COLORS.grayDark.b);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("PROGRESSO GERAL", margin + 8, currentY + 10);
  
  doc.setFontSize(24);
  doc.setTextColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
  doc.text(`${progressPercent}%`, margin + 8, currentY + 24);
  
  doc.setFontSize(9);
  doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
  doc.setFont("helvetica", "normal");
  doc.text(`${totalCompletedDays} de ${totalDays} dias`, margin + 8, currentY + 30);

  // Progress bar
  const barX = margin + 60;
  const barY = currentY + 14;
  const barWidth = contentWidth - 70;
  const barHeight = 8;
  
  doc.setFillColor(229, 231, 235);
  doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, "F");
  
  doc.setFillColor(COLORS.green.r, COLORS.green.g, COLORS.green.b);
  const filledWidth = Math.max(4, (barWidth * progressPercent) / 100);
  doc.roundedRect(barX, barY, filledWidth, barHeight, 2, 2, "F");

  // Phases grid (2 columns)
  currentY = 125;
  doc.setTextColor(COLORS.grayDark.r, COLORS.grayDark.g, COLORS.grayDark.b);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("FASES DO PROGRAMA", margin, currentY);
  currentY += 8;

  const colWidth = (contentWidth - 10) / 2;
  
  phases.forEach((phase, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + col * (colWidth + 10);
    const y = currentY + row * 20;
    
    // Phase card
    doc.setFillColor(COLORS.grayLight.r, COLORS.grayLight.g, COLORS.grayLight.b);
    doc.roundedRect(x, y, colWidth, 16, 2, 2, "F");
    
    const phaseProgress = phase.totalDays > 0 
      ? Math.round((phase.completedDays / phase.totalDays) * 100) 
      : 0;
    
    // Phase number badge
    doc.setFillColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
    doc.roundedRect(x + 3, y + 3, 10, 10, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(String(phase.phase_number), x + 8, y + 9.5, { align: "center" });
    
    // Phase name
    doc.setTextColor(COLORS.grayDark.r, COLORS.grayDark.g, COLORS.grayDark.b);
    doc.setFontSize(8);
    doc.text(phase.name, x + 16, y + 8);
    
    // Progress
    doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`${phase.completedDays}/${phase.totalDays} dias (${phaseProgress}%)`, x + 16, y + 13);
  });

  currentY += Math.ceil(phases.length / 2) * 20 + 10;

  // Date
  doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
  doc.setFontSize(8);
  const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  doc.text(`Gerado em ${dateStr}`, pageWidth / 2, currentY, { align: "center" });

  // Footer
  doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
  doc.setFontSize(8);
  doc.text("Gerado por Guilda — guilda.app.br", pageWidth / 2, pageHeight - 10, { align: "center" });

  // ===== CONTENT PAGES - COMPACT LAYOUT =====
  
  addNewPage();
  
  // Small header
  doc.setFillColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
  doc.rect(0, 0, pageWidth, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("CONSTRUÇÃO DA STARTUP", margin, 8);
  doc.setFont("helvetica", "normal");
  doc.text(cohortName, pageWidth - margin, 8, { align: "right" });
  
  currentY = 18;
  
  let currentPhase = "";

  phases.forEach((phase) => {
    if (phase.submissions.length === 0) return;

    phase.submissions.forEach((submission) => {
      // Show phase header when phase changes
      if (currentPhase !== phase.id) {
        currentPhase = phase.id;
        checkPageBreak(15);
        
        // Phase divider
        doc.setFillColor(COLORS.purpleLight.r, COLORS.purpleLight.g, COLORS.purpleLight.b);
        doc.roundedRect(margin, currentY, contentWidth, 10, 2, 2, "F");
        
        doc.setFillColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
        doc.roundedRect(margin + 2, currentY + 2, 6, 6, 1, 1, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(5);
        doc.setFont("helvetica", "bold");
        doc.text(String(phase.phase_number), margin + 5, currentY + 6, { align: "center" });
        
        doc.setTextColor(COLORS.purpleDark.r, COLORS.purpleDark.g, COLORS.purpleDark.b);
        doc.setFontSize(9);
        doc.text(`FASE ${phase.phase_number}: ${phase.name.toUpperCase()}`, margin + 12, currentY + 7);
        
        currentY += 14;
      }

      // Estimate content height
      const contentLines = wrapText(submission.content, contentWidth - 16, 8);
      const feedbackLines = submission.ai_feedback ? wrapText(submission.ai_feedback, contentWidth - 20, 7) : [];
      const estimatedHeight = 12 + contentLines.length * 3.5 + (feedbackLines.length > 0 ? 8 + feedbackLines.length * 3 : 0);
      
      checkPageBreak(Math.min(estimatedHeight, 60));

      // Day header - inline style
      doc.setFillColor(COLORS.grayLight.r, COLORS.grayLight.g, COLORS.grayLight.b);
      doc.roundedRect(margin, currentY, contentWidth, 7, 1, 1, "F");
      
      doc.setTextColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`DIA ${submission.task.day_number}`, margin + 3, currentY + 5);
      
      doc.setTextColor(COLORS.grayDark.r, COLORS.grayDark.g, COLORS.grayDark.b);
      doc.setFont("helvetica", "normal");
      doc.text(`— ${submission.task.title}`, margin + 18, currentY + 5);
      
      // Date on right
      const submissionDate = format(new Date(submission.submitted_at), "dd/MM/yy", { locale: ptBR });
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.setFontSize(7);
      doc.text(submissionDate, pageWidth - margin - 3, currentY + 5, { align: "right" });

      currentY += 10;

      // Content - compact
      doc.setTextColor(COLORS.grayDark.r, COLORS.grayDark.g, COLORS.grayDark.b);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");

      // Limit content to first 8 lines to save space
      const maxLines = 8;
      const displayLines = contentLines.slice(0, maxLines);
      
      displayLines.forEach((line: string) => {
        if (checkPageBreak(4)) {
          // Redraw mini header after page break
          doc.setFillColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
          doc.rect(0, 0, pageWidth, 12, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text("CONSTRUÇÃO DA STARTUP", margin, 8);
          doc.setFont("helvetica", "normal");
          doc.text(cohortName, pageWidth - margin, 8, { align: "right" });
          currentY = 18;
        }
        doc.setTextColor(COLORS.grayDark.r, COLORS.grayDark.g, COLORS.grayDark.b);
        doc.setFontSize(8);
        doc.text(line, margin + 3, currentY);
        currentY += 3.5;
      });
      
      if (contentLines.length > maxLines) {
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.text(`[... +${contentLines.length - maxLines} linhas]`, margin + 3, currentY);
        currentY += 3.5;
      }

      // File attachment indicator
      if (submission.file_url) {
        doc.setTextColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text("📎 Anexo incluído", margin + 3, currentY);
        currentY += 4;
      }

      // Simple approved indicator (no AI feedback text)
      doc.setTextColor(22, 163, 74); // green-600
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.text("✓", margin + 3, currentY);
      currentY += 2;

      currentY += 5; // Space between entries
    });
  });

  // Final page footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
    doc.setFontSize(7);
    doc.text(`${i}/${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    if (i > 1) {
      doc.text("guilda.app.br", margin, pageHeight - 8);
    }
  }

  return doc;
};
