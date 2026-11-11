'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Car,
  Users,
  Clock,
  ReceiptIndianRupee,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  ClipboardList,
  Phone,
  FileText,
  Check,
  Eye,
  Pencil,
  UserCheck,
  ArrowRight,
  Send,
  ShieldCheck,
  Wrench,
  X,
  Loader2,
  MapPin,
  Gauge,
  FileCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type {
  Customer,
  Employee,
  JobCard,
  RepairStage,
  RepairTask,
  Vehicle,
} from '@/lib/models/types';

interface AdvisorDashboardProps {
  activeTab: string;
  stats: Record<string, unknown> | null;
  jobCards: JobCard[];
  employees: Employee[];
  loading: boolean;
  onRefresh: () => Promise<void> | void;
  onNotify: (msg: string) => void;
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

export function isJobHandedOver(job: JobCard): boolean {
  if (job.handoverToSupervisor === true) return true;
  if (job.handoverToSupervisor === false) return false;
  return !PRE_FLOOR_STAGES.includes(job.currentStage);
}

interface JobFormState {
  id?: string;
  customerMode: 'existing' | 'new';
  customerId: string;
  newCustomerName: string;
  newCustomerPhone: string;
  newCustomerEmail: string;
  newCustomerAddress: string;
  newCustomerCity: string;

  vehicleMode: 'existing' | 'new';
  vehicleId: string;
  newVehicleReg: string;
  newVehicleMake: string;
  newVehicleModel: string;
  newVehicleVariant: string;
  newVehicleYear: string;
  newVehicleColor: string;
  newVehicleFuel: Vehicle['fuelType'];
  newVehicleOdometer: string;
  newVehicleVin: string;
  newVehicleEngine: string;

  intakeDate: string;
  estimatedCompletionDate: string;
  priority: 'Normal' | 'Urgent' | 'Insurance Express';
  currentStage: RepairStage;
  jobStatus: JobCard['jobStatus'];

  accidentDescription: string;
  customerComplaintsText: string;
  visibleDamagesText: string;
  inspectionNotes: string;

  hasInsurance: boolean;
  insuranceProvider: string;
  policyNumber: string;
  claimNumber: string;
  surveyorName: string;
  surveyorPhone: string;

  labour: string;
  spareParts: string;
  painting: string;
  additionalCharges: string;
  discount: string;
  customerApproved: boolean;
  approvalDate: string;

  tasks: RepairTask[];

  assignedSupervisorId: string;
  assignedSupervisorName: string;
  handoverToSupervisor: boolean;
  handoverNotes: string;
}

function getDefaultDates() {
  const today = new Date();
  const est = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    today: today.toISOString().split('T')[0],
    est: est.toISOString().split('T')[0],
  };
}

export default function AdvisorDashboard({
  activeTab,
  jobCards,
  employees,
  loading,
  onRefresh,
  onNotify,
}: AdvisorDashboardProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingRegistry, setLoadingRegistry] = useState(true);
  const [advisorName, setAdvisorName] = useState('Amit Kulkarni');

  // Determine normalized active tab
  const currentTab =
    activeTab === 'customers' ||
    activeTab === 'vehicles' ||
    activeTab === 'jobs' ||
    activeTab === 'supervisors'
      ? activeTab
      : 'intake';

  // Scoped filter state automatically resets cleanly when switching tabs
  const [filters, setFilters] = useState<{
    tab: string;
    searchQuery: string;
    fuelFilter: string;
    stageFilter: string;
    handoverFilter: 'ALL' | 'PENDING' | 'HANDED_OVER';
  }>({
    tab: 'intake',
    searchQuery: '',
    fuelFilter: 'ALL',
    stageFilter: 'ALL',
    handoverFilter: 'ALL',
  });

  const searchQuery = filters.tab === currentTab ? filters.searchQuery : '';
  const fuelFilter = filters.tab === currentTab ? filters.fuelFilter : 'ALL';
  const stageFilter = filters.tab === currentTab ? filters.stageFilter : 'ALL';
  const handoverFilter = filters.tab === currentTab ? filters.handoverFilter : 'ALL';

  const setSearchQuery = (val: string) =>
    setFilters((prev) => ({
      ...(prev.tab === currentTab
        ? prev
        : {
            tab: currentTab,
            searchQuery: '',
            fuelFilter: 'ALL',
            stageFilter: 'ALL',
            handoverFilter: 'ALL',
          }),
      searchQuery: val,
    }));
  const setFuelFilter = (val: string) =>
    setFilters((prev) => ({
      ...(prev.tab === currentTab
        ? prev
        : {
            tab: currentTab,
            searchQuery: '',
            fuelFilter: 'ALL',
            stageFilter: 'ALL',
            handoverFilter: 'ALL',
          }),
      fuelFilter: val,
    }));
  const setStageFilter = (val: string) =>
    setFilters((prev) => ({
      ...(prev.tab === currentTab
        ? prev
        : {
            tab: currentTab,
            searchQuery: '',
            fuelFilter: 'ALL',
            stageFilter: 'ALL',
            handoverFilter: 'ALL',
          }),
      stageFilter: val,
    }));
  const setHandoverFilter = (val: 'ALL' | 'PENDING' | 'HANDED_OVER') =>
    setFilters((prev) => ({
      ...(prev.tab === currentTab
        ? prev
        : {
            tab: currentTab,
            searchQuery: '',
            fuelFilter: 'ALL',
            stageFilter: 'ALL',
            handoverFilter: 'ALL',
          }),
      handoverFilter: val,
    }));

  // Modals State
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [submittingCustomer, setSubmittingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Kolhapur',
    state: 'Maharashtra',
    pincode: '416001',
  });

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [submittingVehicle, setSubmittingVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    customerId: '',
    registrationNumber: '',
    make: '',
    model: '',
    variant: '',
    year: String(new Date().getFullYear()),
    color: '',
    fuelType: 'Petrol' as Vehicle['fuelType'],
    odometer: '0',
    vin: '',
    engineNumber: '',
  });

  const [showJobModal, setShowJobModal] = useState(false);
  const [jobModalMode, setJobModalMode] = useState<'create' | 'edit'>('create');
  const [jobModalSection, setJobModalSection] = useState<1 | 2 | 3 | 4>(1);
  const [submittingJob, setSubmittingJob] = useState(false);
  const [jobForm, setJobForm] = useState<JobFormState>(() => {
    const { today, est } = getDefaultDates();
    return {
      customerMode: 'existing',
      customerId: '',
      newCustomerName: '',
      newCustomerPhone: '',
      newCustomerEmail: '',
      newCustomerAddress: '',
      newCustomerCity: 'Kolhapur',
      vehicleMode: 'existing',
      vehicleId: '',
      newVehicleReg: '',
      newVehicleMake: '',
      newVehicleModel: '',
      newVehicleVariant: '',
      newVehicleYear: String(new Date().getFullYear()),
      newVehicleColor: 'White',
      newVehicleFuel: 'Petrol',
      newVehicleOdometer: '0',
      newVehicleVin: '',
      newVehicleEngine: '',
      intakeDate: today,
      estimatedCompletionDate: est,
      priority: 'Normal',
      currentStage: 'Vehicle Received',
      jobStatus: 'Active',
      accidentDescription: '',
      customerComplaintsText: '',
      visibleDamagesText: '',
      inspectionNotes: '',
      hasInsurance: false,
      insuranceProvider: '',
      policyNumber: '',
      claimNumber: '',
      surveyorName: '',
      surveyorPhone: '',
      labour: '0',
      spareParts: '0',
      painting: '0',
      additionalCharges: '0',
      discount: '0',
      customerApproved: false,
      approvalDate: '',
      tasks: [],
      assignedSupervisorId: 'usr_sup_01',
      assignedSupervisorName: 'Mahesh Jadhav',
      handoverToSupervisor: false,
      handoverNotes: '',
    };
  });

  // New quick task inputs inside Job Modal
  const [newTaskDraft, setNewTaskDraft] = useState({
    title: '',
    department: 'Denting' as RepairTask['department'],
    priority: 'Medium' as RepairTask['priority'],
    estimatedHours: '4',
  });

  // View & Handover modals
  const [viewingJob, setViewingJob] = useState<JobCard | null>(null);
  const [handoverJob, setHandoverJob] = useState<JobCard | null>(null);
  const [handoverSupId, setHandoverSupId] = useState('usr_sup_01');
  const [handoverTargetStage, setHandoverTargetStage] = useState<RepairStage>('Dismantling');
  const [handoverNoteText, setHandoverNoteText] = useState('');
  const [submittingHandover, setSubmittingHandover] = useState(false);

  const [popupAlert, setPopupAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const showCenterPopup = (message: string, title = 'Notice') => {
    setPopupAlert({ title, message });
  };

  const fetchAdvisorRegistries = async () => {
    setLoadingRegistry(true);
    try {
      const [custRes, vehRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/vehicles'),
      ]);
      const custData = await custRes.json();
      const vehData = await vehRes.json();
      if (custData.success) setCustomers(custData.customers || []);
      if (vehData.success) setVehicles(vehData.vehicles || []);
    } catch (err) {
      console.error('Error loading advisor registries:', err);
    } finally {
      setLoadingRegistry(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [custRes, vehRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/vehicles'),
        ]);
        const custData = await custRes.json();
        const vehData = await vehRes.json();
        if (!active) return;
        if (custData.success) setCustomers(custData.customers || []);
        if (vehData.success) setVehicles(vehData.vehicles || []);
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('tm_user');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed.name) setAdvisorName(parsed.name);
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error('Error loading advisor registries:', err);
      } finally {
        if (active) setLoadingRegistry(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Supervisors from employees list
  const supervisors = useMemo(() => {
    const floorSups = employees.filter(
      (e) => e.role === 'supervisor' || e.role === 'body_shop_manager'
    );
    if (floorSups.length > 0) {
      // Put primary 'supervisor' role employees first
      return [...floorSups].sort((a, b) => {
        if (a.role === 'supervisor' && b.role !== 'supervisor') return -1;
        if (a.role !== 'supervisor' && b.role === 'supervisor') return 1;
        return a.name.localeCompare(b.name);
      });
    }
    return [
      {
        id: 'emp_007',
        employeeCode: 'TM-SUP-001',
        userId: 'usr_sup_01',
        name: 'Mahesh Jadhav',
        email: 'supervisor@tuljamotors.com',
        phone: '+91 98220 55001',
        role: 'supervisor' as const,
        department: 'Workshop Supervision',
        designation: 'Workshop Supervisor',
        reportingManager: 'Vikram Deshmukh',
        joiningDate: '2021-03-20',
        status: 'active' as const,
      },
    ];
  }, [employees]);

  const handleAllRefresh = async () => {
    await Promise.all([fetchAdvisorRegistries(), onRefresh()]);
  };

  // Computed KPI Metrics
  const activeJobs = jobCards.filter((j) => j.jobStatus === 'Active');
  const pendingApprovalJobs = jobCards.filter((j) => !j.customerApproved);
  const approvedJobs = jobCards.filter((j) => j.customerApproved);
  const pendingHandoverJobs = jobCards.filter((j) => !isJobHandedOver(j));
  const handedOverJobs = jobCards.filter((j) => isJobHandedOver(j));
  const totalEstimatedPipeline = activeJobs.reduce(
    (sum, j) => sum + (j.costEstimate?.total || 0),
    0
  );
  const insuranceJobsCount = jobCards.filter((j) => Boolean(j.inspection?.insuranceProvider)).length;

  // Helpers
  const getCustomerName = (custId: string) =>
    customers.find((c) => c.id === custId)?.name || 'Unknown Owner';

  const getCustomerVehicles = (custId: string) =>
    vehicles.filter((v) => v.customerId === custId);

  const getCustomerJobs = (custId: string) =>
    jobCards.filter((j) => j.customerId === custId);

  // Live Estimate Math in Modal
  const modalEstimateCalc = useMemo(() => {
    const labour = Number(jobForm.labour) || 0;
    const spareParts = Number(jobForm.spareParts) || 0;
    const painting = Number(jobForm.painting) || 0;
    const additionalCharges = Number(jobForm.additionalCharges) || 0;
    const discount = Number(jobForm.discount) || 0;
    const taxable = Math.max(0, labour + spareParts + painting + additionalCharges - discount);
    const gst = Math.round(taxable * 0.18);
    const total = taxable + gst;
    return { taxable, gst, cgst: Math.round(gst / 2), sgst: Math.round(gst / 2), total };
  }, [
    jobForm.labour,
    jobForm.spareParts,
    jobForm.painting,
    jobForm.additionalCharges,
    jobForm.discount,
  ]);

  // ==============================================================
  // HANDLERS: CUSTOMER CREATE / EDIT
  // ==============================================================
  const openCreateCustomer = () => {
    setEditingCustomerId(null);
    setCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: 'Kolhapur',
      state: 'Maharashtra',
      pincode: '416001',
    });
    setShowCustomerModal(true);
  };

  const openEditCustomer = (cust: Customer) => {
    setEditingCustomerId(cust.id);
    setCustomerForm({
      name: cust.name || '',
      phone: cust.phone || '',
      email: cust.email || '',
      address: cust.address || '',
      city: cust.city || 'Kolhapur',
      state: cust.state || 'Maharashtra',
      pincode: cust.pincode || '416001',
    });
    setShowCustomerModal(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      showCenterPopup(
        'Please provide customer name and mobile phone number.',
        'Customer Information Required'
      );
      return;
    }
    setSubmittingCustomer(true);
    try {
      const isEdit = Boolean(editingCustomerId);
      const res = await fetch('/api/customers', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit ? { id: editingCustomerId } : {}),
          ...customerForm,
          createdBy: advisorName,
          updatedBy: advisorName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(
          data.message || 'Failed to save customer record.',
          'Unable to Save Customer'
        );
        return;
      }
      setShowCustomerModal(false);
      await handleAllRefresh();
      onNotify(
        isEdit
          ? `Customer record "${data.customer.name}" updated in database.`
          : `New customer "${data.customer.name}" (${data.customer.customerCode}) saved to database.`
      );
    } catch (err: unknown) {
      showCenterPopup(
        'Error saving customer: ' + (err instanceof Error ? err.message : String(err)),
        'Error'
      );
    } finally {
      setSubmittingCustomer(false);
    }
  };

  // ==============================================================
  // HANDLERS: VEHICLE CREATE / EDIT
  // ==============================================================
  const openCreateVehicle = (preselectedCustomerId?: string) => {
    setEditingVehicleId(null);
    setVehicleForm({
      customerId: preselectedCustomerId || customers[0]?.id || '',
      registrationNumber: '',
      make: '',
      model: '',
      variant: '',
      year: String(new Date().getFullYear()),
      color: '',
      fuelType: 'Petrol',
      odometer: '0',
      vin: '',
      engineNumber: '',
    });
    setShowVehicleModal(true);
  };

  const openEditVehicle = (veh: Vehicle) => {
    setEditingVehicleId(veh.id);
    setVehicleForm({
      customerId: veh.customerId || '',
      registrationNumber: veh.registrationNumber || '',
      make: veh.make || '',
      model: veh.model || '',
      variant: veh.variant || '',
      year: String(veh.year || new Date().getFullYear()),
      color: veh.color || '',
      fuelType: veh.fuelType || 'Petrol',
      odometer: String(veh.odometer || 0),
      vin: veh.vin || '',
      engineNumber: veh.engineNumber || '',
    });
    setShowVehicleModal(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !vehicleForm.customerId ||
      !vehicleForm.registrationNumber.trim() ||
      !vehicleForm.make.trim() ||
      !vehicleForm.model.trim()
    ) {
      showCenterPopup(
        'Customer owner, registration number, make, and model are required.',
        'Vehicle Details Required'
      );
      return;
    }
    setSubmittingVehicle(true);
    try {
      const isEdit = Boolean(editingVehicleId);
      const res = await fetch('/api/vehicles', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit ? { id: editingVehicleId } : {}),
          ...vehicleForm,
          createdBy: advisorName,
          updatedBy: advisorName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(data.message || 'Failed to save vehicle.', 'Unable to Save Vehicle');
        return;
      }
      setShowVehicleModal(false);
      await handleAllRefresh();
      onNotify(
        isEdit
          ? `Vehicle "${data.vehicle.registrationNumber}" updated in database.`
          : `Vehicle "${data.vehicle.registrationNumber}" (${data.vehicle.make} ${data.vehicle.model}) registered in database.`
      );
    } catch (err: unknown) {
      showCenterPopup(
        'Error saving vehicle: ' + (err instanceof Error ? err.message : String(err)),
        'Error'
      );
    } finally {
      setSubmittingVehicle(false);
    }
  };

  // ==============================================================
  // HANDLERS: JOB CARD CREATE / EDIT
  // ==============================================================
  const openCreateJobCard = (preCustomerId?: string, preVehicleId?: string) => {
    const { today, est } = getDefaultDates();
    const defaultCustId = preCustomerId || customers[0]?.id || '';
    const custVehs = vehicles.filter((v) => v.customerId === defaultCustId);
    const defaultVehId = preVehicleId || custVehs[0]?.id || vehicles[0]?.id || '';
    const primarySup = supervisors[0];

    setJobModalMode('create');
    setJobModalSection(1);
    setJobForm({
      customerMode: customers.length > 0 ? 'existing' : 'new',
      customerId: defaultCustId,
      newCustomerName: '',
      newCustomerPhone: '',
      newCustomerEmail: '',
      newCustomerAddress: '',
      newCustomerCity: 'Kolhapur',

      vehicleMode: vehicles.length > 0 ? 'existing' : 'new',
      vehicleId: defaultVehId,
      newVehicleReg: '',
      newVehicleMake: '',
      newVehicleModel: '',
      newVehicleVariant: '',
      newVehicleYear: String(new Date().getFullYear()),
      newVehicleColor: 'White',
      newVehicleFuel: 'Petrol',
      newVehicleOdometer: '0',
      newVehicleVin: '',
      newVehicleEngine: '',

      intakeDate: today,
      estimatedCompletionDate: est,
      priority: 'Normal',
      currentStage: 'Vehicle Received',
      jobStatus: 'Active',

      accidentDescription: '',
      customerComplaintsText: '',
      visibleDamagesText: '',
      inspectionNotes: '',

      hasInsurance: false,
      insuranceProvider: '',
      policyNumber: '',
      claimNumber: '',
      surveyorName: '',
      surveyorPhone: '',

      labour: '0',
      spareParts: '0',
      painting: '0',
      additionalCharges: '0',
      discount: '0',
      customerApproved: false,
      approvalDate: '',

      tasks: [],

      assignedSupervisorId: primarySup?.userId || primarySup?.id || 'usr_sup_01',
      assignedSupervisorName: primarySup?.name || 'Mahesh Jadhav',
      handoverToSupervisor: false,
      handoverNotes: '',
    });
    setShowJobModal(true);
  };

  const openEditJobCard = (job: JobCard) => {
    setJobModalMode('edit');
    setJobModalSection(1);
    const hasIns = Boolean(
      job.inspection?.insuranceProvider || job.inspection?.claimNumber || job.inspection?.policyNumber
    );
    setJobForm({
      id: job.id,
      customerMode: 'existing',
      customerId: job.customerId || '',
      newCustomerName: '',
      newCustomerPhone: '',
      newCustomerEmail: '',
      newCustomerAddress: '',
      newCustomerCity: 'Kolhapur',

      vehicleMode: 'existing',
      vehicleId: job.vehicleId || '',
      newVehicleReg: '',
      newVehicleMake: '',
      newVehicleModel: '',
      newVehicleVariant: '',
      newVehicleYear: String(new Date().getFullYear()),
      newVehicleColor: 'White',
      newVehicleFuel: 'Petrol',
      newVehicleOdometer: '0',
      newVehicleVin: '',
      newVehicleEngine: '',

      intakeDate: job.intakeDate || getDefaultDates().today,
      estimatedCompletionDate: job.estimatedCompletionDate || getDefaultDates().est,
      priority: job.priority || 'Normal',
      currentStage: job.currentStage || 'Vehicle Received',
      jobStatus: job.jobStatus || 'Active',

      accidentDescription: job.inspection?.accidentDescription || '',
      customerComplaintsText: (job.inspection?.customerComplaints || []).join('\n'),
      visibleDamagesText: (job.inspection?.visibleDamages || []).join('\n'),
      inspectionNotes: job.inspection?.inspectionNotes || '',

      hasInsurance: hasIns,
      insuranceProvider: job.inspection?.insuranceProvider || '',
      policyNumber: job.inspection?.policyNumber || '',
      claimNumber: job.inspection?.claimNumber || '',
      surveyorName: job.inspection?.surveyorName || '',
      surveyorPhone: job.inspection?.surveyorPhone || '',

      labour: String(job.costEstimate?.labour || 0),
      spareParts: String(job.costEstimate?.spareParts || 0),
      painting: String(job.costEstimate?.painting || 0),
      additionalCharges: String(job.costEstimate?.additionalCharges || 0),
      discount: String(job.costEstimate?.discount || 0),
      customerApproved: Boolean(job.customerApproved),
      approvalDate: job.approvalDate || '',

      tasks: job.tasks || [],

      assignedSupervisorId: job.assignedSupervisorId || 'usr_sup_01',
      assignedSupervisorName: job.assignedSupervisorName || 'Mahesh Jadhav',
      handoverToSupervisor: isJobHandedOver(job),
      handoverNotes: job.handoverNotes || '',
    });
    setShowJobModal(true);
  };

  const addDraftTaskToJobForm = () => {
    if (!newTaskDraft.title.trim()) return;
    const task: RepairTask = {
      id: `tsk_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      title: newTaskDraft.title.trim(),
      description: `${newTaskDraft.department} task planned during intake assessment.`,
      department: newTaskDraft.department,
      assignedTechnicianId: 'usr_tech_01',
      assignedTechnicianName: 'Sagar Kamble',
      priority: newTaskDraft.priority,
      status: 'Pending',
      estimatedHours: Number(newTaskDraft.estimatedHours) || 2,
    };
    setJobForm((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
    setNewTaskDraft({ title: '', department: 'Denting', priority: 'Medium', estimatedHours: '4' });
  };

  const removeTaskFromJobForm = (taskId: string) => {
    setJobForm((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) }));
  };

  const handleSaveJobCard = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (jobForm.customerMode === 'new') {
      if (!jobForm.newCustomerName.trim() || !jobForm.newCustomerPhone.trim()) {
        setJobModalSection(1);
        showCenterPopup(
          'Please enter the New Customer Name and Mobile Phone number.',
          'Customer Information Required'
        );
        return;
      }
    } else if (!jobForm.customerId) {
      setJobModalSection(1);
      showCenterPopup(
        'Please select an existing customer or switch to New Customer.',
        'Customer Selection Required'
      );
      return;
    }

    if (jobForm.vehicleMode === 'new') {
      if (
        !jobForm.newVehicleReg.trim() ||
        !jobForm.newVehicleMake.trim() ||
        !jobForm.newVehicleModel.trim()
      ) {
        setJobModalSection(1);
        showCenterPopup(
          'Please enter Vehicle Registration #, Make, and Model.',
          'Vehicle Specifications Required'
        );
        return;
      }
    } else if (!jobForm.vehicleId) {
      setJobModalSection(1);
      showCenterPopup(
        'Please select a vehicle or register a new vehicle.',
        'Vehicle Selection Required'
      );
      return;
    }

    if (!jobForm.accidentDescription.trim() && !jobForm.inspectionNotes.trim()) {
      setJobModalSection(2);
      showCenterPopup(
        'Please provide Damage / Accident Description or Inspection Notes.',
        'Inspection Details Required'
      );
      return;
    }

    setSubmittingJob(true);

    try {
      const selectedCust = customers.find((c) => c.id === jobForm.customerId);
      const selectedVeh = vehicles.find((v) => v.id === jobForm.vehicleId);

      const splitLines = (txt: string) =>
        txt
          .split(/\n|,/)
          .map((s) => s.trim())
          .filter(Boolean);

      const payload: Record<string, unknown> = {
        intakeDate: jobForm.intakeDate,
        estimatedCompletionDate: jobForm.estimatedCompletionDate,
        priority: jobForm.priority,
        currentStage: jobForm.currentStage,
        jobStatus: jobForm.jobStatus,
        advisorName,
        createdBy: advisorName,
        updatedBy: advisorName,
        userRole: 'advisor',
        inspection: {
          intakeDate: jobForm.intakeDate,
          accidentDescription: jobForm.accidentDescription.trim(),
          customerComplaints: splitLines(jobForm.customerComplaintsText),
          visibleDamages: splitLines(jobForm.visibleDamagesText),
          inspectionNotes: jobForm.inspectionNotes.trim(),
          photographs: [],
          insuranceProvider: jobForm.hasInsurance ? jobForm.insuranceProvider.trim() : '',
          policyNumber: jobForm.hasInsurance ? jobForm.policyNumber.trim() : '',
          claimNumber: jobForm.hasInsurance ? jobForm.claimNumber.trim() : '',
          surveyorName: jobForm.hasInsurance ? jobForm.surveyorName.trim() : '',
          surveyorPhone: jobForm.hasInsurance ? jobForm.surveyorPhone.trim() : '',
        },
        costEstimate: {
          labour: Number(jobForm.labour) || 0,
          spareParts: Number(jobForm.spareParts) || 0,
          painting: Number(jobForm.painting) || 0,
          additionalCharges: Number(jobForm.additionalCharges) || 0,
          discount: Number(jobForm.discount) || 0,
          taxRate: 18,
          taxAmount: modalEstimateCalc.gst,
          total: modalEstimateCalc.total,
        },
        customerApproved: jobForm.customerApproved,
        approvalDate: jobForm.customerApproved
          ? jobForm.approvalDate || new Date().toISOString().split('T')[0]
          : undefined,
        tasks: jobForm.tasks,
        assignedSupervisorId: jobForm.assignedSupervisorId,
        assignedSupervisorName: jobForm.assignedSupervisorName,
        handoverToSupervisor: jobForm.handoverToSupervisor,
        handoverNotes: jobForm.handoverNotes.trim(),
      };

      if (jobModalMode === 'create') {
        if (jobForm.customerMode === 'new') {
          payload.newCustomer = {
            name: jobForm.newCustomerName.trim(),
            phone: jobForm.newCustomerPhone.trim(),
            email: jobForm.newCustomerEmail.trim(),
            address: jobForm.newCustomerAddress.trim(),
            city: jobForm.newCustomerCity.trim(),
          };
        } else if (selectedCust) {
          payload.customerId = selectedCust.id;
          payload.customerName = selectedCust.name;
          payload.customerPhone = selectedCust.phone;
        }

        if (jobForm.vehicleMode === 'new') {
          payload.newVehicle = {
            registrationNumber: jobForm.newVehicleReg.trim().toUpperCase(),
            make: jobForm.newVehicleMake.trim(),
            model: jobForm.newVehicleModel.trim(),
            variant: jobForm.newVehicleVariant.trim(),
            year: Number(jobForm.newVehicleYear) || new Date().getFullYear(),
            color: jobForm.newVehicleColor.trim(),
            fuelType: jobForm.newVehicleFuel,
            odometer: Number(jobForm.newVehicleOdometer) || 0,
            vin: jobForm.newVehicleVin.trim(),
            engineNumber: jobForm.newVehicleEngine.trim(),
          };
        } else if (selectedVeh) {
          payload.vehicleId = selectedVeh.id;
          payload.vehicleRegistration = selectedVeh.registrationNumber;
          payload.vehicleModel = `${selectedVeh.make} ${selectedVeh.model}${
            selectedVeh.variant ? ' ' + selectedVeh.variant : ''
          }`.trim();
        }
      } else {
        payload.id = jobForm.id;
        if (selectedCust) {
          payload.customerId = selectedCust.id;
          payload.customerName = selectedCust.name;
          payload.customerPhone = selectedCust.phone;
        }
        if (selectedVeh) {
          payload.vehicleId = selectedVeh.id;
          payload.vehicleRegistration = selectedVeh.registrationNumber;
          payload.vehicleModel = `${selectedVeh.make} ${selectedVeh.model}${
            selectedVeh.variant ? ' ' + selectedVeh.variant : ''
          }`.trim();
        }
      }

      const res = await fetch('/api/job-cards', {
        method: jobModalMode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(
          data.message || 'Failed to save job card to database.',
          'Unable to Save Job Card'
        );
        return;
      }

      setShowJobModal(false);
      await handleAllRefresh();
      onNotify(
        jobModalMode === 'create'
          ? `Job Card ${data.jobCard.jobCardNumber} created & saved to MongoDB for ${data.jobCard.vehicleRegistration}!`
          : `Job Card ${data.jobCard.jobCardNumber} updated and saved to database!`
      );
    } catch (err: unknown) {
      showCenterPopup(
        'Network/database error saving job card: ' +
          (err instanceof Error ? err.message : String(err)),
        'Connection Error'
      );
    } finally {
      setSubmittingJob(false);
    }
  };

  // ==============================================================
  // HANDLERS: HANDOVER TO SUPERVISOR
  // ==============================================================
  const openHandoverModal = (job: JobCard) => {
    setHandoverJob(job);
    const defaultSup =
      supervisors.find((s) => (s.userId || s.id) === job.assignedSupervisorId) || supervisors[0];
    setHandoverSupId(defaultSup?.userId || defaultSup?.id || 'usr_sup_01');
    setHandoverTargetStage(
      PRE_FLOOR_STAGES.includes(job.currentStage) ? 'Dismantling' : job.currentStage
    );
    setHandoverNoteText(
      job.handoverNotes ||
        `Intake completed by ${advisorName}. Ready for floor supervision and technician allocation.`
    );
  };

  const handleConfirmHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverJob) return;
    setSubmittingHandover(true);

    try {
      const supObj = supervisors.find((s) => (s.userId || s.id) === handoverSupId);
      const supName = supObj?.name || 'Mahesh Jadhav';

      const res = await fetch('/api/job-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: handoverJob.id,
          assignedSupervisorId: handoverSupId,
          assignedSupervisorName: supName,
          currentStage: handoverTargetStage,
          handoverToSupervisor: true,
          handoverNotes: handoverNoteText.trim(),
          stageNote: `Handed over to Workshop Supervisor ${supName}. ${handoverNoteText.trim()}`,
          updatedBy: advisorName,
          userRole: 'advisor',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(
          data.message || 'Failed to hand over job card to supervisor.',
          'Handover Failed'
        );
        return;
      }

      setHandoverJob(null);
      await handleAllRefresh();
      onNotify(
        `Job Card ${data.jobCard.jobCardNumber} (${data.jobCard.vehicleRegistration}) successfully handed over to Supervisor ${supName}!`
      );
    } catch (err: unknown) {
      showCenterPopup(
        'Error during handover: ' + (err instanceof Error ? err.message : String(err)),
        'Error'
      );
    } finally {
      setSubmittingHandover(false);
    }
  };

  // Filtered Lists
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.customerCode.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    const ownerName = getCustomerName(v.customerId).toLowerCase();
    const matchesSearch =
      !q ||
      v.registrationNumber.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.vin.toLowerCase().includes(q) ||
      ownerName.includes(q);
    const matchesFuel = fuelFilter === 'ALL' || v.fuelType === fuelFilter;
    return matchesSearch && matchesFuel;
  });

  const filteredJobCards = jobCards.filter((j) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      j.jobCardNumber.toLowerCase().includes(q) ||
      j.customerName.toLowerCase().includes(q) ||
      j.vehicleRegistration.toLowerCase().includes(q) ||
      j.vehicleModel.toLowerCase().includes(q) ||
      (j.assignedSupervisorName || '').toLowerCase().includes(q);
    const matchesStage = stageFilter === 'ALL' || j.currentStage === stageFilter;
    const handed = isJobHandedOver(j);
    const matchesHandover =
      handoverFilter === 'ALL' ||
      (handoverFilter === 'PENDING' && !handed) ||
      (handoverFilter === 'HANDED_OVER' && handed);
    return matchesSearch && matchesStage && matchesHandover;
  });

  // Quick Pill Nav component reused identically across all 5 pages
  const renderTabNavBar = () => (
    <div className="wms-tab-nav-bar">
      <Link
        href="/panels/advisor/dashboard"
        className={`wms-tab-pill-btn ${currentTab === 'intake' ? 'active' : ''}`}
      >
        <ClipboardList size={15} /> Intake Desk
      </Link>
      <Link
        href="/panels/advisor/dashboard?tab=customers"
        className={`wms-tab-pill-btn ${currentTab === 'customers' ? 'active' : ''}`}
      >
        <Users size={15} /> Customer Records ({customers.length})
      </Link>
      <Link
        href="/panels/advisor/dashboard?tab=vehicles"
        className={`wms-tab-pill-btn ${currentTab === 'vehicles' ? 'active' : ''}`}
      >
        <Car size={15} /> Vehicle Intake ({vehicles.length})
      </Link>
      <Link
        href="/panels/advisor/dashboard?tab=jobs"
        className={`wms-tab-pill-btn ${currentTab === 'jobs' ? 'active' : ''}`}
      >
        <FileText size={15} /> Job Cards & Estimates ({jobCards.length})
      </Link>
      <Link
        href="/panels/advisor/dashboard?tab=supervisors"
        className={`wms-tab-pill-btn ${currentTab === 'supervisors' ? 'active' : ''}`}
      >
        <UserCheck size={15} /> Supervisor Coordination ({pendingHandoverJobs.length} Pending)
      </Link>
    </div>
  );

  return (
    <div>
      {/* ============================================================== */}
      {/* TAB 1: INTAKE DESK (DEFAULT /panels/advisor/dashboard)         */}
      {/* ============================================================== */}
      {currentTab === 'intake' && (
        <div>
          {/* Consistent Workspace Header */}
          <div className="workspace-header">
            <div className="workspace-title-box">
              <div className="wms-header-badges">
                <span className="stage-badge badge-info">Service Advisory & Intake</span>
                <span className="stage-badge badge-active">MongoDB Live Synced</span>
              </div>
              <h1>Service Advisor Intake Desk</h1>
              <p>
                Service Advisor <strong>{advisorName}</strong> • Manage customer walk-ins, vehicle inspections, detailed repair estimates, and floor handovers to Workshop Supervisors.
              </p>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-secondary-action"
                onClick={handleAllRefresh}
                title="Refresh Live Data"
              >
                <RefreshCw size={15} /> Refresh
              </button>
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => openCreateJobCard()}
              >
                <Plus size={16} /> Create Detailed Job Card
              </button>
            </div>
          </div>

          {renderTabNavBar()}

          {/* 4 KPI Cards */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Active Job Cards</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <FileText size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : activeJobs.length}</div>
              <div className="stat-card-subtext">
                <span className="stat-trend-up">{jobCards.length} total</span> records in system
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Pending Client Approval</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <Clock size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : pendingApprovalJobs.length}</div>
              <div className="stat-card-subtext">Awaiting estimate sign-off</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Awaiting Supervisor Handover</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <Send size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : pendingHandoverJobs.length}</div>
              <div className="stat-card-subtext">Ready for floor release</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Active Estimate Pipeline</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <ReceiptIndianRupee size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                ₹{totalEstimatedPipeline.toLocaleString('en-IN')}
              </div>
              <div className="stat-card-subtext">Incl. 18% GST valuation</div>
            </div>
          </div>

          {/* 4-Step Intake Workflow Banner */}
          <div className="wms-panel-card" style={{ marginBottom: '24px' }}>
            <div className="panel-card-header">
              <div>
                <h3>Advisor 4-Step Intake-to-Floor Workflow</h3>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  Click any step below to jump directly to that desk or register new records.
                </p>
              </div>
              <span className="stage-badge badge-info">Standard Operating Flow</span>
            </div>
            <div className="wms-workflow-grid" style={{ padding: '18px 20px' }}>
              <Link
                href="/panels/advisor/dashboard?tab=customers"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  background: '#fafdfc',
                  border: '1px solid #d9eae8',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="stage-badge badge-info">Step 1</span>
                  <Users size={16} color="#045F60" />
                </div>
                <strong style={{ fontSize: '14px', color: '#141b1b' }}>Customer Records</strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Verify or add owner profile ({customers.length} registered)
                </span>
              </Link>

              <Link
                href="/panels/advisor/dashboard?tab=vehicles"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  background: '#fafdfc',
                  border: '1px solid #d9eae8',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="stage-badge badge-info">Step 2</span>
                  <Car size={16} color="#045F60" />
                </div>
                <strong style={{ fontSize: '14px', color: '#141b1b' }}>Vehicle Intake</strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Log registration, VIN, odometer & model ({vehicles.length} vehicles)
                </span>
              </Link>

              <Link
                href="/panels/advisor/dashboard?tab=jobs"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  background: '#fafdfc',
                  border: '1px solid #d9eae8',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="stage-badge badge-warning">Step 3</span>
                  <FileText size={16} color="#b45309" />
                </div>
                <strong style={{ fontSize: '14px', color: '#141b1b' }}>Job Cards & Estimates</strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Capture damages, insurance & 18% GST estimate ({jobCards.length} cards)
                </span>
              </Link>

              <Link
                href="/panels/advisor/dashboard?tab=supervisors"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  background: '#f0fdfa',
                  border: '1px solid #045F60',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="stage-badge badge-active">Step 4</span>
                  <UserCheck size={16} color="#045F60" />
                </div>
                <strong style={{ fontSize: '14px', color: '#045F60' }}>Supervisor Handover</strong>
                <span style={{ fontSize: '12px', color: '#475569' }}>
                  Brief & release job card to workshop floor ({pendingHandoverJobs.length} waiting)
                </span>
              </Link>
            </div>
          </div>

          {/* 2-Column Overview Grid */}
          <div className="wms-grid-2col">
            {/* Quick Desk Launchpad */}
            <div className="wms-panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-card-header">
                <h3>Quick Intake Actions</h3>
                <Sparkles size={16} color="#045F60" />
              </div>
              <div className="wms-form-grid-2" style={{ padding: '18px 20px' }}>
                <button
                  type="button"
                  className="btn-primary-action"
                  style={{ justifyContent: 'center', padding: '12px' }}
                  onClick={() => openCreateJobCard()}
                >
                  <Plus size={16} /> New Job Card
                </button>
                <button
                  type="button"
                  className="btn-secondary-action"
                  style={{ justifyContent: 'center', padding: '12px' }}
                  onClick={openCreateCustomer}
                >
                  <Users size={16} /> Register Customer
                </button>
                <button
                  type="button"
                  className="btn-secondary-action"
                  style={{ justifyContent: 'center', padding: '12px' }}
                  onClick={() => openCreateVehicle()}
                >
                  <Car size={16} /> Log Vehicle Intake
                </button>
                <Link
                  href="/panels/advisor/dashboard?tab=supervisors"
                  className="btn-secondary-action"
                  style={{
                    justifyContent: 'center',
                    padding: '12px',
                    textDecoration: 'none',
                    borderColor: '#045F60',
                    color: '#045F60',
                  }}
                >
                  <Send size={16} /> Handover Desk
                </Link>
              </div>
            </div>

            {/* Active Workshop Supervisors Load */}
            <div className="wms-panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-card-header">
                <h3>Floor Supervision Readiness</h3>
                <Link
                  href="/panels/advisor/dashboard?tab=supervisors"
                  style={{ fontSize: '12px', fontWeight: '700', color: '#045F60', textDecoration: 'none' }}
                >
                  Coordinate →
                </Link>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {supervisors.map((sup) => {
                  const supId = sup.userId || sup.id;
                  const supJobsCount = jobCards.filter(
                    (j) =>
                      (j.assignedSupervisorId === supId || j.assignedSupervisorName === sup.name) &&
                      j.jobStatus === 'Active' &&
                      isJobHandedOver(j)
                  ).length;
                  return (
                    <div
                      key={sup.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px',
                        padding: '10px 14px',
                        background: '#fafdfc',
                        border: '1px solid #e2eeec',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: '#045F60',
                            color: '#fff',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: '800',
                            fontSize: '13px',
                            flexShrink: 0,
                          }}
                        >
                          {sup.name.charAt(0)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: '13px', display: 'block' }}>{sup.name}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>
                            {sup.designation} · {sup.phone}
                          </span>
                        </div>
                      </div>
                      <span className="stage-badge badge-info">{supJobsCount} Active Bays</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pending & Recent Job Cards Queue */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <div>
                <h3>Recent Intake & Pre-Handover Job Cards</h3>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  Edit job details, update repair estimates, or hand over directly to a Workshop Supervisor.
                </p>
              </div>
              <Link href="/panels/advisor/dashboard?tab=jobs" className="btn-secondary-action">
                View All Job Cards ({jobCards.length})
              </Link>
            </div>
            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Job Card #</th>
                    <th>Vehicle & Model</th>
                    <th>Customer</th>
                    <th>Current Stage</th>
                    <th>Estimate Total</th>
                    <th>Supervisor Handover</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobCards.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                        No job cards found. Click &ldquo;Create Detailed Job Card&rdquo; to begin vehicle intake.
                      </td>
                    </tr>
                  ) : (
                    jobCards.slice(0, 8).map((job) => {
                      const handed = isJobHandedOver(job);
                      return (
                        <tr key={job.id}>
                          <td>
                            <code>{job.jobCardNumber}</code>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{job.intakeDate}</div>
                          </td>
                          <td>
                            <strong style={{ color: '#045F60' }}>{job.vehicleRegistration}</strong>
                            <div style={{ fontSize: '12px', color: '#475569' }}>{job.vehicleModel}</div>
                          </td>
                          <td>
                            <strong>{job.customerName}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{job.customerPhone}</div>
                          </td>
                          <td>
                            <span className="stage-badge badge-warning">{job.currentStage}</span>
                          </td>
                          <td>
                            <strong>₹{(job.costEstimate?.total || 0).toLocaleString('en-IN')}</strong>
                            <div style={{ fontSize: '11px', color: job.customerApproved ? '#067a46' : '#b45309' }}>
                              {job.customerApproved ? '✓ Client Approved' : 'Pending Sign-off'}
                            </div>
                          </td>
                          <td>
                            {handed ? (
                              <div>
                                <span className="stage-badge badge-active">✓ Handed Over</span>
                                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                                  Sup: {job.assignedSupervisorName}
                                </div>
                              </div>
                            ) : (
                              <span className="stage-badge badge-danger">Awaiting Handover</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 9px', fontSize: '11px' }}
                                onClick={() => setViewingJob(job)}
                                title="View Complete Details"
                              >
                                <Eye size={13} /> View
                              </button>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 9px', fontSize: '11px' }}
                                onClick={() => openEditJobCard(job)}
                                title="Edit Job Card"
                              >
                                <Pencil size={13} /> Edit
                              </button>
                              {!handed && (
                                <button
                                  type="button"
                                  className="btn-primary-action"
                                  style={{ padding: '5px 10px', fontSize: '11px' }}
                                  onClick={() => openHandoverModal(job)}
                                >
                                  <Send size={12} /> Handover
                                </button>
                              )}
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
      {/* TAB 2: CUSTOMER RECORDS (?tab=customers)                       */}
      {/* ============================================================== */}
      {currentTab === 'customers' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <div className="wms-header-badges">
                <span className="stage-badge badge-info">CRM & Owner Registry</span>
                <span className="stage-badge badge-active">{customers.length} Customers</span>
              </div>
              <h1>Customer Records</h1>
              <p>
                Service Advisor <strong>{advisorName}</strong> • Manage customer contact directory, billing addresses, linked vehicles, and service history.
              </p>
            </div>

            <div className="workspace-actions">
              <button type="button" className="btn-secondary-action" onClick={handleAllRefresh}>
                <RefreshCw size={15} /> Refresh
              </button>
              <button type="button" className="btn-primary-action" onClick={openCreateCustomer}>
                <Plus size={16} /> Register Customer
              </button>
            </div>
          </div>

          {renderTabNavBar()}

          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Registered Customers</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <Users size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loadingRegistry ? '...' : customers.length}</div>
              <div className="stat-card-subtext">Verified owner accounts</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Linked Fleet Vehicles</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <Car size={20} />
                </div>
              </div>
              <div className="stat-card-value">{vehicles.length}</div>
              <div className="stat-card-subtext">Registered across clients</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Insurance Claim Files</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <ShieldCheck size={20} />
                </div>
              </div>
              <div className="stat-card-value">{insuranceJobsCount}</div>
              <div className="stat-card-subtext">Active cashless / claim jobs</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Kolhapur Regional Clients</span>
                <div className="stat-icon-wrapper" style={{ background: '#eef7f6', color: '#045F60' }}>
                  <MapPin size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {customers.filter((c) => c.city?.toLowerCase() === 'kolhapur').length}
              </div>
              <div className="stat-card-subtext">Local service catchment</div>
            </div>
          </div>

          <div className="wms-filter-bar">
            <div className="wms-filter-controls">
              <input
                type="text"
                className="table-search-input"
                placeholder="Search customer code, name, phone, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span className="stage-badge badge-info">
              Showing {filteredCustomers.length} of {customers.length} Customers
            </span>
          </div>

          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>Customer Owner Directory (Saved in DB)</h3>
              <button
                type="button"
                className="btn-secondary-action"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={openCreateCustomer}
              >
                <Plus size={14} /> Add Client
              </button>
            </div>
            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Cust Code</th>
                    <th>Customer Name & Email</th>
                    <th>Contact Phone</th>
                    <th>Address & City</th>
                    <th>Registered Vehicles</th>
                    <th>Jobs</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                        No customers match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => {
                      const ownedVehs = getCustomerVehicles(cust.id);
                      const jobsCount = getCustomerJobs(cust.id).length;
                      return (
                        <tr key={cust.id}>
                          <td>
                            <code>{cust.customerCode}</code>
                          </td>
                          <td>
                            <strong>{cust.name}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {cust.email || 'No email provided'}
                            </div>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                              <Phone size={12} color="#045F60" /> {cust.phone}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px' }}>{cust.address || '—'}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {cust.city}, {cust.state} - {cust.pincode}
                            </div>
                          </td>
                          <td>
                            {ownedVehs.length === 0 ? (
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>No vehicle yet</span>
                            ) : (
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {ownedVehs.map((v) => (
                                  <span key={v.id} className="stage-badge badge-neutral">
                                    {v.registrationNumber}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="stage-badge badge-info">{jobsCount} Jobs</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 9px', fontSize: '11px' }}
                                onClick={() => openEditCustomer(cust)}
                              >
                                <Pencil size={12} /> Edit
                              </button>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 9px', fontSize: '11px', color: '#045F60', borderColor: '#045F60' }}
                                onClick={() => openCreateVehicle(cust.id)}
                              >
                                <Plus size={12} /> Vehicle
                              </button>
                              <button
                                type="button"
                                className="btn-primary-action"
                                style={{ padding: '5px 10px', fontSize: '11px' }}
                                onClick={() => openCreateJobCard(cust.id, ownedVehs[0]?.id)}
                              >
                                <FileText size={12} /> Job Card
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
      {/* TAB 3: VEHICLE INTAKE (?tab=vehicles)                          */}
      {/* ============================================================== */}
      {currentTab === 'vehicles' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <div className="wms-header-badges">
                <span className="stage-badge badge-info">Vehicle Intake Master</span>
                <span className="stage-badge badge-active">{vehicles.length} Registered</span>
              </div>
              <h1>Vehicle Intake</h1>
              <p>
                Service Advisor <strong>{advisorName}</strong> • Log arriving vehicles with registration plate, VIN/chassis number, odometer reading, and initiate repair job cards.
              </p>
            </div>

            <div className="workspace-actions">
              <button type="button" className="btn-secondary-action" onClick={handleAllRefresh}>
                <RefreshCw size={15} /> Refresh
              </button>
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => openCreateVehicle()}
              >
                <Plus size={16} /> Register Vehicle
              </button>
            </div>
          </div>

          {renderTabNavBar()}

          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Vehicles</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <Car size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loadingRegistry ? '...' : vehicles.length}</div>
              <div className="stat-card-subtext">Multi-brand fleet catalog</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Diesel / Petrol Split</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <Gauge size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {vehicles.filter((v) => v.fuelType === 'Diesel').length}D /{' '}
                {vehicles.filter((v) => v.fuelType === 'Petrol').length}P
              </div>
              <div className="stat-card-subtext">Primary fuel configurations</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">In Active Service</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <Wrench size={20} />
                </div>
              </div>
              <div className="stat-card-value">{activeJobs.length}</div>
              <div className="stat-card-subtext">Currently assigned to job cards</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">VIN Verified</span>
                <div className="stat-icon-wrapper" style={{ background: '#eef7f6', color: '#045F60' }}>
                  <FileCheck size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {vehicles.filter((v) => v.vin && v.vin !== 'NOT_RECORDED').length}
              </div>
              <div className="stat-card-subtext">Chassis numbers recorded</div>
            </div>
          </div>

          <div className="wms-filter-bar">
            <div className="wms-filter-controls">
              <input
                type="text"
                className="table-search-input"
                placeholder="Search reg no, make, model, VIN, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="wms-select-input"
                value={fuelFilter}
                onChange={(e) => setFuelFilter(e.target.value)}
              >
                <option value="ALL">All Fuel Types ({vehicles.length})</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="CNG">CNG</option>
              </select>
            </div>
            <span className="stage-badge badge-info">
              {filteredVehicles.length} of {vehicles.length} Vehicles
            </span>
          </div>

          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>Registered Vehicles & Bay Intake Ledger</h3>
              <button
                type="button"
                className="btn-primary-action"
                style={{ padding: '6px 14px', fontSize: '12px' }}
                onClick={() => openCreateVehicle()}
              >
                <Plus size={14} /> Log New Vehicle
              </button>
            </div>
            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Registration #</th>
                    <th>Make, Model & Variant</th>
                    <th>Owner Name</th>
                    <th>Year / Color</th>
                    <th>Fuel</th>
                    <th>Odometer</th>
                    <th>VIN / Engine #</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                        No vehicles match your search or fuel filter.
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((veh) => (
                      <tr key={veh.id}>
                        <td>
                          <strong style={{ color: '#045F60', fontSize: '13px' }}>
                            {veh.registrationNumber}
                          </strong>
                        </td>
                        <td>
                          <strong>
                            {veh.make} {veh.model}
                          </strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {veh.variant || 'Standard Variant'}
                          </div>
                        </td>
                        <td>
                          <strong>{getCustomerName(veh.customerId)}</strong>
                        </td>
                        <td>
                          <span>{veh.year}</span>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{veh.color}</div>
                        </td>
                        <td>
                          <span className="stage-badge badge-neutral">{veh.fuelType}</span>
                        </td>
                        <td>{(veh.odometer || 0).toLocaleString('en-IN')} km</td>
                        <td>
                          <code style={{ fontSize: '11px' }}>{veh.vin || 'NOT_RECORDED'}</code>
                          {veh.engineNumber && (
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              Eng: {veh.engineNumber}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn-secondary-action"
                              style={{ padding: '5px 9px', fontSize: '11px' }}
                              onClick={() => openEditVehicle(veh)}
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            <button
                              type="button"
                              className="btn-primary-action"
                              style={{ padding: '5px 10px', fontSize: '11px' }}
                              onClick={() => openCreateJobCard(veh.customerId, veh.id)}
                            >
                              <Plus size={12} /> Create Job Card
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
      {/* TAB 4: JOB CARDS & ESTIMATES (?tab=jobs)                       */}
      {/* ============================================================== */}
      {currentTab === 'jobs' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <div className="wms-header-badges">
                <span className="stage-badge badge-info">Job Cards & Estimates</span>
                <span className="stage-badge badge-active">{jobCards.length} DB Records</span>
              </div>
              <h1>Job Cards & Estimates</h1>
              <p>
                Service Advisor <strong>{advisorName}</strong> • Create comprehensive job cards, assess damages & insurance claims, compute 18% GST repair estimates, and edit any job details.
              </p>
            </div>

            <div className="workspace-actions">
              <button type="button" className="btn-secondary-action" onClick={handleAllRefresh}>
                <RefreshCw size={15} /> Refresh
              </button>
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => openCreateJobCard()}
              >
                <Plus size={16} /> Create Detailed Job Card
              </button>
            </div>
          </div>

          {renderTabNavBar()}

          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Job Cards</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <ClipboardList size={20} />
                </div>
              </div>
              <div className="stat-card-value">{jobCards.length}</div>
              <div className="stat-card-subtext">{activeJobs.length} active repairs</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Customer Approved</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="stat-card-value">{approvedJobs.length}</div>
              <div className="stat-card-subtext">{pendingApprovalJobs.length} awaiting customer OK</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Handed Over to Floor</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <UserCheck size={20} />
                </div>
              </div>
              <div className="stat-card-value">{handedOverJobs.length}</div>
              <div className="stat-card-subtext">{pendingHandoverJobs.length} awaiting handover</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Estimated Value</span>
                <div className="stat-icon-wrapper" style={{ background: '#eef7f6', color: '#045F60' }}>
                  <ReceiptIndianRupee size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                ₹{jobCards.reduce((acc, j) => acc + (j.costEstimate?.total || 0), 0).toLocaleString('en-IN')}
              </div>
              <div className="stat-card-subtext">Combined repair billing scope</div>
            </div>
          </div>

          <div className="wms-filter-bar">
            <div className="wms-filter-controls">
              <input
                type="text"
                className="table-search-input"
                placeholder="Search JC #, vehicle reg, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="wms-select-input"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="ALL">All Stages ({jobCards.length})</option>
                {ALL_13_STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <select
                className="wms-select-input"
                value={handoverFilter}
                onChange={(e) =>
                  setHandoverFilter(e.target.value as 'ALL' | 'PENDING' | 'HANDED_OVER')
                }
              >
                <option value="ALL">All Handover States</option>
                <option value="PENDING">Pending Handover ({pendingHandoverJobs.length})</option>
                <option value="HANDED_OVER">Handed Over ({handedOverJobs.length})</option>
              </select>
            </div>
            <span className="stage-badge badge-info">
              {filteredJobCards.length} of {jobCards.length} Job Cards
            </span>
          </div>

          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>Master Job Cards & Estimates Ledger</h3>
              <button
                type="button"
                className="btn-primary-action"
                style={{ padding: '6px 14px', fontSize: '12px' }}
                onClick={() => openCreateJobCard()}
              >
                <Plus size={14} /> New Job Card
              </button>
            </div>
            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Job Card #</th>
                    <th>Vehicle & Model</th>
                    <th>Customer</th>
                    <th>Insurance / Claim</th>
                    <th>Cost Estimate (GST Incl.)</th>
                    <th>Client Approval</th>
                    <th>Current Stage</th>
                    <th>Supervisor & Handover</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobCards.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                        No job cards match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredJobCards.map((job) => {
                      const handed = isJobHandedOver(job);
                      return (
                        <tr key={job.id}>
                          <td>
                            <code>{job.jobCardNumber}</code>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              In: {job.intakeDate}
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: '#045F60' }}>{job.vehicleRegistration}</strong>
                            <div style={{ fontSize: '12px', color: '#475569' }}>{job.vehicleModel}</div>
                          </td>
                          <td>
                            <strong>{job.customerName}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{job.customerPhone}</div>
                          </td>
                          <td>
                            {job.inspection?.insuranceProvider ? (
                              <div>
                                <span style={{ fontSize: '12px', fontWeight: '600' }}>
                                  {job.inspection.insuranceProvider}
                                </span>
                                {job.inspection.claimNumber && (
                                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                                    {job.inspection.claimNumber}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="stage-badge badge-neutral">Self Pay</span>
                            )}
                          </td>
                          <td>
                            <strong style={{ color: '#045F60', fontSize: '13px' }}>
                              ₹{(job.costEstimate?.total || 0).toLocaleString('en-IN')}
                            </strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              L: ₹{(job.costEstimate?.labour || 0).toLocaleString('en-IN')} · P: ₹
                              {(job.costEstimate?.spareParts || 0).toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`stage-badge ${
                                job.customerApproved ? 'badge-active' : 'badge-warning'
                              }`}
                            >
                              {job.customerApproved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td>
                            <span className="stage-badge badge-info">{job.currentStage}</span>
                          </td>
                          <td>
                            {handed ? (
                              <div>
                                <span className="stage-badge badge-active">Handed Over</span>
                                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                                  {job.assignedSupervisorName}
                                </div>
                              </div>
                            ) : (
                              <span className="stage-badge badge-danger">Not Handed Over</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 9px', fontSize: '11px' }}
                                onClick={() => setViewingJob(job)}
                              >
                                <Eye size={12} /> View
                              </button>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 9px', fontSize: '11px' }}
                                onClick={() => openEditJobCard(job)}
                              >
                                <Pencil size={12} /> Edit
                              </button>
                              {!handed && (
                                <button
                                  type="button"
                                  className="btn-primary-action"
                                  style={{ padding: '5px 9px', fontSize: '11px' }}
                                  onClick={() => openHandoverModal(job)}
                                >
                                  <Send size={12} /> Handover
                                </button>
                              )}
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
      {/* TAB 5: SUPERVISOR COORDINATION (?tab=supervisors)              */}
      {/* ============================================================== */}
      {currentTab === 'supervisors' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <div className="wms-header-badges">
                <span className="stage-badge badge-purple">Floor Handover Desk</span>
                <span className="stage-badge badge-active">
                  {pendingHandoverJobs.length} Pending Handover
                </span>
              </div>
              <h1>Supervisor Coordination</h1>
              <p>
                Service Advisor <strong>{advisorName}</strong> • Review intake completeness, assign a Floor Supervisor, and formally hand over approved job cards to the repair floor.
              </p>
            </div>

            <div className="workspace-actions">
              <button type="button" className="btn-secondary-action" onClick={handleAllRefresh}>
                <RefreshCw size={15} /> Refresh
              </button>
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => openCreateJobCard()}
              >
                <Plus size={16} /> Create New Job Card
              </button>
            </div>
          </div>

          {renderTabNavBar()}

          {/* KPI Cards */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Pending Handover</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <Send size={20} />
                </div>
              </div>
              <div className="stat-card-value">{pendingHandoverJobs.length}</div>
              <div className="stat-card-subtext">Advisor desk holds</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Handed Over & Active</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="stat-card-value">{handedOverJobs.length}</div>
              <div className="stat-card-subtext">Under floor supervision</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Approved Ready to Release</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <FileCheck size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {pendingHandoverJobs.filter((j) => j.customerApproved).length}
              </div>
              <div className="stat-card-subtext">Signed off by customer</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Active Floor Supervisors</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <UserCheck size={20} />
                </div>
              </div>
              <div className="stat-card-value">{supervisors.length}</div>
              <div className="stat-card-subtext">Available to receive jobs</div>
            </div>
          </div>

          {/* Supervisor Team Load Strip */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <div>
                <h3>Available Workshop Supervisors & Floor Load</h3>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  Live supervisor roster fetched from database. Assign jobs balanced across floor leads.
                </p>
              </div>
              <span className="stage-badge badge-info">{supervisors.length} Supervisors Online</span>
            </div>
            <div className="wms-supervisor-cards-grid" style={{ padding: '18px 20px' }}>
              {supervisors.map((sup) => {
                const supId = sup.userId || sup.id;
                const assignedJobs = handedOverJobs.filter(
                  (j) =>
                    (j.assignedSupervisorId === supId || j.assignedSupervisorName === sup.name) &&
                    j.jobStatus === 'Active'
                );
                return (
                  <div key={sup.id} className="wms-org-node" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: '#045F60',
                          color: '#fff',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: '800',
                          fontSize: '15px',
                          flexShrink: 0,
                        }}
                      >
                        {sup.name.charAt(0)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ fontSize: '14px', color: '#141b1b', display: 'block' }}>
                          {sup.name}
                        </strong>
                        <div style={{ fontSize: '12px', color: '#045F60', fontWeight: '600', wordBreak: 'break-word' }}>
                          {sup.designation}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>
                          {sup.phone} · {sup.department}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="stage-badge badge-active">{assignedJobs.length} Active</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QUEUE 1: JOB CARDS AWAITING HANDOVER TO SUPERVISOR */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <div>
                <h3>Job Cards Ready / Awaiting Handover to Supervisor ({pendingHandoverJobs.length})</h3>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  Newly created or intake-stage job cards waiting to be assigned and released to floor supervision.
                </p>
              </div>
              <span className="stage-badge badge-danger">Action Required</span>
            </div>
            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Job Card #</th>
                    <th>Vehicle & Customer</th>
                    <th>Damage & Intake Summary</th>
                    <th>Estimate Total</th>
                    <th>Approval Status</th>
                    <th>Current Stage</th>
                    <th>Handover Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingHandoverJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '28px', color: '#067a46' }}>
                        ✓ All current job cards have already been handed over to Workshop Supervisors!
                      </td>
                    </tr>
                  ) : (
                    pendingHandoverJobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <code>{job.jobCardNumber}</code>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{job.intakeDate}</div>
                        </td>
                        <td>
                          <strong style={{ color: '#045F60' }}>{job.vehicleRegistration}</strong>
                          <div style={{ fontSize: '12px', fontWeight: '600' }}>{job.vehicleModel}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {job.customerName} ({job.customerPhone})
                          </div>
                        </td>
                        <td style={{ maxWidth: '240px' }}>
                          <div style={{ fontSize: '12px', color: '#334155' }}>
                            {job.inspection?.accidentDescription || 'Inspection completed'}
                          </div>
                          {job.inspection?.visibleDamages && job.inspection.visibleDamages.length > 0 && (
                            <div style={{ fontSize: '11px', color: '#8A181A', marginTop: '2px' }}>
                              Damages: {job.inspection.visibleDamages.slice(0, 2).join(', ')}
                            </div>
                          )}
                        </td>
                        <td>
                          <strong>₹{(job.costEstimate?.total || 0).toLocaleString('en-IN')}</strong>
                        </td>
                        <td>
                          <span
                            className={`stage-badge ${
                              job.customerApproved ? 'badge-active' : 'badge-warning'
                            }`}
                          >
                            {job.customerApproved ? '✓ Approved' : 'Pending Client OK'}
                          </span>
                        </td>
                        <td>
                          <span className="stage-badge badge-info">{job.currentStage}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn-secondary-action"
                              style={{ padding: '6px 10px', fontSize: '11px' }}
                              onClick={() => openEditJobCard(job)}
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            <button
                              type="button"
                              className="btn-primary-action"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => openHandoverModal(job)}
                            >
                              <Send size={13} /> Handover to Supervisor <ArrowRight size={13} />
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

          {/* QUEUE 2: ALREADY HANDED OVER TO FLOOR SUPERVISION */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <div>
                <h3>Jobs Handed Over to Floor Supervision ({handedOverJobs.length})</h3>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  Confirmed handovers currently being executed under supervisor floor control.
                </p>
              </div>
              <span className="stage-badge badge-active">Floor Synced</span>
            </div>
            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Job Card #</th>
                    <th>Vehicle & Owner</th>
                    <th>Assigned Supervisor</th>
                    <th>Handover Briefing & Date</th>
                    <th>Floor Stage</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {handedOverJobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <code>{job.jobCardNumber}</code>
                      </td>
                      <td>
                        <strong style={{ color: '#045F60' }}>{job.vehicleRegistration}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {job.vehicleModel} · {job.customerName}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#141b1b' }}>{job.assignedSupervisorName}</strong>
                      </td>
                      <td style={{ maxWidth: '250px' }}>
                        <div style={{ fontSize: '12px', color: '#334155' }}>
                          {job.handoverNotes || 'Released to workshop floor bay.'}
                        </div>
                        {job.handoverDate && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            Handed Over:{' '}
                            {new Date(job.handoverDate).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="stage-badge badge-warning">{job.currentStage}</span>
                      </td>
                      <td>
                        <span className="stage-badge badge-active">{job.jobStatus}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn-secondary-action"
                            style={{ padding: '5px 9px', fontSize: '11px' }}
                            onClick={() => setViewingJob(job)}
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            type="button"
                            className="btn-secondary-action"
                            style={{ padding: '5px 9px', fontSize: '11px' }}
                            onClick={() => openHandoverModal(job)}
                          >
                            <UserCheck size={12} /> Reassign
                          </button>
                        </div>
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
      {/* MODAL A: ADD / EDIT CUSTOMER                                   */}
      {/* ============================================================== */}
      {showCustomerModal && (
        <div className="wms-modal-backdrop" onClick={() => !submittingCustomer && setShowCustomerModal(false)}>
          <div className="wms-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="stage-badge badge-info">Customer CRM</span>
                <h3 style={{ marginTop: '4px' }}>
                  {editingCustomerId ? 'Edit Customer Record' : 'Register New Customer'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={submittingCustomer}
                onClick={() => setShowCustomerModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCustomer}>
              <div className="modal-body">
                <div className="wms-form-grid-2">
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Customer Full Name *
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Rajeshwar Patil"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Mobile Phone *
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="+91 98220 XXXXX"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="client@example.com"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Street Address
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="Plot / House / Lane details"
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      City
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={customerForm.city}
                      onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Pincode
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={customerForm.pincode}
                      onChange={(e) => setCustomerForm({ ...customerForm, pincode: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  disabled={submittingCustomer}
                  onClick={() => setShowCustomerModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action" disabled={submittingCustomer}>
                  {submittingCustomer ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving to DB...
                    </>
                  ) : (
                    <>
                      <Check size={15} /> {editingCustomerId ? 'Update Customer' : 'Save Customer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL B: ADD / EDIT VEHICLE                                    */}
      {/* ============================================================== */}
      {showVehicleModal && (
        <div className="wms-modal-backdrop" onClick={() => !submittingVehicle && setShowVehicleModal(false)}>
          <div className="wms-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="stage-badge badge-info">Vehicle Intake Registry</span>
                <h3 style={{ marginTop: '4px' }}>
                  {editingVehicleId ? 'Edit Vehicle Intake Details' : 'Register Arriving Vehicle'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={submittingVehicle}
                onClick={() => setShowVehicleModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveVehicle}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <div className="wms-form-grid-2">
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Vehicle Owner (Customer) *
                    </label>
                    <select
                      className="wms-select-input"
                      style={{ width: '100%' }}
                      value={vehicleForm.customerId}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, customerId: e.target.value })}
                      required
                    >
                      <option value="">-- Select Registered Customer --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone}) — {c.customerCode}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Registration Plate # *
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%', textTransform: 'uppercase' }}
                      placeholder="MH-09-AB-1234"
                      value={vehicleForm.registrationNumber}
                      onChange={(e) =>
                        setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value.toUpperCase() })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Vehicle Make (Brand) *
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Hyundai / Tata / Maruti / Kia"
                      value={vehicleForm.make}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Model Name *
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Creta / Harrier / Swift"
                      value={vehicleForm.model}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Variant / Trim
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. SX (O) Turbo"
                      value={vehicleForm.variant}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, variant: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Model Year
                    </label>
                    <input
                      type="number"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={vehicleForm.year}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Exterior Color / Shade
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Titan Grey Metallic"
                      value={vehicleForm.color}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Fuel Type
                    </label>
                    <select
                      className="wms-select-input"
                      style={{ width: '100%' }}
                      value={vehicleForm.fuelType}
                      onChange={(e) =>
                        setVehicleForm({ ...vehicleForm, fuelType: e.target.value as Vehicle['fuelType'] })
                      }
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="CNG">CNG</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Odometer Reading (km)
                    </label>
                    <input
                      type="number"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={vehicleForm.odometer}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, odometer: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      VIN / Chassis Number
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%', textTransform: 'uppercase' }}
                      placeholder="MALC381..."
                      value={vehicleForm.vin}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, vin: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Engine Number
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%', textTransform: 'uppercase' }}
                      value={vehicleForm.engineNumber}
                      onChange={(e) =>
                        setVehicleForm({ ...vehicleForm, engineNumber: e.target.value.toUpperCase() })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  disabled={submittingVehicle}
                  onClick={() => setShowVehicleModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action" disabled={submittingVehicle}>
                  {submittingVehicle ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving to DB...
                    </>
                  ) : (
                    <>
                      <Check size={15} /> {editingVehicleId ? 'Update Vehicle' : 'Register Vehicle'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL C: COMPREHENSIVE CREATE / EDIT JOB CARD WIZARD           */}
      {/* ============================================================== */}
      {showJobModal && (
        <div className="wms-modal-backdrop" onClick={() => !submittingJob && setShowJobModal(false)}>
          <div
            className="wms-modal-card"
            style={{ maxWidth: '880px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="wms-header-badges">
                  <span className="stage-badge badge-active">MongoDB Live Save</span>
                  <span className="stage-badge badge-info">
                    {jobModalMode === 'create' ? 'New Job Card Intake' : 'Editing Job Card'}
                  </span>
                </div>
                <h3>
                  {jobModalMode === 'create'
                    ? 'Create Detailed Workshop Job Card'
                    : 'Edit Job Card Details, Inspection & Estimate'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={submittingJob}
                onClick={() => setShowJobModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Section Stepper Bar */}
            <div className="wms-stepper-bar">
              {[
                { num: 1 as const, label: '1. Customer & Vehicle' },
                { num: 2 as const, label: '2. Damage & Insurance' },
                { num: 3 as const, label: '3. Estimate (18% GST) & Tasks' },
                { num: 4 as const, label: '4. Schedule & Supervisor' },
              ].map((sec) => (
                <button
                  key={sec.num}
                  type="button"
                  onClick={() => setJobModalSection(sec.num)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    border: jobModalSection === sec.num ? '1px solid #045F60' : '1px solid transparent',
                    background: jobModalSection === sec.num ? '#045F60' : '#fff',
                    color: jobModalSection === sec.num ? '#fff' : '#334155',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveJobCard}>
              <div className="modal-body" style={{ maxHeight: '64vh', overflowY: 'auto' }}>
                {/* SECTION 1: CUSTOMER & VEHICLE */}
                {jobModalSection === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Customer Block */}
                    <div
                      style={{
                        border: '1px solid #e2eeec',
                        borderRadius: '8px',
                        padding: '16px',
                        background: '#fafdfc',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '12px',
                        }}
                      >
                        <strong style={{ fontSize: '13px', color: '#045F60' }}>
                          CUSTOMER / OWNER INFORMATION
                        </strong>
                        {jobModalMode === 'create' && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className={`stage-badge ${
                                jobForm.customerMode === 'existing' ? 'badge-active' : 'badge-neutral'
                              }`}
                              style={{ cursor: 'pointer', border: 'none' }}
                              onClick={() => setJobForm({ ...jobForm, customerMode: 'existing' })}
                            >
                              Existing Client
                            </button>
                            <button
                              type="button"
                              className={`stage-badge ${
                                jobForm.customerMode === 'new' ? 'badge-active' : 'badge-neutral'
                              }`}
                              style={{ cursor: 'pointer', border: 'none' }}
                              onClick={() =>
                                setJobForm({ ...jobForm, customerMode: 'new', vehicleMode: 'new' })
                              }
                            >
                              + New Walk-in Customer
                            </button>
                          </div>
                        )}
                      </div>

                      {jobForm.customerMode === 'existing' ? (
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                            Select Registered Customer *
                          </label>
                          <select
                            className="wms-select-input"
                            style={{ width: '100%' }}
                            value={jobForm.customerId}
                            onChange={(e) => {
                              const cid = e.target.value;
                              const owned = vehicles.filter((v) => v.customerId === cid);
                              setJobForm({
                                ...jobForm,
                                customerId: cid,
                                vehicleId: owned[0]?.id || '',
                              });
                            }}
                          >
                            <option value="">-- Choose Customer --</option>
                            {customers.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} ({c.phone}) — {c.customerCode}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="wms-form-grid-2">
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                              New Customer Full Name *
                            </label>
                            <input
                              type="text"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              placeholder="Full Name"
                              value={jobForm.newCustomerName}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, newCustomerName: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                              Mobile Phone *
                            </label>
                            <input
                              type="text"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              placeholder="+91 98XXX XXXXX"
                              value={jobForm.newCustomerPhone}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, newCustomerPhone: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                              Email Address
                            </label>
                            <input
                              type="email"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              placeholder="optional@email.com"
                              value={jobForm.newCustomerEmail}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, newCustomerEmail: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                              Address / City
                            </label>
                            <input
                              type="text"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              placeholder="Area, City"
                              value={jobForm.newCustomerAddress}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, newCustomerAddress: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Vehicle Block */}
                    <div
                      style={{
                        border: '1px solid #e2eeec',
                        borderRadius: '8px',
                        padding: '16px',
                        background: '#fafdfc',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '12px',
                        }}
                      >
                        <strong style={{ fontSize: '13px', color: '#045F60' }}>
                          VEHICLE INTAKE SPECIFICATIONS
                        </strong>
                        {jobModalMode === 'create' && jobForm.customerMode === 'existing' && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className={`stage-badge ${
                                jobForm.vehicleMode === 'existing' ? 'badge-active' : 'badge-neutral'
                              }`}
                              style={{ cursor: 'pointer', border: 'none' }}
                              onClick={() => setJobForm({ ...jobForm, vehicleMode: 'existing' })}
                            >
                              Existing Vehicle
                            </button>
                            <button
                              type="button"
                              className={`stage-badge ${
                                jobForm.vehicleMode === 'new' ? 'badge-active' : 'badge-neutral'
                              }`}
                              style={{ cursor: 'pointer', border: 'none' }}
                              onClick={() => setJobForm({ ...jobForm, vehicleMode: 'new' })}
                            >
                              + Register New Vehicle
                            </button>
                          </div>
                        )}
                      </div>

                      {jobForm.vehicleMode === 'existing' ? (
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                            Select Registered Vehicle *
                          </label>
                          <select
                            className="wms-select-input"
                            style={{ width: '100%' }}
                            value={jobForm.vehicleId}
                            onChange={(e) => setJobForm({ ...jobForm, vehicleId: e.target.value })}
                          >
                            <option value="">-- Choose Vehicle --</option>
                            {vehicles.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.registrationNumber} — {v.make} {v.model} ({v.year}, {v.color})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="wms-form-grid-3">
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                              Registration # *
                            </label>
                            <input
                              type="text"
                              className="table-search-input"
                              style={{ width: '100%', textTransform: 'uppercase' }}
                              placeholder="MH-09-AB-1234"
                              value={jobForm.newVehicleReg}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, newVehicleReg: e.target.value.toUpperCase() })
                              }
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                              Make *
                            </label>
                            <input
                              type="text"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              placeholder="Hyundai / Tata"
                              value={jobForm.newVehicleMake}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, newVehicleMake: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                              Model *
                            </label>
                            <input
                              type="text"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              placeholder="Creta / Safari"
                              value={jobForm.newVehicleModel}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, newVehicleModel: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                              Variant / Trim
                            </label>
                            <input
                              type="text"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              placeholder="SX (O)"
                              value={jobForm.newVehicleVariant}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, newVehicleVariant: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                              Color
                            </label>
                            <input
                              type="text"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              value={jobForm.newVehicleColor}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, newVehicleColor: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                              Odometer (km)
                            </label>
                            <input
                              type="number"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              value={jobForm.newVehicleOdometer}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, newVehicleOdometer: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                              Fuel Type
                            </label>
                            <select
                              className="wms-select-input"
                              style={{ width: '100%' }}
                              value={jobForm.newVehicleFuel}
                              onChange={(e) =>
                                setJobForm({
                                  ...jobForm,
                                  newVehicleFuel: e.target.value as Vehicle['fuelType'],
                                })
                              }
                            >
                              <option value="Petrol">Petrol</option>
                              <option value="Diesel">Diesel</option>
                              <option value="Electric">Electric</option>
                              <option value="Hybrid">Hybrid</option>
                              <option value="CNG">CNG</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                              VIN / Chassis #
                            </label>
                            <input
                              type="text"
                              className="table-search-input"
                              style={{ width: '100%', textTransform: 'uppercase' }}
                              value={jobForm.newVehicleVin}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, newVehicleVin: e.target.value.toUpperCase() })
                              }
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                              Year
                            </label>
                            <input
                              type="number"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              value={jobForm.newVehicleYear}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, newVehicleYear: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 2: DAMAGE INSPECTION & INSURANCE */}
                {jobModalSection === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                        Accident / Service Incident Description *
                      </label>
                      <textarea
                        rows={3}
                        className="table-search-input"
                        style={{ width: '100%', height: 'auto', padding: '10px 12px' }}
                        placeholder="Describe impact zones, accident details, or reason for workshop intake..."
                        value={jobForm.accidentDescription}
                        onChange={(e) =>
                          setJobForm({ ...jobForm, accidentDescription: e.target.value })
                        }
                      />
                    </div>

                    <div className="wms-form-grid-2">
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                          Customer Complaints (one per line or comma separated)
                        </label>
                        <textarea
                          rows={3}
                          className="table-search-input"
                          style={{ width: '100%', height: 'auto', padding: '10px 12px' }}
                          placeholder={'Front bumper cracked\nHeadlight misaligned\nVibration at 80 kmph'}
                          value={jobForm.customerComplaintsText}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, customerComplaintsText: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                          Visible Bay Inspection Damages (one per line or comma separated)
                        </label>
                        <textarea
                          rows={3}
                          className="table-search-input"
                          style={{ width: '100%', height: 'auto', padding: '10px 12px' }}
                          placeholder={'LH fender creased 20cm\nBonnet edge dented\nBracket snapped'}
                          value={jobForm.visibleDamagesText}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, visibleDamagesText: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                        Detailed Advisor Inspection Notes
                      </label>
                      <textarea
                        rows={2}
                        className="table-search-input"
                        style={{ width: '100%', height: 'auto', padding: '10px 12px' }}
                        placeholder="Mechanical / radiator / chassis apron observations and special instructions..."
                        value={jobForm.inspectionNotes}
                        onChange={(e) => setJobForm({ ...jobForm, inspectionNotes: e.target.value })}
                      />
                    </div>

                    {/* Insurance Block */}
                    <div
                      style={{
                        border: '1px solid #d9e8e6',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        background: '#f8fbfb',
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#045F60',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={jobForm.hasInsurance}
                          onChange={(e) => setJobForm({ ...jobForm, hasInsurance: e.target.checked })}
                        />
                        This Job Card is Under Insurance Claim (Cashless / Reimbursement)
                      </label>

                      {jobForm.hasInsurance && (
                        <div className="wms-form-grid-3" style={{ marginTop: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                              Insurance Company
                            </label>
                            <input
                              type="text"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              placeholder="ICICI Lombard / HDFC ERGO"
                              value={jobForm.insuranceProvider}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, insuranceProvider: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                              Policy Number
                            </label>
                            <input
                              type="text"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              value={jobForm.policyNumber}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, policyNumber: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                              Claim Number
                            </label>
                            <input
                              type="text"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              placeholder="CLM-2026-..."
                              value={jobForm.claimNumber}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, claimNumber: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                              Surveyor Name
                            </label>
                            <input
                              type="text"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              value={jobForm.surveyorName}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, surveyorName: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                              Surveyor Phone
                            </label>
                            <input
                              type="text"
                              className="table-search-input"
                              style={{ width: '100%' }}
                              value={jobForm.surveyorPhone}
                              onChange={(e) =>
                                setJobForm({ ...jobForm, surveyorPhone: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 3: ESTIMATE (18% GST) & INITIAL TASKS */}
                {jobModalSection === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="wms-form-grid-5">
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                          Labour (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="table-search-input"
                          style={{ width: '100%' }}
                          value={jobForm.labour}
                          onChange={(e) => setJobForm({ ...jobForm, labour: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                          Spare Parts (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="table-search-input"
                          style={{ width: '100%' }}
                          value={jobForm.spareParts}
                          onChange={(e) => setJobForm({ ...jobForm, spareParts: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                          Painting (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="table-search-input"
                          style={{ width: '100%' }}
                          value={jobForm.painting}
                          onChange={(e) => setJobForm({ ...jobForm, painting: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                          Consumables (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="table-search-input"
                          style={{ width: '100%' }}
                          value={jobForm.additionalCharges}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, additionalCharges: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                          Discount (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="table-search-input"
                          style={{ width: '100%' }}
                          value={jobForm.discount}
                          onChange={(e) => setJobForm({ ...jobForm, discount: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Live GST Calculation Summary Box */}
                    <div
                      style={{
                        background: '#f0fdfa',
                        border: '1px solid #045F60',
                        borderRadius: '8px',
                        padding: '14px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#334155' }}>
                        <div>
                          Taxable Subtotal:{' '}
                          <strong>₹{modalEstimateCalc.taxable.toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                          GST 18% (CGST 9% ₹{modalEstimateCalc.cgst.toLocaleString('en-IN')} + SGST
                          9% ₹{modalEstimateCalc.sgst.toLocaleString('en-IN')}):{' '}
                          <strong>₹{modalEstimateCalc.gst.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: '#045F60', fontWeight: '700' }}>
                          GRAND TOTAL ESTIMATE (INCL. 18% GST)
                        </span>
                        <div style={{ fontSize: '22px', fontWeight: '900', color: '#045F60' }}>
                          ₹{modalEstimateCalc.total.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Customer Approval Toggle */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px',
                        padding: '10px 14px',
                        background: '#fafdfc',
                        border: '1px solid #e2eeec',
                        borderRadius: '8px',
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={jobForm.customerApproved}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, customerApproved: e.target.checked })
                          }
                        />
                        Customer Has Approved Cost Estimate & Authorized Work
                      </label>
                      {jobForm.customerApproved && (
                        <input
                          type="date"
                          className="table-search-input"
                          style={{ width: '160px', minHeight: '34px' }}
                          value={jobForm.approvalDate || getDefaultDates().today}
                          onChange={(e) => setJobForm({ ...jobForm, approvalDate: e.target.value })}
                        />
                      )}
                    </div>

                    {/* Initial Floor Tasks Builder */}
                    <div
                      style={{
                        border: '1px solid #e2eeec',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        background: '#ffffff',
                      }}
                    >
                      <strong style={{ fontSize: '12px', color: '#045F60', display: 'block', marginBottom: '10px' }}>
                        PLANNED WORKSHOP REPAIR TASKS ({jobForm.tasks.length})
                      </strong>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <input
                          type="text"
                          className="table-search-input"
                          style={{ flex: '2', minWidth: 'min(180px, 100%)', height: '34px' }}
                          placeholder="Task title e.g. Front Bumper Replacement"
                          value={newTaskDraft.title}
                          onChange={(e) =>
                            setNewTaskDraft({ ...newTaskDraft, title: e.target.value })
                          }
                        />
                        <select
                          className="wms-select-input"
                          style={{ height: '34px' }}
                          value={newTaskDraft.department}
                          onChange={(e) =>
                            setNewTaskDraft({
                              ...newTaskDraft,
                              department: e.target.value as RepairTask['department'],
                            })
                          }
                        >
                          <option value="Denting">Denting</option>
                          <option value="Painting">Painting</option>
                          <option value="Mechanical">Mechanical</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Assembly">Assembly</option>
                          <option value="Detailing">Detailing</option>
                        </select>
                        <input
                          type="number"
                          className="table-search-input"
                          style={{ width: '75px', height: '34px' }}
                          placeholder="Hrs"
                          value={newTaskDraft.estimatedHours}
                          onChange={(e) =>
                            setNewTaskDraft({ ...newTaskDraft, estimatedHours: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          className="btn-secondary-action"
                          style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}
                          onClick={addDraftTaskToJobForm}
                        >
                          <Plus size={14} /> Add Task
                        </button>
                      </div>
                      {jobForm.tasks.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {jobForm.tasks.map((t) => (
                            <div
                              key={t.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '8px',
                                padding: '6px 10px',
                                background: '#f8fafc',
                                borderRadius: '6px',
                                fontSize: '12px',
                              }}
                            >
                              <div>
                                <strong>{t.title}</strong> ·{' '}
                                <span style={{ color: '#045F60' }}>{t.department}</span> ·{' '}
                                {t.estimatedHours} hrs
                              </div>
                              <button
                                type="button"
                                onClick={() => removeTaskFromJobForm(t.id)}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  color: '#8A181A',
                                  cursor: 'pointer',
                                }}
                                title="Remove task"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 4: SCHEDULE & SUPERVISOR HANDOVER */}
                {jobModalSection === 4 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="wms-form-grid-3">
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                          Intake Date
                        </label>
                        <input
                          type="date"
                          className="table-search-input"
                          style={{ width: '100%' }}
                          value={jobForm.intakeDate}
                          onChange={(e) => setJobForm({ ...jobForm, intakeDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                          Estimated Delivery Date
                        </label>
                        <input
                          type="date"
                          className="table-search-input"
                          style={{ width: '100%' }}
                          value={jobForm.estimatedCompletionDate}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, estimatedCompletionDate: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                          Job Priority
                        </label>
                        <select
                          className="wms-select-input"
                          style={{ width: '100%' }}
                          value={jobForm.priority}
                          onChange={(e) =>
                            setJobForm({
                              ...jobForm,
                              priority: e.target.value as JobFormState['priority'],
                            })
                          }
                        >
                          <option value="Normal">Normal Workflow</option>
                          <option value="Urgent">Urgent Priority</option>
                          <option value="Insurance Express">Insurance Express Claim</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                          Current Repair Stage
                        </label>
                        <select
                          className="wms-select-input"
                          style={{ width: '100%' }}
                          value={jobForm.currentStage}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, currentStage: e.target.value as RepairStage })
                          }
                        >
                          {ALL_13_STAGES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                          Job Status
                        </label>
                        <select
                          className="wms-select-input"
                          style={{ width: '100%' }}
                          value={jobForm.jobStatus}
                          onChange={(e) =>
                            setJobForm({
                              ...jobForm,
                              jobStatus: e.target.value as JobCard['jobStatus'],
                            })
                          }
                        >
                          <option value="Active">Active</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Completed">Completed</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                          Assigned Workshop Supervisor
                        </label>
                        <select
                          className="wms-select-input"
                          style={{ width: '100%' }}
                          value={jobForm.assignedSupervisorId}
                          onChange={(e) => {
                            const sup = supervisors.find((s) => (s.userId || s.id) === e.target.value);
                            setJobForm({
                              ...jobForm,
                              assignedSupervisorId: e.target.value,
                              assignedSupervisorName: sup?.name || 'Mahesh Jadhav',
                            });
                          }}
                        >
                          {supervisors.map((s) => (
                            <option key={s.id} value={s.userId || s.id}>
                              {s.name} ({s.designation})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div
                      style={{
                        border: '1px solid #045F60',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        background: '#f0fdfa',
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#045F60',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={jobForm.handoverToSupervisor}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, handoverToSupervisor: e.target.checked })
                          }
                        />
                        Handover to Supervisor ({jobForm.assignedSupervisorName}) immediately upon saving
                      </label>
                      <p style={{ fontSize: '11px', color: '#475569', marginTop: '4px', marginBottom: '8px' }}>
                        Leave unchecked if you want to save as an Advisor Intake/Estimate first and trigger handover later from the Supervisor Coordination tab.
                      </p>
                      <textarea
                        rows={2}
                        className="table-search-input"
                        style={{ width: '100%', height: 'auto', padding: '8px 12px', background: '#fff' }}
                        placeholder="Briefing notes for floor supervisor (optional)..."
                        value={jobForm.handoverNotes}
                        onChange={(e) => setJobForm({ ...jobForm, handoverNotes: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer wms-modal-footer-split">
                <div style={{ display: 'flex', gap: '8px' }}>
                  {jobModalSection > 1 && (
                    <button
                      type="button"
                      className="btn-secondary-action"
                      onClick={() =>
                        setJobModalSection((prev) => (prev - 1) as 1 | 2 | 3 | 4)
                      }
                    >
                      ← Previous Step
                    </button>
                  )}
                  {jobModalSection < 4 && (
                    <button
                      type="button"
                      className="btn-secondary-action"
                      style={{ borderColor: '#045F60', color: '#045F60' }}
                      onClick={() =>
                        setJobModalSection((prev) => (prev + 1) as 1 | 2 | 3 | 4)
                      }
                    >
                      Next Step →
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-secondary-action"
                    disabled={submittingJob}
                    onClick={() => setShowJobModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-action" disabled={submittingJob}>
                    {submittingJob ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Saving to MongoDB...
                      </>
                    ) : (
                      <>
                        <Check size={15} />{' '}
                        {jobModalMode === 'create' ? 'Create & Save Job Card' : 'Update Job Card'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL D: VIEW FULL JOB CARD                                    */}
      {/* ============================================================== */}
      {viewingJob && (
        <div className="wms-modal-backdrop" onClick={() => setViewingJob(null)}>
          <div
            className="wms-modal-card"
            style={{ maxWidth: '760px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="wms-header-badges">
                  <span className="stage-badge badge-warning">{viewingJob.currentStage}</span>
                  <span
                    className={`stage-badge ${
                      isJobHandedOver(viewingJob) ? 'badge-active' : 'badge-danger'
                    }`}
                  >
                    {isJobHandedOver(viewingJob)
                      ? `Handed Over (${viewingJob.assignedSupervisorName})`
                      : 'Pending Supervisor Handover'}
                  </span>
                </div>
                <h3>Job Card: {viewingJob.jobCardNumber}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setViewingJob(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div
                className="wms-form-grid-2"
                style={{
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <strong style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>
                    VEHICLE REGISTRATION
                  </strong>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#045F60' }}>
                    {viewingJob.vehicleRegistration}
                  </div>
                  <div>{viewingJob.vehicleModel}</div>
                </div>
                <div>
                  <strong style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>
                    CUSTOMER DETAILS
                  </strong>
                  <div style={{ fontWeight: '700' }}>{viewingJob.customerName}</div>
                  <div>{viewingJob.customerPhone}</div>
                </div>
                <div>
                  <strong style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>
                    INSURANCE & CLAIM
                  </strong>
                  <div>{viewingJob.inspection?.insuranceProvider || 'Self-Pay Customer'}</div>
                  {viewingJob.inspection?.claimNumber && (
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Claim #: {viewingJob.inspection.claimNumber}
                    </div>
                  )}
                </div>
                <div>
                  <strong style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>
                    ESTIMATED REPAIR COST
                  </strong>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: '#045F60' }}>
                    ₹{(viewingJob.costEstimate?.total || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Labour: ₹{(viewingJob.costEstimate?.labour || 0).toLocaleString('en-IN')} · Parts: ₹
                    {(viewingJob.costEstimate?.spareParts || 0).toLocaleString('en-IN')} · Paint: ₹
                    {(viewingJob.costEstimate?.painting || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '12px' }}>
                <strong style={{ fontSize: '12px', color: '#8A181A' }}>
                  ACCIDENT & DAMAGE DESCRIPTION
                </strong>
                <p
                  style={{
                    marginTop: '6px',
                    fontSize: '13px',
                    background: '#f8fafc',
                    padding: '10px 12px',
                    borderRadius: '6px',
                  }}
                >
                  {viewingJob.inspection?.accidentDescription || 'Not specified'}
                </p>
                {viewingJob.inspection?.inspectionNotes && (
                  <p style={{ marginTop: '6px', fontSize: '12px', color: '#475569' }}>
                    <strong>Inspection Notes:</strong> {viewingJob.inspection.inspectionNotes}
                  </p>
                )}
              </div>

              {viewingJob.stageHistory && viewingJob.stageHistory.length > 0 && (
                <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '14px' }}>
                  <strong style={{ fontSize: '12px', color: '#045F60' }}>
                    WORKFLOW & HANDOVER AUDIT TRAIL
                  </strong>
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {viewingJob.stageHistory.map((h, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 10px',
                          background: '#fafdfc',
                          border: '1px solid #e2eeec',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 10px' }}>
                          <strong>{h.stage}</strong>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>
                            {h.updatedBy} ·{' '}
                            {new Date(h.timestamp).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
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
                  const j = viewingJob;
                  setViewingJob(null);
                  openEditJobCard(j);
                }}
              >
                <Pencil size={14} /> Edit Job Card
              </button>
              {!isJobHandedOver(viewingJob) && (
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={() => {
                    const j = viewingJob;
                    setViewingJob(null);
                    openHandoverModal(j);
                  }}
                >
                  <Send size={14} /> Handover to Supervisor →
                </button>
              )}
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => setViewingJob(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL E: HANDOVER JOB CARD TO SUPERVISOR                       */}
      {/* ============================================================== */}
      {handoverJob && (
        <div
          className="wms-modal-backdrop"
          onClick={() => !submittingHandover && setHandoverJob(null)}
        >
          <div
            className="wms-modal-card"
            style={{ maxWidth: '620px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="wms-header-badges">
                  <span className="stage-badge badge-active">Floor Release Protocol</span>
                  <span className="stage-badge badge-info">{handoverJob.jobCardNumber}</span>
                </div>
                <h3>Handover Job Card to Workshop Supervisor</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={submittingHandover}
                onClick={() => setHandoverJob(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmHandover}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Summary Box */}
                <div
                  style={{
                    background: '#f0fdfa',
                    border: '1px solid #045F60',
                    borderRadius: '8px',
                    padding: '12px 16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#045F60' }}>
                        {handoverJob.vehicleRegistration}
                      </strong>{' '}
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>
                        ({handoverJob.vehicleModel})
                      </span>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                        Owner: {handoverJob.customerName} ({handoverJob.customerPhone}) · Est: ₹
                        {(handoverJob.costEstimate?.total || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <span
                      className={`stage-badge ${
                        handoverJob.customerApproved ? 'badge-active' : 'badge-warning'
                      }`}
                    >
                      {handoverJob.customerApproved ? 'Client Approved' : 'Approval Pending'}
                    </span>
                  </div>
                </div>

                {!handoverJob.customerApproved && (
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #f59e0b',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      fontSize: '12px',
                      color: '#92400e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span>
                      Note: Client estimate approval is still marked pending. You can hand over for initial dismantling/diagnosis or approve first via Edit.
                    </span>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Select Receiving Workshop Supervisor *
                  </label>
                  <select
                    className="wms-select-input"
                    style={{ width: '100%' }}
                    value={handoverSupId}
                    onChange={(e) => setHandoverSupId(e.target.value)}
                    required
                  >
                    {supervisors.map((sup) => (
                      <option key={sup.id} value={sup.userId || sup.id}>
                        {sup.name} — {sup.designation} ({sup.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Release Repair Floor Stage
                  </label>
                  <select
                    className="wms-select-input"
                    style={{ width: '100%' }}
                    value={handoverTargetStage}
                    onChange={(e) => setHandoverTargetStage(e.target.value as RepairStage)}
                  >
                    {ALL_13_STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Supervisor Handover Briefing & Bay Instructions *
                  </label>
                  <textarea
                    rows={3}
                    className="table-search-input"
                    style={{ width: '100%', height: 'auto', padding: '10px 12px' }}
                    placeholder="Specify special attention zones, insurance surveyor remarks, parts availability, or delivery deadline..."
                    value={handoverNoteText}
                    onChange={(e) => setHandoverNoteText(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  disabled={submittingHandover}
                  onClick={() => setHandoverJob(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action" disabled={submittingHandover}>
                  {submittingHandover ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Handing Over...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Confirm & Handover to Supervisor
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL F: CENTERED VALIDATION / ALERT POPUP CARD (OK BUTTON)    */}
      {/* ============================================================== */}
      {popupAlert && (
        <div
          className="wms-modal-backdrop"
          style={{
            zIndex: 1200,
            background: 'rgba(10, 25, 25, 0.62)',
            backdropFilter: 'blur(4px)',
          }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="advisor-popup-title"
          onClick={() => setPopupAlert(null)}
        >
          <div
            className="wms-modal-card"
            style={{
              maxWidth: '430px',
              borderRadius: '14px',
              border: '1px solid #d9e8e6',
              boxShadow: '0 24px 60px rgba(10, 25, 25, 0.28)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '28px 26px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#fff3cd',
                  border: '2px solid #f59e0b',
                  color: '#b45309',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <AlertTriangle size={26} />
              </div>

              <h3
                id="advisor-popup-title"
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '800',
                  color: '#141b1b',
                }}
              >
                {popupAlert.title}
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: 1.55,
                  color: '#475569',
                }}
              >
                {popupAlert.message}
              </p>
            </div>

            <div
              style={{
                padding: '14px 24px 22px',
                display: 'flex',
                justifyContent: 'center',
                background: '#fafdfc',
                borderTop: '1px solid #e2eeec',
              }}
            >
              <button
                type="button"
                autoFocus
                className="btn-primary-action"
                style={{
                  minWidth: '130px',
                  justifyContent: 'center',
                  padding: '9px 24px',
                  fontSize: '13px',
                  fontWeight: '700',
                }}
                onClick={() => setPopupAlert(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
