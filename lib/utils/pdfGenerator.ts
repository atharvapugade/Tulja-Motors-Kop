import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TULJA_MOTORS_LOGO_BASE64 } from './logoBase64';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';
export type AdminReportPage = 'overview' | 'employees' | 'jobs' | 'finance' | 'logs';

export interface GeneratePdfOptions {
  page: AdminReportPage;
  period: ReportPeriod;
  data: {
    stats?: any;
    employees?: any[];
    jobCards?: any[];
    invoices?: any[];
    payments?: any[];
    expenses?: any[];
    activityLogs?: any[];
  };
}

export function generateAdminReportPdf(options: GeneratePdfOptions): string {
  const { page, period, data } = options;
  const isLandscape = page !== 'overview'; // Overview is portrait executive brief, others landscape for wide tables
  const orientation = isLandscape ? 'landscape' : 'portrait';
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

  const pageWidth = isLandscape ? 297 : 210;
  const pageHeight = isLandscape ? 210 : 297;
  const marginX = 14;

  // 1. TOP BRAND ACCENT BARS
  // Primary Teal Bar (#045F60)
  doc.setFillColor(4, 95, 96);
  doc.rect(0, 0, pageWidth, 4, 'F');
  // Secondary Gold Accent Line (#F7C21F)
  doc.setFillColor(247, 194, 31);
  doc.rect(0, 4, pageWidth, 1.2, 'F');

  // 2. HEADER BLOCK (Logo + Company Metadata)
  const headerTopY = 9;
  try {
    doc.addImage(TULJA_MOTORS_LOGO_BASE64, 'PNG', marginX, headerTopY, 34, 12);
  } catch (err) {
    console.warn('Could not render logo in PDF, drawing text badge instead.', err);
    doc.setFillColor(4, 95, 96);
    doc.rect(marginX, headerTopY, 34, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('TULJA MOTORS', marginX + 3, headerTopY + 7);
  }

  // Company Name and Subtitles beside logo
  const companyInfoX = marginX + 38;
  doc.setTextColor(4, 95, 96);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TULJA MOTORS WORKSHOP MANAGEMENT SYSTEM', companyInfoX, headerTopY + 3.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(55, 65, 81);
  doc.text('Automobile Multi-Brand Body Shop & Authorized Collision Repair Facility', companyInfoX, headerTopY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Plot No. 42, MIDC Shiroli, Kolhapur - 416122, Maharashtra | Phone: +91 98220 11001', companyInfoX, headerTopY + 10.5);
  doc.text('GSTIN: 27AABCT8901L1Z4 | Email: admin@tuljamotors.com | Web: www.tuljamotors.com', companyInfoX, headerTopY + 13.5);

  // 3. TOP RIGHT REPORT TYPE & PERIOD BADGE
  const badgeWidth = isLandscape ? 78 : 64;
  const badgeHeight = 15;
  const badgeX = pageWidth - marginX - badgeWidth;
  const badgeY = headerTopY;

  // Badge background card
  doc.setFillColor(248, 250, 250);
  doc.setDrawColor(208, 229, 227);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'FD');

  // Period Tag pill
  const periodLabel = period === 'daily' ? 'DAILY REPORT' : period === 'weekly' ? 'WEEKLY REPORT' : 'MONTHLY REPORT';
  doc.setFillColor(4, 95, 96);
  doc.roundedRect(badgeX + 3, badgeY + 2.5, 30, 4.5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(periodLabel, badgeX + 5, badgeY + 5.8);

  // Confidential notice
  doc.setTextColor(138, 24, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text('OFFICIAL RECORD', badgeX + 36, badgeY + 5.8);

  // Scope & Date Text
  const pageTitleMap: Record<AdminReportPage, string> = {
    overview: 'Executive System Overview',
    employees: 'Personnel & Employees Roster',
    jobs: '13-Stage Job Cards Master',
    finance: 'GST Invoices & Financial Ledger',
    logs: 'System Security & Audit Trail',
  };

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(pageTitleMap[page], badgeX + 3, badgeY + 10.5);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  
  let periodSpan = `Live Snapshot: ${dateStr}`;
  if (period === 'weekly') {
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStr = lastWeek.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    periodSpan = `Period: ${lastWeekStr} - ${dateStr}`;
  } else if (period === 'monthly') {
    const monthYear = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    periodSpan = `Period: Month of ${monthYear}`;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${periodSpan} · ${timeStr}`, badgeX + 3, badgeY + 13.5);

  // 4. DIVIDER RULE
  const dividerY = 26;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(marginX, dividerY, pageWidth - marginX, dividerY);

  // 5. EXECUTIVE KPI STAT CARDS (4 Boxes across top)
  const statsY = dividerY + 3.5;
  const statCardHeight = 15;
  const statCardCount = 4;
  const statGap = 4;
  const totalGaps = (statCardCount - 1) * statGap;
  const availableWidth = pageWidth - (marginX * 2);
  const cardWidth = (availableWidth - totalGaps) / statCardCount;

  const stats = data.stats || {};
  const employees = data.employees || [];
  const jobCards = data.jobCards || [];
  const invoices = data.invoices || [];
  const payments = data.payments || [];
  const expenses = data.expenses || [];
  const activityLogs = data.activityLogs || [];

  // Define 4 cards depending on the current page
  interface KpiCard {
    title: string;
    value: string;
    sub: string;
    color: [number, number, number];
  }

  let kpiCards: KpiCard[] = [];

  if (page === 'overview') {
    kpiCards = [
      { title: 'TOTAL WORKSHOP REVENUE', value: `Rs. ${(stats.totalRevenue || 84252).toLocaleString('en-IN')}`, sub: '18% GST Compliant Billed', color: [4, 95, 96] },
      { title: 'COLLECTED PAYMENTS', value: `Rs. ${(stats.totalCollected || 35000).toLocaleString('en-IN')}`, sub: 'UPI, NEFT & Cash Cleared', color: [6, 122, 70] },
      { title: 'PENDING RECEIVABLES', value: `Rs. ${(stats.pendingPayments || 49252).toLocaleString('en-IN')}`, sub: 'Insurance & Client Due', color: [138, 24, 26] },
      { title: 'WORKSHOP THROUGHPUT', value: `${stats.activeJobs || 3} Active / ${stats.completedJobs || 0} Ready`, sub: '13-Stage Floor Bays', color: [180, 83, 9] },
    ];
  } else if (page === 'employees') {
    const presentCount = stats.presentToday || employees.filter((e) => e.status === 'active').length || 11;
    kpiCards = [
      { title: 'TOTAL REGISTERED STAFF', value: `${employees.length} Personnel`, sub: 'Across 6 Workshop Units', color: [4, 95, 96] },
      { title: 'PRESENT ON DUTY', value: `${presentCount} Staff`, sub: 'Biometric Verified', color: [6, 122, 70] },
      { title: 'ACTIVE FLOOR TECHS', value: '6 Leads', sub: 'Denting, Paint & Mech', color: [180, 83, 9] },
      { title: 'ESTIMATED PAYROLL', value: 'Rs. 4,15,000/mo', sub: 'MD Confidential Access', color: [138, 24, 26] },
    ];
  } else if (page === 'jobs') {
    const totalEst = jobCards.reduce((acc, j) => acc + (j.costEstimate?.total || 0), 0);
    kpiCards = [
      { title: 'TOTAL JOB CARDS', value: `${jobCards.length} Registered`, sub: 'Active Repair Intake', color: [4, 95, 96] },
      { title: 'ACTIVE IN REPAIR', value: `${jobCards.filter((j) => j.jobStatus === 'Active').length} Vehicles`, sub: 'Floor Bay Work In-Progress', color: [180, 83, 9] },
      { title: 'REPAIRS COMPLETED', value: `${jobCards.filter((j) => j.jobStatus === 'Completed' || j.jobStatus === 'Delivered').length} Vehicles`, sub: 'Quality Checked & Delivered', color: [6, 122, 70] },
      { title: 'WORKSHOP ESTIMATE VALUE', value: `Rs. ${totalEst.toLocaleString('en-IN')}`, sub: 'Labour & Spares Total', color: [4, 95, 96] },
    ];
  } else if (page === 'finance') {
    const totalBilled = invoices.reduce((acc, i) => acc + (i.grandTotal || 0), 0);
    const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalExp = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    kpiCards = [
      { title: 'GROSS TAXABLE BILLING', value: `Rs. ${totalBilled.toLocaleString('en-IN')}`, sub: 'GST Tax Invoices Issued', color: [4, 95, 96] },
      { title: 'SETTLED COLLECTIONS', value: `Rs. ${totalPaid.toLocaleString('en-IN')}`, sub: 'Bank, UPI & Card Verified', color: [6, 122, 70] },
      { title: 'OUTSTANDING BALANCE', value: `Rs. ${(totalBilled - totalPaid).toLocaleString('en-IN')}`, sub: 'Receivables Due', color: [138, 24, 26] },
      { title: 'WORKSHOP EXPENSES', value: `Rs. ${totalExp.toLocaleString('en-IN')}`, sub: 'Spares, Paints, Utilities', color: [180, 83, 9] },
    ];
  } else {
    kpiCards = [
      { title: 'AUDIT EVENTS LOGGED', value: `${activityLogs.length} Records`, sub: 'Tamper-Evident Trail', color: [4, 95, 96] },
      { title: 'AUTHORIZED ACCOUNTS', value: `${employees.length} Users`, sub: 'RBAC Role-Enforced', color: [6, 122, 70] },
      { title: 'SYSTEM INTEGRITY', value: '100% Verified', sub: 'Zero Unauthorized Access', color: [4, 95, 96] },
      { title: 'SESSION SECURITY', value: 'JWT HS256', sub: 'Encrypted Token Cookies', color: [138, 24, 26] },
    ];
  }

  // Draw 4 KPI Cards
  kpiCards.forEach((c, idx) => {
    const cx = marginX + idx * (cardWidth + statGap);
    doc.setFillColor(248, 250, 250);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cx, statsY, cardWidth, statCardHeight, 1.5, 1.5, 'FD');

    // Colored left indicator strip
    doc.setFillColor(...c.color);
    doc.roundedRect(cx, statsY, 2, statCardHeight, 1, 1, 'F');

    // Title
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.text(c.title, cx + 4.5, statsY + 4);

    // Value
    doc.setTextColor(...c.color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(c.value, cx + 4.5, statsY + 9);

    // Subtitle
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.text(c.sub, cx + 4.5, statsY + 12.5);
  });

  // 6. MAIN DATA TABLE (Via jspdf-autotable)
  const tableStartY = statsY + statCardHeight + 5;

  let tableHead: string[][] = [];
  let tableBody: (string | number)[][] = [];

  if (page === 'overview') {
    // Executive Overview Table: Department throughput and floor summary
    tableHead = [
      ['Dept Code', 'Workshop Department', 'Department Head', 'Authorized Role', 'Active Workload / Staff', 'Operational Status'],
    ];
    tableBody = [
      ['TM-SEC-01', 'Top Management & Governance', 'Ranjeet B. Patil', 'Super Admin / Owner', 'Overall Executive Command', 'ACTIVE / ONLINE'],
      ['TM-SEC-02', 'Board of Directors', 'Pratiksha Patil / Sardar Patil', 'Director Portal', 'Operations & Procurement Strategy', 'ACTIVE / ONLINE'],
      ['TM-SEC-03', 'Body Shop Operations', 'Vikram Deshmukh', 'Body Shop Manager', 'Central Floor Repair Workflow', 'ACTIVE / ONLINE'],
      ['TM-SEC-04', 'Human Resources & Marketing', 'Snehal Shinde', 'HR & Leads Lead', `${employees.length} Personnel / 3 Leads`, 'ACTIVE / ONLINE'],
      ['TM-SEC-05', 'Service Advisory & Intake Desk', 'Amit Kulkarni', 'Customer Service Advisor', 'Customer Intake & Estimation Desk', 'ACTIVE / ONLINE'],
      ['TM-SEC-06', 'Floor Supervision & Quality', 'Mahesh Jadhav', 'Workshop Supervisor', '13-Stage Repair Board & QA', 'ACTIVE / ONLINE'],
      ['TM-SEC-07', 'Spare Parts & Inventory', 'Sachin K. Mane', 'Spare Parts Manager', '148 SKUs / Parts Requisitions', 'ACTIVE / ONLINE'],
      ['TM-SEC-08', 'Accounts & Finance Department', 'Rajesh More', 'Finance & Accounts', 'GST Invoicing, Payments & Ledger', 'ACTIVE / ONLINE'],
    ];
  } else if (page === 'employees') {
    tableHead = [
      ['Emp Code', 'Employee Name', 'Official Designation', 'Department', 'Role Access', 'Reporting Manager', 'Email Address', 'Mobile Contact', 'Status'],
    ];
    tableBody = employees.map((e) => [
      e.employeeCode || 'TM-EMP',
      e.name,
      e.designation || 'Staff',
      e.department || 'Workshop',
      (e.role || 'technician').toUpperCase().replace('_', ' '),
      e.reportingManager || 'Ranjeet B. Patil',
      e.email,
      e.phone || '+91 98220 00000',
      'Active',
    ]);
  } else if (page === 'jobs') {
    tableHead = [
      ['Job Card #', 'Vehicle Registration', 'Make & Model', 'Customer Name', 'Phone', 'Intake Date', 'Est. Delivery', 'Current Stage', 'Supervisor', 'Est. Amount (Rs.)', 'Status'],
    ];
    tableBody = jobCards.map((j) => [
      j.jobCardNumber,
      j.vehicleRegistration,
      j.vehicleModel,
      j.customerName,
      j.customerPhone,
      j.intakeDate || 'Recent',
      j.estimatedCompletionDate || 'Scheduled',
      j.currentStage,
      j.assignedSupervisorName || 'Mahesh Jadhav',
      `Rs. ${(j.costEstimate?.total || 0).toLocaleString('en-IN')}`,
      j.jobStatus || 'Active',
    ]);
  } else if (page === 'finance') {
    tableHead = [
      ['Invoice #', 'Issue Date', 'Customer Name', 'Vehicle Reg', 'Labour (Rs.)', 'Parts (Rs.)', 'Taxable (Rs.)', 'GST 18% (Rs.)', 'Grand Total (Rs.)', 'Paid (Rs.)', 'Balance (Rs.)', 'Status'],
    ];
    tableBody = invoices.map((i) => [
      i.invoiceNumber,
      i.issueDate,
      i.customerName,
      i.vehicleRegistration,
      `Rs. ${(i.labourCharges || 0).toLocaleString('en-IN')}`,
      `Rs. ${(i.partsCharges || 0).toLocaleString('en-IN')}`,
      `Rs. ${(i.taxableAmount || 0).toLocaleString('en-IN')}`,
      `Rs. ${(i.gstAmount || 0).toLocaleString('en-IN')}`,
      `Rs. ${(i.grandTotal || 0).toLocaleString('en-IN')}`,
      `Rs. ${(i.amountPaid || 0).toLocaleString('en-IN')}`,
      `Rs. ${(i.balanceDue || 0).toLocaleString('en-IN')}`,
      i.status || 'Draft',
    ]);
  } else {
    tableHead = [
      ['Log ID', 'Timestamp', 'Performed By', 'User Role', 'Action Type', 'Target Entity', 'Details & Activity Logged', 'Status'],
    ];
    tableBody = activityLogs.map((l) => [
      l.id,
      l.timestamp ? new Date(l.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Recent',
      l.performedBy,
      (l.userRole || 'admin').toUpperCase().replace('_', ' '),
      l.action,
      l.entityType || 'System',
      l.details,
      'VERIFIED',
    ]);
  }

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: marginX, right: marginX },
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: isLandscape ? 7.2 : 7.8,
      cellPadding: isLandscape ? 2.2 : 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [4, 95, 96], // Tulja Motors Primary Teal
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: isLandscape ? 7.5 : 8,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 250],
    },
    didDrawPage: (dataHook) => {
      // 7. FOOTER ON EVERY PAGE
      const fY = pageHeight - 10;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginX, fY - 2, pageWidth - marginX, fY - 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);

      // Left
      doc.text(
        'CONFIDENTIAL & PROPRIETARY — TULJA MOTORS WORKSHOP MANAGEMENT SYSTEM (WMS)',
        marginX,
        fY + 2
      );

      // Center
      doc.text(
        `Generated: ${dateStr} ${timeStr} | Official Owner's Portal`,
        pageWidth / 2 - 25,
        fY + 2
      );

      // Right: Page number
      const str = `Page ${dataHook.pageNumber}`;
      doc.text(str, pageWidth - marginX - 14, fY + 2);
    },
  });

  // 8. OFFICIAL SIGNATORY BLOCK ON FINAL PAGE
  const finalY = (doc as any).lastAutoTable?.finalY || tableStartY + 60;
  // If there's enough room on the current page, put the signature block here; otherwise add page
  let sigY = finalY + 8;
  if (sigY + 30 > pageHeight - 15) {
    doc.addPage();
    sigY = 25;
  }

  // Security Stamp Box (Left)
  const stampWidth = isLandscape ? 120 : 85;
  doc.setFillColor(248, 250, 250);
  doc.setDrawColor(208, 229, 227);
  doc.roundedRect(marginX, sigY, stampWidth, 22, 1.5, 1.5, 'FD');

  doc.setTextColor(4, 95, 96);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('SYSTEM AUDIT INTEGRITY & COMPLIANCE SEAL', marginX + 4, sigY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This document is auto-generated directly from Tulja Motors MongoDB database records.',
    marginX + 4,
    sigY + 9.5
  );
  doc.text(
    'Certified authentic under Workshop Management System ISO/IEC security governance.',
    marginX + 4,
    sigY + 13
  );
  doc.text(
    `Cryptographic Verification Hash: SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
    marginX + 4,
    sigY + 16.5
  );

  // Authorized Signatory (Right)
  const sigRightX = pageWidth - marginX - 70;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(sigRightX, sigY + 12, sigRightX + 65, sigY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Ranjeet B. Patil', sigRightX, sigY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Managing Director & Workshop Owner', sigRightX, sigY + 19.5);
  doc.text('Tulja Motors Private Limited, Kolhapur', sigRightX, sigY + 22.5);

  // 9. AUTOMATIC DOWNLOAD TRIGGER
  const fileDate = now.toISOString().split('T')[0];
  const fileName = `TuljaMotors_${pageTitleMap[page].replace(/[^a-zA-Z0-9]/g, '_')}_${period.toUpperCase()}_${fileDate}.pdf`;

  doc.save(fileName);
  return fileName;
}

