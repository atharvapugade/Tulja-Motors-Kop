'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Car,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileText,
  Flame,
  Gauge,
  Hammer,
  Layers,
  Loader2,
  Pencil,
  Phone,
  Plus,
  ReceiptIndianRupee,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import type {
  ActivityLog,
  BottleneckInfo,
  Employee,
  Invoice,
  JobCard,
  Payment,
  RepairStage,
  RepairTask,
  UserRole,
  Vehicle,
} from '@/lib/models/types';
import CenterPopupModal, { CenterPopupState } from '@/lib/components/CenterPopupModal';
import { generateInvoicePdf, generateAdminReportPdf } from '@/lib/utils/pdfGenerator';

interface BodyShopManagerDashboardProps {
  activeTab: string;
  jobCards: JobCard[];
  employees: Employee[];
  activityLogs: ActivityLog[];
  invoices?: Invoice[];
  loading: boolean;
  onRefresh: () => Promise<void> | void;
  onNotify: (msg: string) => void;
  onOpenExportPdf: () => void;
}

const ALL_13_STAGES: RepairStage[] = [
  'Vehicle Received',
  'Initial Inspection',
  'Estimation',
  'Customer Approval',
  'Dismantling',
  'Denting & Bodywork',
  'Mechanical Work',
  'Painting',
  'Reassembly',
  'Quality Inspection',
  'Final Approval',
  'Ready for Delivery',
  'Delivered',
];

const PRE_FLOOR_STAGES: RepairStage[] = [
  'Vehicle Received',
  'Initial Inspection',
  'Estimation',
  'Customer Approval',
];

const FLOOR_BAY_STAGES: RepairStage[] = [
  'Dismantling',
  'Denting & Bodywork',
  'Mechanical Work',
  'Painting',
  'Reassembly',
  'Quality Inspection',
];

const DEPARTMENTS: RepairTask['department'][] = [
  'Denting',
  'Painting',
  'Mechanical',
  'Electrical',
  'Assembly',
  'Detailing',
];

const TASK_PRIORITIES: RepairTask['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
const TASK_STATUSES: RepairTask['status'][] = ['Pending', 'In Progress', 'Under Review', 'Completed'];

const BOTTLENECK_CATEGORIES: BottleneckInfo['category'][] = [
  'Spare Parts Pending',
  'Insurance Surveyor Approval',
  'Customer Approval Pending',
  'Paint Booth Queue',
  'Technician Bandwidth',
  'QC Rework',
  'Other',
];

interface DelayAssessment {
  isDelayed: boolean;
  isOverdue: boolean;
  isExplicitHold: boolean;
  isRework: boolean;
  isUnallocatedFloor: boolean;
  isAtRiskSoon: boolean;
  daysDiff: number;
  severityScore: number;
  primaryTag: string;
  badgeClass: string;
  reasons: string[];
}

function getTodayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

function assessJobBottleneck(job: JobCard, todayIso: string): DelayAssessment {
  const isFinished =
    job.jobStatus === 'Completed' ||
    job.jobStatus === 'Delivered' ||
    job.jobStatus === 'Cancelled' ||
    job.currentStage === 'Ready for Delivery' ||
    job.currentStage === 'Delivered';

  const dueDateStr = job.estimatedCompletionDate || todayIso;
  const dueMs = new Date(dueDateStr).getTime();
  const todayMs = new Date(todayIso).getTime();
  const daysDiff =
    Number.isNaN(dueMs) || Number.isNaN(todayMs)
      ? 0
      : Math.round((dueMs - todayMs) / (1000 * 60 * 60 * 24));

  const isExplicitHold =
    job.jobStatus === 'On Hold' || Boolean(job.bottleneckInfo?.isDelayed);
  const isRework = job.qualityInspection?.status === 'Rework Required';
  const isOverdue = !isFinished && daysDiff < 0;
  const isHandedOver =
    job.handoverToSupervisor === true ||
    (job.handoverToSupervisor !== false && !PRE_FLOOR_STAGES.includes(job.currentStage));
  const isUnallocatedFloor =
    !isFinished &&
    isHandedOver &&
    ((job.tasks || []).length === 0 || (job.tasks || []).some((t) => !t.assignedTechnicianId));
  const isClientPending =
    !isFinished && job.currentStage === 'Customer Approval' && !job.customerApproved;
  const isAtRiskSoon =
    !isFinished &&
    daysDiff >= 0 &&
    daysDiff <= 2 &&
    job.currentStage !== 'Final Approval';

  const reasons: string[] = [];
  if (job.bottleneckInfo?.isDelayed && job.bottleneckInfo.reason) {
    reasons.push(`[${job.bottleneckInfo.category}] ${job.bottleneckInfo.reason}`);
  } else if (job.jobStatus === 'On Hold') {
    reasons.push('Job placed On Hold awaiting floor resolution');
  }
  if (isRework) {
    reasons.push(
      `QC Rework flagged: ${job.qualityInspection?.reworkReason || 'Inspect finishing'}`
    );
  }
  if (isOverdue) {
    reasons.push(`Past SLA due date by ${Math.abs(daysDiff)} day(s) (Due ${dueDateStr})`);
  }
  if (isUnallocatedFloor) {
    reasons.push('Handed over to floor without assigned specialist technician tasks');
  }
  if (isClientPending) {
    reasons.push('Waiting on customer estimate / repair sign-off');
  }
  if (isAtRiskSoon && !isOverdue) {
    reasons.push(`Delivery due in ${daysDiff === 0 ? 'today' : `${daysDiff} day(s)`}`);
  }

  let severityScore = 0;
  if (isExplicitHold) severityScore += 40;
  if (isRework) severityScore += 30;
  if (isOverdue) severityScore += 20 + Math.min(25, Math.abs(daysDiff));
  if (isUnallocatedFloor) severityScore += 15;
  if (isClientPending) severityScore += 10;
  if (isAtRiskSoon) severityScore += 5;

  let primaryTag = 'On Track';
  let badgeClass = 'badge-active';
  if (job.jobStatus === 'On Hold' || job.bottleneckInfo?.isDelayed) {
    primaryTag = job.bottleneckInfo?.category || 'On Hold';
    badgeClass = 'badge-danger';
  } else if (isRework) {
    primaryTag = 'QC Rework';
    badgeClass = 'badge-danger';
  } else if (isOverdue) {
    primaryTag = `Overdue ${Math.abs(daysDiff)}d`;
    badgeClass = 'badge-danger';
  } else if (isUnallocatedFloor) {
    primaryTag = 'Crew Pending';
    badgeClass = 'badge-warning';
  } else if (isClientPending) {
    primaryTag = 'Client Approval';
    badgeClass = 'badge-warning';
  } else if (isAtRiskSoon) {
    primaryTag = `Due ${daysDiff === 0 ? 'Today' : `in ${daysDiff}d`}`;
    badgeClass = 'badge-warning';
  }

  const isDelayed =
    isExplicitHold || isRework || isOverdue || isUnallocatedFloor || isClientPending || isAtRiskSoon;

  return {
    isDelayed,
    isOverdue,
    isExplicitHold,
    isRework,
    isUnallocatedFloor,
    isAtRiskSoon,
    daysDiff,
    severityScore,
    primaryTag,
    badgeClass,
    reasons,
  };
}

function getPriorityBadgeClass(priority?: JobCard['priority'] | RepairTask['priority']): string {
  if (priority === 'Urgent' || priority === 'Critical') return 'badge-danger';
  if (priority === 'Insurance Express' || priority === 'High') return 'badge-purple';
  if (priority === 'Medium') return 'badge-warning';
  return 'badge-neutral';
}

function getDepartmentBadgeClass(dept: RepairTask['department']): string {
  switch (dept) {
    case 'Denting':
      return 'badge-danger';
    case 'Painting':
      return 'badge-purple';
    case 'Mechanical':
      return 'badge-info';
    case 'Electrical':
      return 'badge-warning';
    case 'Assembly':
      return 'badge-neutral';
    case 'Detailing':
      return 'badge-active';
    default:
      return 'badge-neutral';
  }
}

function getSuggestedTechnicianForDepartment(
  dept: RepairTask['department'],
  techs: Employee[]
): Employee | undefined {
  if (techs.length === 0) return undefined;
  const keywordMap: Record<RepairTask['department'], string[]> = {
    Denting: ['dent', 'body'],
    Painting: ['paint', 'spray', 'booth'],
    Mechanical: ['mech', 'suspension', 'engine'],
    Electrical: ['electr', 'wiring', 'sensor'],
    Detailing: ['detail', 'polish', 'ceramic', 'electr'],
    Assembly: ['assembly', 'dent', 'mech'],
  };
  const keywords = keywordMap[dept] || [];
  const matched = techs.find((t) =>
    keywords.some((kw) => t.designation.toLowerCase().includes(kw))
  );
  return matched || techs[0];
}

export default function BodyShopManagerDashboard({
  activeTab,
  jobCards,
  employees,
  activityLogs,
  invoices: initialInvoicesProp,
  loading,
  onRefresh,
  onNotify,
  onOpenExportPdf,
}: BodyShopManagerDashboardProps) {
  const currentTab =
    activeTab === 'jobs' || activeTab === 'technicians' || activeTab === 'delays' || activeTab === 'billing' || activeTab === 'finance'
      ? activeTab
      : 'overview';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [managerName, setManagerName] = useState('Vikram Deshmukh');
  const [managerRole, setManagerRole] = useState<UserRole>('body_shop_manager');

  // Invoices & Live Billing States
  const [invoicesList, setInvoicesList] = useState<Invoice[]>(initialInvoicesProp || []);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [billingSearch, setBillingSearch] = useState('');
  const [billingStatusFilter, setBillingStatusFilter] = useState('ALL');

  // Billing Modals State
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateTargetJobId, setGenerateTargetJobId] = useState('');
  const [submittingBilling, setSubmittingBilling] = useState(false);
  const [downloadingPdfInvId, setDownloadingPdfInvId] = useState<string | null>(null);

  // Billing Form States
  const [payForm, setPayForm] = useState({
    amount: '',
    method: 'UPI',
    reference: '',
  });

  const [editInvoiceForm, setEditInvoiceForm] = useState({
    labourCharges: '0',
    partsCharges: '0',
    paintCharges: '0',
    otherCharges: '0',
    discount: '0',
    status: 'Sent' as Invoice['status'],
  });

  const fetchInvoices = useCallback(async () => {
    try {
      setLoadingInvoices(true);
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (data.success && Array.isArray(data.invoices)) {
        setInvoicesList(data.invoices);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    if (initialInvoicesProp && initialInvoicesProp.length > 0) {
      setInvoicesList(initialInvoicesProp);
    }
  }, [initialInvoicesProp]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token =
          typeof window !== 'undefined' ? localStorage.getItem('tm_auth_token') : null;
        const [vehRes, meRes] = await Promise.all([
          fetch('/api/vehicles'),
          fetch('/api/auth/me', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);
        const vehData = await vehRes.json();
        const meData = await meRes.json();
        if (!active) return;

        if (vehData.success && Array.isArray(vehData.vehicles)) {
          setVehicles(vehData.vehicles);
        }
        if (meRes.ok && meData.authenticated && meData.user) {
          setManagerName(meData.user.name || 'Vikram Deshmukh');
          setManagerRole(meData.user.role || 'body_shop_manager');
        } else if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('tm_user');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed.name) setManagerName(parsed.name);
              if (parsed.role) setManagerRole(parsed.role);
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error('Error loading body shop manager data:', err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Scoped tab filters (automatically reset cleanly when switching tabs)
  const [filters, setFilters] = useState<{
    tab: string;
    search: string;
    stage: string;
    status: string;
    supervisorId: string;
    priority: string;
    techId: string;
    dept: string;
    taskStatus: string;
    delayCategory:
      | 'ALL_DELAYED'
      | 'OVERDUE'
      | 'ON_HOLD'
      | 'QC_REWORK'
      | 'UNALLOCATED'
      | 'ALL_ACTIVE';
  }>({
    tab: 'overview',
    search: '',
    stage: 'ALL',
    status: 'ALL',
    supervisorId: 'ALL',
    priority: 'ALL',
    techId: 'ALL',
    dept: 'ALL',
    taskStatus: 'ALL',
    delayCategory: 'ALL_DELAYED',
  });

  const activeFilters = useMemo(
    () =>
      filters.tab === currentTab
        ? filters
        : {
            tab: currentTab,
            search: '',
            stage: 'ALL',
            status: 'ALL',
            supervisorId: 'ALL',
            priority: 'ALL',
            techId: 'ALL',
            dept: 'ALL',
            taskStatus: 'ALL',
            delayCategory: 'ALL_DELAYED' as const,
          },
    [filters, currentTab]
  );

  const patchFilters = (
    patch: Partial<Omit<typeof filters, 'tab'>>
  ) => {
    setFilters((prev) => ({
      ...(prev.tab === currentTab
        ? prev
        : {
            tab: currentTab,
            search: '',
            stage: 'ALL',
            status: 'ALL',
            supervisorId: 'ALL',
            priority: 'ALL',
            techId: 'ALL',
            dept: 'ALL',
            taskStatus: 'ALL',
            delayCategory: 'ALL_DELAYED' as const,
          }),
      ...patch,
    }));
  };

  // Modals State
  const [dossierJob, setDossierJob] = useState<JobCard | null>(null);

  // Stage & Final Approval Modal
  const [stageJob, setStageJob] = useState<JobCard | null>(null);
  const [targetStage, setTargetStage] = useState<RepairStage>('Denting & Bodywork');
  const [targetJobStatus, setTargetJobStatus] = useState<JobCard['jobStatus']>('Active');
  const [stageNoteText, setStageNoteText] = useState('');
  const [savingStage, setSavingStage] = useState(false);

  // Supervisor Reassignment & Priority Escalation Modal
  const [reassignJob, setReassignJob] = useState<JobCard | null>(null);
  const [nextSupId, setNextSupId] = useState('');
  const [nextPriority, setNextPriority] = useState<NonNullable<JobCard['priority']>>('Normal');
  const [nextEstDate, setNextEstDate] = useState('');
  const [reassignNote, setReassignNote] = useState('');
  const [savingReassign, setSavingReassign] = useState(false);

  // Multi-Technician Rebalance / Allocation Modal
  const [allocJob, setAllocJob] = useState<JobCard | null>(null);
  const [allocTasks, setAllocTasks] = useState<RepairTask[]>([]);
  const [savingAlloc, setSavingAlloc] = useState(false);
  const [newTaskDraft, setNewTaskDraft] = useState<{
    title: string;
    department: RepairTask['department'];
    assignedTechnicianId: string;
    priority: RepairTask['priority'];
    estimatedHours: string;
    description: string;
  }>({
    title: '',
    department: 'Denting',
    assignedTechnicianId: '',
    priority: 'Medium',
    estimatedHours: '4',
    description: '',
  });

  // Register New Technician Modal
  const [showAddTechModal, setShowAddTechModal] = useState(false);
  const [savingNewTech, setSavingNewTech] = useState(false);
  const [newTechForm, setNewTechForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    designation: 'Master Denting Technician',
    salary: '30000',
  });

  // Bottleneck & Delay Escalation Modal
  const [delayJob, setDelayJob] = useState<JobCard | null>(null);
  const [delayCategoryForm, setDelayCategoryForm] =
    useState<BottleneckInfo['category']>('Spare Parts Pending');
  const [delayReasonText, setDelayReasonText] = useState('');
  const [delayActionPlan, setDelayActionPlan] = useState('');
  const [delayRevisedDate, setDelayRevisedDate] = useState('');
  const [delayHoldStatus, setDelayHoldStatus] = useState<'On Hold' | 'Active'>('On Hold');
  const [savingDelay, setSavingDelay] = useState(false);

  // Centered Popup Dialog (Zero native browser alert/confirm)
  const [popupAlert, setPopupAlert] = useState<CenterPopupState | null>(null);

  const showCenterPopup = (
    message: string,
    title = 'Action Required',
    tone: CenterPopupState['tone'] = 'warning',
    options?: Pick<CenterPopupState, 'confirmLabel' | 'onConfirm'>
  ) => {
    setPopupAlert({
      title,
      message,
      tone,
      confirmLabel: options?.confirmLabel,
      onConfirm: options?.onConfirm,
    });
  };

  const todayIso = useMemo(() => getTodayIsoDate(), []);

  // Derived Personnel Lists
  const supervisors = useMemo(
    () =>
      employees
        .filter((e) => e.role === 'supervisor')
        .sort((a, b) => a.name.localeCompare(b.name)),
    [employees]
  );

  const technicians = useMemo(
    () =>
      employees
        .filter(
          (e) =>
            e.role === 'technician' &&
            e.status !== 'resigned' &&
            e.status !== 'terminated'
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [employees]
  );

  // Billing Metrics & KPIs
  const billingMetrics = useMemo(() => {
    const totalBilled = invoicesList.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
    const totalPaid = invoicesList.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
    const totalBalance = invoicesList.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);
    const paidCount = invoicesList.filter((inv) => inv.status === 'Paid').length;
    const partialCount = invoicesList.filter((inv) => inv.status === 'Partially Paid').length;
    const pendingCount = invoicesList.filter((inv) => inv.status !== 'Paid').length;

    return {
      totalBilled,
      totalPaid,
      totalBalance,
      paidCount,
      partialCount,
      pendingCount,
      totalInvoices: invoicesList.length,
    };
  }, [invoicesList]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoicesList.filter((inv) => {
      const q = billingSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.jobCardNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.vehicleRegistration.toLowerCase().includes(q);

      const matchStatus = billingStatusFilter === 'ALL' || inv.status === billingStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoicesList, billingSearch, billingStatusFilter]);

  // Active/Completed Job Cards without an official Tax Invoice yet
  const jobsAwaitingInvoice = useMemo(() => {
    const invoicedJobCardNumbers = new Set(invoicesList.map((i) => i.jobCardNumber));
    const invoicedJobCardIds = new Set(invoicesList.map((i) => i.jobCardId));
    return jobCards.filter((j) => {
      const notInvoiced = !invoicedJobCardNumbers.has(j.jobCardNumber) && !invoicedJobCardIds.has(j.id);
      const hasEstimate = (j.costEstimate?.total || 0) > 0;
      return notInvoiced && hasEstimate;
    });
  }, [jobCards, invoicesList]);

  // Download Formatted Tax Invoice PDF
  const handleDownloadInvoicePdf = (inv: Invoice) => {
    try {
      setDownloadingPdfInvId(inv.id);
      const matchedJob = jobCards.find(
        (j) => j.id === inv.jobCardId || j.jobCardNumber === inv.jobCardNumber
      );
      const fileName = generateInvoicePdf(inv, matchedJob);
      onNotify(`Official Tax Invoice PDF downloaded: ${fileName}`);
    } catch (err) {
      console.error('Failed to generate invoice PDF:', err);
      showCenterPopup(
        'Failed to generate invoice PDF: ' + (err instanceof Error ? err.message : String(err)),
        'PDF Generation Error',
        'error'
      );
    } finally {
      setDownloadingPdfInvId(null);
    }
  };

  // Export Monthly Billing Ledger PDF
  const handleExportBillingLedgerPdf = () => {
    try {
      const fileName = generateAdminReportPdf({
        page: 'finance',
        period: 'monthly',
        data: {
          invoices: invoicesList,
          jobCards,
        },
      });
      onNotify(`Monthly Financial Ledger PDF downloaded: ${fileName}`);
    } catch (err) {
      console.error('Failed to export financial ledger:', err);
      showCenterPopup('Failed to export financial ledger PDF.', 'PDF Error', 'error');
    }
  };

  const handleOpenEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setEditInvoiceForm({
      labourCharges: String(inv.labourCharges || 0),
      partsCharges: String(inv.partsCharges || 0),
      paintCharges: String(inv.paintCharges || 0),
      otherCharges: String(inv.otherCharges || 0),
      discount: String(inv.discount || 0),
      status: inv.status,
    });
  };

  const handleSaveEditInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    setSubmittingBilling(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_invoice',
          invoiceId: editingInvoice.id,
          labourCharges: Number(editInvoiceForm.labourCharges) || 0,
          partsCharges: Number(editInvoiceForm.partsCharges) || 0,
          paintCharges: Number(editInvoiceForm.paintCharges) || 0,
          otherCharges: Number(editInvoiceForm.otherCharges) || 0,
          discount: Number(editInvoiceForm.discount) || 0,
          status: editInvoiceForm.status,
          updatedBy: `${managerName} (Body Shop Manager)`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingInvoice(null);
        await Promise.all([fetchInvoices(), onRefresh()]);
        onNotify(data.message || 'Invoice updated successfully!');
      } else {
        showCenterPopup(data.message || 'Failed to update invoice.', 'Error', 'error');
      }
    } catch {
      showCenterPopup('Network error while updating invoice.', 'Error', 'error');
    } finally {
      setSubmittingBilling(false);
    }
  };

  const handleOpenRecordPayment = (inv: Invoice) => {
    setPaymentInvoice(inv);
    setPayForm({
      amount: String(inv.balanceDue || inv.grandTotal || 0),
      method: 'UPI',
      reference: `PAY-${Date.now().toString().slice(-6)}`,
    });
  };

  const handleConfirmRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice) return;
    setSubmittingBilling(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_payment',
          invoiceId: paymentInvoice.id,
          amount: Number(payForm.amount) || 0,
          paymentMethod: payForm.method,
          reference: payForm.reference.trim(),
          receivedBy: `${managerName} (Body Shop Manager)`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentInvoice(null);
        await Promise.all([fetchInvoices(), onRefresh()]);
        onNotify(data.message || 'Payment recorded successfully!');
      } else {
        showCenterPopup(data.message || 'Failed to record payment.', 'Error', 'error');
      }
    } catch {
      showCenterPopup('Network error while recording payment.', 'Error', 'error');
    } finally {
      setSubmittingBilling(false);
    }
  };

  const handleConfirmGenerateInvoice = async (jobCardId: string) => {
    setSubmittingBilling(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_from_job',
          jobCardId,
          generatedBy: `${managerName} (Body Shop Manager)`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowGenerateModal(false);
        await Promise.all([fetchInvoices(), onRefresh()]);
        onNotify(data.message || 'Tax Invoice generated successfully!');
        showCenterPopup(
          `Tax Invoice ${data.invoice?.invoiceNumber} generated! You can now download the PDF invoice or record customer payments.`,
          'Invoice Created',
          'info'
        );
      } else {
        showCenterPopup(data.message || 'Failed to generate invoice.', 'Error', 'error');
      }
    } catch {
      showCenterPopup('Network error while generating invoice.', 'Error', 'error');
    } finally {
      setSubmittingBilling(false);
    }
  };

  // Helpers
  const getActorLabel = () => {
    const tag =
      managerRole === 'super_admin' || managerRole === 'admin'
        ? 'Super Admin / BSM Command'
        : 'Body Shop Manager';
    return `${managerName} (${tag})`;
  };

  const getTechName = useCallback(
    (techId: string, fallback?: string) => {
      if (!techId) return 'Unassigned';
      const found = technicians.find((t) => t.userId === techId || t.id === techId);
      if (found) return found.name;
      const anyEmp = employees.find((e) => e.userId === techId || e.id === techId);
      return anyEmp?.name || fallback || 'Workshop Tech';
    },
    [technicians, employees]
  );

  const getUniqueAssignedTechsForJob = useCallback(
    (job: JobCard): { id: string; name: string; departments: string[] }[] => {
      const map = new Map<string, { id: string; name: string; departments: Set<string> }>();
      (job.tasks || []).forEach((t) => {
        if (!t.assignedTechnicianId) return;
        const id = t.assignedTechnicianId;
        const name = getTechName(id, t.assignedTechnicianName);
        if (!map.has(id)) {
          map.set(id, { id, name, departments: new Set([t.department]) });
        } else {
          map.get(id)?.departments.add(t.department);
        }
      });
      if (map.size === 0 && Array.isArray(job.assignedTechnicianIds)) {
        job.assignedTechnicianIds.forEach((tid) => {
          if (!tid) return;
          const name = getTechName(tid);
          map.set(tid, { id: tid, name, departments: new Set() });
        });
      }
      return Array.from(map.values()).map((entry) => ({
        id: entry.id,
        name: entry.name,
        departments: Array.from(entry.departments),
      }));
    },
    [getTechName]
  );

  const getVehicleDetails = (vehicleId: string, reg: string): Vehicle | undefined =>
    vehicles.find((v) => v.id === vehicleId || v.registrationNumber === reg);

  // Operational Metrics & Delay Intelligence
  const jobAssessments = useMemo(() => {
    const map = new Map<string, DelayAssessment>();
    jobCards.forEach((j) => map.set(j.id, assessJobBottleneck(j, todayIso)));
    return map;
  }, [jobCards, todayIso]);

  const activeWorkshopJobs = useMemo(
    () =>
      jobCards.filter(
        (j) => j.jobStatus === 'Active' || j.jobStatus === 'On Hold'
      ),
    [jobCards]
  );

  const inFloorBayJobs = useMemo(
    () =>
      activeWorkshopJobs.filter((j) => FLOOR_BAY_STAGES.includes(j.currentStage)),
    [activeWorkshopJobs]
  );

  const wipRevenueTotal = useMemo(
    () =>
      activeWorkshopJobs.reduce((acc, j) => acc + (j.costEstimate?.total || 0), 0),
    [activeWorkshopJobs]
  );

  const totalOpenTasks = useMemo(
    () =>
      jobCards.reduce(
        (acc, j) => acc + (j.tasks || []).filter((t) => t.status !== 'Completed').length,
        0
      ),
    [jobCards]
  );

  const completedTasksCount = useMemo(
    () =>
      jobCards.reduce(
        (acc, j) => acc + (j.tasks || []).filter((t) => t.status === 'Completed').length,
        0
      ),
    [jobCards]
  );

  const delayedJobsList = useMemo(
    () =>
      jobCards
        .filter((j) => jobAssessments.get(j.id)?.isDelayed)
        .sort(
          (a, b) =>
            (jobAssessments.get(b.id)?.severityScore || 0) -
            (jobAssessments.get(a.id)?.severityScore || 0)
        ),
    [jobCards, jobAssessments]
  );

  const finalApprovalWatchlist = useMemo(
    () =>
      jobCards.filter(
        (j) =>
          j.currentStage === 'Quality Inspection' ||
          j.currentStage === 'Final Approval' ||
          j.qualityInspection?.status === 'Passed' ||
          j.priority === 'Urgent'
      ),
    [jobCards]
  );

  const floorActivityFeed = useMemo(
    () =>
      [...activityLogs]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 6),
    [activityLogs]
  );

  // Filtered Views per Tab
  const filteredJobs = useMemo(() => {
    const q = activeFilters.search.toLowerCase();
    return jobCards.filter((j) => {
      const matchesSearch =
        !q ||
        j.jobCardNumber.toLowerCase().includes(q) ||
        j.vehicleRegistration.toLowerCase().includes(q) ||
        j.vehicleModel.toLowerCase().includes(q) ||
        j.customerName.toLowerCase().includes(q) ||
        (j.assignedSupervisorName || '').toLowerCase().includes(q) ||
        (j.advisorName || '').toLowerCase().includes(q) ||
        (j.tasks || []).some(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            getTechName(t.assignedTechnicianId, t.assignedTechnicianName)
              .toLowerCase()
              .includes(q)
        );
      const matchesStage =
        activeFilters.stage === 'ALL' || j.currentStage === activeFilters.stage;
      const matchesStatus =
        activeFilters.status === 'ALL' || j.jobStatus === activeFilters.status;
      const matchesPriority =
        activeFilters.priority === 'ALL' ||
        (j.priority || 'Normal') === activeFilters.priority;
      const matchesSup =
        activeFilters.supervisorId === 'ALL' ||
        j.assignedSupervisorId === activeFilters.supervisorId ||
        employees.some(
          (e) =>
            e.role === 'supervisor' &&
            (e.userId === activeFilters.supervisorId || e.id === activeFilters.supervisorId) &&
            (e.id === j.assignedSupervisorId ||
              e.userId === j.assignedSupervisorId ||
              e.name.toLowerCase() === (j.assignedSupervisorName || '').toLowerCase())
        );

      const matchesTech =
        activeFilters.techId === 'ALL' ||
        (j.tasks || []).some((t) => t.assignedTechnicianId === activeFilters.techId) ||
        (j.assignedTechnicianIds || []).includes(activeFilters.techId);

      const matchesDept =
        activeFilters.dept === 'ALL' ||
        (j.tasks || []).some((t) => t.department === activeFilters.dept);

      const matchesTaskStatus =
        activeFilters.taskStatus === 'ALL' ||
        (j.tasks || []).some((t) => t.status === activeFilters.taskStatus);

      return (
        matchesSearch &&
        matchesStage &&
        matchesStatus &&
        matchesPriority &&
        matchesSup &&
        matchesTech &&
        matchesDept &&
        matchesTaskStatus
      );
    });
  }, [jobCards, activeFilters, employees, getTechName]);

  const filteredDelayJobs = useMemo(() => {
    const q = activeFilters.search.toLowerCase();
    return jobCards
      .filter((j) => {
        const assess = jobAssessments.get(j.id);
        if (!assess) return false;
        const cat = activeFilters.delayCategory;

        const matchesCategory =
          cat === 'ALL_ACTIVE'
            ? j.jobStatus !== 'Delivered' && j.jobStatus !== 'Cancelled'
            : cat === 'ALL_DELAYED'
            ? assess.isDelayed
            : cat === 'OVERDUE'
            ? assess.isOverdue
            : cat === 'ON_HOLD'
            ? assess.isExplicitHold
            : cat === 'QC_REWORK'
            ? assess.isRework
            : assess.isUnallocatedFloor ||
              (j.currentStage === 'Customer Approval' && !j.customerApproved);

        const matchesSearch =
          !q ||
          j.jobCardNumber.toLowerCase().includes(q) ||
          j.vehicleRegistration.toLowerCase().includes(q) ||
          j.vehicleModel.toLowerCase().includes(q) ||
          j.customerName.toLowerCase().includes(q) ||
          (j.assignedSupervisorName || '').toLowerCase().includes(q) ||
          (j.bottleneckInfo?.reason || '').toLowerCase().includes(q);

        return matchesCategory && matchesSearch;
      })
      .sort(
        (a, b) =>
          (jobAssessments.get(b.id)?.severityScore || 0) -
          (jobAssessments.get(a.id)?.severityScore || 0)
      );
  }, [jobCards, activeFilters, jobAssessments]);

  // ==============================================================
  // HANDLERS: STAGE PROGRESSION & MANAGER FINAL APPROVAL
  // ==============================================================
  const openStageModal = (job: JobCard) => {
    const idx = ALL_13_STAGES.indexOf(job.currentStage);
    const suggested =
      idx >= 0 && idx < ALL_13_STAGES.length - 1 ? ALL_13_STAGES[idx + 1] : job.currentStage;
    setStageJob(job);
    setTargetStage(suggested);
    setTargetJobStatus(job.jobStatus);
    setStageNoteText('');
  };

  const handleConfirmStageUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageJob) return;
    if (!stageNoteText.trim()) {
      showCenterPopup(
        'Please record a Body Shop Manager operational note for this stage or approval update.',
        'Operational Note Required'
      );
      return;
    }

    setSavingStage(true);
    try {
      const res = await fetch('/api/job-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: stageJob.id,
          currentStage: targetStage,
          jobStatus: targetJobStatus,
          stageNote: stageNoteText.trim(),
          updatedBy: getActorLabel(),
          userRole: 'body_shop_manager',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(data.message || 'Could not update repair stage.', 'Update Failed', 'error');
        return;
      }
      setStageJob(null);
      await onRefresh();
      onNotify(
        `Updated ${data.jobCard.jobCardNumber} (${data.jobCard.vehicleRegistration}) to "${targetStage}".`
      );
    } catch (err: unknown) {
      showCenterPopup(
        'Network error updating stage: ' + (err instanceof Error ? err.message : String(err)),
        'Connection Error',
        'error'
      );
    } finally {
      setSavingStage(false);
    }
  };

  const handleManagerFinalApproval = (job: JobCard) => {
    const nextStage: RepairStage =
      job.currentStage === 'Final Approval' ? 'Ready for Delivery' : 'Final Approval';
    showCenterPopup(
      `Certify Body Shop Manager Final Approval for ${job.jobCardNumber} (${job.vehicleRegistration}) and advance stage to "${nextStage}"?`,
      'Confirm Final Floor Approval',
      'info',
      {
        confirmLabel: `Approve -> ${nextStage}`,
        onConfirm: async () => {
          try {
            const res = await fetch('/api/job-cards', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: job.id,
                currentStage: nextStage,
                jobStatus: nextStage === 'Ready for Delivery' ? 'Completed' : 'Active',
                stageNote: `Final Management Approval signed off by ${managerName} (Body Shop Manager).`,
                updatedBy: getActorLabel(),
                userRole: 'body_shop_manager',
              }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
              showCenterPopup(data.message || 'Final approval failed.', 'Approval Error', 'error');
              return;
            }
            await onRefresh();
            onNotify(
              `Final Approval granted on ${job.jobCardNumber}! Moved to "${nextStage}".`
            );
          } catch {
            showCenterPopup('Network error submitting approval.', 'Connection Error', 'error');
          }
        },
      }
    );
  };

  // ==============================================================
  // HANDLERS: SUPERVISOR REASSIGNMENT & PRIORITY ESCALATION
  // ==============================================================
  const openReassignModal = (job: JobCard) => {
    setReassignJob(job);
    const matched = supervisors.find(
      (s) =>
        (s.userId && s.userId === job.assignedSupervisorId) ||
        s.id === job.assignedSupervisorId ||
        s.name.toLowerCase() === (job.assignedSupervisorName || '').toLowerCase()
    );
    setNextSupId(matched?.userId || matched?.id || job.assignedSupervisorId || '');
    setNextPriority(job.priority || 'Normal');
    setNextEstDate(job.estimatedCompletionDate || todayIso);
    setReassignNote('');
  };

  const handleSaveReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignJob) return;
    if (!nextSupId) {
      showCenterPopup('Please choose a Floor Supervisor for this vehicle.', 'Supervisor Required');
      return;
    }

    const supObj = supervisors.find((s) => (s.userId || s.id) === nextSupId || s.id === nextSupId);
    const supName = supObj?.name || reassignJob.assignedSupervisorName;

    setSavingReassign(true);
    try {
      const res = await fetch('/api/job-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reassignJob.id,
          assignedSupervisorId: nextSupId,
          assignedSupervisorName: supName,
          priority: nextPriority,
          estimatedCompletionDate: nextEstDate,
          handoverToSupervisor: true,
          stageNote:
            reassignNote.trim() ||
            `Body Shop Manager ${managerName} assigned Floor Supervisor ${supName} (${nextPriority} priority, due ${nextEstDate}).`,
          updatedBy: getActorLabel(),
          userRole: 'body_shop_manager',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(
          data.message || 'Unable to reassign floor supervisor.',
          'Update Failed',
          'error'
        );
        return;
      }
      setReassignJob(null);
      await onRefresh();
      onNotify(
        `Updated floor assignment on ${data.jobCard.jobCardNumber}: Supervisor ${supName} (${nextPriority}).`
      );
    } catch (err: unknown) {
      showCenterPopup(
        'Connection error updating supervisor: ' +
          (err instanceof Error ? err.message : String(err)),
        'Connection Error',
        'error'
      );
    } finally {
      setSavingReassign(false);
    }
  };

  // ==============================================================
  // HANDLERS: MULTI-TECHNICIAN ALLOCATION & REBALANCING
  // ==============================================================
  const openAllocateModal = (job: JobCard) => {
    setAllocJob(job);
    const cloned = (job.tasks || []).map((t) => ({
      ...t,
      assignedTechnicianId:
        t.assignedTechnicianId || technicians[0]?.userId || technicians[0]?.id || '',
      assignedTechnicianName: getTechName(t.assignedTechnicianId, t.assignedTechnicianName),
    }));
    setAllocTasks(cloned);
    const defaultTech = getSuggestedTechnicianForDepartment('Denting', technicians);
    setNewTaskDraft({
      title: '',
      department: 'Denting',
      assignedTechnicianId: defaultTech?.userId || defaultTech?.id || '',
      priority: job.priority === 'Urgent' ? 'Critical' : 'Medium',
      estimatedHours: '4',
      description: '',
    });
  };

  const handleAddTaskInModal = () => {
    if (!newTaskDraft.title.trim()) {
      showCenterPopup(
        'Please enter a clear bay task title before adding it to the vehicle crew.',
        'Task Title Required'
      );
      return;
    }
    if (!newTaskDraft.assignedTechnicianId) {
      showCenterPopup(
        'Please assign a specialist technician to handle this bay task.',
        'Technician Required'
      );
      return;
    }

    const techName = getTechName(newTaskDraft.assignedTechnicianId);
    const task: RepairTask = {
      id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      title: newTaskDraft.title.trim(),
      description:
        newTaskDraft.description.trim() ||
        `${newTaskDraft.department} allocation scheduled by Body Shop Manager ${managerName}.`,
      department: newTaskDraft.department,
      assignedTechnicianId: newTaskDraft.assignedTechnicianId,
      assignedTechnicianName: techName,
      priority: newTaskDraft.priority,
      status: 'Pending',
      estimatedHours: Math.max(1, Number(newTaskDraft.estimatedHours) || 4),
    };
    setAllocTasks((prev) => [...prev, task]);
    setNewTaskDraft((prev) => ({ ...prev, title: '', description: '' }));
  };

  const handleSaveMultiTechAllocation = async () => {
    if (!allocJob) return;
    if (allocTasks.length === 0) {
      showCenterPopup(
        'Please include at least one technician bay task before saving.',
        'Tasks Required'
      );
      return;
    }
    const unassigned = allocTasks.find((t) => !t.assignedTechnicianId);
    if (unassigned) {
      showCenterPopup(
        `Task "${unassigned.title}" needs a technician assigned before saving.`,
        'Unassigned Task'
      );
      return;
    }

    setSavingAlloc(true);
    try {
      const normalizedTasks = allocTasks.map((t) => ({
        ...t,
        assignedTechnicianName: getTechName(t.assignedTechnicianId, t.assignedTechnicianName),
      }));
      const uniqueTechIds = Array.from(
        new Set(normalizedTasks.map((t) => t.assignedTechnicianId).filter(Boolean))
      );

      const res = await fetch('/api/job-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: allocJob.id,
          tasks: normalizedTasks,
          assignedTechnicianIds: uniqueTechIds,
          updatedBy: getActorLabel(),
          userRole: 'body_shop_manager',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(
          data.message || 'Unable to save technician rebalancing.',
          'Save Failed',
          'error'
        );
        return;
      }
      setAllocJob(null);
      await onRefresh();
      onNotify(
        `Balanced ${normalizedTasks.length} bay task(s) across ${uniqueTechIds.length} specialist(s) on ${data.jobCard.jobCardNumber}.`
      );
    } catch (err: unknown) {
      showCenterPopup(
        'Network error saving crew changes: ' +
          (err instanceof Error ? err.message : String(err)),
        'Connection Error',
        'error'
      );
    } finally {
      setSavingAlloc(false);
    }
  };

  const handleInlineTaskUpdate = async (
    job: JobCard,
    taskId: string,
    patch: Partial<RepairTask>
  ) => {
    if (patch.assignedTechnicianId !== undefined && !patch.assignedTechnicianId) {
      showCenterPopup(
        'Each repair bay task must remain assigned to a workshop technician.',
        'Technician Required'
      );
      return;
    }

    const updatedTasks = (job.tasks || []).map((t) => {
      if (t.id !== taskId) return t;
      const nextTechId = patch.assignedTechnicianId ?? t.assignedTechnicianId;
      const nextStatus = patch.status ?? t.status;
      return {
        ...t,
        ...patch,
        assignedTechnicianId: nextTechId,
        assignedTechnicianName: getTechName(nextTechId, t.assignedTechnicianName),
        completedAt:
          nextStatus === 'Completed'
            ? t.completedAt || new Date().toISOString()
            : undefined,
      };
    });
    const uniqueTechIds = Array.from(
      new Set(updatedTasks.map((t) => t.assignedTechnicianId).filter(Boolean))
    );

    try {
      const res = await fetch('/api/job-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: job.id,
          tasks: updatedTasks,
          assignedTechnicianIds: uniqueTechIds,
          updatedBy: getActorLabel(),
          userRole: 'body_shop_manager',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(data.message || 'Could not update task.', 'Update Failed', 'error');
        return;
      }
      await onRefresh();
      onNotify(`Rebalanced bay task on ${job.jobCardNumber}.`);
    } catch {
      showCenterPopup('Network error while updating technician task.', 'Connection Error', 'error');
    }
  };

  const handleRegisterTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechForm.name.trim() || !newTechForm.email.trim()) {
      showCenterPopup('Please provide technician full name and email.', 'Missing Details');
      return;
    }
    if (!newTechForm.password.trim()) {
      showCenterPopup('Please set an initial portal password for this technician.', 'Password Required');
      return;
    }
    setSavingNewTech(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTechForm.name.trim(),
          email: newTechForm.email.trim(),
          password: newTechForm.password.trim(),
          phone: newTechForm.phone.trim() || '+91 98220 88099',
          role: 'technician',
          department: 'Technician Team',
          designation: newTechForm.designation.trim() || 'Workshop Technician',
          reportingManager: supervisors[0]?.name || 'Mahesh Jadhav',
          salary: Number(newTechForm.salary) || 30000,
          createdBy: getActorLabel(),
          userRole: 'body_shop_manager',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg = data.message || 'Failed to register technician.';
        const isDuplicate = msg.toLowerCase().includes('already registered');
        showCenterPopup(
          msg,
          isDuplicate ? 'Account Already Registered' : 'Registration Failed',
          isDuplicate ? 'warning' : 'error'
        );
        return;
      }
      setShowAddTechModal(false);
      setNewTechForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        designation: 'Master Denting Technician',
        salary: '30000',
      });
      await onRefresh();
      onNotify(`Added specialist technician "${data.employee.name}" to workshop roster.`);
    } catch (err: unknown) {
      showCenterPopup(
        'Error registering technician: ' + (err instanceof Error ? err.message : String(err)),
        'Error',
        'error'
      );
    } finally {
      setSavingNewTech(false);
    }
  };

  // ==============================================================
  // HANDLERS: FLOOR DELAYS & BOTTLENECK ESCALATION / RESOLUTION
  // ==============================================================
  const openDelayModal = (job: JobCard) => {
    setDelayJob(job);
    const assess = jobAssessments.get(job.id);
    setDelayCategoryForm(
      job.bottleneckInfo?.category ||
        (assess?.isRework ? 'QC Rework' : 'Spare Parts Pending')
    );
    setDelayReasonText(
      job.bottleneckInfo?.reason || assess?.reasons[0] || ''
    );
    setDelayActionPlan(job.bottleneckInfo?.actionPlan || '');
    setDelayRevisedDate(
      job.bottleneckInfo?.revisedCompletionDate || job.estimatedCompletionDate || todayIso
    );
    setDelayHoldStatus(job.jobStatus === 'On Hold' ? 'On Hold' : 'Active');
  };

  const handleSaveDelayEscalation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delayJob) return;
    if (!delayReasonText.trim()) {
      showCenterPopup(
        'Please specify the root cause of this delay or bottleneck before logging escalation.',
        'Root Cause Required'
      );
      return;
    }

    setSavingDelay(true);
    try {
      const nowIso = new Date().toISOString();
      const info: BottleneckInfo = {
        isDelayed: true,
        category: delayCategoryForm,
        reason: delayReasonText.trim(),
        actionPlan: delayActionPlan.trim() || undefined,
        revisedCompletionDate: delayRevisedDate || delayJob.estimatedCompletionDate,
        flaggedBy: getActorLabel(),
        flaggedAt: nowIso,
      };

      const res = await fetch('/api/job-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: delayJob.id,
          jobStatus: delayHoldStatus,
          estimatedCompletionDate: delayRevisedDate || delayJob.estimatedCompletionDate,
          bottleneckInfo: info,
          stageNote: `BOTTLENECK ESCALATED [${delayCategoryForm}]: ${delayReasonText.trim()}${delayActionPlan.trim() ? ` | Plan: ${delayActionPlan.trim()}` : ''}`,
          updatedBy: getActorLabel(),
          userRole: 'body_shop_manager',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(
          data.message || 'Could not record floor bottleneck.',
          'Save Failed',
          'error'
        );
        return;
      }

      setDelayJob(null);
      await onRefresh();
      onNotify(
        `Bottleneck logged [${delayCategoryForm}] on ${data.jobCard.jobCardNumber} (${delayHoldStatus}).`
      );
    } catch (err: unknown) {
      showCenterPopup(
        'Network error logging bottleneck: ' +
          (err instanceof Error ? err.message : String(err)),
        'Connection Error',
        'error'
      );
    } finally {
      setSavingDelay(false);
    }
  };

  const handleResolveBottleneck = (job: JobCard) => {
    showCenterPopup(
      `Mark floor bottleneck resolved for ${job.jobCardNumber} (${job.vehicleRegistration}), restore status to Active, and update delivery target if needed?`,
      'Resolve Floor Bottleneck',
      'info',
      {
        confirmLabel: 'Resolve & Resume Work',
        onConfirm: async () => {
          try {
            const nowIso = new Date().toISOString();
            const safeDue =
              job.estimatedCompletionDate < todayIso
                ? new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
                : job.estimatedCompletionDate;

            const cleared: BottleneckInfo = {
              isDelayed: false,
              category: job.bottleneckInfo?.category || 'Other',
              reason: job.bottleneckInfo?.reason || 'Resolved by Body Shop Manager',
              actionPlan: job.bottleneckInfo?.actionPlan,
              revisedCompletionDate: safeDue,
              flaggedBy: job.bottleneckInfo?.flaggedBy,
              flaggedAt: job.bottleneckInfo?.flaggedAt,
              resolvedAt: nowIso,
            };

            const res = await fetch('/api/job-cards', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: job.id,
                jobStatus: 'Active',
                estimatedCompletionDate: safeDue,
                bottleneckInfo: cleared,
                stageNote: `Bottleneck cleared by ${managerName} (Body Shop Manager). Vehicle resumed Active bay execution (Target delivery: ${safeDue}).`,
                updatedBy: getActorLabel(),
                userRole: 'body_shop_manager',
              }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
              showCenterPopup(data.message || 'Unable to resolve bottleneck.', 'Error', 'error');
              return;
            }
            await onRefresh();
            onNotify(
              `Bottleneck resolved on ${job.jobCardNumber} — resumed Active floor work.`
            );
          } catch {
            showCenterPopup('Network error resolving bottleneck.', 'Connection Error', 'error');
          }
        },
      }
    );
  };

  return (
    <div>
      {/* ============================================================== */}
      {/* TAB 1: FLOOR OPERATIONS (DEFAULT)                              */}
      {/* ============================================================== */}
      {currentTab === 'overview' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>Body Shop Floor Operations</h1>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-secondary-action"
                style={{ borderColor: '#045F60', color: '#045F60', fontWeight: '700' }}
                onClick={onOpenExportPdf}
              >
                <Download size={15} /> Export PDF
              </button>
              <Link
                href="/panels/body-shop-manager/dashboard?tab=delays"
                className="btn-primary-action"
                style={{ textDecoration: 'none' }}
              >
                <AlertOctagon size={15} /> Issues ({delayedJobsList.length})
              </Link>
            </div>
          </div>

          {/* 4 Body Shop Operations KPI Cards */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Active Workshop Load</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <Car size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : activeWorkshopJobs.length}</div>
              <div className="stat-card-subtext">
                {inFloorBayJobs.length} in active bays · {jobCards.length} total cards
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Floor WIP Pipeline</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <ShieldCheck size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `₹${wipRevenueTotal.toLocaleString('en-IN')}`}
              </div>
              <div className="stat-card-subtext">
                Across active &amp; on-hold repair orders
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Crew &amp; Task Bandwidth</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <Hammer size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : totalOpenTasks}</div>
              <div className="stat-card-subtext">
                Open tasks across {technicians.length} techs &amp; {supervisors.length} sup(s)
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Delays &amp; Bottlenecks</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : delayedJobsList.length}</div>
              <div
                className="stat-card-subtext"
                style={{ color: delayedJobsList.length > 0 ? '#8A181A' : '#067a46' }}
              >
                {delayedJobsList.filter((j) => jobAssessments.get(j.id)?.isOverdue).length} past SLA ·{' '}
                {jobCards.filter((j) => j.jobStatus === 'On Hold' || j.bottleneckInfo?.isDelayed).length} held
              </div>
            </div>
          </div>

          {/* 13-Stage Workshop Throughput Strip */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>13-Stage Floor Bay Distribution</h3>
              <Link
                href="/panels/body-shop-manager/dashboard?tab=jobs"
                className="btn-secondary-action"
                style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}
              >
                Open Master Jobs Table →
              </Link>
            </div>
            <div style={{ padding: '18px 20px' }}>
              <div className="wms-stage-board-grid">
                {ALL_13_STAGES.map((stg, idx) => {
                  const count = jobCards.filter((j) => j.currentStage === stg).length;
                  return (
                    <Link
                      key={stg}
                      href="/panels/body-shop-manager/dashboard?tab=jobs"
                      style={{
                        textDecoration: 'none',
                        background: count > 0 ? '#045F60' : '#f8faf9',
                        color: count > 0 ? '#ffffff' : '#5e6d6d',
                        border: count > 0 ? '1px solid #045F60' : '1px solid #e0e9e8',
                        borderRadius: '8px',
                        padding: '10px 8px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.85 }}>
                        Stage {idx + 1}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', marginTop: '4px', lineHeight: 1.2 }}>
                        {stg}
                      </div>
                      {count > 0 ? (
                        <div
                          style={{
                            marginTop: '6px',
                            fontSize: '11px',
                            background: '#F7C21F',
                            color: '#1a1a1a',
                            borderRadius: '12px',
                            padding: '2px 6px',
                            fontWeight: '800',
                            display: 'inline-block',
                          }}
                        >
                          {count} Vehicle{count > 1 ? 's' : ''}
                        </div>
                      ) : (
                        <div style={{ marginTop: '6px', fontSize: '11px', opacity: 0.6 }}>0 active</div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2-Column Supervisor Accountability & Live Floor Audit Stream */}
          <div className="wms-grid-2col">
            {/* Floor Supervisors Coordination */}
            <div className="wms-panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-card-header">
                <h3>Floor Supervisors Workload &amp; Coordination</h3>
                <span className="stage-badge badge-info">{supervisors.length} Supervisor(s)</span>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {supervisors.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    No workshop supervisors registered yet.
                  </p>
                ) : (
                  supervisors.map((sup) => {
                    const supJobs = jobCards.filter(
                      (j) =>
                        j.assignedSupervisorId === sup.userId ||
                        j.assignedSupervisorId === sup.id ||
                        (j.assignedSupervisorName || '').toLowerCase().trim() ===
                          sup.name.toLowerCase().trim()
                    );
                    const activeSupJobs = supJobs.filter(
                      (j) => j.jobStatus === 'Active' || j.jobStatus === 'On Hold'
                    );
                    const delayedCount = supJobs.filter(
                      (j) => jobAssessments.get(j.id)?.isDelayed
                    ).length;
                    const unallocatedCount = supJobs.filter(
                      (j) => (j.tasks || []).length === 0
                    ).length;

                    return (
                      <div
                        key={sup.id}
                        style={{
                          border: '1px solid #d9eae8',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          background: '#fafdfc',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                background: '#8A181A',
                                color: '#fff',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: '800',
                                fontSize: '14px',
                                flexShrink: 0,
                              }}
                            >
                              {sup.name.charAt(0)}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ fontSize: '14px', color: '#141b1b', display: 'block' }}>
                                {sup.name}
                              </strong>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>
                                {sup.designation} · {sup.phone}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <span className="stage-badge badge-info">
                              {activeSupJobs.length} Active Vehicles
                            </span>
                            {delayedCount > 0 && (
                              <span className="stage-badge badge-danger">
                                {delayedCount} Delayed
                              </span>
                            )}
                            {unallocatedCount > 0 && (
                              <span className="stage-badge badge-warning">
                                {unallocatedCount} Unallocated
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: '#475569' }}>
                          <span>Total Handled: {supJobs.length} job cards</span>
                          <Link
                            href="/panels/body-shop-manager/dashboard?tab=jobs"
                            style={{ fontWeight: '700', color: '#045F60', textDecoration: 'none' }}
                          >
                            Review &amp; Rebalance →
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Live Workshop Floor Activity Feed */}
            <div className="wms-panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-card-header">
                <h3>Live Workshop Activity &amp; Escalation Stream</h3>
                <span className="stage-badge badge-active">Real-Time Audit</span>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {floorActivityFeed.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    No recent workshop operational events logged.
                  </p>
                ) : (
                  floorActivityFeed.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        borderBottom: '1px solid #eef2f1',
                        paddingBottom: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <strong style={{ color: '#141b1b' }}>{log.performedBy}</strong>
                          <span className="stage-badge badge-neutral" style={{ fontSize: '10px' }}>
                            {log.action}
                          </span>
                        </div>
                        <div style={{ color: '#475569', marginTop: '3px', wordBreak: 'break-word' }}>{log.details}</div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {log.timestamp
                          ? new Date(log.timestamp).toLocaleDateString('en-IN')
                          : 'Recent'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Priority Floor & Final Management Approval Queue */}
          <div className="wms-panel-card" style={{ marginTop: '24px' }}>
            <div className="panel-card-header">
              <h3>Manager Final Approval &amp; Watchlist</h3>
              <span className="stage-badge badge-warning">
                {finalApprovalWatchlist.length} Priority / QC Jobs
              </span>
            </div>

            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Job Card #</th>
                    <th>Vehicle &amp; Customer</th>
                    <th>Supervisor &amp; Crew</th>
                    <th>Current Stage &amp; QC</th>
                    <th>SLA / Bottleneck</th>
                    <th>Manager Sign-Off Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {finalApprovalWatchlist.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '26px', color: '#64748b' }}>
                        No vehicles awaiting Final Approval or marked Urgent right now.
                      </td>
                    </tr>
                  ) : (
                    finalApprovalWatchlist.map((job) => {
                      const assess = jobAssessments.get(job.id);
                      const crew = getUniqueAssignedTechsForJob(job);
                      const canApprove =
                        job.currentStage === 'Quality Inspection' ||
                        job.currentStage === 'Final Approval' ||
                        job.qualityInspection?.status === 'Passed';

                      return (
                        <tr key={job.id}>
                          <td>
                            <code>{job.jobCardNumber}</code>
                            <div style={{ marginTop: '4px' }}>
                              <span
                                className={`stage-badge ${getPriorityBadgeClass(job.priority)}`}
                                style={{ fontSize: '10px' }}
                              >
                                {job.priority || 'Normal'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: '#045F60' }}>{job.vehicleRegistration}</strong>
                            <div style={{ fontSize: '12px', fontWeight: '600' }}>
                              {job.vehicleModel}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {job.customerName}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px', fontWeight: '700' }}>
                              Sup: {job.assignedSupervisorName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {crew.length > 0
                                ? `${crew.length} Tech(s): ${crew.map((c) => c.name).join(', ')}`
                                : 'No tech crew assigned'}
                            </div>
                          </td>
                          <td>
                            <span className="stage-badge badge-warning">{job.currentStage}</span>
                            {job.qualityInspection && (
                              <div style={{ fontSize: '11px', color: '#045F60', marginTop: '4px', fontWeight: '700' }}>
                                QC: {job.qualityInspection.status}
                              </div>
                            )}
                          </td>
                          <td>
                            {assess && (
                              <span className={`stage-badge ${assess.badgeClass}`}>
                                {assess.primaryTag}
                              </span>
                            )}
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                              Due: {job.estimatedCompletionDate}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {canApprove && (
                                <button
                                  type="button"
                                  className="btn-primary-action"
                                  style={{ padding: '5px 10px', fontSize: '11px' }}
                                  onClick={() => handleManagerFinalApproval(job)}
                                >
                                  <ShieldCheck size={13} />{' '}
                                  {job.currentStage === 'Final Approval'
                                    ? 'Release Delivery'
                                    : 'Final Approval'}
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 9px', fontSize: '11px' }}
                                onClick={() => openDelayModal(job)}
                              >
                                <Clock size={12} /> Hold
                              </button>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 9px', fontSize: '11px' }}
                                onClick={() => setDossierJob(job)}
                              >
                                <Eye size={12} /> View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ACTIVE REPAIR JOBS (?tab=jobs)                          */}
      {/* ============================================================== */}
      {currentTab === 'jobs' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>Active Repair Jobs</h1>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-primary-action"
                onClick={onOpenExportPdf}
              >
                <Download size={15} /> Export Floor Report
              </button>
            </div>
          </div>

          {/* 4 Job Tracking KPI Cards */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Active Orders</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <Car size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : activeWorkshopJobs.length}</div>
              <div className="stat-card-subtext">Active or Held on workshop floor</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">In Active Floor Bays</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <Layers size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : inFloorBayJobs.length}</div>
              <div className="stat-card-subtext">Dismantling through QC Inspection</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Completed / Ready</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading
                  ? '...'
                  : jobCards.filter(
                      (j) =>
                        j.currentStage === 'Final Approval' ||
                        j.currentStage === 'Ready for Delivery' ||
                        j.jobStatus === 'Completed' ||
                        j.jobStatus === 'Delivered'
                    ).length}
              </div>
              <div className="stat-card-subtext">Approved / cleared for customer</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Active WIP Estimate</span>
                <div className="stat-icon-wrapper" style={{ background: '#eef7f6', color: '#045F60' }}>
                  <FileText size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `₹${wipRevenueTotal.toLocaleString('en-IN')}`}
              </div>
              <div className="stat-card-subtext">Incl. 18% GST repair estimates</div>
            </div>
          </div>

          {/* Search & Multi-Filter Controls */}
          <div className="wms-filter-bar">
            <div className="wms-filter-controls">
              <input
                type="text"
                className="table-search-input"
                placeholder="Search job #, reg #, customer, tech..."
                value={activeFilters.search}
                onChange={(e) => patchFilters({ search: e.target.value })}
              />
              <select
                className="wms-select-input"
                value={activeFilters.stage}
                onChange={(e) => patchFilters({ stage: e.target.value })}
              >
                <option value="ALL">All 13 Repair Stages</option>
                {ALL_13_STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <select
                className="wms-select-input"
                value={activeFilters.supervisorId}
                onChange={(e) => patchFilters({ supervisorId: e.target.value })}
              >
                <option value="ALL">All Supervisors</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.userId || s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                className="wms-select-input"
                value={activeFilters.status}
                onChange={(e) => patchFilters({ status: e.target.value })}
              >
                <option value="ALL">All Job Statuses</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Delivered">Delivered</option>
              </select>
              <select
                className="wms-select-input"
                value={activeFilters.priority}
                onChange={(e) => patchFilters({ priority: e.target.value })}
              >
                <option value="ALL">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="Insurance Express">Insurance Express</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
            <span className="stage-badge badge-info">
              {filteredJobs.length} of {jobCards.length} Jobs
            </span>
          </div>

          {/* Complete Repair Jobs Operations Table */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>All Workshop Repair Jobs</h3>
              <span className="stage-badge badge-active">Saved Live to MongoDB</span>
            </div>

            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Job Card #</th>
                    <th>Vehicle &amp; Customer</th>
                    <th>Floor Supervisor</th>
                    <th>13-Stage Progress</th>
                    <th>Allocated Technicians Crew</th>
                    <th>Estimate &amp; SLA</th>
                    <th>Manager Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        No repair jobs match your current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => {
                      const stageIdx = Math.max(0, ALL_13_STAGES.indexOf(job.currentStage));
                      const pct = Math.round(((stageIdx + 1) / ALL_13_STAGES.length) * 100);
                      const crew = getUniqueAssignedTechsForJob(job);
                      const totalT = (job.tasks || []).length;
                      const doneT = (job.tasks || []).filter((t) => t.status === 'Completed').length;
                      const assess = jobAssessments.get(job.id);

                      return (
                        <tr key={job.id}>
                          <td>
                            <code>{job.jobCardNumber}</code>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                              <span
                                className={`stage-badge ${getPriorityBadgeClass(job.priority)}`}
                                style={{ fontSize: '10px' }}
                              >
                                {job.priority || 'Normal'}
                              </span>
                              <span
                                className={`stage-badge ${
                                  job.jobStatus === 'On Hold'
                                    ? 'badge-danger'
                                    : job.jobStatus === 'Completed' || job.jobStatus === 'Delivered'
                                    ? 'badge-active'
                                    : 'badge-info'
                                }`}
                                style={{ fontSize: '10px' }}
                              >
                                {job.jobStatus}
                              </span>
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: '#045F60', fontSize: '14px' }}>
                              {job.vehicleRegistration}
                            </strong>
                            <div style={{ fontSize: '12px', fontWeight: '600' }}>
                              {job.vehicleModel}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {job.customerName} · {job.customerPhone}
                            </div>
                          </td>
                          <td>
                            <strong style={{ fontSize: '13px', color: '#141b1b' }}>
                              {job.assignedSupervisorName || 'Unassigned'}
                            </strong>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              Advisor: {job.advisorName || 'Amit Kulkarni'}
                            </div>
                          </td>
                          <td style={{ minWidth: '185px' }}>
                            <span className="stage-badge badge-warning">{job.currentStage}</span>
                            <div
                              style={{
                                marginTop: '6px',
                                height: '6px',
                                width: '100%',
                                background: '#e2eeec',
                                borderRadius: '4px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${pct}%`,
                                  background: pct === 100 ? '#067a46' : '#045F60',
                                }}
                              />
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
                              Step {stageIdx + 1}/13 ({pct}%)
                            </div>
                          </td>
                          <td style={{ minWidth: '175px' }}>
                            {crew.length === 0 ? (
                              <span className="stage-badge badge-danger" style={{ fontSize: '11px' }}>
                                No Crew Allocated
                              </span>
                            ) : (
                              <div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {crew.map((c) => (
                                    <span
                                      key={c.id}
                                      className="stage-badge badge-info"
                                      style={{ fontSize: '10px' }}
                                    >
                                      {c.name}
                                    </span>
                                  ))}
                                </div>
                                <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>
                                  {doneT}/{totalT} tasks completed
                                </div>
                              </div>
                            )}
                          </td>
                          <td>
                            <strong style={{ color: '#045F60', fontSize: '13px' }}>
                              ₹{(job.costEstimate?.total || 0).toLocaleString('en-IN')}
                            </strong>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              Due: {job.estimatedCompletionDate}
                            </div>
                            {assess && (
                              <span
                                className={`stage-badge ${assess.badgeClass}`}
                                style={{ fontSize: '10px', marginTop: '4px' }}
                              >
                                {assess.primaryTag}
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 8px', fontSize: '11px' }}
                                onClick={() => setDossierJob(job)}
                              >
                                <Eye size={12} /> View
                              </button>
                              <button
                                type="button"
                                className="btn-primary-action"
                                style={{ padding: '5px 9px', fontSize: '11px' }}
                                onClick={() => openStageModal(job)}
                              >
                                <ArrowRight size={12} /> Move Stage
                              </button>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 8px', fontSize: '11px' }}
                                onClick={() => openReassignModal(job)}
                              >
                                <UserCheck size={12} /> Assign
                              </button>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{
                                  padding: '5px 8px',
                                  fontSize: '11px',
                                  borderColor: '#8A181A',
                                  color: '#8A181A',
                                }}
                                onClick={() => openDelayModal(job)}
                              >
                                <Clock size={12} /> Hold
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: TECHNICIAN ALLOCATION (?tab=technicians)                */}
      {/* ============================================================== */}
      {currentTab === 'technicians' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>Technician Allocation</h1>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setShowAddTechModal(true)}
              >
                <UserPlus size={15} /> Register Technician
              </button>
            </div>
          </div>

          {/* 4 Crew KPI Cards */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Specialist Technicians</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <Users size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : technicians.length}</div>
              <div className="stat-card-subtext">Available across 6 repair bays</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Open Workshop Tasks</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <Hammer size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : totalOpenTasks}</div>
              <div className="stat-card-subtext">{completedTasksCount} tasks completed</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Unstaffed Active Jobs</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading
                  ? '...'
                  : activeWorkshopJobs.filter((j) => (j.tasks || []).length === 0).length}
              </div>
              <div className="stat-card-subtext">Jobs with 0 technician bay tasks</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">High-Load Technicians</span>
                <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                  <Gauge size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading
                  ? '...'
                  : technicians.filter((tech) => {
                      const key = tech.userId || tech.id;
                      const hrs = jobCards
                        .flatMap((j) =>
                          (j.tasks || []).filter(
                            (t) =>
                              (t.assignedTechnicianId === key ||
                                t.assignedTechnicianId === tech.id) &&
                              t.status !== 'Completed'
                          )
                        )
                        .reduce((s, t) => s + (t.estimatedHours || 0), 0);
                      return hrs >= 12;
                    }).length}
              </div>
              <div className="stat-card-subtext">12+ active estimated hrs queued</div>
            </div>
          </div>

          {/* 6-Bay Departmental Capacity Strip (Clickable filter) */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>Departmental Bay Load</h3>
              {activeFilters.dept !== 'ALL' && (
                <button
                  type="button"
                  className="btn-secondary-action"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => patchFilters({ dept: 'ALL' })}
                >
                  Show All Bays ×
                </button>
              )}
            </div>

            <div
              className="wms-bay-filter-grid"
              style={{
                padding: '16px 20px',
              }}
            >
              {DEPARTMENTS.map((dept) => {
                const bayOpenTasks = jobCards.flatMap((j) =>
                  (j.tasks || []).filter(
                    (t) => t.department === dept && t.status !== 'Completed'
                  )
                );
                const bayHours = bayOpenTasks.reduce(
                  (s, t) => s + (t.estimatedHours || 0),
                  0
                );
                const selected = activeFilters.dept === dept;

                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => patchFilters({ dept: selected ? 'ALL' : dept })}
                    style={{
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: selected ? '#045F60' : '#fafdfc',
                      color: selected ? '#ffffff' : '#141b1b',
                      border: selected ? '2px solid #F7C21F' : '1px solid #d9eae8',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <strong style={{ fontSize: '13px' }}>{dept}</strong>
                      <span
                        className={`stage-badge ${selected ? 'badge-warning' : getDepartmentBadgeClass(dept)}`}
                        style={{ fontSize: '10px' }}
                      >
                        {bayOpenTasks.length} open
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        marginTop: '6px',
                        opacity: selected ? 0.9 : 0.7,
                      }}
                    >
                      {bayHours} est. hrs queued
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technician Capacity Roster Cards */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>Specialist Technicians Capacity</h3>
              {activeFilters.techId !== 'ALL' && (
                <button
                  type="button"
                  className="btn-secondary-action"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => patchFilters({ techId: 'ALL' })}
                >
                  All Technicians ×
                </button>
              )}
            </div>

            <div style={{ padding: '18px 20px' }}>
              <div className="wms-grid-3col" style={{ marginBottom: 0 }}>
                {technicians.map((tech) => {
                  const techKey = tech.userId || tech.id;
                  const techTasks = jobCards.flatMap((j) =>
                    (j.tasks || []).filter(
                      (t) => t.assignedTechnicianId === techKey || t.assignedTechnicianId === tech.id
                    )
                  );
                  const openTasks = techTasks.filter((t) => t.status !== 'Completed');
                  const hoursLoad = openTasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
                  const activeVehiclesCount = jobCards.filter((j) =>
                    (j.tasks || []).some(
                      (t) =>
                        (t.assignedTechnicianId === techKey ||
                          t.assignedTechnicianId === tech.id) &&
                        t.status !== 'Completed'
                    )
                  ).length;
                  const isOverloaded = hoursLoad >= 12 || openTasks.length >= 3;
                  const isSelected = activeFilters.techId === techKey;

                  return (
                    <button
                      key={tech.id}
                      type="button"
                      className="wms-org-node"
                      onClick={() =>
                        patchFilters({ techId: isSelected ? 'ALL' : techKey })
                      }
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderColor: isSelected ? '#045F60' : undefined,
                        background: isSelected ? '#f0fdfa' : '#ffffff',
                        borderWidth: isSelected ? '2px' : '1px',
                      }}
                    >
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: isOverloaded ? '#8A181A' : '#045F60',
                          color: '#ffffff',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: '800',
                          fontSize: '16px',
                          flexShrink: 0,
                        }}
                      >
                        {tech.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <strong style={{ fontSize: '14px', color: '#141b1b' }}>{tech.name}</strong>
                          <span
                            className={`stage-badge ${
                              isOverloaded
                                ? 'badge-danger'
                                : openTasks.length > 0
                                ? 'badge-warning'
                                : 'badge-active'
                            }`}
                            style={{ fontSize: '10px' }}
                          >
                            {isOverloaded ? 'High Load' : openTasks.length > 0 ? 'Busy' : 'Available'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                          {tech.designation}
                        </div>
                        <div style={{ fontSize: '11px', color: '#045F60', fontWeight: '700', marginTop: '4px' }}>
                          {activeVehiclesCount} Vehicle(s) · {openTasks.length} Open ({hoursLoad}h) · Sup:{' '}
                          {tech.reportingManager}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search & Rebalance Filter Bar */}
          <div className="wms-filter-bar">
            <div className="wms-filter-controls">
              <input
                type="text"
                className="table-search-input"
                placeholder="Search vehicle, job #, task, tech..."
                value={activeFilters.search}
                onChange={(e) => patchFilters({ search: e.target.value })}
              />
              <select
                className="wms-select-input"
                value={activeFilters.supervisorId}
                onChange={(e) => patchFilters({ supervisorId: e.target.value })}
              >
                <option value="ALL">All Supervisors</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.userId || s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                className="wms-select-input"
                value={activeFilters.techId}
                onChange={(e) => patchFilters({ techId: e.target.value })}
              >
                <option value="ALL">All Technicians</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.userId || t.id}>
                    {t.name} ({t.designation.split(' ')[0]})
                  </option>
                ))}
              </select>
              <select
                className="wms-select-input"
                value={activeFilters.taskStatus}
                onChange={(e) => patchFilters({ taskStatus: e.target.value })}
              >
                <option value="ALL">All Task Statuses</option>
                {TASK_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <span className="stage-badge badge-info">
              {filteredJobs.length} Job Card{filteredJobs.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Job-by-Job Technician Matrix & Inline Rebalancing */}
          {filteredJobs.map((job) => {
            const crew = getUniqueAssignedTechsForJob(job);
            const jobTasks = (job.tasks || []).filter((t) => {
              const matchTech =
                activeFilters.techId === 'ALL' ||
                t.assignedTechnicianId === activeFilters.techId;
              const matchDept =
                activeFilters.dept === 'ALL' || t.department === activeFilters.dept;
              const matchSt =
                activeFilters.taskStatus === 'ALL' || t.status === activeFilters.taskStatus;
              return matchTech && matchDept && matchSt;
            });

            return (
              <div key={job.id} className="wms-panel-card">
                <div className="panel-card-header" style={{ background: '#fcfdfd' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <code>{job.jobCardNumber}</code>
                      <strong style={{ fontSize: '15px', color: '#045F60' }}>
                        {job.vehicleRegistration}
                      </strong>
                      <span style={{ fontSize: '13px', fontWeight: '700' }}>
                        {job.vehicleModel}
                      </span>
                      <span className="stage-badge badge-warning">{job.currentStage}</span>
                      <span className="stage-badge badge-neutral">
                        Sup: {job.assignedSupervisorName}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                        Crew ({crew.length}):
                      </span>
                      {crew.length === 0 ? (
                        <span className="stage-badge badge-danger" style={{ fontSize: '11px' }}>
                          No Techs Allocated Yet
                        </span>
                      ) : (
                        crew.map((c) => (
                          <span key={c.id} className="stage-badge badge-active" style={{ fontSize: '11px' }}>
                            {c.name} {c.departments.length > 0 ? `(${c.departments.join(', ')})` : ''}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-secondary-action"
                      style={{ padding: '6px 11px', fontSize: '12px' }}
                      onClick={() => setDossierJob(job)}
                    >
                      <Eye size={13} /> Dossier
                    </button>
                    <button
                      type="button"
                      className="btn-primary-action"
                      style={{ padding: '6px 13px', fontSize: '12px' }}
                      onClick={() => openAllocateModal(job)}
                    >
                      <Hammer size={13} /> Rebalance / Allocate Crew
                    </button>
                  </div>
                </div>

                {jobTasks.length === 0 ? (
                  <div style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b', background: '#fffdf7' }}>
                    {(job.tasks || []).length === 0
                      ? 'No bay repair tasks created on this job card yet. Click "Rebalance / Allocate Crew" to assign specialists.'
                      : 'No tasks match your active bay/technician filters on this vehicle.'}
                  </div>
                ) : (
                  <div className="wms-table-responsive">
                    <table className="wms-table">
                      <thead>
                        <tr>
                          <th>Bay Task</th>
                          <th>Trade Bay</th>
                          <th>Priority</th>
                          <th>Assigned Technician (Rebalance Inline)</th>
                          <th>Est. Hrs</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobTasks.map((task) => (
                          <tr key={task.id}>
                            <td>
                              <strong>{task.title}</strong>
                              {task.description && (
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                  {task.description}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`stage-badge ${getDepartmentBadgeClass(task.department)}`}>
                                {task.department}
                              </span>
                            </td>
                            <td>
                              <span className={`stage-badge ${getPriorityBadgeClass(task.priority)}`}>
                                {task.priority}
                              </span>
                            </td>
                            <td>
                              <select
                                className="wms-select-input"
                                style={{ height: '32px', fontSize: '12px', minWidth: '185px' }}
                                value={task.assignedTechnicianId || ''}
                                onChange={(e) =>
                                  handleInlineTaskUpdate(job, task.id, {
                                    assignedTechnicianId: e.target.value,
                                  })
                                }
                              >
                                <option value="">-- Select Technician --</option>
                                {technicians.map((t) => (
                                  <option key={t.id} value={t.userId || t.id}>
                                    {t.name} ({t.designation.split(' ')[0]})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <strong>{task.estimatedHours} hrs</strong>
                            </td>
                            <td>
                              <select
                                className="wms-select-input"
                                style={{
                                  height: '32px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  color:
                                    task.status === 'Completed'
                                      ? '#067a46'
                                      : task.status === 'In Progress'
                                      ? '#045F60'
                                      : '#996f00',
                                }}
                                value={task.status}
                                onChange={(e) =>
                                  handleInlineTaskUpdate(job, task.id, {
                                    status: e.target.value as RepairTask['status'],
                                  })
                                }
                              >
                                {TASK_STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: FLOOR DELAYS & BOTTLENECKS (?tab=delays)                */}
      {/* ============================================================== */}
      {currentTab === 'delays' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>Floor Delays &amp; Bottlenecks</h1>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => patchFilters({ delayCategory: 'ALL_ACTIVE' })}
              >
                <AlertOctagon size={15} /> Flag Any Active Job
              </button>
            </div>
          </div>

          {/* 4 Bottleneck KPI Cards */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Past SLA Due Date</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <Flame size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading
                  ? '...'
                  : jobCards.filter((j) => jobAssessments.get(j.id)?.isOverdue).length}
              </div>
              <div className="stat-card-subtext" style={{ color: '#8A181A' }}>
                Estimated delivery date passed
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">On Hold / Escalated</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <AlertOctagon size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading
                  ? '...'
                  : jobCards.filter((j) => jobAssessments.get(j.id)?.isExplicitHold).length}
              </div>
              <div className="stat-card-subtext">Parts, surveyor, or bay blockage</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">QC Rework Returned</span>
                <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                  <RotateCcw size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading
                  ? '...'
                  : jobCards.filter((j) => jobAssessments.get(j.id)?.isRework).length}
              </div>
              <div className="stat-card-subtext">Returned from Quality Inspection</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Crew / Approval Gaps</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <Clock size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading
                  ? '...'
                  : jobCards.filter(
                      (j) =>
                        jobAssessments.get(j.id)?.isUnallocatedFloor ||
                        (j.currentStage === 'Customer Approval' && !j.customerApproved)
                    ).length}
              </div>
              <div className="stat-card-subtext">Missing tech tasks or client sign-off</div>
            </div>
          </div>

          {/* Bottleneck Filter Bar */}
          <div className="wms-filter-bar">
            <div className="wms-filter-controls">
              <input
                type="text"
                className="table-search-input"
                placeholder="Search job #, reg #, supervisor, reason..."
                value={activeFilters.search}
                onChange={(e) => patchFilters({ search: e.target.value })}
              />
              <select
                className="wms-select-input"
                value={activeFilters.delayCategory}
                onChange={(e) =>
                  patchFilters({
                    delayCategory: e.target.value as
                      | 'ALL_DELAYED'
                      | 'OVERDUE'
                      | 'ON_HOLD'
                      | 'QC_REWORK'
                      | 'UNALLOCATED'
                      | 'ALL_ACTIVE',
                  })
                }
              >
                <option value="ALL_DELAYED">All Flagged &amp; At-Risk Delays ({delayedJobsList.length})</option>
                <option value="OVERDUE">Past SLA Overdue Only</option>
                <option value="ON_HOLD">On Hold / Manual Escalations</option>
                <option value="QC_REWORK">QC Rework Returned</option>
                <option value="UNALLOCATED">Unallocated / Pending Approval</option>
                <option value="ALL_ACTIVE">All Active Jobs (Select Any to Escalate)</option>
              </select>
            </div>
            <span className="stage-badge badge-danger">
              {filteredDelayJobs.length} Order{filteredDelayJobs.length === 1 ? '' : 's'} Shown
            </span>
          </div>

          {/* Bottleneck Resolution Table */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>Floor Delays &amp; Escalation Desk</h3>
              <span className="stage-badge badge-info">SLA Date Check: {todayIso}</span>
            </div>

            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Severity &amp; Job #</th>
                    <th>Vehicle &amp; Customer</th>
                    <th>Stage &amp; Supervisor</th>
                    <th>Detected Delay / Root Cause</th>
                    <th>SLA Delivery Date</th>
                    <th>Escalation Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDelayJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        <strong style={{ display: 'block', color: '#067a46', marginBottom: '4px' }}>
                          Zero delays or bottlenecks in this filter!
                        </strong>
                        <span style={{ fontSize: '12px' }}>
                          Switch the filter dropdown above to &ldquo;All Active Jobs&rdquo; if you want to proactively log an escalation or put a job On Hold.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    filteredDelayJobs.map((job) => {
                      const assess = jobAssessments.get(job.id)!;
                      const isManualDelay =
                        job.jobStatus === 'On Hold' || Boolean(job.bottleneckInfo?.isDelayed);

                      return (
                        <tr key={job.id}>
                          <td>
                            <span className={`stage-badge ${assess.badgeClass}`}>
                              {assess.primaryTag}
                            </span>
                            <div style={{ marginTop: '5px' }}>
                              <code>{job.jobCardNumber}</code>
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: '#045F60' }}>{job.vehicleRegistration}</strong>
                            <div style={{ fontSize: '12px', fontWeight: '600' }}>
                              {job.vehicleModel}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {job.customerName} · {job.customerPhone}
                            </div>
                          </td>
                          <td>
                            <span className="stage-badge badge-warning">{job.currentStage}</span>
                            <div style={{ fontSize: '12px', fontWeight: '700', marginTop: '4px' }}>
                              Sup: {job.assignedSupervisorName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              Status: <strong>{job.jobStatus}</strong>
                            </div>
                          </td>
                          <td style={{ maxWidth: '320px' }}>
                            {assess.reasons.length === 0 ? (
                              <span style={{ fontSize: '12px', color: '#067a46' }}>
                                Currently on schedule — no blockers reported.
                              </span>
                            ) : (
                              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#334155', lineHeight: 1.45 }}>
                                {assess.reasons.map((r, i) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            )}
                            {job.bottleneckInfo?.actionPlan && (
                              <div
                                style={{
                                  marginTop: '6px',
                                  fontSize: '11px',
                                  background: '#f0fdfa',
                                  borderLeft: '3px solid #045F60',
                                  padding: '4px 8px',
                                  color: '#045F60',
                                }}
                              >
                                <strong>Action Plan:</strong> {job.bottleneckInfo.actionPlan}
                              </div>
                            )}
                          </td>
                          <td>
                            <strong
                              style={{
                                fontSize: '13px',
                                color: assess.isOverdue ? '#8A181A' : '#141b1b',
                              }}
                            >
                              {job.estimatedCompletionDate}
                            </strong>
                            {job.bottleneckInfo?.revisedCompletionDate &&
                              job.bottleneckInfo.revisedCompletionDate !==
                                job.estimatedCompletionDate && (
                                <div style={{ fontSize: '11px', color: '#045F60' }}>
                                  Revised: {job.bottleneckInfo.revisedCompletionDate}
                                </div>
                              )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-primary-action"
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '11px',
                                  background: '#8A181A',
                                }}
                                onClick={() => openDelayModal(job)}
                              >
                                <AlertOctagon size={12} />{' '}
                                {isManualDelay ? 'Edit Delay' : 'Add Delay'}
                              </button>
                              {(isManualDelay || assess.isOverdue) && (
                                <button
                                  type="button"
                                  className="btn-secondary-action"
                                  style={{
                                    padding: '5px 10px',
                                    fontSize: '11px',
                                    borderColor: '#067a46',
                                    color: '#067a46',
                                  }}
                                  onClick={() => handleResolveBottleneck(job)}
                                >
                                  <CheckCircle2 size={12} /> Resolve
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 9px', fontSize: '11px' }}
                                onClick={() => openReassignModal(job)}
                              >
                                <UserCheck size={12} /> Reassign
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: BILLING & TAX INVOICES (?tab=billing | ?tab=finance)   */}
      {/* ============================================================== */}
      {(currentTab === 'billing' || currentTab === 'finance') && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>Body Shop Billing &amp; Tax Invoices</h1>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                Manage customer billing, live repair charges, GST invoices &amp; payment collections
              </p>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-secondary-action"
                style={{ borderColor: '#045F60', color: '#045F60', fontWeight: '700' }}
                onClick={handleExportBillingLedgerPdf}
              >
                <Download size={15} /> Export Ledger (PDF)
              </button>
              <button
                type="button"
                className="btn-primary-action"
                style={{ background: '#045F60' }}
                onClick={() => setShowGenerateModal(true)}
              >
                <Plus size={15} /> Generate Tax Invoice
              </button>
            </div>
          </div>

          {/* 4 Financial & Billing KPI Cards */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Invoices</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <FileText size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loadingInvoices ? '...' : billingMetrics.totalInvoices}
              </div>
              <div className="stat-card-subtext">
                {billingMetrics.paidCount} Fully Paid · {billingMetrics.partialCount} Partial
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Gross Billed</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <ReceiptIndianRupee size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loadingInvoices ? '...' : `₹${billingMetrics.totalBilled.toLocaleString('en-IN')}`}
              </div>
              <div className="stat-card-subtext">
                Incl. 18% GST (CGST 9% + SGST 9%)
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Collections Received</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <CreditCard size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loadingInvoices ? '...' : `₹${billingMetrics.totalPaid.toLocaleString('en-IN')}`}
              </div>
              <div className="stat-card-subtext">
                Confirmed realized customer payments
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Outstanding Receivables</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="stat-card-value" style={{ color: '#8A181A' }}>
                {loadingInvoices ? '...' : `₹${billingMetrics.totalBalance.toLocaleString('en-IN')}`}
              </div>
              <div className="stat-card-subtext">
                Across {billingMetrics.pendingCount} pending / partial invoices
              </div>
            </div>
          </div>

          {/* Master Invoices Table Card */}
          <div className="wms-table-container" style={{ marginTop: '20px' }}>
            <div className="table-controls">
              <div className="search-box">
                <input
                  type="text"
                  className="table-search-input"
                  placeholder="Search invoice #, job card #, customer, registration..."
                  value={billingSearch}
                  onChange={(e) => setBillingSearch(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <select
                  className="table-filter-select"
                  value={billingStatusFilter}
                  onChange={(e) => setBillingStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Payment Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Sent">Sent</option>
                  <option value="Draft">Draft</option>
                  <option value="Overdue">Overdue</option>
                </select>

                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => fetchInvoices()}
                  title="Refresh Invoices"
                >
                  <RotateCcw size={14} className={loadingInvoices ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Invoice &amp; Date</th>
                    <th>Job Card &amp; Customer</th>
                    <th>Vehicle</th>
                    <th>Charges Breakdown</th>
                    <th>GST (18%)</th>
                    <th>Grand Total</th>
                    <th>Paid / Due</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                        {loadingInvoices
                          ? 'Loading invoice records...'
                          : 'No tax invoices match your search filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const isFullyPaid = inv.status === 'Paid';
                      const isPartial = inv.status === 'Partially Paid';
                      const badgeClass = isFullyPaid
                        ? 'badge-active'
                        : isPartial
                        ? 'badge-warning'
                        : inv.status === 'Overdue'
                        ? 'badge-danger'
                        : 'badge-neutral';

                      return (
                        <tr key={inv.id}>
                          <td>
                            <strong style={{ color: '#045F60', fontSize: '13px' }}>
                              {inv.invoiceNumber}
                            </strong>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('en-IN') : 'N/A'}
                            </div>
                          </td>
                          <td>
                            <strong>{inv.jobCardNumber}</strong>
                            <div style={{ fontSize: '12px', color: '#475569' }}>
                              {inv.customerName}
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                background: '#f1f5f9',
                                borderRadius: '4px',
                                fontWeight: '700',
                                fontSize: '12px',
                                letterSpacing: '0.5px',
                              }}
                            >
                              {inv.vehicleRegistration}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px', color: '#334155' }}>
                              <div>Labour: ₹{(inv.labourCharges || 0).toLocaleString('en-IN')}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                Parts: ₹{(inv.partsCharges || 0).toLocaleString('en-IN')} · Paint: ₹{(inv.paintCharges || 0).toLocaleString('en-IN')}
                              </div>
                              {inv.discount > 0 && (
                                <div style={{ fontSize: '11px', color: '#16a34a' }}>
                                  Discount: -₹{inv.discount.toLocaleString('en-IN')}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px', fontWeight: '600' }}>
                              ₹{(inv.gstAmount || 0).toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>
                              Taxable: ₹{(inv.taxableAmount || 0).toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#045F60' }}>
                              ₹{(inv.grandTotal || 0).toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>
                              ₹{(inv.amountPaid || 0).toLocaleString('en-IN')}
                            </div>
                            {inv.balanceDue > 0 ? (
                              <div style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626' }}>
                                Due: ₹{inv.balanceDue.toLocaleString('en-IN')}
                              </div>
                            ) : (
                              <div style={{ fontSize: '11px', color: '#16a34a' }}>Cleared</div>
                            )}
                          </td>
                          <td>
                            <span className={`stage-badge ${badgeClass}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{
                                  fontSize: '11px',
                                  padding: '4px 8px',
                                  color: '#045F60',
                                  borderColor: '#045F60',
                                }}
                                onClick={() => handleDownloadInvoicePdf(inv)}
                                disabled={downloadingPdfInvId === inv.id}
                                title="Download Official Tax Invoice PDF"
                              >
                                {downloadingPdfInvId === inv.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Download size={12} />
                                )}
                                PDF
                              </button>

                              {!isFullyPaid && (
                                <button
                                  type="button"
                                  className="btn-primary-action"
                                  style={{
                                    fontSize: '11px',
                                    padding: '4px 8px',
                                    background: '#045F60',
                                  }}
                                  onClick={() => handleOpenRecordPayment(inv)}
                                  title="Record Customer Payment"
                                >
                                  <CreditCard size={12} /> Pay
                                </button>
                              )}

                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ fontSize: '11px', padding: '4px 8px' }}
                                onClick={() => handleOpenEditInvoice(inv)}
                                title="Edit Charges / Status"
                              >
                                <Pencil size={12} /> Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Job Cards Awaiting Official Invoicing */}
          {jobsAwaitingInvoice.length > 0 && (
            <div className="wms-table-container" style={{ marginTop: '24px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2eeec' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#141b1b' }}>
                  Active Job Cards Ready for Billing ({jobsAwaitingInvoice.length})
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Vehicles with estimates recorded by Service Advisors &amp; Floor Supervisors awaiting formal Tax Invoice creation
                </p>
              </div>

              <div className="table-responsive">
                <table className="wms-table">
                  <thead>
                    <tr>
                      <th>Job Card #</th>
                      <th>Customer &amp; Phone</th>
                      <th>Vehicle</th>
                      <th>Current Stage</th>
                      <th>Advisor Estimate</th>
                      <th>Estimate Breakdown</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobsAwaitingInvoice.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <strong style={{ color: '#045F60' }}>{job.jobCardNumber}</strong>
                        </td>
                        <td>
                          <strong>{job.customerName}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {job.customerPhone || 'No contact'}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              background: '#f1f5f9',
                              borderRadius: '4px',
                              fontWeight: '700',
                              fontSize: '12px',
                            }}
                          >
                            {job.vehicleRegistration}
                          </span>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{job.vehicleModel}</div>
                        </td>
                        <td>
                          <span className="stage-badge badge-warning">{job.currentStage}</span>
                        </td>
                        <td>
                          <strong style={{ fontSize: '14px', color: '#045F60' }}>
                            ₹{(job.costEstimate?.total || 0).toLocaleString('en-IN')}
                          </strong>
                        </td>
                        <td style={{ fontSize: '11px', color: '#475569' }}>
                          <div>Labour: ₹{(job.costEstimate?.labour || 0).toLocaleString('en-IN')}</div>
                          <div>Parts: ₹{(job.costEstimate?.spareParts || 0).toLocaleString('en-IN')} · Paint: ₹{(job.costEstimate?.painting || 0).toLocaleString('en-IN')}</div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-primary-action"
                            style={{ fontSize: '11px', padding: '5px 10px', background: '#045F60' }}
                            onClick={() => handleConfirmGenerateInvoice(job.id)}
                            disabled={submittingBilling}
                          >
                            <Plus size={12} /> Generate Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL A: COMPLETE JOB CARD DOSSIER                             */}
      {/* ============================================================== */}
      {dossierJob && (
        <div className="wms-modal-backdrop" onClick={() => setDossierJob(null)}>
          <div
            className="wms-modal-card"
            style={{ maxWidth: '820px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="wms-header-badges">
                  <span className="stage-badge badge-warning">{dossierJob.currentStage}</span>
                  <span className={`stage-badge ${getPriorityBadgeClass(dossierJob.priority)}`}>
                    {dossierJob.priority || 'Normal'} Priority
                  </span>
                  <span
                    className={`stage-badge ${
                      dossierJob.jobStatus === 'On Hold' ? 'badge-danger' : 'badge-active'
                    }`}
                  >
                    {dossierJob.jobStatus}
                  </span>
                </div>
                <h3>Body Shop Operational Dossier: {dossierJob.jobCardNumber}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDossierJob(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dossierJob.bottleneckInfo?.isDelayed && (
                <div
                  style={{
                    background: '#fffafa',
                    border: '1px solid #8A181A',
                    borderRadius: '10px',
                    padding: '12px 16px',
                  }}
                >
                  <strong style={{ fontSize: '12px', color: '#8A181A', textTransform: 'uppercase' }}>
                    Active Bottleneck Escalation [{dossierJob.bottleneckInfo.category}]
                  </strong>
                  <div style={{ fontSize: '13px', color: '#141b1b', marginTop: '4px' }}>
                    {dossierJob.bottleneckInfo.reason}
                  </div>
                  {dossierJob.bottleneckInfo.actionPlan && (
                    <div style={{ fontSize: '12px', color: '#045F60', marginTop: '4px' }}>
                      <strong>Action Plan:</strong> {dossierJob.bottleneckInfo.actionPlan}
                    </div>
                  )}
                </div>
              )}

              {(() => {
                const vehSpec = getVehicleDetails(
                  dossierJob.vehicleId,
                  dossierJob.vehicleRegistration
                );
                return (
                  <div className="wms-form-grid-2" style={{ fontSize: '13px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2eeec' }}>
                      <strong style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        VEHICLE &amp; SPECS
                      </strong>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#045F60' }}>
                        {dossierJob.vehicleRegistration}
                      </div>
                      <div style={{ fontWeight: '700' }}>{dossierJob.vehicleModel}</div>
                      {vehSpec && (
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                          {vehSpec.year} · {vehSpec.color} · {vehSpec.fuelType}
                          <br />
                          <Gauge size={11} style={{ display: 'inline', marginRight: '4px' }} />
                          Odometer: {vehSpec.odometer?.toLocaleString('en-IN')} km
                        </div>
                      )}
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2eeec' }}>
                      <strong style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        CUSTOMER &amp; COORDINATION
                      </strong>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{dossierJob.customerName}</div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                        <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {dossierJob.customerPhone || 'Not recorded'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>
                        Supervisor: <strong>{dossierJob.assignedSupervisorName}</strong> · Due:{' '}
                        <strong>{dossierJob.estimatedCompletionDate}</strong>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2eeec' }}>
                      <strong style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        INSURANCE &amp; ADVISOR
                      </strong>
                      <div style={{ fontWeight: '700' }}>
                        {dossierJob.inspection?.insuranceProvider || 'Self-Pay / Direct Customer'}
                      </div>
                      {dossierJob.inspection?.claimNumber && (
                        <div style={{ fontSize: '12px', color: '#475569' }}>
                          Claim #: <code>{dossierJob.inspection.claimNumber}</code>
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        Intake Advisor: {dossierJob.advisorName || 'Amit Kulkarni'}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2eeec' }}>
                      <strong style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        ESTIMATE BREAKDOWN (18% GST)
                      </strong>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#045F60' }}>
                        ₹{(dossierJob.costEstimate?.total || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                        Labour: ₹{(dossierJob.costEstimate?.labour || 0).toLocaleString('en-IN')} · Parts: ₹
                        {(dossierJob.costEstimate?.spareParts || 0).toLocaleString('en-IN')} · Paint: ₹
                        {(dossierJob.costEstimate?.painting || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ border: '1px solid #f2d7d8', background: '#fffafa', borderRadius: '10px', padding: '14px 16px' }}>
                <strong style={{ fontSize: '12px', color: '#8A181A', textTransform: 'uppercase' }}>
                  Damage Assessment &amp; Handover Notes
                </strong>
                <p style={{ fontSize: '13px', color: '#1e293b', marginTop: '6px' }}>
                  {dossierJob.inspection?.accidentDescription || 'No description provided.'}
                </p>
                {dossierJob.handoverNotes && (
                  <div style={{ fontSize: '12px', color: '#045F60', marginTop: '6px' }}>
                    <strong>Advisor Handover Brief:</strong> {dossierJob.handoverNotes}
                  </div>
                )}
              </div>

              <div>
                <strong style={{ fontSize: '12px', color: '#045F60', textTransform: 'uppercase' }}>
                  Bay Technician Tasks ({(dossierJob.tasks || []).length})
                </strong>
                {(dossierJob.tasks || []).length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#92400e', marginTop: '6px' }}>
                    No technician tasks allocated yet.
                  </div>
                ) : (
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {dossierJob.tasks.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px',
                          padding: '8px 12px',
                          background: '#fafdfc',
                          border: '1px solid #e2eeec',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                          <strong>{t.title}</strong> ({t.department}) —{' '}
                          <strong>{getTechName(t.assignedTechnicianId, t.assignedTechnicianName)}</strong>{' '}
                          ({t.estimatedHours}h)
                        </div>
                        <span
                          className={`stage-badge ${
                            t.status === 'Completed' ? 'badge-active' : 'badge-warning'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {dossierJob.stageHistory && dossierJob.stageHistory.length > 0 && (
                <div>
                  <strong style={{ fontSize: '12px', color: '#045F60', textTransform: 'uppercase' }}>
                    Audit Trail &amp; Stage History
                  </strong>
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {dossierJob.stageHistory.map((h, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 12px',
                          background: '#f8fafc',
                          border: '1px solid #e2eeec',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 10px' }}>
                          <strong>{h.stage}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {h.updatedBy} · {new Date(h.timestamp).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        {h.notes && <div style={{ color: '#475569', marginTop: '2px' }}>{h.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => {
                  const j = dossierJob;
                  setDossierJob(null);
                  openReassignModal(j);
                }}
              >
                <UserCheck size={14} /> Reassign
              </button>
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => {
                  const j = dossierJob;
                  setDossierJob(null);
                  openAllocateModal(j);
                }}
              >
                <Hammer size={14} /> Assign Staff
              </button>
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => setDossierJob(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL B: STAGE PROGRESSION & MANAGER FINAL APPROVAL            */}
      {/* ============================================================== */}
      {stageJob && (
        <div
          className="wms-modal-backdrop"
          onClick={() => !savingStage && setStageJob(null)}
        >
          <div
            className="wms-modal-card"
            style={{ maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="wms-header-badges">
                  <span className="stage-badge badge-info">Manager Stage &amp; Approval</span>
                  <span className="stage-badge badge-warning">{stageJob.currentStage}</span>
                </div>
                <h3>
                  Update Stage: {stageJob.jobCardNumber} ({stageJob.vehicleRegistration})
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={savingStage}
                onClick={() => setStageJob(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmStageUpdate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Target Workflow Stage *
                  </label>
                  <select
                    className="wms-select-input"
                    style={{ width: '100%' }}
                    value={targetStage}
                    onChange={(e) => {
                      const next = e.target.value as RepairStage;
                      setTargetStage(next);
                      if (next === 'Delivered') setTargetJobStatus('Delivered');
                      else if (next === 'Ready for Delivery') setTargetJobStatus('Completed');
                      else setTargetJobStatus('Active');
                    }}
                  >
                    {ALL_13_STAGES.map((st, idx) => (
                      <option key={st} value={st}>
                        Stage {idx + 1}: {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Operational Job Status
                  </label>
                  <select
                    className="wms-select-input"
                    style={{ width: '100%' }}
                    value={targetJobStatus}
                    onChange={(e) => setTargetJobStatus(e.target.value as JobCard['jobStatus'])}
                  >
                    <option value="Active">Active (In Workshop Bays)</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed (Ready for Delivery)</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Body Shop Manager Operational Note *
                  </label>
                  <textarea
                    rows={3}
                    className="table-search-input"
                    style={{ width: '100%', height: 'auto', padding: '10px 12px' }}
                    placeholder="Record Final Approval sign-off, supervisor bay instruction, or dispatch remark..."
                    value={stageNoteText}
                    onChange={(e) => setStageNoteText(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  disabled={savingStage}
                  onClick={() => setStageJob(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action" disabled={savingStage}>
                  {savingStage ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check size={15} /> Confirm Stage Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL C: REASSIGN SUPERVISOR & PRIORITY ESCALATION             */}
      {/* ============================================================== */}
      {reassignJob && (
        <div
          className="wms-modal-backdrop"
          onClick={() => !savingReassign && setReassignJob(null)}
        >
          <div
            className="wms-modal-card"
            style={{ maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="wms-header-badges">
                  <span className="stage-badge badge-purple">Supervisor Load Balancing</span>
                  <span className="stage-badge badge-info">{reassignJob.jobCardNumber}</span>
                </div>
                <h3>
                  Reassign &amp; Prioritize: {reassignJob.vehicleRegistration}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={savingReassign}
                onClick={() => setReassignJob(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveReassign}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Assigned Workshop Supervisor *
                  </label>
                  <select
                    className="wms-select-input"
                    style={{ width: '100%' }}
                    value={nextSupId}
                    onChange={(e) => setNextSupId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Workshop Supervisor --</option>
                    {supervisors.map((sup) => (
                      <option key={sup.id} value={sup.userId || sup.id}>
                        {sup.name} ({sup.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="wms-form-grid-2" style={{ gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Repair Priority *
                    </label>
                    <select
                      className="wms-select-input"
                      style={{ width: '100%' }}
                      value={nextPriority}
                      onChange={(e) =>
                        setNextPriority(e.target.value as NonNullable<JobCard['priority']>)
                      }
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent (Floor Expedite)</option>
                      <option value="Insurance Express">Insurance Express</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Target Delivery SLA *
                    </label>
                    <input
                      type="date"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={nextEstDate}
                      onChange={(e) => setNextEstDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Load Balancing / Escalation Note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="table-search-input"
                    style={{ width: '100%', height: 'auto', padding: '10px 12px' }}
                    placeholder="Reason for supervisor reassignment or priority escalation..."
                    value={reassignNote}
                    onChange={(e) => setReassignNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  disabled={savingReassign}
                  onClick={() => setReassignJob(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action" disabled={savingReassign}>
                  {savingReassign ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving Assignment...
                    </>
                  ) : (
                    <>
                      <Check size={15} /> Save Supervisor Assignment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL D: MULTI-TECHNICIAN REBALANCE & CREW ALLOCATION          */}
      {/* ============================================================== */}
      {allocJob && (
        <div
          className="wms-modal-backdrop"
          onClick={() => !savingAlloc && setAllocJob(null)}
        >
          <div
            className="wms-modal-card"
            style={{ maxWidth: '820px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="wms-header-badges">
                  <span className="stage-badge badge-danger">Workshop Crew Rebalancing</span>
                  <span className="stage-badge badge-info">{allocJob.jobCardNumber}</span>
                </div>
                <h3>
                  Allocate / Rebalance Crew: {allocJob.vehicleRegistration} ({allocJob.vehicleModel})
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={savingAlloc}
                onClick={() => setAllocJob(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  border: '1px solid #045F60',
                  background: '#f0fdfa',
                  borderRadius: '10px',
                  padding: '14px 16px',
                }}
              >
                <strong style={{ fontSize: '12px', color: '#045F60', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                  + Add Bay Work Item &amp; Specialist Technician
                </strong>

                <div className="wms-form-grid-2" style={{ gap: '10px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                      Repair Task Title *
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Paint Booth Clearcoat Re-Buff or Front Suspension Subframe Torque Check"
                      value={newTaskDraft.title}
                      onChange={(e) => setNewTaskDraft({ ...newTaskDraft, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                      Trade Department Bay *
                    </label>
                    <select
                      className="wms-select-input"
                      style={{ width: '100%' }}
                      value={newTaskDraft.department}
                      onChange={(e) => {
                        const dept = e.target.value as RepairTask['department'];
                        const suggested = getSuggestedTechnicianForDepartment(dept, technicians);
                        setNewTaskDraft({
                          ...newTaskDraft,
                          department: dept,
                          assignedTechnicianId:
                            suggested?.userId || suggested?.id || newTaskDraft.assignedTechnicianId,
                        });
                      }}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d} Bay
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                      Assign Technician *
                    </label>
                    <select
                      className="wms-select-input"
                      style={{ width: '100%' }}
                      value={newTaskDraft.assignedTechnicianId}
                      onChange={(e) =>
                        setNewTaskDraft({ ...newTaskDraft, assignedTechnicianId: e.target.value })
                      }
                    >
                      <option value="">-- Select Workshop Technician --</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.userId || t.id}>
                          {t.name} — {t.designation}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                      Priority &amp; Est. Hours
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <select
                        className="wms-select-input"
                        style={{ flex: '1 1 150px' }}
                        value={newTaskDraft.priority}
                        onChange={(e) =>
                          setNewTaskDraft({
                            ...newTaskDraft,
                            priority: e.target.value as RepairTask['priority'],
                          })
                        }
                      >
                        {TASK_PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p} Priority
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        className="table-search-input"
                        style={{ width: '85px' }}
                        value={newTaskDraft.estimatedHours}
                        onChange={(e) =>
                          setNewTaskDraft({ ...newTaskDraft, estimatedHours: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                      Floor Instructions
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="Specific notes for bay specialist..."
                      value={newTaskDraft.description}
                      onChange={(e) =>
                        setNewTaskDraft({ ...newTaskDraft, description: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn-primary-action"
                    style={{ padding: '7px 14px', fontSize: '12px' }}
                    onClick={handleAddTaskInModal}
                  >
                    <Plus size={14} /> Add Task to Vehicle
                  </button>
                </div>
              </div>

              {/* Editable Task List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allocTasks.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                    No tasks scheduled on this vehicle yet. Add tasks above.
                  </div>
                ) : (
                  allocTasks.map((t, idx) => (
                    <div
                      key={t.id}
                      style={{
                        border: '1px solid #d9eae8',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px', minWidth: 0, flexWrap: 'wrap' }}>
                          <span className="stage-badge badge-neutral">#{idx + 1}</span>
                          <input
                            type="text"
                            className="table-search-input"
                            style={{ flex: '1 1 160px', minWidth: 0, height: '34px', fontWeight: '700' }}
                            value={t.title}
                            onChange={(e) =>
                              setAllocTasks((prev) =>
                                prev.map((x) =>
                                  x.id === t.id ? { ...x, title: e.target.value } : x
                                )
                              )
                            }
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setAllocTasks((prev) => prev.filter((x) => x.id !== t.id))
                          }
                          style={{
                            border: 'none',
                            background: '#fbebed',
                            color: '#8A181A',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            cursor: 'pointer',
                          }}
                          title="Remove Task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="wms-task-edit-grid">
                        <select
                          className="wms-select-input"
                          style={{ height: '34px', fontSize: '12px' }}
                          value={t.department}
                          onChange={(e) =>
                            setAllocTasks((prev) =>
                              prev.map((x) =>
                                x.id === t.id
                                  ? {
                                      ...x,
                                      department: e.target.value as RepairTask['department'],
                                    }
                                  : x
                              )
                            )
                          }
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>

                        <select
                          className="wms-select-input"
                          style={{ height: '34px', fontSize: '12px', fontWeight: '700', color: '#045F60' }}
                          value={t.assignedTechnicianId}
                          onChange={(e) => {
                            const tid = e.target.value;
                            const tName = getTechName(tid);
                            setAllocTasks((prev) =>
                              prev.map((x) =>
                                x.id === t.id
                                  ? {
                                      ...x,
                                      assignedTechnicianId: tid,
                                      assignedTechnicianName: tName,
                                    }
                                  : x
                              )
                            );
                          }}
                        >
                          <option value="">-- Pick Technician --</option>
                          {technicians.map((tech) => (
                            <option key={tech.id} value={tech.userId || tech.id}>
                              {tech.name} ({tech.designation.split(' ')[0]})
                            </option>
                          ))}
                        </select>

                        <select
                          className="wms-select-input"
                          style={{ height: '34px', fontSize: '12px' }}
                          value={t.priority}
                          onChange={(e) =>
                            setAllocTasks((prev) =>
                              prev.map((x) =>
                                x.id === t.id
                                  ? {
                                      ...x,
                                      priority: e.target.value as RepairTask['priority'],
                                    }
                                  : x
                              )
                            )
                          }
                        >
                          {TASK_PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>

                        <select
                          className="wms-select-input"
                          style={{ height: '34px', fontSize: '12px' }}
                          value={t.status}
                          onChange={(e) => {
                            const nextSt = e.target.value as RepairTask['status'];
                            setAllocTasks((prev) =>
                              prev.map((x) =>
                                x.id === t.id
                                  ? {
                                      ...x,
                                      status: nextSt,
                                      completedAt:
                                        nextSt === 'Completed'
                                          ? x.completedAt || new Date().toISOString()
                                          : undefined,
                                    }
                                  : x
                              )
                            );
                          }}
                        >
                          {TASK_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min={1}
                          className="table-search-input"
                          style={{ height: '34px', width: '100%', fontSize: '12px' }}
                          value={t.estimatedHours}
                          onChange={(e) =>
                            setAllocTasks((prev) =>
                              prev.map((x) =>
                                x.id === t.id
                                  ? { ...x, estimatedHours: Number(e.target.value) || 1 }
                                  : x
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary-action"
                disabled={savingAlloc}
                onClick={() => setAllocJob(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary-action"
                disabled={savingAlloc}
                onClick={handleSaveMultiTechAllocation}
              >
                {savingAlloc ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Saving Crew...
                  </>
                ) : (
                  <>
                    <Check size={15} /> Save Crew Allocation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL E: REGISTER NEW TECHNICIAN                               */}
      {/* ============================================================== */}
      {showAddTechModal && (
        <div
          className="wms-modal-backdrop"
          onClick={() => !savingNewTech && setShowAddTechModal(false)}
        >
          <div
            className="wms-modal-card"
            style={{ maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="wms-header-badges">
                  <span className="stage-badge badge-active">Saved to Database</span>
                  <span className="stage-badge badge-info">Workshop Technician</span>
                </div>
                <h3>Register Workshop Specialist Technician</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={savingNewTech}
                onClick={() => setShowAddTechModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegisterTechnician}>
              <div className="modal-body">
                <div className="wms-form-grid-2" style={{ gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Technician Full Name *
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Akash Suryawanshi"
                      value={newTechForm.name}
                      onChange={(e) => setNewTechForm({ ...newTechForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Email (Portal Login) *
                    </label>
                    <input
                      type="email"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="akash.tech@tuljamotors.com"
                      value={newTechForm.email}
                      onChange={(e) => setNewTechForm({ ...newTechForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Password *
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Tech@2026"
                      value={newTechForm.password}
                      onChange={(e) => setNewTechForm({ ...newTechForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Trade Specialty / Designation *
                    </label>
                    <select
                      className="wms-select-input"
                      style={{ width: '100%' }}
                      value={newTechForm.designation}
                      onChange={(e) => setNewTechForm({ ...newTechForm, designation: e.target.value })}
                    >
                      <option value="Master Denting Technician">Master Denting Technician (Denting Bay)</option>
                      <option value="Senior Paint Booth Specialist">Senior Paint Booth Specialist (Painting Bay)</option>
                      <option value="Mechanical & Suspension Specialist">Mechanical &amp; Suspension Specialist (Mechanical Bay)</option>
                      <option value="Auto Electrical & Detailing Tech">Auto Electrical &amp; Detailing Tech (Electrical/Detailing Bay)</option>
                      <option value="Bodyshop Assembly Technician">Bodyshop Assembly Technician (Assembly Bay)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="+91 98220 XXXXX"
                      value={newTechForm.phone}
                      onChange={(e) => setNewTechForm({ ...newTechForm, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Monthly Salary (₹)
                    </label>
                    <input
                      type="number"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={newTechForm.salary}
                      onChange={(e) => setNewTechForm({ ...newTechForm, salary: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  disabled={savingNewTech}
                  onClick={() => setShowAddTechModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action" disabled={savingNewTech}>
                  {savingNewTech ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Registering...
                    </>
                  ) : (
                    <>
                      <Check size={15} /> Register Technician
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL F: FLAG / ESCALATE FLOOR BOTTLENECK OR HOLD              */}
      {/* ============================================================== */}
      {delayJob && (
        <div
          className="wms-modal-backdrop"
          onClick={() => !savingDelay && setDelayJob(null)}
        >
          <div
            className="wms-modal-card"
            style={{ maxWidth: '600px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="wms-header-badges">
                  <span className="stage-badge badge-danger">Floor Delay Escalation</span>
                  <span className="stage-badge badge-info">{delayJob.jobCardNumber}</span>
                </div>
                <h3>
                  Flag Bottleneck: {delayJob.vehicleRegistration} ({delayJob.vehicleModel})
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={savingDelay}
                onClick={() => setDelayJob(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDelayEscalation}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="wms-form-grid-2" style={{ gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Bottleneck Category *
                    </label>
                    <select
                      className="wms-select-input"
                      style={{ width: '100%' }}
                      value={delayCategoryForm}
                      onChange={(e) =>
                        setDelayCategoryForm(e.target.value as BottleneckInfo['category'])
                      }
                    >
                      {BOTTLENECK_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Operational Floor Status *
                    </label>
                    <select
                      className="wms-select-input"
                      style={{ width: '100%' }}
                      value={delayHoldStatus}
                      onChange={(e) =>
                        setDelayHoldStatus(e.target.value as 'On Hold' | 'Active')
                      }
                    >
                      <option value="On Hold">Place Job On Hold (Blocked)</option>
                      <option value="Active">Keep Active (Expedite Watch)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Bottleneck Root Cause &amp; Blocking Details *
                  </label>
                  <textarea
                    rows={3}
                    className="table-search-input"
                    style={{ width: '100%', height: 'auto', padding: '10px 12px' }}
                    placeholder="e.g. OEM LH Headlamp & foglamp coupler backordered with Hyundai regional depot; insurance supplementary estimate pending surveyor visit."
                    value={delayReasonText}
                    onChange={(e) => setDelayReasonText(e.target.value)}
                    required
                  />
                </div>

                <div className="wms-form-grid-2" style={{ gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Manager Action Plan / Owner
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Sachin Mane escalated PO #412 to Mumbai distributor"
                      value={delayActionPlan}
                      onChange={(e) => setDelayActionPlan(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Revised Est. Delivery Date *
                    </label>
                    <input
                      type="date"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={delayRevisedDate}
                      onChange={(e) => setDelayRevisedDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  disabled={savingDelay}
                  onClick={() => setDelayJob(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ background: '#8A181A' }}
                  disabled={savingDelay}
                >
                  {savingDelay ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Logging Bottleneck...
                    </>
                  ) : (
                    <>
                      <AlertOctagon size={15} /> Log Escalation &amp; Update Status
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT INVOICE CHARGES & STATUS                           */}
      {/* ============================================================== */}
      {editingInvoice && (
        <div className="wms-modal-backdrop" onClick={() => setEditingInvoice(null)}>
          <div
            className="wms-modal-card"
            style={{ maxWidth: '620px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="stage-badge badge-info">{editingInvoice.invoiceNumber}</span>
                <h3 style={{ marginTop: '4px' }}>Edit Tax Invoice Charges</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingInvoice(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditInvoice}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2eeec', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#045F60' }}>
                    {editingInvoice.customerName} · {editingInvoice.vehicleRegistration}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Job Card: {editingInvoice.jobCardNumber} · Original Total: ₹{editingInvoice.grandTotal.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="wms-form-grid-2" style={{ gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Labour Charges (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={editInvoiceForm.labourCharges}
                      onChange={(e) =>
                        setEditInvoiceForm((prev) => ({ ...prev, labourCharges: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Spare Parts Charges (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={editInvoiceForm.partsCharges}
                      onChange={(e) =>
                        setEditInvoiceForm((prev) => ({ ...prev, partsCharges: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Painting &amp; Consumables (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={editInvoiceForm.paintCharges}
                      onChange={(e) =>
                        setEditInvoiceForm((prev) => ({ ...prev, paintCharges: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Other / Misc Charges (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={editInvoiceForm.otherCharges}
                      onChange={(e) =>
                        setEditInvoiceForm((prev) => ({ ...prev, otherCharges: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Special Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={editInvoiceForm.discount}
                      onChange={(e) =>
                        setEditInvoiceForm((prev) => ({ ...prev, discount: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Invoice Status
                    </label>
                    <select
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={editInvoiceForm.status}
                      onChange={(e) =>
                        setEditInvoiceForm((prev) => ({
                          ...prev,
                          status: e.target.value as Invoice['status'],
                        }))
                      }
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                {/* Live Recalculation Summary Box */}
                {(() => {
                  const l = Number(editInvoiceForm.labourCharges) || 0;
                  const p = Number(editInvoiceForm.partsCharges) || 0;
                  const pt = Number(editInvoiceForm.paintCharges) || 0;
                  const o = Number(editInvoiceForm.otherCharges) || 0;
                  const d = Number(editInvoiceForm.discount) || 0;
                  const taxable = Math.max(0, l + p + pt + o - d);
                  const gst = Math.round(taxable * 0.18);
                  const grandTotal = taxable + gst;
                  const balance = Math.max(0, grandTotal - (editingInvoice.amountPaid || 0));

                  return (
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        background: '#e6f2f2',
                        borderRadius: '8px',
                        border: '1px solid #b3d7d7',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '11px', color: '#045F60', fontWeight: '600' }}>
                          Taxable: ₹{taxable.toLocaleString('en-IN')} + GST (18%): ₹{gst.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#045F60' }}>
                          Grand Total: ₹{grandTotal.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Already Paid: ₹{(editingInvoice.amountPaid || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: balance > 0 ? '#dc2626' : '#16a34a' }}>
                          Balance Due: ₹{balance.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  disabled={submittingBilling}
                  onClick={() => setEditingInvoice(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ background: '#045F60' }}
                  disabled={submittingBilling}
                >
                  {submittingBilling ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Invoice Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: RECORD CUSTOMER PAYMENT                                 */}
      {/* ============================================================== */}
      {paymentInvoice && (
        <div className="wms-modal-backdrop" onClick={() => setPaymentInvoice(null)}>
          <div
            className="wms-modal-card"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="stage-badge badge-active">Payment Collection</span>
                <h3 style={{ marginTop: '4px' }}>Record Payment: {paymentInvoice.invoiceNumber}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPaymentInvoice(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmRecordPayment}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2eeec', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '13px' }}>{paymentInvoice.customerName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {paymentInvoice.vehicleRegistration} · Job Card: {paymentInvoice.jobCardNumber}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Balance Due</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#dc2626' }}>
                        ₹{(paymentInvoice.balanceDue || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Payment Amount (₹) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={paymentInvoice.balanceDue > 0 ? paymentInvoice.balanceDue : undefined}
                      className="table-search-input"
                      style={{ width: '100%', fontSize: '16px', fontWeight: '700', color: '#045F60' }}
                      value={payForm.amount}
                      onChange={(e) => setPayForm((prev) => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Payment Method *
                    </label>
                    <select
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={payForm.method}
                      onChange={(e) => setPayForm((prev) => ({ ...prev, method: e.target.value }))}
                    >
                      <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="Cash">Cash at Reception Counter</option>
                      <option value="Credit Card">Credit Card (POS Terminal)</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT / RTGS</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Transaction Ref / Cheque # / UPI UTR
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. UPI-9283742918 or CHQ-002145"
                      value={payForm.reference}
                      onChange={(e) => setPayForm((prev) => ({ ...prev, reference: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  disabled={submittingBilling}
                  onClick={() => setPaymentInvoice(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ background: '#045F60' }}
                  disabled={submittingBilling}
                >
                  {submittingBilling ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Recording...
                    </>
                  ) : (
                    <>
                      <Check size={15} /> Confirm Payment Receipt
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: GENERATE TAX INVOICE FROM JOB CARD                      */}
      {/* ============================================================== */}
      {showGenerateModal && (
        <div className="wms-modal-backdrop" onClick={() => setShowGenerateModal(false)}>
          <div
            className="wms-modal-card"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="stage-badge badge-purple">New GST Tax Invoice</span>
                <h3 style={{ marginTop: '4px' }}>Generate Official Invoice from Job Card</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowGenerateModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
                Select an active or completed repair order to generate an official Tulja Motors Tax Invoice. The invoice is populated with live charges (Labour, Spare Parts, Painting &amp; 18% GST).
              </p>

              {jobsAwaitingInvoice.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                  All job cards with recorded estimates have already been invoiced.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Select Vehicle / Job Card *
                    </label>
                    <select
                      className="table-search-input"
                      style={{ width: '100%', fontSize: '13px' }}
                      value={generateTargetJobId}
                      onChange={(e) => setGenerateTargetJobId(e.target.value)}
                    >
                      <option value="">-- Choose a Vehicle Job Card --</option>
                      {jobsAwaitingInvoice.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.jobCardNumber} — {j.vehicleRegistration} ({j.customerName}) — Est: ₹{(j.costEstimate?.total || 0).toLocaleString('en-IN')} [{j.currentStage}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const sel = jobsAwaitingInvoice.find((j) => j.id === generateTargetJobId);
                    if (!sel) return null;
                    return (
                      <div
                        style={{
                          background: '#f8fafc',
                          padding: '14px 16px',
                          borderRadius: '8px',
                          border: '1px solid #e2eeec',
                        }}
                      >
                        <div style={{ fontWeight: '700', fontSize: '14px', color: '#045F60' }}>
                          {sel.vehicleRegistration} · {sel.vehicleModel}
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                          Customer: <strong>{sel.customerName}</strong> ({sel.customerPhone || 'N/A'}) · Supervisor: {sel.assignedSupervisorName}
                        </div>

                        <div
                          className="wms-form-grid-3"
                          style={{
                            marginTop: '12px',
                            gap: '8px',
                            fontSize: '12px',
                          }}
                        >
                          <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2eeec' }}>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>Labour</div>
                            <div style={{ fontWeight: '700' }}>₹{(sel.costEstimate?.labour || 0).toLocaleString('en-IN')}</div>
                          </div>
                          <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2eeec' }}>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>Spare Parts</div>
                            <div style={{ fontWeight: '700' }}>₹{(sel.costEstimate?.spareParts || 0).toLocaleString('en-IN')}</div>
                          </div>
                          <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2eeec' }}>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>Paint &amp; Body</div>
                            <div style={{ fontWeight: '700' }}>₹{(sel.costEstimate?.painting || 0).toLocaleString('en-IN')}</div>
                          </div>
                        </div>

                        <div
                          style={{
                            marginTop: '10px',
                            paddingTop: '10px',
                            borderTop: '1px dashed #cbd5e1',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Taxable + 18% GST</span>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: '#045F60' }}>
                            Grand Total: ₹{(sel.costEstimate?.total || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary-action"
                disabled={submittingBilling}
                onClick={() => setShowGenerateModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary-action"
                style={{ background: '#045F60' }}
                disabled={submittingBilling || !generateTargetJobId}
                onClick={() => handleConfirmGenerateInvoice(generateTargetJobId)}
              >
                {submittingBilling ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Plus size={15} /> Create Tax Invoice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CENTERED VALIDATION & CONFIRMATION POPUP CARD (OK BUTTON) */}
      <CenterPopupModal
        popup={popupAlert}
        onClose={() => setPopupAlert(null)}
        titleId="bsm-popup-title"
      />
    </div>
  );
}
