import { jsPDF } from 'jspdf';
import { AppConfig } from '../types';

/**
 * Generates and downloads a clean, executive PDF specification report
 * for an application in the RummyDex Admin Control Panel.
 * 
 * Strict Security & Privacy Guidelines:
 * - NO user reviews or comments.
 * - NO secret download links or vault endpoints.
 * - Purely catalog specifications, package data, developer info, and SEO metadata.
 */
export async function exportAppToPdf(app: AppConfig): Promise<void> {
  if (!app) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Premium Slate Palette
  const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const accentColor: [number, number, number] = [37, 99, 235]; // Blue 600
  const secondaryColor: [number, number, number] = [71, 85, 105]; // Slate 600
  const lightBgColor: [number, number, number] = [248, 250, 252]; // Slate 50
  const borderColor: [number, number, number] = [226, 232, 240]; // Slate 200
  const emeraldColor: [number, number, number] = [16, 185, 129];
  const amberColor: [number, number, number] = [245, 158, 11];

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 16) {
      doc.addPage();
      currentY = margin;
      drawHeaderStrip();
    }
  };

  const drawHeaderStrip = () => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, currentY, contentWidth, 2, 'F');
    currentY += 5;
  };

  // 1. Top Executive Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('RUMMYDEX TRANSPARENCY PLATFORM', margin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('OFFICIAL APPLICATION SPECIFICATION & METADATA REPORT', margin + 6, currentY + 15);

  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.setFontSize(7.5);
  doc.text(`Generated: ${generatedDate}`, pageWidth - margin - 6, currentY + 15, { align: 'right' });

  currentY += 28;

  // 2. App Hero Card
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.roundedRect(margin, currentY, contentWidth, 28, 2, 2, 'FD');

  // App Name
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  const appName = app.name || 'Unnamed Application';
  doc.text(appName, margin + 6, currentY + 9);

  // Subtitle / metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Order #${app.serial_number || 0}  |  Category: `, margin + 6, currentY + 16);
  
  // Category highlight
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(app.category || 'General', margin + 37, currentY + 16);

  // App ID & Public Slug
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`App ID: ${app.id || 'N/A'}    •    Public Slug: /app/${app.slug || 'N/A'}`, margin + 6, currentY + 22);

  // Status Badge on right
  const isLive = app.sync_to_public !== false;
  if (isLive) {
    doc.setFillColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  } else {
    doc.setFillColor(amberColor[0], amberColor[1], amberColor[2]);
  }
  doc.roundedRect(pageWidth - margin - 32, currentY + 6, 26, 7, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(isLive ? 'LIVE ON WEB' : 'ADMIN DRAFT', pageWidth - margin - 19, currentY + 10.8, { align: 'center' });

  currentY += 33;

  // Section Header Helper
  const drawSectionHeader = (title: string) => {
    checkPageBreak(14);
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(margin, currentY, 3, 5.5, 'F');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(title, margin + 6, currentY + 4.2);
    currentY += 8;
  };

  // Grid Key-Value Rows Helper
  const drawSpecsTable = (items: Array<{ label: string; value: string | number | boolean | undefined; highlight?: boolean }>) => {
    const colWidth = (contentWidth - 4) / 2;
    const rowHeight = 7;
    const totalRows = Math.ceil(items.length / 2);

    checkPageBreak(totalRows * rowHeight + 6);

    for (let r = 0; r < totalRows; r++) {
      const item1 = items[r * 2];
      const item2 = items[r * 2 + 1];

      const rowY = currentY + r * rowHeight;
      const isEven = r % 2 === 0;

      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.rect(margin, rowY, contentWidth, rowHeight, 'FD');

      // Left Column
      if (item1) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(item1.label, margin + 4, rowY + 4.6);

        doc.setFont('helvetica', item1.highlight ? 'bold' : 'normal');
        doc.setFontSize(8);
        doc.setTextColor(item1.highlight ? accentColor[0] : primaryColor[0], item1.highlight ? accentColor[1] : primaryColor[1], item1.highlight ? accentColor[2] : primaryColor[2]);
        const valStr = String(item1.value !== undefined && item1.value !== null && item1.value !== '' ? item1.value : 'None');
        doc.text(valStr, margin + 42, rowY + 4.6);
      }

      // Dividing Line
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.line(margin + colWidth + 2, rowY, margin + colWidth + 2, rowY + rowHeight);

      // Right Column
      if (item2) {
        const col2X = margin + colWidth + 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(item2.label, col2X, rowY + 4.6);

        doc.setFont('helvetica', item2.highlight ? 'bold' : 'normal');
        doc.setFontSize(8);
        doc.setTextColor(item2.highlight ? accentColor[0] : primaryColor[0], item2.highlight ? accentColor[1] : primaryColor[1], item2.highlight ? accentColor[2] : primaryColor[2]);
        const valStr2 = String(item2.value !== undefined && item2.value !== null && item2.value !== '' ? item2.value : 'None');
        doc.text(valStr2, col2X + 38, rowY + 4.6);
      }
    }

    currentY += totalRows * rowHeight + 6;
  };

  // 3. Technical & Package Specifications
  drawSectionHeader('1. TECHNICAL & PACKAGE SPECIFICATIONS');
  drawSpecsTable([
    { label: 'Package Size:', value: app.file_size || 'N/A', highlight: true },
    { label: 'App Version:', value: app.version || '1.0' },
    { label: 'Developer / Studio:', value: app.developer || 'Official Studio', highlight: true },
    { label: 'Rating Score:', value: `${app.rating || 4.2} / 5.0` },
    { label: 'Total Rating Votes:', value: app.review_count || 0 },
    { label: 'Safety Evaluation:', value: app.safety_status || 'Verified' },
    { label: 'Publish Date:', value: app.publish_date || 'N/A' },
    { label: 'Target Region:', value: app.target_region || 'Global / India' },
    { label: 'Top Chart Category:', value: app.is_top_chart ? (app.top_chart_category || 'Featured') : 'Not Ranked' },
    { label: 'Featured Banner:', value: app.is_featured ? 'Active (Yes)' : 'No' },
    { label: 'Hot / Trending Badge:', value: app.is_hot ? 'Active (Yes)' : 'No' },
    { label: 'New Addition Badge:', value: app.is_new ? 'Active (Yes)' : 'No' }
  ]);

  // 4. Search Engine Optimization (SEO) & Metadata
  drawSectionHeader('2. SEARCH ENGINE OPTIMIZATION (SEO) & METADATA');
  
  const drawBlockField = (label: string, value: string | undefined, isUrl = false) => {
    const textVal = (value || '').trim() || 'Not Configured';
    const splitLines = doc.splitTextToSize(textVal, contentWidth - 8);
    const boxHeight = Math.max(10, splitLines.length * 4.2 + 8);

    checkPageBreak(boxHeight + 4);

    doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(label.toUpperCase(), margin + 4, currentY + 4.8);

    doc.setFont('helvetica', isUrl ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(isUrl ? accentColor[0] : primaryColor[0], isUrl ? accentColor[1] : primaryColor[1], isUrl ? accentColor[2] : primaryColor[2]);
    doc.text(splitLines, margin + 4, currentY + 9.5);

    currentY += boxHeight + 3.5;
  };

  drawBlockField('Google SEO Meta Title', app.seo_title || `${app.name} Review & Specs | RummyDex`);
  drawBlockField('Google SEO Meta Description', app.seo_description || 'Hands-on review, gameplay specs, and verified metrics on RummyDex.');
  drawBlockField('Canonical Public URL', `https://www.rummydex.com/app/${app.slug || app.id}`, true);
  
  if (app.seo_keywords) {
    drawBlockField('SEO Keywords & Meta Tags', app.seo_keywords);
  }

  // 5. Administrative Alerts & Warning Notices
  if (app.red_box_msg || app.yellow_box_msg || app.idea_box_msg) {
    drawSectionHeader('3. COMPLIANCE & SAFETY CALLOUT NOTICES');
    if (app.red_box_msg) {
      drawBlockField('Critical Red Alert Notice (Security / Caution)', app.red_box_msg);
    }
    if (app.yellow_box_msg) {
      drawBlockField('Advisory Yellow Box Notice (Important Notice)', app.yellow_box_msg);
    }
    if (app.idea_box_msg) {
      drawBlockField('Information & Idea Box Notice (Tips)', app.idea_box_msg);
    }
  }

  // Footer for all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    doc.text('RUMMYDEX TRANSPARENCY SYSTEM • INTERNAL ADMIN APP SPEC SHEET', margin, pageHeight - 6.5);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6.5, { align: 'right' });
  }

  // Trigger browser download
  const cleanFilename = (app.slug || app.name || 'app')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  doc.save(`${cleanFilename}_specs_report.pdf`);
}
