'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/lib/components/DashboardLayout';
import {
  Car,
  Users,
  Clock,
  TrendingUp,
  ReceiptIndianRupee,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  ArrowUpRight,
  ShieldAlert,
  Hammer,
  ClipboardList,
  Phone,
  Calendar,
  FileCheck,
  FileText,
  Building2,
  Check,
  Filter,
  Download,
  Eye,
  ChevronRight,
  ShieldCheck,
  Printer,
  X,
  UserCheck,
  Activity,
  Layers,
  Wrench,
  Megaphone,
  Package,
  Loader2,
  Lock,
  KeyRound,
} from 'lucide-react';
import ExportPdfModal from '@/lib/components/ExportPdfModal';
import AdvisorDashboard from '@/lib/components/AdvisorDashboard';
import SupervisorDashboard from '@/lib/components/SupervisorDashboard';
import BodyShopManagerDashboard from '@/lib/components/BodyShopManagerDashboard';
import SparePartsManagerDashboard from '@/lib/components/SparePartsManagerDashboard';
import TechnicianDashboard from '@/lib/components/TechnicianDashboard';
import CenterPopupModal, { CenterPopupState } from '@/lib/components/CenterPopupModal';
import { AdminReportPage } from '@/lib/utils/pdfGenerator';

interface RoleDashboardClientProps {
  role: string;
}

const roleTitles: Record<string, { title: string; dept: string }> = {
  admin: { title: 'Super Admin Dashboard', dept: 'Executive & Governance' },
  director: { title: 'Director Analytics Portal', dept: 'Board of Directors' },
  'body-shop-manager': { title: 'Body Shop Floor Operations', dept: 'Workshop Floor' },
  /* hr: { title: 'Human Resources Hub', dept: 'HR & Personnel' }, */
  advisor: { title: 'Service Advisor Intake Desk', dept: 'Customer Advisory' },
  supervisor: { title: 'Workshop Supervision Floor', dept: 'Floor Supervision' },
  accounts: { title: 'Accounts & Billing Ledger', dept: 'Accounts & Finance' },
  'digital-marketing': { title: 'Marketing & CRM Funnel', dept: 'Digital Marketing' },
  technician: { title: 'Technician Workbench', dept: 'Workshop Technicians' },
  'spare-parts-manager': { title: 'Spare Parts & Inventory Management', dept: 'Parts & Inventory' },
};

const ALL_13_STAGES = [
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

export default function RoleDashboardClient({ role }: RoleDashboardClientProps) {
  const meta = roleTitles[role];
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // Core Data States
  const [stats, setStats] = useState<any>(null);
  const [jobCards, setJobCards] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [logActionFilter, setLogActionFilter] = useState('ALL');
  const [financeSubTab, setFinanceSubTab] = useState<'invoices' | 'payments' | 'expenses'>('invoices');

  // Modal States
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [submittingEmp, setSubmittingEmp] = useState(false);
  const [popupAlert, setPopupAlert] = useState<CenterPopupState | null>(null);

  const showCenterPopup = (
    message: string,
    title = 'Notice',
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
  const [exportModalConfig, setExportModalConfig] = useState<{
    isOpen: boolean;
    page: AdminReportPage;
    pageTitle: string;
  }>({
    isOpen: false,
    page: 'overview',
    pageTitle: 'Executive System Overview',
  });
  const [newEmpForm, setNewEmpForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'advisor',
    department: 'Customer Advisory & Intake',
    designation: 'Service Advisor',
    reportingManager: 'Ranjeet B. Patil (Owner / MD)',
    salary: '40000',
  });

  if (!meta) {
    notFound();
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, jobsRes, empRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/job-cards'),
        fetch('/api/employees'),
      ]);

      const statsData = await statsRes.json();
      const jobsData = await jobsRes.json();
      const empData = await empRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
        if (statsData.allInvoices) setInvoices(statsData.allInvoices);
        if (statsData.allPayments) setPayments(statsData.allPayments);
        if (statsData.allExpenses) setExpenses(statsData.allExpenses);
        if (statsData.allActivityLogs) setActivityLogs(statsData.allActivityLogs);
      }
      if (jobsData.success) setJobCards(jobsData.jobCards);
      if (empData.success) setEmployees(empData.employees);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  // Stage Advancement
  const advanceStage = async (jobId: string, currentStage: string) => {
    const currentIndex = ALL_13_STAGES.indexOf(currentStage);
    const nextStage = currentIndex < ALL_13_STAGES.length - 1 ? ALL_13_STAGES[currentIndex + 1] : currentStage;

    try {
      const res = await fetch('/api/job-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: jobId,
          currentStage: nextStage,
          stageNote: `Advanced from ${currentStage} to ${nextStage}`,
          updatedBy: `${meta.title} (Ranjeet B. Patil)`,
          userRole: role,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Successfully advanced job card stage to "${nextStage}".`);
        fetchData();
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch {
      showCenterPopup('Error updating job card stage. Please try again.', 'Stage Update Failed', 'error');
    }
  };

  // Add Employee & Portal User Handler (Saved directly to DB)
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpForm.name.trim() || !newEmpForm.email.trim()) {
      showCenterPopup('Please enter employee full name and email address.', 'Missing Details', 'warning');
      return;
    }
    if (!newEmpForm.password.trim()) {
      showCenterPopup('Please enter a secure password for this user to log in.', 'Password Required', 'warning');
      return;
    }
    setSubmittingEmp(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEmpForm.name.trim(),
          email: newEmpForm.email.trim(),
          password: newEmpForm.password.trim(),
          phone: newEmpForm.phone.trim(),
          role: newEmpForm.role,
          department: newEmpForm.department,
          designation: newEmpForm.designation.trim(),
          reportingManager: newEmpForm.reportingManager.trim(),
          salary: parseInt(newEmpForm.salary, 10) || 40000,
          createdBy: 'Ranjeet B. Patil (Super Admin)',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const errMsg = data.message || 'Failed to create employee in database.';
        const isDuplicate = errMsg.toLowerCase().includes('already registered');
        showCenterPopup(
          errMsg,
          isDuplicate ? 'Account Already Registered' : 'Registration Failed',
          isDuplicate ? 'warning' : 'error'
        );
        return;
      }

      setShowAddEmpModal(false);
      setNewEmpForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'advisor',
        department: 'Customer Advisory & Intake',
        designation: 'Service Advisor',
        reportingManager: 'Ranjeet B. Patil (Owner / MD)',
        salary: '40000',
      });

      // Reload live data directly from DB
      await fetchData();
      setFeedbackMsg(
        `Staff account "${data.employee.name}" (${data.employee.email}) saved to DB! They can now log in at /panels/${data.employee.role.replace('_', '-')}.`
      );
      setTimeout(() => setFeedbackMsg(''), 6000);
    } catch (err: unknown) {
      showCenterPopup(
        'Network or server error while saving employee: ' + (err instanceof Error ? err.message : String(err)),
        'Connection Error',
        'error'
      );
    } finally {
      setSubmittingEmp(false);
    }
  };

  // Filtered Lists
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const filteredJobs = jobCards.filter((job) => {
    const matchesSearch =
      job.jobCardNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.vehicleRegistration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.vehicleModel?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'ALL' || job.currentStage === stageFilter;
    const matchesStatus = statusFilter === 'ALL' || job.jobStatus === statusFilter;
    return matchesSearch && matchesStage && matchesStatus;
  });

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.vehicleRegistration?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = logActionFilter === 'ALL' || log.action === logActionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <DashboardLayout
      roleSlug={role}
      roleTitle={meta.title}
      departmentName={meta.dept}
    >
      {/* FEEDBACK TOAST */}
      {feedbackMsg && (
        <div
          style={{
            background: '#e6f7ef',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 18px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />{' '}
          <span style={{ minWidth: 0 }}>{feedbackMsg}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUPER ADMIN: TAB 1 - SYSTEM OVERVIEW (Default / ?tab=overview)  */}
      {/* ============================================================== */}
      {role === 'admin' && (activeTab === 'overview' || !activeTab) && (
        <div>
          {/* Executive Header */}
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>Executive Workshop Overview</h1>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-secondary-action"
                style={{ borderColor: '#045F60', color: '#045F60', fontWeight: '700' }}
                onClick={() => {
                  setExportModalConfig({
                    isOpen: true,
                    page: 'overview',
                    pageTitle: 'Executive System Overview',
                  });
                }}
                title="Export Daily, Weekly or Monthly PDF Report"
              >
                <Download size={15} /> Export PDF
              </button>

              <button
                type="button"
                className="btn-primary-action"
                style={{ background: '#045F60' }}
                onClick={() => {
                  setNewEmpForm({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    role: 'technician',
                    department: 'Floor Operations',
                    designation: 'Senior Technician',
                    reportingManager: 'Ranjeet B. Patil (Owner / MD)',
                    salary: '35000',
                  });
                  setShowAddEmpModal(true);
                }}
              >
                <Plus size={15} /> Add Staff
              </button>
            </div>
          </div>

          {/* 6 Executive Metric Cards */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Active Floor Repairs</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <Car size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `${stats?.activeJobs || '3'} Vehicles`}
              </div>
              <div className="stat-card-subtext">
                <span className="stat-trend-up">100%</span> floor bay capacity
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Revenue (Billed)</span>
                <div className="stat-icon-wrapper" style={{ background: '#eef7f6', color: '#045F60' }}>
                  <ReceiptIndianRupee size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `₹${stats?.totalRevenue?.toLocaleString('en-IN') || '84,252'}`}
              </div>
              <div className="stat-card-subtext">
                <span className="stat-trend-up">18% GST</span> compliant billing
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Collected Payments</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `₹${stats?.totalCollected?.toLocaleString('en-IN') || '35,000'}`}
              </div>
              <div className="stat-card-subtext">
                <span className="stat-trend-up">UPI & NEFT</span> settlements
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Pending Receivables</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <Clock size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `₹${stats?.pendingPayments?.toLocaleString('en-IN') || '49,252'}`}
              </div>
              <div className="stat-card-subtext" style={{ color: '#8A181A' }}>
                Follow-up with insurance claims
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Workshop Staff</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <Users size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `${stats?.totalEmployees || '10'} Registered`}
              </div>
              <div className="stat-card-subtext">
                <span className="stat-trend-up">{stats?.presentToday || '7'} On Duty</span> today
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Digital Marketing Leads</span>
                <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                  <Megaphone size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `${stats?.activeLeads || '3'} Active`}
              </div>
              <div className="stat-card-subtext">
                Managed by HR Department
              </div>
            </div>
          </div>

          {/* Department Throughput Status Matrix */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>Departmental Operations & Floor Status Matrix</h3>
              <span className="stage-badge badge-active">All 6 Departments Active</span>
            </div>

            <div style={{ padding: '20px' }}>
              <div className="wms-grid-3col" style={{ margin: 0 }}>
                {/* 1. Body Shop */}
                <div className="wms-org-node">
                  <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#e6f2f2', color: '#045F60', display: 'grid', placeItems: 'center' }}>
                    <Hammer size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#141b1b' }}>Body Shop Operations</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>Head: Vikram Deshmukh</div>
                    <div style={{ fontSize: '11px', color: '#045F60', fontWeight: '700', marginTop: '4px' }}>
                      3 Vehicles in repair · 2 Bays occupied
                    </div>
                  </div>
                </div>

                {/* 2. HR & Marketing */}
                <div className="wms-org-node">
                  <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#fff8e6', color: '#b45309', display: 'grid', placeItems: 'center' }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#141b1b' }}>HR & Digital Marketing</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>Head: Snehal Shinde</div>
                    <div style={{ fontSize: '11px', color: '#b45309', fontWeight: '700', marginTop: '4px' }}>
                      10 Staff on roster · 3 Marketing leads
                    </div>
                  </div>
                </div>

                {/* 3. Service Advisory */}
                <div className="wms-org-node">
                  <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#eef7f6', color: '#045F60', display: 'grid', placeItems: 'center' }}>
                    <Car size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#141b1b' }}>Service Advisory & Intake</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>Head: Amit Kulkarni</div>
                    <div style={{ fontSize: '11px', color: '#045F60', fontWeight: '700', marginTop: '4px' }}>
                      Accidental claim estimations · Customer approvals
                    </div>
                  </div>
                </div>

                {/* 4. Floor Supervision */}
                <div className="wms-org-node">
                  <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#f3e8ff', color: '#7e22ce', display: 'grid', placeItems: 'center' }}>
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#141b1b' }}>Floor Supervision</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>Head: Mahesh Jadhav</div>
                    <div style={{ fontSize: '11px', color: '#7e22ce', fontWeight: '700', marginTop: '4px' }}>
                      13-Stage tracking · Quality inspections
                    </div>
                  </div>
                </div>

                {/* 5. Accounts & Finance */}
                <div className="wms-org-node">
                  <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#e6f7ef', color: '#067a46', display: 'grid', placeItems: 'center' }}>
                    <ReceiptIndianRupee size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#141b1b' }}>Accounts & Finance</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>Head: Rajesh More</div>
                    <div style={{ fontSize: '11px', color: '#067a46', fontWeight: '700', marginTop: '4px' }}>
                      GST Invoicing · Expense ledger · Payments
                    </div>
                  </div>
                </div>

                {/* 6. Technicians Team */}
                <div className="wms-org-node">
                  <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#fbebed', color: '#8A181A', display: 'grid', placeItems: 'center' }}>
                    <Wrench size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#141b1b' }}>Technicians Team</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>Lead: Sagar Kamble</div>
                    <div style={{ fontSize: '11px', color: '#8A181A', fontWeight: '700', marginTop: '4px' }}>
                      Denting, painting & mechanical execution
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 13-Stage Workflow Health Bar */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>13-Stage Vehicle Repair Workflow Distribution</h3>
              <Link href="/panels/admin/dashboard?tab=jobs" className="btn-secondary-action" style={{ padding: '6px 12px', fontSize: '12px' }}>
                All Job Cards <ArrowUpRight size={14} />
              </Link>
            </div>

            <div style={{ padding: '20px' }}>
              <div className="wms-stage-board-grid">
                {ALL_13_STAGES.map((stg, idx) => {
                  const count = jobCards.filter((j) => j.currentStage === stg).length;
                  return (
                    <div
                      key={stg}
                      style={{
                        background: count > 0 ? '#045F60' : '#f8faf9',
                        color: count > 0 ? '#ffffff' : '#5e6d6d',
                        border: count > 0 ? '1px solid #045F60' : '1px solid #e0e9e8',
                        borderRadius: '8px',
                        padding: '10px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8 }}>
                        Stage {idx + 1}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', marginTop: '4px', lineHeight: 1.2 }}>
                        {stg}
                      </div>
                      {count > 0 ? (
                        <div style={{ marginTop: '6px', fontSize: '11px', background: '#F7C21F', color: '#1a1a1a', borderRadius: '12px', padding: '2px 6px', fontWeight: '800' }}>
                          {count} Vehicle{count > 1 ? 's' : ''}
                        </div>
                      ) : (
                        <div style={{ marginTop: '6px', fontSize: '11px', color: '#999' }}>0 active</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Job Cards Snapshot & Recent Activity Feed */}
          <div className="wms-grid-2col">
            {/* Quick Job Cards Snapshot */}
            <div className="wms-panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-card-header">
                <h3>Live Floor Repairs Quick View</h3>
                <Link href="/panels/admin/dashboard?tab=jobs" className="stage-badge badge-info">
                  View All ({jobCards.length})
                </Link>
              </div>
              <div className="wms-table-responsive">
                <table className="wms-table">
                  <thead>
                    <tr>
                      <th>Job Card</th>
                      <th>Vehicle</th>
                      <th>Customer</th>
                      <th>Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobCards.slice(0, 3).map((job) => (
                      <tr key={job.id}>
                        <td>
                          <strong>{job.jobCardNumber}</strong>
                        </td>
                        <td>
                          <strong style={{ color: '#045F60' }}>{job.vehicleRegistration}</strong>
                          <div style={{ fontSize: '11px', color: '#666' }}>{job.vehicleModel}</div>
                        </td>
                        <td>{job.customerName}</td>
                        <td>
                          <span className="stage-badge badge-warning">{job.currentStage}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Audit Activities */}
            <div className="wms-panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-card-header">
                <h3>System Audit & Activity Feed</h3>
                <Link href="/panels/admin/dashboard?tab=logs" className="stage-badge badge-info">
                  Full Audit Log ({activityLogs.length})
                </Link>
              </div>
              <div style={{ padding: '16px 20px' }}>
                {activityLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    style={{
                      borderBottom: '1px solid #f0f0f0',
                      paddingBottom: '12px',
                      marginBottom: '12px',
                      display: 'flex',
                      gap: '12px',
                    }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef7f6', color: '#045F60', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Activity size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        <strong>{log.performedBy}</strong>
                        <span style={{ fontSize: '11px', color: '#888' }}>
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                        </span>
                      </div>
                      <div style={{ color: '#555', marginTop: '2px', fontSize: '12px' }}>{log.details}</div>
                      <span className="stage-badge badge-neutral" style={{ fontSize: '10px', marginTop: '4px' }}>
                        {log.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COMPLETE WORKSHOP EMPLOYEES & DESIGNATIONS DIRECTORY (LIVE FROM DB) */}
          <div className="wms-panel-card" style={{ marginTop: '24px' }}>
            <div className="panel-card-header">
              <h3>Workshop Personnel & Employee Designations ({employees.length} Staff)</h3>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/panels/admin/dashboard?tab=employees"
                  className="btn-secondary-action"
                  style={{ padding: '7px 14px', fontSize: '12px' }}
                >
                  <Users size={14} /> All Staff
                </Link>

                <button
                  type="button"
                  className="btn-primary-action"
                  style={{ padding: '7px 14px', fontSize: '12px' }}
                  onClick={() => {
                    setNewEmpForm({
                      name: '',
                      email: '',
                      password: '',
                      phone: '',
                      role: 'technician',
                      department: 'Floor Operations',
                      designation: 'Senior Technician',
                      reportingManager: 'Ranjeet B. Patil (Owner / MD)',
                      salary: '35000',
                    });
                    setShowAddEmpModal(true);
                  }}
                >
                  <Plus size={14} /> Add Staff
                </button>
              </div>
            </div>

            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Emp Code</th>
                    <th>Employee Name</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Portal Role</th>
                    <th>Reporting Manager</th>
                    <th>Official Email</th>
                    <th>Contact Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <code>{emp.employeeCode}</code>
                      </td>
                      <td>
                        <strong>{emp.name}</strong>
                      </td>
                      <td>
                        <strong style={{ color: '#045F60' }}>{emp.designation}</strong>
                      </td>
                      <td>{emp.department}</td>
                      <td>
                        <span
                          className={`stage-badge ${
                            emp.role === 'super_admin'
                              ? 'badge-purple'
                              : emp.role === 'hr'
                              ? 'badge-info'
                              : emp.role === 'body_shop_manager'
                              ? 'badge-warning'
                              : 'badge-active'
                          }`}
                        >
                          {emp.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ color: '#555' }}>{emp.reportingManager}</td>
                      <td>
                        <span style={{ fontSize: '12px' }}>{emp.email}</span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>{emp.phone}</td>
                      <td>
                        <span className="stage-badge badge-active">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUPER ADMIN: TAB 2 - EMPLOYEES DIRECTORY (?tab=employees)       */}
      {/* ============================================================== */}
      {role === 'admin' && activeTab === 'employees' && (
        <div>
          {/* Header */}
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>Employees Directory</h1>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-secondary-action"
                style={{ borderColor: '#045F60', color: '#045F60', fontWeight: '700' }}
                onClick={() => {
                  setExportModalConfig({
                    isOpen: true,
                    page: 'employees',
                    pageTitle: 'Employees Directory',
                  });
                }}
                title="Export Daily, Weekly or Monthly PDF Report"
              >
                <Download size={15} /> Export PDF
              </button>

              <button
                type="button"
                className="btn-primary-action"
                onClick={() => {
                  setNewEmpForm({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    role: 'technician',
                    department: 'Floor Operations',
                    designation: 'Senior Technician',
                    reportingManager: 'Ranjeet B. Patil (Owner / MD)',
                    salary: '35000',
                  });
                  setShowAddEmpModal(true);
                }}
              >
                <Plus size={16} /> Add Staff
              </button>
            </div>
          </div>

          {/* Employee KPI Metrics */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Staff</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <Users size={20} />
                </div>
              </div>
              <div className="stat-card-value">{employees.length}</div>
              <div className="stat-card-subtext">Across 6 active departments</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Present Today</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <UserCheck size={20} />
                </div>
              </div>
              <div className="stat-card-value">{stats?.presentToday || 7} Staff</div>
              <div className="stat-card-subtext">Biometric verified at main gate</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Floor Technicians</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <Hammer size={20} />
                </div>
              </div>
              <div className="stat-card-value">2 Leads</div>
              <div className="stat-card-subtext">Denting & paint specialists</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Monthly Payroll (Est.)</span>
                <div className="stat-icon-wrapper" style={{ background: '#eef7f6', color: '#045F60' }}>
                  <ReceiptIndianRupee size={20} />
                </div>
              </div>
              <div className="stat-card-value">₹4,15,000</div>
              <div className="stat-card-subtext">MD confidential access</div>
            </div>
          </div>

          {/* Employees Table */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>Staff Directory & Registered Personnel</h3>

              <div className="wms-filter-controls">
                <input
                  type="text"
                  className="table-search-input"
                  placeholder="Search staff name, code, designation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="wms-select-input"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="ALL">All Departments ({employees.length})</option>
                  <option value="Top Management">Top Management</option>
                  <option value="Board of Directors">Board of Directors</option>
                  <option value="Workshop Operations">Workshop Operations</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Service Advisory & Intake">Service Advisory & Intake</option>
                  <option value="Workshop Supervision">Workshop Supervision</option>
                  <option value="Accounts & Finance">Accounts & Finance</option>
                  <option value="Digital Marketing & CRM">Digital Marketing & CRM</option>
                  <option value="Technician Team">Technician Team</option>
                </select>
                <span className="stage-badge badge-info">
                  {filteredEmployees.length} of {employees.length} Staff
                </span>
              </div>
            </div>
            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Emp Code</th>
                    <th>Employee Name</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Reporting Manager</th>
                    <th>Contact Phone</th>
                    <th>Joining Date</th>
                    <th>Salary (MD Confidential)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                        No employees found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id}>
                        <td>
                          <code>{emp.employeeCode}</code>
                        </td>
                        <td>
                          <strong>{emp.name}</strong>
                          <div style={{ fontSize: '11px', color: '#777' }}>{emp.email}</div>
                        </td>
                        <td>{emp.designation}</td>
                        <td>
                          <span className="stage-badge badge-info">{emp.department}</span>
                        </td>
                        <td>{emp.reportingManager || 'Board'}</td>
                        <td>{emp.phone || '+91 98220 11001'}</td>
                        <td>{emp.joiningDate}</td>
                        <td>
                          <strong style={{ color: '#045F60' }}>
                            ₹{emp.salary ? emp.salary.toLocaleString('en-IN') : '45,000'}
                          </strong>
                        </td>
                        <td>
                          <span className="stage-badge badge-active">{emp.status.toUpperCase()}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-secondary-action"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => setSelectedEmployee(emp)}
                          >
                            <Eye size={13} /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUPER ADMIN: TAB 3 - JOB CARDS MASTER (?tab=jobs)              */}
      {/* ============================================================== */}
      {role === 'admin' && activeTab === 'jobs' && (
        <div>
          {/* Header */}
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>Job Cards Master</h1>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-secondary-action"
                style={{ borderColor: '#045F60', color: '#045F60', fontWeight: '700' }}
                onClick={() => {
                  setExportModalConfig({
                    isOpen: true,
                    page: 'jobs',
                    pageTitle: 'Job Cards Master',
                  });
                }}
                title="Export Daily, Weekly or Monthly PDF Report"
              >
                <Download size={15} /> Export PDF
              </button>

              <button
                type="button"
                className="btn-primary-action"
                onClick={() =>
                  showCenterPopup(
                    'New Vehicle Intake Wizard: Form ready for Service Advisor / MD entry.',
                    'Vehicle Intake Wizard',
                    'info'
                  )
                }
              >
                <Plus size={16} /> New Job Card
              </button>
            </div>
          </div>

          {/* Job Cards KPI Metrics */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Active Repair Jobs</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <Car size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : `${jobCards.length} Vehicles`}</div>
              <div className="stat-card-subtext">
                <span className="stat-trend-up">100%</span> active floor capacity
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Floor Bay Occupancy</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <Hammer size={20} />
                </div>
              </div>
              <div className="stat-card-value">3 Active Bays</div>
              <div className="stat-card-subtext">Denting, paint & assembly</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Client Approvals</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <Clock size={20} />
                </div>
              </div>
              <div className="stat-card-value">1 Pending</div>
              <div className="stat-card-subtext" style={{ color: '#8A181A' }}>
                Requires coordinator review
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Estimated Repair Value</span>
                <div className="stat-icon-wrapper" style={{ background: '#eef7f6', color: '#045F60' }}>
                  <ReceiptIndianRupee size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `₹${(stats?.totalRevenue ?? 84252).toLocaleString('en-IN')}`}
              </div>
              <div className="stat-card-subtext">
                <span className="stat-trend-up">Approved</span> insurance claims
              </div>
            </div>
          </div>

          {/* 13-Stage Visual Pipeline Bar */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>Standardized 13-Stage Vehicle Repair Lifecycle</h3>
              <span className="stage-badge badge-info">ISO-Compliant SOP</span>
            </div>
            <div style={{ padding: '16px 20px', overflowX: 'auto' }}>
              <div className="wms-stage-pipeline-row">
                {ALL_13_STAGES.map((stageName, idx) => {
                  const count = jobCards.filter((j) => j.currentStage === stageName).length;
                  return (
                    <div
                      key={stageName}
                      style={{
                        flex: 1,
                        background: count > 0 ? '#045F60' : '#f7faf9',
                        color: count > 0 ? '#ffffff' : '#333',
                        border: count > 0 ? '1px solid #045F60' : '1px solid #ddd',
                        borderRadius: '6px',
                        padding: '10px 6px',
                        textAlign: 'center',
                        fontSize: '11px',
                      }}
                    >
                      <div style={{ opacity: 0.7, fontSize: '9px' }}>STEP {idx + 1}</div>
                      <div style={{ fontWeight: '700', marginTop: '2px', lineHeight: 1.2 }}>{stageName}</div>
                      {count > 0 && (
                        <div style={{ background: '#F7C21F', color: '#1a1a1a', borderRadius: '10px', padding: '2px 6px', fontSize: '10px', fontWeight: '800', marginTop: '4px' }}>
                          {count} Car{count > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Job Cards Table */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>Active Repair Job Cards</h3>

              <div className="wms-filter-controls">
                <input
                  type="text"
                  className="table-search-input"
                  placeholder="Search job card no, vehicle reg, model, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  className="wms-select-input"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                >
                  <option value="ALL">All 13 Repair Stages</option>
                  {ALL_13_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  className="wms-select-input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Delivered">Delivered</option>
                </select>

                <span className="stage-badge badge-info">{filteredJobs.length} Job Cards</span>
              </div>
            </div>
            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Job Card No</th>
                    <th>Vehicle Details</th>
                    <th>Customer Info</th>
                    <th>Current Stage</th>
                    <th>Assigned Supervisor</th>
                    <th>Cost Estimate</th>
                    <th>Approval</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                        No job cards found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <strong>{job.jobCardNumber}</strong>
                          <div style={{ fontSize: '11px', color: '#888' }}>Intake: {job.intakeDate}</div>
                        </td>
                        <td>
                          <strong style={{ color: '#045F60' }}>{job.vehicleRegistration}</strong>
                          <div style={{ fontSize: '12px', color: '#444' }}>{job.vehicleModel}</div>
                        </td>
                        <td>
                          <strong>{job.customerName}</strong>
                          <div style={{ fontSize: '11px', color: '#888' }}>{job.customerPhone}</div>
                        </td>
                        <td>
                          <span className="stage-badge badge-warning">{job.currentStage}</span>
                        </td>
                        <td>{job.assignedSupervisorName || 'Mahesh Jadhav'}</td>
                        <td>
                          <strong>₹{job.costEstimate?.total?.toLocaleString('en-IN') || '0'}</strong>
                        </td>
                        <td>
                          <span className={`stage-badge ${job.customerApproved ? 'badge-active' : 'badge-danger'}`}>
                            {job.customerApproved ? 'Approved' : 'Pending Approval'}
                          </span>
                        </td>
                        <td>
                          <span className="stage-badge badge-active">{job.jobStatus}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn-primary-action"
                              style={{ padding: '6px 10px', fontSize: '11px' }}
                              onClick={() => advanceStage(job.id, job.currentStage)}
                              title="Advance to next repair stage"
                            >
                              Next Stage →
                            </button>
                            <button
                              type="button"
                              className="btn-secondary-action"
                              style={{ padding: '6px 10px', fontSize: '11px' }}
                              onClick={() => setSelectedJob(job)}
                            >
                              <Eye size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUPER ADMIN: TAB 4 - BILLING & INVOICES (?tab=finance)         */}
      {/* ============================================================== */}
      {role === 'admin' && activeTab === 'finance' && (
        <div>
          {/* Header */}
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>Billing & Invoices</h1>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-secondary-action"
                style={{ borderColor: '#045F60', color: '#045F60', fontWeight: '700' }}
                onClick={() => {
                  setExportModalConfig({
                    isOpen: true,
                    page: 'finance',
                    pageTitle: 'Billing & Invoices',
                  });
                }}
                title="Export Daily, Weekly or Monthly PDF Report"
              >
                <Download size={15} /> Export PDF
              </button>

              <button
                type="button"
                className="btn-primary-action"
                onClick={() =>
                  showCenterPopup(
                    'Generate Invoice: Integrated with Accounts Department ledger.',
                    'Accounts & Billing',
                    'info'
                  )
                }
              >
                <Plus size={16} /> New Invoice
              </button>
            </div>
          </div>

          {/* Financial KPI Cards */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Invoiced (Billed)</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <ReceiptIndianRupee size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `₹${(stats?.totalRevenue ?? 84252).toLocaleString('en-IN')}`}
              </div>
              <div className="stat-card-subtext">Taxable base: ₹71,400 + GST ₹12,852</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Payments Received</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `₹${(stats?.totalCollected ?? 35000).toLocaleString('en-IN')}`}
              </div>
              <div className="stat-card-subtext">Settled via GooglePay UPI & NEFT</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Outstanding Receivables</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <Clock size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `₹${(stats?.pendingPayments ?? 49252).toLocaleString('en-IN')}`}
              </div>
              <div className="stat-card-subtext" style={{ color: '#8A181A' }}>
                Pending from Insurance / Deductibles
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Workshop Expenses</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `₹${(stats?.totalExpenses ?? 61200).toLocaleString('en-IN')}`}
              </div>
              <div className="stat-card-subtext">Paints, OEM parts & overheads</div>
            </div>
          </div>

          {/* Main Financial Ledger Panel Card */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={financeSubTab === 'invoices' ? 'btn-primary-action' : 'btn-secondary-action'}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                  onClick={() => setFinanceSubTab('invoices')}
                >
                  <FileText size={14} /> GST Tax Invoices ({invoices.length})
                </button>
                <button
                  type="button"
                  className={financeSubTab === 'payments' ? 'btn-primary-action' : 'btn-secondary-action'}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                  onClick={() => setFinanceSubTab('payments')}
                >
                  <CheckCircle2 size={14} /> Payment Receipts ({payments.length})
                </button>
                <button
                  type="button"
                  className={financeSubTab === 'expenses' ? 'btn-primary-action' : 'btn-secondary-action'}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                  onClick={() => setFinanceSubTab('expenses')}
                >
                  <TrendingUp size={14} /> Workshop Expenses ({expenses.length})
                </button>
              </div>

              <div className="wms-filter-controls">
                <input
                  type="text"
                  className="table-search-input"
                  placeholder="Search invoice no, client, reg..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Sub-Tab 1: GST Invoices Table */}
            {financeSubTab === 'invoices' && (
              <div className="wms-table-responsive">
                <table className="wms-table">
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Date</th>
                      <th>Customer & Vehicle</th>
                      <th>Taxable Base</th>
                      <th>CGST (9%)</th>
                      <th>SGST (9%)</th>
                      <th>Grand Total</th>
                      <th>Paid Amount</th>
                      <th>Balance Due</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <strong>{inv.invoiceNumber}</strong>
                        </td>
                        <td>{inv.issueDate}</td>
                        <td>
                          <strong>{inv.customerName}</strong>
                          <div style={{ fontSize: '11px', color: '#045F60' }}>{inv.vehicleRegistration}</div>
                        </td>
                        <td>₹{inv.subtotal?.toLocaleString('en-IN') || '0'}</td>
                        <td>₹{inv.cgst?.toLocaleString('en-IN') || '0'}</td>
                        <td>₹{inv.sgst?.toLocaleString('en-IN') || '0'}</td>
                        <td>
                          <strong style={{ color: '#045F60' }}>
                            ₹{inv.grandTotal?.toLocaleString('en-IN') || '0'}
                          </strong>
                        </td>
                        <td style={{ color: '#059669', fontWeight: '700' }}>
                          ₹{inv.paidAmount?.toLocaleString('en-IN') || '0'}
                        </td>
                        <td style={{ color: '#dc2626', fontWeight: '700' }}>
                          ₹{inv.balanceDue?.toLocaleString('en-IN') || '0'}
                        </td>
                        <td>
                          <span className={`stage-badge ${inv.paymentStatus === 'Paid' ? 'badge-active' : 'badge-warning'}`}>
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-secondary-action"
                            style={{ padding: '5px 8px', fontSize: '11px' }}
                            onClick={() => setSelectedInvoice(inv)}
                          >
                            <Printer size={12} /> Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-Tab 2: Payment Receipts */}
            {financeSubTab === 'payments' && (
              <div className="wms-table-responsive">
                <table className="wms-table">
                  <thead>
                    <tr>
                      <th>Receipt No</th>
                      <th>Date</th>
                      <th>Amount Received</th>
                      <th>Payment Method</th>
                      <th>Transaction Reference</th>
                      <th>Received By</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.paymentNumber}</strong>
                        </td>
                        <td>{p.date}</td>
                        <td>
                          <strong style={{ color: '#059669', fontSize: '14px' }}>
                            ₹{p.amount?.toLocaleString('en-IN')}
                          </strong>
                        </td>
                        <td>
                          <span className="stage-badge badge-info">{p.paymentMethod}</span>
                        </td>
                        <td>
                          <code>{p.transactionReference}</code>
                        </td>
                        <td>{p.receivedBy}</td>
                        <td style={{ fontSize: '12px', color: '#666' }}>{p.receiptNotes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-Tab 3: Workshop Expenses */}
            {financeSubTab === 'expenses' && (
              <div className="wms-table-responsive">
                <table className="wms-table">
                  <thead>
                    <tr>
                      <th>Expense No</th>
                      <th>Date</th>
                      <th>Title & Description</th>
                      <th>Category</th>
                      <th>Vendor Name</th>
                      <th>Amount</th>
                      <th>Approved By</th>
                      <th>Payment Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <strong>{e.expenseNumber}</strong>
                        </td>
                        <td>{e.date}</td>
                        <td>
                          <strong>{e.title}</strong>
                        </td>
                        <td>
                          <span className="stage-badge badge-neutral">{e.category}</span>
                        </td>
                        <td>{e.vendorName}</td>
                        <td>
                          <strong style={{ color: '#dc2626' }}>₹{e.amount?.toLocaleString('en-IN')}</strong>
                        </td>
                        <td>{e.approvedBy}</td>
                        <td>
                          <span className="stage-badge badge-info">{e.paymentMode}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUPER ADMIN: TAB 5 - SYSTEM AUDIT LOGS (?tab=logs)             */}
      {/* ============================================================== */}
      {role === 'admin' && activeTab === 'logs' && (
        <div>
          {/* Header */}
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>System Audit Logs</h1>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-secondary-action"
                style={{ borderColor: '#045F60', color: '#045F60', fontWeight: '700' }}
                onClick={() => {
                  setExportModalConfig({
                    isOpen: true,
                    page: 'logs',
                    pageTitle: 'System Audit Logs',
                  });
                }}
                title="Export Daily, Weekly or Monthly PDF Report"
              >
                <Download size={15} /> Export PDF
              </button>

              <button
                type="button"
                className="btn-primary-action"
                onClick={() =>
                  showCenterPopup(
                    'Exporting Audit Trail (CSV): Download generated for MD executive record.',
                    'Audit Trail Export',
                    'info'
                  )
                }
              >
                <Download size={15} /> Export Log
              </button>
            </div>
          </div>

          {/* Security Summary Metrics */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Logged Events</span>
                <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                  <ShieldCheck size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : `${activityLogs.length} Records`}</div>
              <div className="stat-card-subtext">Continuous real-time capture</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Active Authorized Users</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <Users size={20} />
                </div>
              </div>
              <div className="stat-card-value">10 Accounts</div>
              <div className="stat-card-subtext">RBAC role matrix enforced</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Audit Integrity</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="stat-card-value">100% Verified</div>
              <div className="stat-card-subtext">Zero unauthorized attempts</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Session Security</span>
                <div className="stat-icon-wrapper" style={{ background: '#eef7f6', color: '#045F60' }}>
                  <ShieldAlert size={20} />
                </div>
              </div>
              <div className="stat-card-value">JWT HS256</div>
              <div className="stat-card-subtext">HTTP-only protected cookies</div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>System Security & Activity Audit Trail</h3>

              <div className="wms-filter-controls">
                <input
                  type="text"
                  className="table-search-input"
                  placeholder="Search log description, user, entity ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  className="wms-select-input"
                  value={logActionFilter}
                  onChange={(e) => setLogActionFilter(e.target.value)}
                >
                  <option value="ALL">All Action Types</option>
                  <option value="USER_LOGIN">User Logins</option>
                  <option value="JOB_CARD_CREATED">Job Cards Created</option>
                  <option value="STAGE_UPDATED">Stage Advancements</option>
                  <option value="PAYMENT_RECORDED">Payments Recorded</option>
                  <option value="INVOICE_GENERATED">Invoices Generated</option>
                  <option value="LEAD_CONVERTED">Marketing Conversions</option>
                  <option value="SECURITY_AUDIT">Security Audits</option>
                  <option value="ATTENDANCE_MARKED">Attendance Updates</option>
                </select>

                <span className="stage-badge badge-info">{filteredLogs.length} Events</span>
              </div>
            </div>
            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Timestamp</th>
                    <th>Performed By</th>
                    <th>User Role</th>
                    <th>Action Type</th>
                    <th>Target Entity</th>
                    <th>Details / Changes Made</th>
                    <th>Network Source</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                        No audit logs match current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      let badgeClass = 'badge-info';
                      if (log.action === 'SECURITY_AUDIT') badgeClass = 'badge-purple';
                      if (log.action === 'PAYMENT_RECORDED') badgeClass = 'badge-active';
                      if (log.action === 'STAGE_UPDATED') badgeClass = 'badge-warning';

                      return (
                        <tr key={log.id}>
                          <td>
                            <code>{log.id}</code>
                          </td>
                          <td style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                          </td>
                          <td>
                            <strong>{log.performedBy}</strong>
                          </td>
                          <td>
                            <span className="stage-badge badge-neutral">{log.userRole?.toUpperCase()}</span>
                          </td>
                          <td>
                            <span className={`stage-badge ${badgeClass}`}>{log.action}</span>
                          </td>
                          <td>
                            <code>{log.entityId}</code>
                          </td>
                          <td style={{ fontSize: '13px', color: '#333', maxWidth: '380px' }}>
                            {log.details}
                          </td>
                          <td style={{ fontSize: '11px', color: '#666' }}>
                            192.168.1.105 (Workshop LAN)
                          </td>
                          <td>
                            <span className="stage-badge badge-active">VERIFIED</span>
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
      {/* SERVICE ADVISOR DEDICATED WORKSPACE (/panels/advisor/dashboard)*/}
      {/* ============================================================== */}
      {role === 'advisor' && (
        <AdvisorDashboard
          activeTab={activeTab}
          stats={stats}
          jobCards={jobCards}
          employees={employees}
          loading={loading}
          onRefresh={fetchData}
          onNotify={(msg) => {
            setFeedbackMsg(msg);
            setTimeout(() => setFeedbackMsg(''), 6000);
          }}
        />
      )}

      {/* ============================================================== */}
      {/* WORKSHOP SUPERVISOR DEDICATED WORKSPACE                        */}
      {/* ============================================================== */}
      {role === 'supervisor' && (
        <SupervisorDashboard
          activeTab={activeTab}
          employees={employees}
          loadingParent={loading}
          onRefreshParent={fetchData}
          onNotify={(msg) => {
            setFeedbackMsg(msg);
            setTimeout(() => setFeedbackMsg(''), 6000);
          }}
        />
      )}

      {/* ============================================================== */}
      {/* BODY SHOP MANAGER DEDICATED WORKSPACE                          */}
      {/* ============================================================== */}
      {role === 'body-shop-manager' && (
        <BodyShopManagerDashboard
          activeTab={activeTab}
          jobCards={jobCards}
          employees={employees}
          activityLogs={activityLogs}
          invoices={invoices}
          loading={loading}
          onRefresh={fetchData}
          onNotify={(msg) => {
            setFeedbackMsg(msg);
            setTimeout(() => setFeedbackMsg(''), 6000);
          }}
          onOpenExportPdf={() =>
            setExportModalConfig({
              isOpen: true,
              page: 'jobs',
              pageTitle: 'Body Shop Floor Operations',
            })
          }
        />
      )}

      {/* ============================================================== */}
      {/* SPARE PARTS MANAGER DEDICATED WORKSPACE                        */}
      {/* ============================================================== */}
      {role === 'spare-parts-manager' && (
        <SparePartsManagerDashboard
          activeTab={activeTab}
          jobCards={jobCards}
          employees={employees}
          loading={loading}
          onRefresh={fetchData}
          onNotify={(msg) => {
            setFeedbackMsg(msg);
            setTimeout(() => setFeedbackMsg(''), 6000);
          }}
        />
      )}

      {/* ============================================================== */}
      {/* WORKSHOP FLOOR TECHNICIAN DEDICATED WORKSPACE                  */}
      {/* ============================================================== */}
      {role === 'technician' && (
        <TechnicianDashboard
          activeTab={activeTab}
          jobCards={jobCards}
          employees={employees}
          loading={loading}
          onRefresh={fetchData}
          onNotify={(msg) => {
            setFeedbackMsg(msg);
            setTimeout(() => setFeedbackMsg(''), 6000);
          }}
        />
      )}

      {/* ============================================================== */}
      {/* OTHER ROLES (Accounts, Digital Marketing, Director)            */}
      {/* ============================================================== */}
      {role !== 'admin' &&
        role !== 'advisor' &&
        role !== 'supervisor' &&
        role !== 'body-shop-manager' &&
        role !== 'spare-parts-manager' &&
        role !== 'technician' && (
        <div>
          {/* Role Header */}
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>{meta.title}</h1>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-secondary-action"
                style={{ borderColor: '#045F60', color: '#045F60', fontWeight: '700' }}
                onClick={() => {
                  setExportModalConfig({
                    isOpen: true,
                    page: 'jobs',
                    pageTitle: 'Job Cards Master',
                  });
                }}
                title="Export Daily, Weekly or Monthly PDF Report"
              >
                <Download size={15} /> Export PDF
              </button>
            </div>
          </div>

          {/* Role Metric Cards */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">
                  {role === 'accounts'
                    ? 'Total Billed'
                    : role === 'hr'
                    ? 'Total Staff'
                    : role === 'spare-parts-manager'
                    ? 'In-Stock SKUs'
                    : 'Active Repair Jobs'}
                </span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  {role === 'accounts' ? (
                    <ReceiptIndianRupee size={20} />
                  ) : role === 'hr' ? (
                    <Users size={20} />
                  ) : role === 'spare-parts-manager' ? (
                    <Package size={20} />
                  ) : (
                    <Car size={20} />
                  )}
                </div>
              </div>
              <div className="stat-card-value">
                {loading
                  ? '...'
                  : role === 'accounts'
                  ? `₹${stats?.totalRevenue?.toLocaleString('en-IN') || '0'}`
                  : role === 'hr'
                  ? stats?.totalEmployees || '10'
                  : role === 'spare-parts-manager'
                  ? '148 Items'
                  : stats?.activeJobs || '3'}
              </div>
              <div className="stat-card-subtext">
                {role === 'spare-parts-manager' ? 'Across 8 workshop categories' : 'Live workshop status'}
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">
                  {role === 'accounts'
                    ? 'Payments Collected'
                    : role === 'hr'
                    ? 'Present Today'
                    : role === 'spare-parts-manager'
                    ? 'Issued to Floor'
                    : 'Completed Repairs'}
                </span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#B45309' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading
                  ? '...'
                  : role === 'accounts'
                  ? `₹${stats?.totalCollected?.toLocaleString('en-IN') || '0'}`
                  : role === 'hr'
                  ? `${stats?.presentToday || '7'} Present`
                  : role === 'spare-parts-manager'
                  ? '32 Parts Issued'
                  : `${stats?.completedJobs || '0'} Ready`}
              </div>
              <div className="stat-card-subtext">
                {role === 'spare-parts-manager' ? 'Allocated to active job cards' : 'Updated in real-time'}
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">
                  {role === 'accounts'
                    ? 'Pending Balance'
                    : role === 'spare-parts-manager'
                    ? 'Low Stock Alerts'
                    : 'Pending Client Approvals'}
                </span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <Clock size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading
                  ? '...'
                  : role === 'accounts'
                  ? `₹${stats?.pendingPayments?.toLocaleString('en-IN') || '0'}`
                  : role === 'spare-parts-manager'
                  ? '2 Critical'
                  : '1 Vehicle'}
              </div>
              <div className="stat-card-subtext" style={{ color: '#8A181A' }}>
                {role === 'spare-parts-manager' ? 'Purchase orders required' : 'Requires attention'}
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">
                  {role === 'spare-parts-manager' ? 'Inventory Valuation' : 'Total Vehicles Registered'}
                </span>
                <div className="stat-icon-wrapper" style={{ background: '#eef7f6', color: '#045F60' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {role === 'spare-parts-manager'
                  ? '₹3,84,500'
                  : loading
                  ? '...'
                  : `${stats?.totalVehicles || 3} Registered`}
              </div>
              <div className="stat-card-subtext">
                {role === 'spare-parts-manager' ? 'Current warehouse stock' : 'Verified customer vehicles'}
              </div>
            </div>
          </div>

          {/* Technician Specific View */}
          {role === 'technician' && (
            <div className="wms-panel-card">
              <div className="panel-card-header">
                <h3>My Active Repair Checklist (Sagar Kamble)</h3>
                <span className="stage-badge badge-active">Floor Priority</span>
              </div>
              <div style={{ padding: '20px' }}>
                {jobCards.map((job) => (
                  <div
                    key={job.id}
                    style={{
                      background: '#fcfdfd',
                      border: '1px solid #e0e9e8',
                      borderRadius: '8px',
                      padding: '18px',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '16px', color: '#141b1b' }}>{job.vehicleModel}</strong>
                        <div style={{ fontSize: '13px', color: '#045F60', fontWeight: '700' }}>
                          Reg: {job.vehicleRegistration} · Job Card: {job.jobCardNumber}
                        </div>
                      </div>
                      <span className="stage-badge badge-info">{job.currentStage}</span>
                    </div>

                    <div style={{ marginTop: '12px', fontSize: '13px', color: '#555' }}>
                      <strong>Damage Assessment:</strong> {job.inspection?.accidentDescription || 'LH front collision damage'}
                    </div>

                    <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-primary-action"
                        onClick={() => advanceStage(job.id, job.currentStage)}
                      >
                        <CheckCircle2 size={15} /> Advance Stage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Non-Technician & Non-Spare-Parts Roles: Job Cards Table */}
          {role !== 'technician' && role !== 'spare-parts-manager' && (
            <div className="wms-panel-card">
              <div className="panel-card-header">
                <h3>Active Vehicle Repairs & Workflow Status</h3>
                <input
                  type="text"
                  className="table-search-input"
                  placeholder="Search vehicle reg, model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="wms-table-responsive">
                <table className="wms-table">
                  <thead>
                    <tr>
                      <th>Job Card</th>
                      <th>Vehicle</th>
                      <th>Customer</th>
                      <th>Current Stage</th>
                      <th>Supervisor</th>
                      <th>Estimate</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <strong>{job.jobCardNumber}</strong>
                        </td>
                        <td>
                          <strong style={{ color: '#045F60' }}>{job.vehicleRegistration}</strong>
                          <div style={{ fontSize: '11px', color: '#555' }}>{job.vehicleModel}</div>
                        </td>
                        <td>{job.customerName}</td>
                        <td>
                          <span className="stage-badge badge-warning">{job.currentStage}</span>
                        </td>
                        <td>{job.assignedSupervisorName || 'Mahesh Jadhav'}</td>
                        <td>₹{job.costEstimate?.total?.toLocaleString('en-IN') || '0'}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-secondary-action"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => advanceStage(job.id, job.currentStage)}
                          >
                            Next Stage →
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
      {/* MODAL 1: ADD EMPLOYEE & PORTAL ACCOUNT (Super Admin)           */}
      {/* ============================================================== */}
      {showAddEmpModal && (
        <div className="wms-modal-backdrop" onClick={() => !submittingEmp && setShowAddEmpModal(false)}>
          <div className="wms-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="wms-header-badges">
                  <span className="stage-badge badge-active">Live Database Write</span>
                  <span className="stage-badge badge-info">Portal User Account</span>
                </div>
                <h3>Register Staff & Create Portal Account</h3>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  Super Admin can add HR or workshop personnel. Credentials are saved directly in DB so they can immediately sign in.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={submittingEmp}
                onClick={() => setShowAddEmpModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateEmployee}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <div className="wms-form-grid-2">
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Snehal Shinde / Ramesh Jadhav"
                      value={newEmpForm.name}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Email Address (Login Username) *
                    </label>
                    <input
                      type="email"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. ramesh.hr@tuljamotors.com"
                      value={newEmpForm.email}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Portal Login Password *
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. HrPass@2026"
                      value={newEmpForm.password}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Portal Role *
                    </label>
                    <select
                      className="wms-select-input"
                      style={{ width: '100%' }}
                      value={newEmpForm.role}
                      onChange={(e) => {
                        const newRole = e.target.value;
                        let autoDept = 'Human Resources';
                        let autoDesig = 'Human Resources Specialist';
                        if (newRole === 'body_shop_manager') {
                          autoDept = 'Workshop Operations';
                          autoDesig = 'Body Shop Manager';
                        } else if (newRole === 'advisor') {
                          autoDept = 'Service Advisory & Intake';
                          autoDesig = 'Service Advisor';
                        } else if (newRole === 'supervisor') {
                          autoDept = 'Workshop Supervision';
                          autoDesig = 'Workshop Supervisor';
                        } else if (newRole === 'spare_parts_manager') {
                          autoDept = 'Spare Parts & Inventory';
                          autoDesig = 'Spare Parts & Inventory Manager';
                        } else if (newRole === 'technician') {
                          autoDept = 'Technician Team';
                          autoDesig = 'Denting & Bodywork Technician';
                        }
                        setNewEmpForm({
                          ...newEmpForm,
                          role: newRole,
                          department: autoDept,
                          designation: autoDesig,
                        });
                      }}
                    >
                      {/* <option value="hr">Human Resources (HR) - Access to /panels/hr</option> */}
                      <option value="body_shop_manager">Body Shop Manager - Access to /panels/body-shop-manager</option>
                      <option value="advisor">Service Advisor - Access to /panels/advisor</option>
                      <option value="supervisor">Workshop Supervisor - Access to /panels/supervisor</option>
                      <option value="spare_parts_manager">Spare Parts Manager - Access to /panels/spare-parts-manager</option>
                      <option value="technician">Technician Team Staff</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Department *
                    </label>
                    <select
                      className="wms-select-input"
                      style={{ width: '100%' }}
                      value={newEmpForm.department}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, department: e.target.value })}
                    >
                      <option value="Human Resources">Human Resources</option>
                      <option value="Workshop Operations">Workshop Operations</option>
                      <option value="Service Advisory & Intake">Service Advisory & Intake</option>
                      <option value="Workshop Supervision">Workshop Supervision</option>
                      <option value="Spare Parts & Inventory">Spare Parts & Inventory</option>
                      <option value="Accounts & Finance">Accounts & Finance</option>
                      <option value="Technician Team">Technician Team</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Designation *
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Human Resources Lead"
                      value={newEmpForm.designation}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, designation: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Contact Mobile Phone
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="+91 98220 XXXXX"
                      value={newEmpForm.phone}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Reporting Manager
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={newEmpForm.reportingManager}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, reportingManager: e.target.value })}
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
                      value={newEmpForm.salary}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, salary: e.target.value })}
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px 14px',
                    background: '#eef7f6',
                    border: '1px solid #d0e5e3',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#045F60',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <Lock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ minWidth: 0 }}>
                    <strong>Live Database Storage:</strong> Saving will hash the password with bcrypt and write both the employee record and user account into the database.
                    The user can immediately log in at{' '}
                    <code style={{ wordBreak: 'break-word' }}>
                      /panels/{newEmpForm.role === 'body_shop_manager' ? 'body-shop-manager' : newEmpForm.role === 'spare_parts_manager' ? 'spare-parts-manager' : newEmpForm.role}
                    </code>.
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  disabled={submittingEmp}
                  onClick={() => setShowAddEmpModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action" disabled={submittingEmp}>
                  {submittingEmp ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving to Database...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Save Staff
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: VIEW EMPLOYEE PROFILE                                 */}
      {/* ============================================================== */}
      {selectedEmployee && (
        <div className="wms-modal-backdrop" onClick={() => setSelectedEmployee(null)}>
          <div className="wms-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="stage-badge badge-info">{selectedEmployee.employeeCode}</span>
                <h3 style={{ marginTop: '4px' }}>{selectedEmployee.name}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedEmployee(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="wms-form-grid-2" style={{ fontSize: '13px' }}>
                <div>
                  <strong style={{ color: '#888', fontSize: '11px', display: 'block' }}>DESIGNATION</strong>
                  <div>{selectedEmployee.designation}</div>
                </div>
                <div>
                  <strong style={{ color: '#888', fontSize: '11px', display: 'block' }}>DEPARTMENT</strong>
                  <span className="stage-badge badge-info">{selectedEmployee.department}</span>
                </div>
                <div>
                  <strong style={{ color: '#888', fontSize: '11px', display: 'block' }}>REPORTING MANAGER</strong>
                  <div>{selectedEmployee.reportingManager || 'Board'}</div>
                </div>
                <div>
                  <strong style={{ color: '#888', fontSize: '11px', display: 'block' }}>JOINING DATE</strong>
                  <div>{selectedEmployee.joiningDate}</div>
                </div>
                <div>
                  <strong style={{ color: '#888', fontSize: '11px', display: 'block' }}>EMAIL ADDRESS</strong>
                  <div>{selectedEmployee.email}</div>
                </div>
                <div>
                  <strong style={{ color: '#888', fontSize: '11px', display: 'block' }}>PHONE NUMBER</strong>
                  <div>{selectedEmployee.phone || '+91 98220 11001'}</div>
                </div>
                <div>
                  <strong style={{ color: '#888', fontSize: '11px', display: 'block' }}>MONTHLY COMPENSATION</strong>
                  <div style={{ color: '#045F60', fontWeight: '700' }}>
                    ₹{selectedEmployee.salary?.toLocaleString('en-IN') || '45,000'} / month
                  </div>
                </div>
                <div>
                  <strong style={{ color: '#888', fontSize: '11px', display: 'block' }}>STATUS</strong>
                  <span className="stage-badge badge-active">{selectedEmployee.status.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => setSelectedEmployee(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: VIEW JOB CARD DETAILS                                 */}
      {/* ============================================================== */}
      {selectedJob && (
        <div className="wms-modal-backdrop" onClick={() => setSelectedJob(null)}>
          <div className="wms-modal-card" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="stage-badge badge-warning">{selectedJob.currentStage}</span>
                <h3 style={{ marginTop: '4px' }}>Job Card: {selectedJob.jobCardNumber}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedJob(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="wms-form-grid-2" style={{ fontSize: '13px', marginBottom: '18px' }}>
                <div>
                  <strong style={{ color: '#888', fontSize: '11px', display: 'block' }}>VEHICLE REGISTRATION</strong>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#045F60' }}>
                    {selectedJob.vehicleRegistration}
                  </div>
                  <div style={{ fontSize: '12px', color: '#555' }}>{selectedJob.vehicleModel}</div>
                </div>
                <div>
                  <strong style={{ color: '#888', fontSize: '11px', display: 'block' }}>CUSTOMER INFORMATION</strong>
                  <div style={{ fontWeight: '700' }}>{selectedJob.customerName}</div>
                  <div style={{ fontSize: '12px', color: '#555' }}>{selectedJob.customerPhone}</div>
                </div>
                <div>
                  <strong style={{ color: '#888', fontSize: '11px', display: 'block' }}>INSURANCE CARRIER & CLAIM</strong>
                  <div>{selectedJob.insurance?.company || 'ICICI Lombard General Insurance'}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Claim No: {selectedJob.insurance?.claimNumber || 'CLM-2026-9041'}</div>
                </div>
                <div>
                  <strong style={{ color: '#888', fontSize: '11px', display: 'block' }}>ESTIMATED COST</strong>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#045F60' }}>
                    ₹{selectedJob.costEstimate?.total?.toLocaleString('en-IN') || '63,012'}
                  </div>
                  <span className={`stage-badge ${selectedJob.customerApproved ? 'badge-active' : 'badge-danger'}`} style={{ marginTop: '4px' }}>
                    {selectedJob.customerApproved ? 'Customer Approved' : 'Pending Customer Approval'}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '14px', marginTop: '14px' }}>
                <strong style={{ fontSize: '12px', color: '#8A181A', textTransform: 'uppercase' }}>
                  Damage & Accident Assessment:
                </strong>
                <p style={{ marginTop: '6px', fontSize: '13px', color: '#444', lineHeight: 1.5, background: '#fafafa', padding: '10px 14px', borderRadius: '6px' }}>
                  {selectedJob.inspection?.accidentDescription ||
                    'Front LHS collision damage with bumper fracture, left fender crimp, headlight bracket broken, radiator frame minor misalignment. Bonnet edge dented.'}
                </p>
              </div>

              {selectedJob.tasks && selectedJob.tasks.length > 0 && (
                <div style={{ borderTop: '1px solid #eee', paddingTop: '14px', marginTop: '14px' }}>
                  <strong style={{ fontSize: '12px', color: '#045F60', textTransform: 'uppercase' }}>
                    Workshop Tasks & Execution Checklist:
                  </strong>
                  <div style={{ marginTop: '8px' }}>
                    {selectedJob.tasks.map((t: any) => (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px',
                          padding: '8px 12px',
                          background: '#f9fbfb',
                          borderRadius: '6px',
                          marginBottom: '6px',
                          fontSize: '12px',
                        }}
                      >
                        <div>
                          <strong>{t.title}</strong>
                          <div style={{ color: '#666' }}>Assigned: {t.assignedToName || 'Sagar Kamble'}</div>
                        </div>
                        <span className={`stage-badge ${t.status === 'Completed' ? 'badge-active' : 'badge-warning'}`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => {
                  advanceStage(selectedJob.id, selectedJob.currentStage);
                  setSelectedJob(null);
                }}
              >
                Advance to Next Stage →
              </button>
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: PRINT TAX INVOICE PREVIEW                             */}
      {/* ============================================================== */}
      {selectedInvoice && (
        <div className="wms-modal-backdrop" onClick={() => setSelectedInvoice(null)}>
          <div className="wms-modal-card" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="stage-badge badge-active">GST Tax Invoice</span>
                <h3 style={{ marginTop: '4px' }}>{selectedInvoice.invoiceNumber}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedInvoice(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ background: '#fff', padding: '24px' }}>
              <div style={{ borderBottom: '2px solid #045F60', paddingBottom: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', color: '#045F60', fontWeight: '900', margin: 0 }}>TULJA MOTORS</h2>
                  <div style={{ fontSize: '12px', color: '#555' }}>Authorized Multi-Brand Bodyshop & Service Station</div>
                  <div style={{ fontSize: '11px', color: '#777' }}>Kolhapur, Maharashtra · GSTIN: 27AABCT9981M1Z5</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>{selectedInvoice.invoiceNumber}</strong>
                  <div style={{ fontSize: '12px', color: '#555' }}>Date: {selectedInvoice.issueDate}</div>
                </div>
              </div>

              <div className="wms-modal-spec-grid" style={{ fontSize: '12px', marginBottom: '18px' }}>
                <div>
                  <strong style={{ color: '#888' }}>BILLED TO:</strong>
                  <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '2px' }}>{selectedInvoice.customerName}</div>
                  <div>Vehicle: {selectedInvoice.vehicleRegistration}</div>
                </div>
                <div>
                  <strong style={{ color: '#888' }}>PAYMENT STATUS:</strong>
                  <div style={{ fontWeight: '700', color: selectedInvoice.paymentStatus === 'Paid' ? '#059669' : '#b45309', fontSize: '14px', marginTop: '2px' }}>
                    {selectedInvoice.paymentStatus}
                  </div>
                </div>
              </div>

              <div className="wms-table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '18px' }}>
                  <thead>
                    <tr style={{ background: '#f5f8f8', borderBottom: '1px solid #ddd' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Description</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}>Accidental Bodyshop Repairs & Painting Base</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{selectedInvoice.subtotal?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}>CGST @ 9%</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{selectedInvoice.cgst?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}>SGST @ 9%</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{selectedInvoice.sgst?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ background: '#f5f8f8', fontWeight: '800' }}>
                      <td style={{ padding: '10px 8px', fontSize: '14px' }}>Grand Total (Incl. 18% GST)</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '15px', color: '#045F60' }}>
                        ₹{selectedInvoice.grandTotal?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', color: '#059669' }}>Amount Paid (Advance / Settlement)</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#059669', fontWeight: '700' }}>
                        - ₹{selectedInvoice.paidAmount?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr style={{ fontWeight: '700', color: '#dc2626' }}>
                      <td style={{ padding: '8px' }}>Balance Due</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>
                        ₹{selectedInvoice.balanceDue?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => window.print()}
              >
                <Printer size={15} /> Print Document
              </button>
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => setSelectedInvoice(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TULJA MOTORS OFFICIAL PDF EXPORT MODAL */}
      <ExportPdfModal
        isOpen={exportModalConfig.isOpen}
        onClose={() => setExportModalConfig((prev) => ({ ...prev, isOpen: false }))}
        page={exportModalConfig.page}
        pageTitle={exportModalConfig.pageTitle}
        data={{
          stats,
          employees,
          jobCards,
          invoices,
          payments,
          expenses,
          activityLogs,
        }}
        onSuccess={(msg) => {
          setFeedbackMsg(msg);
          setTimeout(() => setFeedbackMsg(''), 5000);
        }}
      />

      {/* CENTERED VALIDATION & ALERT POPUP CARD (OK BUTTON) */}
      <CenterPopupModal
        popup={popupAlert}
        onClose={() => setPopupAlert(null)}
        titleId="role-dashboard-popup-title"
      />
    </DashboardLayout>
  );
}
