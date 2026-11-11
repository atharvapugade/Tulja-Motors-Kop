'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Car,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  Gauge,
  Hammer,
  Layers,
  Loader2,
  Lock,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import type {
  Employee,
  JobCard,
  QualityInspectionReport,
  RepairStage,
  RepairTask,
  UserRole,
  Vehicle,
} from '@/lib/models/types';

interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone?: string;
}

interface SupervisorDashboardProps {
  activeTab: string;
  employees: Employee[];
  loadingParent: boolean;
  onRefreshParent: () => Promise<void> | void;
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

export function isHandedOverForFloor(job: JobCard): boolean {
  if (job.handoverToSupervisor === true) return true;
  if (job.handoverToSupervisor === false) return false;
  return !PRE_FLOOR_STAGES.includes(job.currentStage);
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

function getPriorityBadgeClass(priority?: JobCard['priority'] | RepairTask['priority']): string {
  if (priority === 'Urgent' || priority === 'Critical') return 'badge-danger';
  if (priority === 'Insurance Express' || priority === 'High') return 'badge-purple';
  if (priority === 'Medium') return 'badge-warning';
  return 'badge-neutral';
}

function getQcStatus(job: JobCard): 'Pending' | 'Passed' | 'Rework Required' {
  return job.qualityInspection?.status || 'Pending';
}

function getQcBadgeClass(status: 'Pending' | 'Passed' | 'Rework Required'): string {
  if (status === 'Passed') return 'badge-active';
  if (status === 'Rework Required') return 'badge-danger';
  return 'badge-warning';
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

export default function SupervisorDashboard({
  activeTab,
  employees,
  loadingParent,
  onRefreshParent,
  onNotify,
}: SupervisorDashboardProps) {
  const currentTab =
    activeTab === 'stages' || activeTab === 'tasks' || activeTab === 'quality'
      ? activeTab
      : 'overview';

  // Authentication & Strict Supervisor Isolation State
  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState<AuthSessionUser | null>(null);
  const [authBlockedReason, setAuthBlockedReason] = useState<string | null>(null);

  // Admin-only preview selector (Super Admin can inspect Supervisor A vs B or All)
  const [adminViewSupervisorId, setAdminViewSupervisorId] = useState<string>('ALL');

  // Strictly Supervisor-Scoped Data
  const [scopedJobs, setScopedJobs] = useState<JobCard[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Scoped filter state automatically resets cleanly when switching tabs
  const [filters, setFilters] = useState<{
    tab: string;
    search: string;
    stage: string;
    priority: string;
    allocation: 'ALL' | 'NEEDS_ALLOCATION' | 'ALLOCATED';
    techId: string;
    dept: string;
    taskStatus: string;
    qcFilter: 'ALL' | 'NEEDS_QC' | 'PASSED' | 'REWORK' | 'PENDING';
  }>({
    tab: 'overview',
    search: '',
    stage: 'ALL',
    priority: 'ALL',
    allocation: 'ALL',
    techId: 'ALL',
    dept: 'ALL',
    taskStatus: 'ALL',
    qcFilter: 'ALL',
  });

  const activeFilters = useMemo(
    () =>
      filters.tab === currentTab
        ? filters
        : {
            tab: currentTab,
            search: '',
            stage: 'ALL',
            priority: 'ALL',
            allocation: 'ALL' as const,
            techId: 'ALL',
            dept: 'ALL',
            taskStatus: 'ALL',
            qcFilter: 'ALL' as const,
          },
    [filters, currentTab]
  );

  const patchFilters = (
    patch: Partial<{
      search: string;
      stage: string;
      priority: string;
      allocation: 'ALL' | 'NEEDS_ALLOCATION' | 'ALLOCATED';
      techId: string;
      dept: string;
      taskStatus: string;
      qcFilter: 'ALL' | 'NEEDS_QC' | 'PASSED' | 'REWORK' | 'PENDING';
    }>
  ) => {
    setFilters((prev) => ({
      ...(prev.tab === currentTab
        ? prev
        : {
            tab: currentTab,
            search: '',
            stage: 'ALL',
            priority: 'ALL',
            allocation: 'ALL' as const,
            techId: 'ALL',
            dept: 'ALL',
            taskStatus: 'ALL',
            qcFilter: 'ALL' as const,
          }),
      ...patch,
    }));
  };

  // Modals State
  const [dossierJob, setDossierJob] = useState<JobCard | null>(null);

  // Multi-Technician Task Allocation Modal
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
    designation: 'Bodyshop Paint & Denting Technician',
    salary: '30000',
  });

  // Stage Transition Modal
  const [stageJob, setStageJob] = useState<JobCard | null>(null);
  const [targetStage, setTargetStage] = useState<RepairStage>('Denting & Bodywork');
  const [targetJobStatus, setTargetJobStatus] = useState<JobCard['jobStatus']>('Active');
  const [stageNoteText, setStageNoteText] = useState('');
  const [savingStage, setSavingStage] = useState(false);

  // Structured 5-Point Quality Inspection Modal
  const [qcJob, setQcJob] = useState<JobCard | null>(null);
  const [qcChecklist, setQcChecklist] = useState<QualityInspectionReport['checklist']>({
    panelAlignment: false,
    paintFinishColorMatch: false,
    mechanicalRoadTest: false,
    electricalLightsSensors: false,
    waterLeakDetailing: false,
  });
  const [qcNotes, setQcNotes] = useState('');
  const [qcReworkStage, setQcReworkStage] = useState<RepairStage>('Denting & Bodywork');
  const [qcPassStage, setQcPassStage] = useState<RepairStage>('Final Approval');
  const [savingQc, setSavingQc] = useState(false);

  // Centered Alert Popup (Zero native browser alerts)
  const [popupAlert, setPopupAlert] = useState<{
    title: string;
    message: string;
    tone?: 'warning' | 'error' | 'info';
  } | null>(null);

  const showCenterPopup = (
    message: string,
    title = 'Action Required',
    tone: 'warning' | 'error' | 'info' = 'warning'
  ) => {
    setPopupAlert({ title, message, tone });
  };

  // Lists derived from employees
  const supervisors = useMemo(
    () =>
      employees
        .filter((e) => e.role === 'supervisor' || e.role === 'body_shop_manager')
        .sort((a, b) => a.name.localeCompare(b.name)),
    [employees]
  );

  const technicians = useMemo(
    () =>
      employees
        .filter((e) => e.role === 'technician' && e.status !== 'resigned' && e.status !== 'terminated')
        .sort((a, b) => a.name.localeCompare(b.name)),
    [employees]
  );

  const isOwnerMode =
    authUser?.role === 'super_admin' || authUser?.role === 'admin';

  const currentSupervisorEmployee = useMemo(() => {
    if (!authUser) return undefined;
    return employees.find(
      (e) =>
        e.userId === authUser.id ||
        e.email?.toLowerCase() === authUser.email?.toLowerCase()
    );
  }, [authUser, employees]);

  const fetchSupervisorWorkspaceData = useCallback(
    async (sessionUser: AuthSessionUser, ownerSelectedSupId: string) => {
      const params = new URLSearchParams({ handedOverOnly: 'true' });

      if (sessionUser.role === 'super_admin' || sessionUser.role === 'admin') {
        if (ownerSelectedSupId && ownerSelectedSupId !== 'ALL') {
          const targetSup = employees.find(
            (e) => (e.userId || e.id) === ownerSelectedSupId || e.id === ownerSelectedSupId
          );
          params.set('supervisorId', targetSup?.userId || ownerSelectedSupId);
          if (targetSup?.id) params.set('supervisorEmpId', targetSup.id);
          if (targetSup?.name) params.set('supervisorName', targetSup.name);
        }
      } else {
        // STRICT USER-SPECIFIC ISOLATION: Supervisor A NEVER receives Supervisor B's jobs
        const matchedEmp = employees.find(
          (e) =>
            e.userId === sessionUser.id ||
            e.email?.toLowerCase() === sessionUser.email?.toLowerCase()
        );
        params.set('supervisorId', sessionUser.id);
        if (matchedEmp?.id) {
          params.set('supervisorEmpId', matchedEmp.id);
        }
        if (sessionUser.name) {
          params.set('supervisorName', sessionUser.name);
        }
      }

      const [jobsRes, vehRes] = await Promise.all([
        fetch(`/api/job-cards?${params.toString()}`),
        fetch('/api/vehicles'),
      ]);
      const jobsData = await jobsRes.json();
      const vehData = await vehRes.json();

      let nextJobs: JobCard[] | null = null;
      if (jobsData.success && Array.isArray(jobsData.jobCards)) {
        let list: JobCard[] = jobsData.jobCards.filter((j: JobCard) => isHandedOverForFloor(j));

        // Secondary defense-in-depth client-side isolation
        if (sessionUser.role !== 'super_admin' && sessionUser.role !== 'admin') {
          const matchedEmp = employees.find(
            (e) =>
              e.userId === sessionUser.id ||
              e.email?.toLowerCase() === sessionUser.email?.toLowerCase()
          );
          const normName = sessionUser.name.toLowerCase().trim();
          list = list.filter((j) => {
            const idMatch =
              j.assignedSupervisorId === sessionUser.id ||
              (matchedEmp?.id && j.assignedSupervisorId === matchedEmp.id);
            const nameMatch =
              Boolean(normName) &&
              j.assignedSupervisorName?.toLowerCase().trim() === normName;
            return Boolean(idMatch || nameMatch);
          });
        }
        nextJobs = list;
      }

      const nextVehicles: Vehicle[] | null =
        vehData.success && Array.isArray(vehData.vehicles) ? vehData.vehicles : null;

      return { nextJobs, nextVehicles };
    },
    [employees]
  );

  // Verify active authenticated user on mount & establish strict user scope
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token =
          typeof window !== 'undefined' ? localStorage.getItem('tm_auth_token') : null;
        const res = await fetch('/api/auth/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!active) return;

        if (!res.ok || !data.authenticated || !data.user) {
          setAuthUser(null);
          setAuthBlockedReason(
            'Your supervisor session is not signed in or has expired. Sign in with your Workshop Supervisor account to view your assigned floor queue.'
          );
          setLoadingJobs(false);
          setAuthLoading(false);
          return;
        }

        const user: AuthSessionUser = data.user;
        const allowed: UserRole[] = ['supervisor', 'body_shop_manager', 'super_admin', 'admin'];
        if (!allowed.includes(user.role)) {
          setAuthUser(user);
          setAuthBlockedReason(
            `Signed in as "${user.name}" (${user.role.replace('_', ' ').toUpperCase()}). Supervisor Floor Portal requires a Workshop Supervisor account.`
          );
          setLoadingJobs(false);
          setAuthLoading(false);
          return;
        }

        setAuthUser(user);
        setAuthBlockedReason(null);
        setAuthLoading(false);
      } catch {
        if (!active) return;
        setAuthUser(null);
        setAuthBlockedReason(
          'Unable to verify your supervisor credentials. Please sign in again.'
        );
        setLoadingJobs(false);
        setAuthLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Load jobs whenever authenticated user, employee directory, or admin filter settles
  useEffect(() => {
    if (!authUser || authBlockedReason) return;
    let active = true;
    (async () => {
      try {
        const { nextJobs, nextVehicles } = await fetchSupervisorWorkspaceData(
          authUser,
          adminViewSupervisorId
        );
        if (!active) return;
        if (nextJobs) setScopedJobs(nextJobs);
        if (nextVehicles) setVehicles(nextVehicles);
      } catch (err) {
        console.error('Error loading supervisor jobs:', err);
      } finally {
        if (active) setLoadingJobs(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [authUser, authBlockedReason, adminViewSupervisorId, fetchSupervisorWorkspaceData]);

  const handleFullRefresh = async () => {
    await onRefreshParent();
    if (authUser && !authBlockedReason) {
      setLoadingJobs(true);
      try {
        const { nextJobs, nextVehicles } = await fetchSupervisorWorkspaceData(
          authUser,
          adminViewSupervisorId
        );
        if (nextJobs) setScopedJobs(nextJobs);
        if (nextVehicles) setVehicles(nextVehicles);
      } catch (err) {
        console.error('Error refreshing supervisor jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    }
  };

  // Helpers
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

      // Fallback if job has assignedTechnicianIds but no tasks recorded yet
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

  const getActorLabel = () => {
    if (!authUser) return 'Workshop Supervisor';
    if (isOwnerMode) return `${authUser.name} (Super Admin Oversight)`;
    return `${authUser.name} (Supervisor)`;
  };

  // Computed Supervisor KPIs
  const jobsNeedingTechs = useMemo(
    () =>
      scopedJobs.filter(
        (j) =>
          (j.tasks || []).length === 0 ||
          (j.tasks || []).some((t) => !t.assignedTechnicianId)
      ),
    [scopedJobs]
  );

  const totalOpenTasks = useMemo(
    () =>
      scopedJobs.reduce(
        (acc, j) => acc + (j.tasks || []).filter((t) => t.status !== 'Completed').length,
        0
      ),
    [scopedJobs]
  );

  const qcQueueJobs = useMemo(
    () =>
      scopedJobs.filter(
        (j) =>
          j.currentStage === 'Reassembly' ||
          j.currentStage === 'Quality Inspection' ||
          getQcStatus(j) === 'Rework Required'
      ),
    [scopedJobs]
  );

  const qcPassedCount = useMemo(
    () =>
      scopedJobs.filter(
        (j) =>
          getQcStatus(j) === 'Passed' ||
          j.currentStage === 'Final Approval' ||
          j.currentStage === 'Ready for Delivery' ||
          j.currentStage === 'Delivered'
      ).length,
    [scopedJobs]
  );

  const qcReworkCount = useMemo(
    () => scopedJobs.filter((j) => getQcStatus(j) === 'Rework Required').length,
    [scopedJobs]
  );

  // ==============================================================
  // HANDLERS: MULTI-TECHNICIAN ALLOCATION & TASKS
  // ==============================================================
  const openAllocateModal = (job: JobCard) => {
    setAllocJob(job);
    const cloned = (job.tasks || []).map((t) => ({
      ...t,
      assignedTechnicianId: t.assignedTechnicianId || technicians[0]?.userId || technicians[0]?.id || '',
      assignedTechnicianName: getTechName(
        t.assignedTechnicianId,
        t.assignedTechnicianName
      ),
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
        'Please enter a specific repair task title (e.g. "LH Fender Dent Pull", "Metallic Basecoat Painting", or "Front Strut Alignment").',
        'Task Title Required'
      );
      return;
    }
    if (!newTaskDraft.assignedTechnicianId) {
      showCenterPopup(
        'Please select a workshop technician to handle this work.',
        'Technician Selection Required'
      );
      return;
    }

    const techName = getTechName(newTaskDraft.assignedTechnicianId);
    const newTask: RepairTask = {
      id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      title: newTaskDraft.title.trim(),
      description:
        newTaskDraft.description.trim() ||
        `${newTaskDraft.department} bay assignment created by ${authUser?.name || 'Supervisor'}.`,
      department: newTaskDraft.department,
      assignedTechnicianId: newTaskDraft.assignedTechnicianId,
      assignedTechnicianName: techName,
      priority: newTaskDraft.priority,
      status: 'Pending',
      estimatedHours: Math.max(1, Number(newTaskDraft.estimatedHours) || 4),
    };

    setAllocTasks((prev) => [...prev, newTask]);
    setNewTaskDraft((prev) => ({
      ...prev,
      title: '',
      description: '',
    }));
  };

  const handleSaveMultiTechAllocation = async () => {
    if (!allocJob) return;
    if (allocTasks.length === 0) {
      showCenterPopup(
        'Please add at least one department repair task assigned to a technician before saving.',
        'At Least One Task Required'
      );
      return;
    }
    const missingTech = allocTasks.find((t) => !t.assignedTechnicianId);
    if (missingTech) {
      showCenterPopup(
        `Task "${missingTech.title}" does not have a technician assigned. Assign a specific technician to every task.`,
        'Technician Unassigned'
      );
      return;
    }

    setSavingAlloc(true);
    try {
      const normalizedTasks: RepairTask[] = allocTasks.map((t) => ({
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
          userRole: 'supervisor',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(
          data.message || 'Failed to save multi-technician task allocation.',
          'Save Failed',
          'error'
        );
        return;
      }

      setAllocJob(null);
      await handleFullRefresh();
      onNotify(
        `Allocated ${normalizedTasks.length} bay task(s) across ${uniqueTechIds.length} technician(s) on ${data.jobCard.jobCardNumber} (${data.jobCard.vehicleRegistration}).`
      );
    } catch (err: unknown) {
      showCenterPopup(
        'Network error saving technician allocation: ' +
          (err instanceof Error ? err.message : String(err)),
        'Connection Error',
        'error'
      );
    } finally {
      setSavingAlloc(false);
    }
  };

  // Inline quick update of a single task's status or assigned technician in Tab 3
  const handleInlineTaskUpdate = async (
    job: JobCard,
    taskId: string,
    patch: Partial<RepairTask>
  ) => {
    if (patch.assignedTechnicianId !== undefined && !patch.assignedTechnicianId) {
      showCenterPopup(
        'Each repair bay task must stay assigned to a workshop technician.',
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
          userRole: 'supervisor',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(data.message || 'Unable to update task.', 'Update Failed', 'error');
        return;
      }
      await handleFullRefresh();
      onNotify(`Updated task assignment on ${job.jobCardNumber}.`);
    } catch {
      showCenterPopup('Network error while updating technician task.', 'Connection Error', 'error');
    }
  };

  // Register New Technician into DB
  const handleRegisterTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechForm.name.trim() || !newTechForm.email.trim()) {
      showCenterPopup('Please enter the technician full name and email address.', 'Missing Details');
      return;
    }
    if (!newTechForm.password.trim()) {
      showCenterPopup('Please enter an initial login password for this technician.', 'Password Required');
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
          reportingManager: authUser?.name || 'Mahesh Jadhav',
          salary: Number(newTechForm.salary) || 30000,
          createdBy: getActorLabel(),
          userRole: 'supervisor',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(data.message || 'Unable to register technician.', 'Registration Failed', 'error');
        return;
      }
      setShowAddTechModal(false);
      setNewTechForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        designation: 'Bodyshop Paint & Denting Technician',
        salary: '30000',
      });
      await handleFullRefresh();
      onNotify(
        `Registered specialist technician "${data.employee.name}" (${data.employee.designation}) into database!`
      );
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
  // HANDLERS: 13-STAGE PROGRESSION
  // ==============================================================
  const openStageModal = (job: JobCard) => {
    const idx = ALL_13_STAGES.indexOf(job.currentStage);
    const suggestedNext =
      idx >= 0 && idx < ALL_13_STAGES.length - 1 ? ALL_13_STAGES[idx + 1] : job.currentStage;
    setStageJob(job);
    setTargetStage(suggestedNext);
    setTargetJobStatus(job.jobStatus);
    setStageNoteText('');
  };

  const handleQuickAdvanceStage = async (job: JobCard) => {
    const idx = ALL_13_STAGES.indexOf(job.currentStage);
    if (idx === ALL_13_STAGES.length - 1) {
      showCenterPopup(
        `${job.jobCardNumber} is already at the final stage (Delivered).`,
        'Workflow Complete',
        'info'
      );
      return;
    }
    const nextStage = ALL_13_STAGES[idx + 1];
    try {
      const res = await fetch('/api/job-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: job.id,
          currentStage: nextStage,
          jobStatus:
            nextStage === 'Delivered'
              ? 'Delivered'
              : nextStage === 'Ready for Delivery'
              ? 'Completed'
              : job.jobStatus,
          stageNote: `Supervisor ${authUser?.name || ''} progressed workflow from ${job.currentStage} to ${nextStage}.`.trim(),
          updatedBy: getActorLabel(),
          userRole: 'supervisor',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(data.message || 'Could not update repair stage.', 'Update Failed', 'error');
        return;
      }
      await handleFullRefresh();
      onNotify(`${job.jobCardNumber} moved to "${nextStage}".`);
    } catch {
      showCenterPopup('Network error advancing job stage.', 'Connection Error', 'error');
    }
  };

  const handleConfirmStageTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageJob) return;
    if (!stageNoteText.trim()) {
      showCenterPopup(
        'Please enter a short bay supervisor note explaining the work completed or reason for this stage change.',
        'Supervisor Note Required'
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
          userRole: 'supervisor',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(data.message || 'Stage update failed.', 'Error', 'error');
        return;
      }
      setStageJob(null);
      await handleFullRefresh();
      onNotify(
        `Job Card ${data.jobCard.jobCardNumber} transitioned to "${targetStage}" and logged in audit trail.`
      );
    } catch (err: unknown) {
      showCenterPopup(
        'Error updating stage: ' + (err instanceof Error ? err.message : String(err)),
        'Error',
        'error'
      );
    } finally {
      setSavingStage(false);
    }
  };

  // ==============================================================
  // HANDLERS: QUALITY INSPECTION (PASS / REWORK)
  // ==============================================================
  const openQcModal = (job: JobCard) => {
    setQcJob(job);
    const existing = job.qualityInspection;
    setQcChecklist(
      existing?.checklist || {
        panelAlignment: false,
        paintFinishColorMatch: false,
        mechanicalRoadTest: false,
        electricalLightsSensors: false,
        waterLeakDetailing: false,
      }
    );
    setQcNotes(existing?.notes || existing?.reworkReason || '');
    setQcReworkStage('Denting & Bodywork');
    setQcPassStage(
      job.currentStage === 'Final Approval' || job.currentStage === 'Ready for Delivery'
        ? job.currentStage
        : 'Final Approval'
    );
  };

  const handleSubmitQcDecision = async (decision: 'Passed' | 'Rework Required') => {
    if (!qcJob) return;

    if (decision === 'Passed') {
      const allChecked =
        qcChecklist.panelAlignment &&
        qcChecklist.paintFinishColorMatch &&
        qcChecklist.mechanicalRoadTest &&
        qcChecklist.electricalLightsSensors &&
        qcChecklist.waterLeakDetailing;

      if (!allChecked) {
        showCenterPopup(
          'All 5 Quality Inspection checkpoints (Panel Alignment, Paint Shade Match, Mechanical Road Test, Electrical & Sensors, and Water-Leak / Detailing) must be verified & checked before approving Final QC.',
          'Incomplete QC Checklist'
        );
        return;
      }
    } else if (!qcNotes.trim()) {
      showCenterPopup(
        'Please specify the rework defects or finishing observations before returning the vehicle to the repair bay.',
        'Rework Description Required'
      );
      return;
    }

    setSavingQc(true);
    try {
      const nowIso = new Date().toISOString();
      const targetNextStage = decision === 'Passed' ? qcPassStage : qcReworkStage;
      const report: QualityInspectionReport = {
        status: decision,
        inspectedBy: getActorLabel(),
        inspectedAt: nowIso,
        checklist: qcChecklist,
        notes:
          qcNotes.trim() ||
          (decision === 'Passed'
            ? 'All 5 workshop QC points inspected and cleared for delivery release.'
            : ''),
        reworkReason: decision === 'Rework Required' ? qcNotes.trim() : undefined,
      };

      const res = await fetch('/api/job-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: qcJob.id,
          currentStage: targetNextStage,
          jobStatus: decision === 'Passed' && targetNextStage === 'Ready for Delivery' ? 'Completed' : 'Active',
          qualityInspection: report,
          stageNote:
            decision === 'Passed'
              ? `5-Point QC PASSED by ${authUser?.name || 'Supervisor'}. ${report.notes || ''}`.trim()
              : `QC REWORK FLAGGED (${qcReworkStage}): ${qcNotes.trim()}`,
          updatedBy: getActorLabel(),
          userRole: 'supervisor',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showCenterPopup(data.message || 'Unable to save Quality Inspection.', 'QC Save Failed', 'error');
        return;
      }

      setQcJob(null);
      await handleFullRefresh();
      onNotify(
        decision === 'Passed'
          ? `QC PASSED on ${data.jobCard.jobCardNumber}! Released to "${targetNextStage}".`
          : `QC Rework flagged on ${data.jobCard.jobCardNumber}. Returned to "${qcReworkStage}".`
      );
    } catch (err: unknown) {
      showCenterPopup(
        'Network error saving Quality Inspection: ' +
          (err instanceof Error ? err.message : String(err)),
        'Connection Error',
        'error'
      );
    } finally {
      setSavingQc(false);
    }
  };

  // Filtered Views per Tab
  const filteredJobs = useMemo(() => {
    const q = activeFilters.search.toLowerCase();
    return scopedJobs.filter((j) => {
      const matchesSearch =
        !q ||
        j.jobCardNumber.toLowerCase().includes(q) ||
        j.vehicleRegistration.toLowerCase().includes(q) ||
        j.vehicleModel.toLowerCase().includes(q) ||
        j.customerName.toLowerCase().includes(q) ||
        (j.advisorName || '').toLowerCase().includes(q) ||
        (j.handoverNotes || '').toLowerCase().includes(q) ||
        (j.tasks || []).some(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            getTechName(t.assignedTechnicianId, t.assignedTechnicianName).toLowerCase().includes(q)
        );
      const matchesStage = activeFilters.stage === 'ALL' || j.currentStage === activeFilters.stage;
      const matchesPriority =
        activeFilters.priority === 'ALL' || (j.priority || 'Normal') === activeFilters.priority;
      const hasAllocation =
        (j.tasks || []).length > 0 && (j.tasks || []).every((t) => Boolean(t.assignedTechnicianId));
      const matchesAlloc =
        activeFilters.allocation === 'ALL' ||
        (activeFilters.allocation === 'NEEDS_ALLOCATION' && !hasAllocation) ||
        (activeFilters.allocation === 'ALLOCATED' && hasAllocation);

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

      const qcSt = getQcStatus(j);
      const matchesQc =
        activeFilters.qcFilter === 'ALL' ||
        (activeFilters.qcFilter === 'NEEDS_QC' &&
          (j.currentStage === 'Reassembly' ||
            j.currentStage === 'Quality Inspection' ||
            qcSt === 'Rework Required')) ||
        (activeFilters.qcFilter === 'PASSED' && qcSt === 'Passed') ||
        (activeFilters.qcFilter === 'REWORK' && qcSt === 'Rework Required') ||
        (activeFilters.qcFilter === 'PENDING' && qcSt === 'Pending');

      return (
        matchesSearch &&
        matchesStage &&
        matchesPriority &&
        matchesAlloc &&
        matchesTech &&
        matchesDept &&
        matchesTaskStatus &&
        matchesQc
      );
    });
  }, [scopedJobs, activeFilters, getTechName]);

  // Sorted QC queue: Quality Inspection / Rework Required / Reassembly first
  const sortedQcJobs = useMemo(() => {
    const score = (j: JobCard) => {
      if (getQcStatus(j) === 'Rework Required') return 0;
      if (j.currentStage === 'Quality Inspection') return 1;
      if (j.currentStage === 'Reassembly') return 2;
      if (getQcStatus(j) === 'Passed') return 4;
      return 3;
    };
    return [...filteredJobs].sort((a, b) => score(a) - score(b));
  }, [filteredJobs]);

  // Shared 4-Tab Pill Bar matching DashboardLayout Supervisor Navigation
  const renderTabNavBar = () => (
    <div className="wms-tab-nav-bar">
      <Link
        href="/panels/supervisor/dashboard"
        className={`wms-tab-pill-btn ${currentTab === 'overview' ? 'active' : ''}`}
      >
        <ClipboardList size={15} /> Floor Supervision ({scopedJobs.length})
      </Link>
      <Link
        href="/panels/supervisor/dashboard?tab=stages"
        className={`wms-tab-pill-btn ${currentTab === 'stages' ? 'active' : ''}`}
      >
        <Layers size={15} /> 13-Stage Repair Board
      </Link>
      <Link
        href="/panels/supervisor/dashboard?tab=tasks"
        className={`wms-tab-pill-btn ${currentTab === 'tasks' ? 'active' : ''}`}
      >
        <Hammer size={15} /> Technicians Team Allocation ({totalOpenTasks} Open Tasks)
      </Link>
      <Link
        href="/panels/supervisor/dashboard?tab=quality"
        className={`wms-tab-pill-btn ${currentTab === 'quality' ? 'active' : ''}`}
      >
        <CheckCircle2 size={15} /> Quality Inspection ({qcQueueJobs.length} Queue)
      </Link>
    </div>
  );

  // Supervisor Identity & Isolation Banner (plus Super Admin Oversight dropdown when signed in as owner)
  const renderScopeBanner = () => (
    <div
      style={{
        background: isOwnerMode ? '#f3e8ff' : '#eef7f6',
        border: isOwnerMode ? '1px solid #d8b4fe' : '1px solid #cce3e0',
        borderRadius: '10px',
        padding: '10px 16px',
        marginBottom: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isOwnerMode ? '#6b21a8' : '#045F60' }}>
        <Lock size={15} style={{ flexShrink: 0 }} />
        {isOwnerMode ? (
          <span>
            <strong>Super Admin Oversight Mode ({authUser?.name}):</strong> Inspect all handed-over floor jobs or filter to verify individual supervisor isolation.
          </span>
        ) : (
          <span>
            <strong>Private Supervisor Queue ({authUser?.name}):</strong> Strictly isolated to job cards handed over directly to{' '}
            <strong>{authUser?.name}</strong>
            {currentSupervisorEmployee?.designation ? ` (${currentSupervisorEmployee.designation})` : ''}. Other supervisors&rsquo; queues are hidden.
          </span>
        )}
      </div>

      {isOwnerMode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', maxWidth: '100%' }}>
          <strong style={{ color: '#6b21a8' }}>Preview Supervisor Queue:</strong>
          <select
            className="wms-select-input"
            style={{ height: '32px', fontSize: '12px', maxWidth: '100%' }}
            value={adminViewSupervisorId}
            onChange={(e) => setAdminViewSupervisorId(e.target.value)}
          >
            <option value="ALL">All Supervisors (Combined Oversight)</option>
            {supervisors.map((sup) => (
              <option key={sup.id} value={sup.userId || sup.id}>
                {sup.name} ({sup.designation})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  // Loading / Auth Gate Render
  if (authLoading) {
    return (
      <div className="wms-panel-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <Loader2 size={28} className="animate-spin" color="#045F60" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontWeight: '700', color: '#045F60', fontSize: '14px' }}>
          Verifying Workshop Supervisor Session &amp; Queue Permissions...
        </div>
      </div>
    );
  }

  if (authBlockedReason || !authUser) {
    return (
      <div
        className="wms-panel-card"
        style={{
          maxWidth: '580px',
          margin: '32px auto',
          padding: '36px 28px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#fbebed',
            color: '#8A181A',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 16px',
          }}
        >
          <ShieldAlert size={26} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#141b1b', marginBottom: '8px' }}>
          Workshop Supervisor Sign-In Required
        </h2>
        <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '22px' }}>
          {authBlockedReason ||
            'Each supervisor queue is strictly user-specific so supervisors only access job cards handed over to them.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/panels/supervisor" className="btn-primary-action" style={{ textDecoration: 'none' }}>
            Sign In to Supervisor Portal →
          </Link>
          <Link href="/panels" className="btn-secondary-action" style={{ textDecoration: 'none' }}>
            Back to All Panels
          </Link>
        </div>
      </div>
    );
  }

  const isBusy = loadingJobs || loadingParent;

  return (
    <div>
      {/* ============================================================== */}
      {/* TAB 1: FLOOR SUPERVISION (DEFAULT /panels/supervisor/dashboard)*/}
      {/* ============================================================== */}
      {currentTab === 'overview' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <div className="wms-header-badges">
                <span className="stage-badge badge-danger">Workshop Floor Supervision</span>
                <span className="stage-badge badge-active">{authUser.name}</span>
              </div>
              <h1>Floor Supervision &amp; Advisor Handovers</h1>
              <p>
                Workshop Supervisor <strong>{authUser.name}</strong> • Inspect full Service Advisor dossiers, assign multi-trade technicians per vehicle, track 13 repair bays, and certify Quality Inspection.
              </p>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-secondary-action"
                onClick={handleFullRefresh}
                title="Refresh Handed-Over Queue"
              >
                <RefreshCw size={15} /> Refresh Queue
              </button>
              <Link
                href="/panels/supervisor/dashboard?tab=tasks"
                className="btn-primary-action"
                style={{ textDecoration: 'none' }}
              >
                <Hammer size={15} /> Allocate Technicians
              </Link>
            </div>
          </div>

          {renderScopeBanner()}
          {renderTabNavBar()}

          {/* 4 Supervisor KPI Cards */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Handed-Over Jobs</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <Car size={20} />
                </div>
              </div>
              <div className="stat-card-value">{isBusy ? '...' : scopedJobs.length}</div>
              <div className="stat-card-subtext">
                <span className="stat-trend-up">
                  {scopedJobs.filter((j) => j.jobStatus === 'Active').length} active
                </span>{' '}
                in your bays
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Needs Tech Allocation</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <UserCheck size={20} />
                </div>
              </div>
              <div className="stat-card-value">{isBusy ? '...' : jobsNeedingTechs.length}</div>
              <div className="stat-card-subtext" style={{ color: jobsNeedingTechs.length > 0 ? '#8A181A' : undefined }}>
                {jobsNeedingTechs.length > 0 ? 'Requires technician crew setup' : 'All jobs allocated'}
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Open Multi-Tech Tasks</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <Wrench size={20} />
                </div>
              </div>
              <div className="stat-card-value">{isBusy ? '...' : totalOpenTasks}</div>
              <div className="stat-card-subtext">
                Across {technicians.length} workshop technicians
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Quality Check Queue</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <ClipboardCheck size={20} />
                </div>
              </div>
              <div className="stat-card-value">{isBusy ? '...' : qcQueueJobs.length}</div>
              <div className="stat-card-subtext">
                {qcPassedCount} passed · {qcReworkCount} rework flagged
              </div>
            </div>
          </div>

          {/* 4-Step Supervisor Workflow Banner */}
          <div className="wms-panel-card" style={{ marginBottom: '24px' }}>
            <div className="panel-card-header">
              <div>
                <h3>Supervisor Handover-to-Delivery Floor Workflow</h3>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  Review complete Service Advisor intake dossiers and orchestrate your specialized technician crews across bays.
                </p>
              </div>
              <span className="stage-badge badge-info">Floor Execution Standard</span>
            </div>
            <div className="wms-workflow-grid" style={{ padding: '18px 20px' }}>
              <div
                style={{
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
                  <FileText size={16} color="#045F60" />
                </div>
                <strong style={{ fontSize: '14px', color: '#141b1b' }}>Inspect Handover Dossier</strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Review Advisor damage notes, customer complaints &amp; claims ({scopedJobs.length} jobs)
                </span>
              </div>

              <Link
                href="/panels/supervisor/dashboard?tab=tasks"
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
                  <span className="stage-badge badge-danger">Step 2</span>
                  <Hammer size={16} color="#8A181A" />
                </div>
                <strong style={{ fontSize: '14px', color: '#141b1b' }}>Multi-Tech Allocation</strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Assign Denters, Painters, Mechanics &amp; Electrical techs per vehicle ({jobsNeedingTechs.length} pending)
                </span>
              </Link>

              <Link
                href="/panels/supervisor/dashboard?tab=stages"
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
                  <Layers size={16} color="#b45309" />
                </div>
                <strong style={{ fontSize: '14px', color: '#141b1b' }}>13-Stage Repair Board</strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Advance bays &amp; log stage history notes across repair bays
                </span>
              </Link>

              <Link
                href="/panels/supervisor/dashboard?tab=quality"
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
                  <CheckCircle2 size={16} color="#045F60" />
                </div>
                <strong style={{ fontSize: '14px', color: '#045F60' }}>5-Point Quality Inspection</strong>
                <span style={{ fontSize: '12px', color: '#475569' }}>
                  Certify final delivery readiness or return to bay for rework
                </span>
              </Link>
            </div>
          </div>

          {/* Search & Quick Filters */}
          <div className="wms-filter-bar">
            <div className="wms-filter-controls">
              <input
                type="text"
                className="table-search-input"
                placeholder="Search job #, reg #, customer, handover note..."
                value={activeFilters.search}
                onChange={(e) => patchFilters({ search: e.target.value })}
              />
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
              <select
                className="wms-select-input"
                value={activeFilters.allocation}
                onChange={(e) =>
                  patchFilters({
                    allocation: e.target.value as 'ALL' | 'NEEDS_ALLOCATION' | 'ALLOCATED',
                  })
                }
              >
                <option value="ALL">All Tech Allocations</option>
                <option value="NEEDS_ALLOCATION">Needs Technician Allocation</option>
                <option value="ALLOCATED">Technicians Allocated</option>
              </select>
            </div>
            <span className="stage-badge badge-info">
              Showing {filteredJobs.length} of {scopedJobs.length} Handed-Over Jobs
            </span>
          </div>

          {/* Main Handed-Over Job Cards Table */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <div>
                <h3>Handed-Over Job Cards &amp; Advisor Work Details</h3>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  Open any job card to read Advisor damage inspection &amp; insurance details, or assign multiple trade technicians directly.
                </p>
              </div>
              <span className="stage-badge badge-active">Scoped to {isOwnerMode && adminViewSupervisorId === 'ALL' ? 'All Floor Supervisors' : authUser.name}</span>
            </div>

            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Job Card #</th>
                    <th>Vehicle &amp; Customer</th>
                    <th>Advisor Handover &amp; Damage Scope</th>
                    <th>Stage &amp; Delivery</th>
                    <th>Allocated Technicians Crew</th>
                    <th>QC Status</th>
                    <th>Supervisor Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: '#141b1b', marginBottom: '4px' }}>
                          No handed-over job cards found in your queue
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          {scopedJobs.length === 0
                            ? `No vehicles have been handed over to ${authUser.name} yet. When a Service Advisor hands over a job card to you, it appears here immediately.`
                            : 'Try clearing your search or filter selections above.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => {
                      const crew = getUniqueAssignedTechsForJob(job);
                      const qcSt = getQcStatus(job);
                      const doneTasks = (job.tasks || []).filter((t) => t.status === 'Completed').length;
                      const totalTasks = (job.tasks || []).length;

                      return (
                        <tr key={job.id}>
                          <td>
                            <code>{job.jobCardNumber}</code>
                            <div style={{ marginTop: '4px' }}>
                              <span className={`stage-badge ${getPriorityBadgeClass(job.priority)}`} style={{ fontSize: '10px' }}>
                                {job.priority || 'Normal'}
                              </span>
                            </div>
                          </td>

                          <td>
                            <strong style={{ color: '#045F60', fontSize: '14px' }}>
                              {job.vehicleRegistration}
                            </strong>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#141b1b' }}>
                              {job.vehicleModel}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {job.customerName} · {job.customerPhone}
                            </div>
                          </td>

                          <td style={{ maxWidth: '290px' }}>
                            <div style={{ fontSize: '11px', color: '#045F60', fontWeight: '700', marginBottom: '3px' }}>
                              Advisor: {job.advisorName || 'Amit Kulkarni'}
                              {job.handoverDate
                                ? ` · ${new Date(job.handoverDate).toLocaleDateString('en-IN')}`
                                : ''}
                            </div>
                            <div
                              style={{
                                fontSize: '12px',
                                color: '#334155',
                                background: '#f8fafc',
                                borderLeft: '3px solid #045F60',
                                padding: '5px 8px',
                                borderRadius: '4px',
                                marginBottom: '4px',
                              }}
                            >
                              {job.handoverNotes ||
                                job.inspection?.accidentDescription ||
                                'Ready for floor repair inspection'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {(job.inspection?.customerComplaints || []).length} complaint(s) ·{' '}
                              {(job.inspection?.visibleDamages || []).length} damage(s)
                              {job.inspection?.insuranceProvider
                                ? ` · Claim: ${job.inspection.insuranceProvider}`
                                : ''}
                            </div>
                          </td>

                          <td>
                            <span className="stage-badge badge-warning">{job.currentStage}</span>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                              Est. Delivery: <strong>{job.estimatedCompletionDate}</strong>
                            </div>
                            <div style={{ fontSize: '11px', color: '#045F60', fontWeight: '700' }}>
                              ₹{(job.costEstimate?.total || 0).toLocaleString('en-IN')}
                            </div>
                          </td>

                          <td style={{ minWidth: '190px' }}>
                            {crew.length === 0 ? (
                              <span className="stage-badge badge-danger">Unassigned — Allocate</span>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {crew.map((member) => (
                                    <span
                                      key={member.id}
                                      className="stage-badge badge-info"
                                      style={{ fontSize: '10px', padding: '3px 8px' }}
                                    >
                                      {member.name}
                                      {member.departments.length > 0
                                        ? ` (${member.departments.join('/')})`
                                        : ''}
                                    </span>
                                  ))}
                                </div>
                                <div style={{ fontSize: '11px', color: '#475569' }}>
                                  {doneTasks}/{totalTasks} tasks done
                                </div>
                              </div>
                            )}
                          </td>

                          <td>
                            <span className={`stage-badge ${getQcBadgeClass(qcSt)}`}>
                              {qcSt === 'Passed'
                                ? '✓ QC Passed'
                                : qcSt === 'Rework Required'
                                ? '⚠ Rework'
                                : 'Pending QC'}
                            </span>
                          </td>

                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 9px', fontSize: '11px' }}
                                onClick={() => setDossierJob(job)}
                              >
                                <Eye size={13} /> Dossier
                              </button>
                              <button
                                type="button"
                                className="btn-primary-action"
                                style={{ padding: '5px 10px', fontSize: '11px' }}
                                onClick={() => openAllocateModal(job)}
                              >
                                <Users size={13} /> Assign Techs
                              </button>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 9px', fontSize: '11px' }}
                                onClick={() => openStageModal(job)}
                              >
                                <ArrowRight size={13} /> Stage
                              </button>
                              {(job.currentStage === 'Reassembly' ||
                                job.currentStage === 'Quality Inspection' ||
                                qcSt === 'Rework Required') && (
                                <button
                                  type="button"
                                  className="btn-secondary-action"
                                  style={{
                                    padding: '5px 9px',
                                    fontSize: '11px',
                                    borderColor: '#8A181A',
                                    color: '#8A181A',
                                  }}
                                  onClick={() => openQcModal(job)}
                                >
                                  <ClipboardCheck size={13} /> Inspect QC
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

          {/* Bottom 2-Column Operational Feed */}
          <div className="wms-grid-2col">
            {/* Advisor Handover Briefings */}
            <div className="wms-panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-card-header">
                <h3>Latest Advisor Handover Briefings</h3>
                <Sparkles size={16} color="#045F60" />
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {scopedJobs.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#64748b' }}>No handover briefings waiting.</p>
                ) : (
                  scopedJobs.slice(0, 4).map((job) => (
                    <div
                      key={job.id}
                      style={{
                        border: '1px solid #e2eeec',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        background: '#fafdfc',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ color: '#045F60', fontSize: '13px' }}>
                            {job.jobCardNumber} · {job.vehicleRegistration}
                          </strong>
                          <span style={{ fontSize: '12px', color: '#475569', marginLeft: '6px' }}>
                            ({job.vehicleModel})
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-secondary-action"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                          onClick={() => setDossierJob(job)}
                        >
                          Read Full Brief
                        </button>
                      </div>
                      <p style={{ fontSize: '12px', color: '#334155', margin: '4px 0' }}>
                        &ldquo;{job.handoverNotes || job.inspection?.accidentDescription || 'No extra note'}&rdquo;
                      </p>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        From: <strong>{job.advisorName || 'Service Advisor'}</strong> · Target Stage:{' '}
                        <strong>{job.currentStage}</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Specialist Technicians Crew Workload */}
            <div className="wms-panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-card-header">
                <h3>Technician Bay Capacity</h3>
                <Link
                  href="/panels/supervisor/dashboard?tab=tasks"
                  style={{ fontSize: '12px', fontWeight: '700', color: '#045F60', textDecoration: 'none' }}
                >
                  Open Allocation Matrix →
                </Link>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {technicians.map((tech) => {
                  const techKey = tech.userId || tech.id;
                  const techTasks = scopedJobs.flatMap((j) =>
                    (j.tasks || []).filter((t) => t.assignedTechnicianId === techKey || t.assignedTechnicianId === tech.id)
                  );
                  const activeCount = techTasks.filter((t) => t.status !== 'Completed').length;
                  const doneCount = techTasks.filter((t) => t.status === 'Completed').length;
                  return (
                    <div
                      key={tech.id}
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
                          {tech.name.charAt(0)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: '13px', display: 'block' }}>{tech.name}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>
                            {tech.designation} · {tech.phone}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`stage-badge ${activeCount > 0 ? 'badge-warning' : 'badge-active'}`}>
                          {activeCount} Active Tasks
                        </span>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {doneCount} completed
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: 13-STAGE REPAIR BOARD (?tab=stages)                     */}
      {/* ============================================================== */}
      {currentTab === 'stages' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <div className="wms-header-badges">
                <span className="stage-badge badge-info">Bay Progression Control</span>
                <span className="stage-badge badge-active">13 Standardized Stages</span>
              </div>
              <h1>13-Stage Repair Workflow Board</h1>
              <p>
                Supervisor <strong>{authUser.name}</strong> • Click any stage tile to filter vehicles, track multi-tech task readiness, and advance bay stages with audit notes.
              </p>
            </div>

            <div className="workspace-actions">
              <button type="button" className="btn-secondary-action" onClick={handleFullRefresh}>
                <RefreshCw size={15} /> Refresh Board
              </button>
            </div>
          </div>

          {renderScopeBanner()}
          {renderTabNavBar()}

          {/* 4 Stage Board KPI Cards */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">In Active Floor Bays</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <Layers size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {isBusy
                  ? '...'
                  : scopedJobs.filter((j) => FLOOR_BAY_STAGES.includes(j.currentStage)).length}
              </div>
              <div className="stat-card-subtext">Dismantling through QC bays</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Denting &amp; Painting Bays</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <Wrench size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {isBusy
                  ? '...'
                  : scopedJobs.filter(
                      (j) =>
                        j.currentStage === 'Denting & Bodywork' || j.currentStage === 'Painting'
                    ).length}
              </div>
              <div className="stat-card-subtext">Active body &amp; booth vehicles</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Reassembly &amp; QC Gate</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <Clock size={20} />
                </div>
              </div>
              <div className="stat-card-value">{isBusy ? '...' : qcQueueJobs.length}</div>
              <div className="stat-card-subtext">Ready for final inspection</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Ready / Delivered</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {isBusy
                  ? '...'
                  : scopedJobs.filter(
                      (j) =>
                        j.currentStage === 'Final Approval' ||
                        j.currentStage === 'Ready for Delivery' ||
                        j.currentStage === 'Delivered'
                    ).length}
              </div>
              <div className="stat-card-subtext">Cleared workshop pipeline</div>
            </div>
          </div>

          {/* Interactive 13-Stage Floor Board */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <div>
                <h3>Live Workshop Bay Pipeline (Click Any Stage to Filter)</h3>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  {activeFilters.stage === 'ALL'
                    ? 'Showing all repair stages in your supervisor queue.'
                    : `Filtered strictly to stage: "${activeFilters.stage}"`}
                </p>
              </div>
              {activeFilters.stage !== 'ALL' && (
                <button
                  type="button"
                  className="btn-secondary-action"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => patchFilters({ stage: 'ALL' })}
                >
                  Clear Stage Filter ×
                </button>
              )}
            </div>

            <div style={{ padding: '18px 20px' }}>
              <div className="wms-stage-board-grid">
                {ALL_13_STAGES.map((stg, idx) => {
                  const count = scopedJobs.filter((j) => j.currentStage === stg).length;
                  const isSelected = activeFilters.stage === stg;
                  const isFloorStage = FLOOR_BAY_STAGES.includes(stg);

                  return (
                    <button
                      key={stg}
                      type="button"
                      onClick={() =>
                        patchFilters({ stage: isSelected ? 'ALL' : stg })
                      }
                      style={{
                        cursor: 'pointer',
                        background: isSelected
                          ? '#8A181A'
                          : count > 0
                          ? '#045F60'
                          : isFloorStage
                          ? '#f8faf9'
                          : '#fcfcfd',
                        color: isSelected || count > 0 ? '#ffffff' : '#5e6d6d',
                        border: isSelected
                          ? '2px solid #F7C21F'
                          : count > 0
                          ? '1px solid #045F60'
                          : '1px solid #e0e9e8',
                        borderRadius: '8px',
                        padding: '10px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s',
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
                        <div style={{ marginTop: '6px', fontSize: '11px', opacity: 0.65 }}>0 active</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search & Stage Filters */}
          <div className="wms-filter-bar">
            <div className="wms-filter-controls">
              <input
                type="text"
                className="table-search-input"
                placeholder="Search job #, reg #, vehicle..."
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
                value={activeFilters.priority}
                onChange={(e) => patchFilters({ priority: e.target.value })}
              >
                <option value="ALL">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="Insurance Express">Insurance Express</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
            <span className="stage-badge badge-info">{filteredJobs.length} Matching Vehicles</span>
          </div>

          {/* Stage Transition Table */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>Floor Vehicles &amp; Stage Transition Controls</h3>
              <span className="stage-badge badge-neutral">Audit Logged Stage Changes</span>
            </div>

            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Job Card #</th>
                    <th>Vehicle &amp; Customer</th>
                    <th>Stage Progress</th>
                    <th>Allocated Technicians</th>
                    <th>Task Progress</th>
                    <th>Last Stage History Note</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                        No vehicles match the selected repair stage or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => {
                      const stageIdx = Math.max(0, ALL_13_STAGES.indexOf(job.currentStage));
                      const pct = Math.round(((stageIdx + 1) / ALL_13_STAGES.length) * 100);
                      const crew = getUniqueAssignedTechsForJob(job);
                      const totalT = (job.tasks || []).length;
                      const doneT = (job.tasks || []).filter((t) => t.status === 'Completed').length;
                      const lastHistory =
                        job.stageHistory && job.stageHistory.length > 0
                          ? job.stageHistory[job.stageHistory.length - 1]
                          : null;

                      return (
                        <tr key={job.id}>
                          <td>
                            <code>{job.jobCardNumber}</code>
                            <div style={{ marginTop: '4px' }}>
                              <span className={`stage-badge ${getPriorityBadgeClass(job.priority)}`} style={{ fontSize: '10px' }}>
                                {job.priority || 'Normal'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: '#045F60' }}>{job.vehicleRegistration}</strong>
                            <div style={{ fontSize: '12px' }}>{job.vehicleModel}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{job.customerName}</div>
                          </td>
                          <td style={{ minWidth: '190px' }}>
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
                              Step {stageIdx + 1} of 13 ({pct}%)
                            </div>
                          </td>
                          <td>
                            {crew.length === 0 ? (
                              <span className="stage-badge badge-danger">No Crew Yet</span>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                                {crew.map((c) => (
                                  <span key={c.id} className="stage-badge badge-info" style={{ fontSize: '10px' }}>
                                    {c.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td>
                            <strong>
                              {doneT} / {totalT}
                            </strong>{' '}
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Tasks</span>
                          </td>
                          <td style={{ maxWidth: '240px', fontSize: '12px', color: '#475569' }}>
                            {lastHistory ? (
                              <>
                                <div>{lastHistory.notes || `Moved to ${lastHistory.stage}`}</div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                                  by {lastHistory.updatedBy}
                                </div>
                              </>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {stageIdx < ALL_13_STAGES.length - 1 && (
                                <button
                                  type="button"
                                  className="btn-primary-action"
                                  style={{ padding: '5px 10px', fontSize: '11px' }}
                                  onClick={() => handleQuickAdvanceStage(job)}
                                >
                                  Advance →
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 10px', fontSize: '11px' }}
                                onClick={() => openStageModal(job)}
                              >
                                <Pencil size={12} /> Set Stage
                              </button>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 9px', fontSize: '11px' }}
                                onClick={() => setDossierJob(job)}
                              >
                                <Eye size={12} /> Dossier
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
      {/* TAB 3: TECHNICIANS TEAM ALLOCATION (?tab=tasks)                */}
      {/* ============================================================== */}
      {currentTab === 'tasks' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <div className="wms-header-badges">
                <span className="stage-badge badge-danger">Multi-Technician Bay Matrix</span>
                <span className="stage-badge badge-active">{technicians.length} Active Technicians</span>
              </div>
              <h1>Technicians Team Allocation</h1>
              <p>
                Supervisor <strong>{authUser.name}</strong> • Assign multiple specialist technicians (Denting, Painting, Mechanical, Electrical, Detailing) to a single vehicle based on Advisor work requirements.
              </p>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-secondary-action"
                onClick={handleFullRefresh}
              >
                <RefreshCw size={15} /> Refresh
              </button>
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setShowAddTechModal(true)}
              >
                <UserPlus size={15} /> Register Technician
              </button>
            </div>
          </div>

          {renderScopeBanner()}
          {renderTabNavBar()}

          {/* 4 Allocation KPI Cards */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Active Technicians</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <Users size={20} />
                </div>
              </div>
              <div className="stat-card-value">{isBusy ? '...' : technicians.length}</div>
              <div className="stat-card-subtext">Multi-trade floor specialists</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Bay Tasks</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <Hammer size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {isBusy
                  ? '...'
                  : scopedJobs.reduce((acc, j) => acc + (j.tasks || []).length, 0)}
              </div>
              <div className="stat-card-subtext">{totalOpenTasks} currently pending/active</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Unallocated Vehicles</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="stat-card-value">{isBusy ? '...' : jobsNeedingTechs.length}</div>
              <div className="stat-card-subtext">Awaiting multi-tech assignment</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Tasks Completed</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {isBusy
                  ? '...'
                  : scopedJobs.reduce(
                      (acc, j) =>
                        acc + (j.tasks || []).filter((t) => t.status === 'Completed').length,
                      0
                    )}
              </div>
              <div className="stat-card-subtext">Signed off by technicians</div>
            </div>
          </div>

          {/* Technician Roster Load Cards (Clickable filter!) */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <div>
                <h3>Specialist Technicians Workload &amp; Trade Availability</h3>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  Click a technician card to filter the vehicle allocation matrix below to that specialist&rsquo;s jobs.
                </p>
              </div>
              {activeFilters.techId !== 'ALL' && (
                <button
                  type="button"
                  className="btn-secondary-action"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => patchFilters({ techId: 'ALL' })}
                >
                  Show All Technicians ×
                </button>
              )}
            </div>

            <div style={{ padding: '18px 20px' }}>
              <div className="wms-grid-3col" style={{ marginBottom: 0 }}>
                {technicians.map((tech) => {
                  const techKey = tech.userId || tech.id;
                  const assignedJobsCount = scopedJobs.filter((j) =>
                    (j.tasks || []).some(
                      (t) => t.assignedTechnicianId === techKey || t.assignedTechnicianId === tech.id
                    )
                  ).length;
                  const techTasks = scopedJobs.flatMap((j) =>
                    (j.tasks || []).filter(
                      (t) => t.assignedTechnicianId === techKey || t.assignedTechnicianId === tech.id
                    )
                  );
                  const openCount = techTasks.filter((t) => t.status !== 'Completed').length;
                  const hoursLoad = techTasks
                    .filter((t) => t.status !== 'Completed')
                    .reduce((s, t) => s + (t.estimatedHours || 0), 0);
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
                          background: isSelected ? '#045F60' : '#e6f2f2',
                          color: isSelected ? '#ffffff' : '#045F60',
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
                          <span className={`stage-badge ${openCount > 0 ? 'badge-warning' : 'badge-active'}`} style={{ fontSize: '10px' }}>
                            {openCount} Open
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                          {tech.designation}
                        </div>
                        <div style={{ fontSize: '11px', color: '#045F60', fontWeight: '700', marginTop: '4px' }}>
                          {assignedJobsCount} Vehicle{assignedJobsCount === 1 ? '' : 's'} · {hoursLoad} Est. Hrs Active
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
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
                value={activeFilters.techId}
                onChange={(e) => patchFilters({ techId: e.target.value })}
              >
                <option value="ALL">All Technicians</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.userId || t.id}>
                    {t.name} ({t.designation})
                  </option>
                ))}
              </select>
              <select
                className="wms-select-input"
                value={activeFilters.dept}
                onChange={(e) => patchFilters({ dept: e.target.value })}
              >
                <option value="ALL">All Trade Bays</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d} Bay
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
              {filteredJobs.length} Handed-Over Vehicle{filteredJobs.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Job-by-Job Multi-Technician Crew Cards */}
          {filteredJobs.length === 0 ? (
            <div className="wms-panel-card" style={{ padding: '36px 24px', textAlign: 'center', color: '#64748b' }}>
              No handed-over job cards match your active technician or bay filters.
            </div>
          ) : (
            filteredJobs.map((job) => {
              const crew = getUniqueAssignedTechsForJob(job);
              const jobTasks = (job.tasks || []).filter((t) => {
                const matchTech =
                  activeFilters.techId === 'ALL' || t.assignedTechnicianId === activeFilters.techId;
                const matchDept = activeFilters.dept === 'ALL' || t.department === activeFilters.dept;
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
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#141b1b' }}>
                          {job.vehicleModel}
                        </span>
                        <span className="stage-badge badge-warning">{job.currentStage}</span>
                        <span className={`stage-badge ${getPriorityBadgeClass(job.priority)}`}>
                          {job.priority || 'Normal'}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                        <strong>Advisor Work Brief:</strong>{' '}
                        {job.handoverNotes ||
                          job.inspection?.accidentDescription ||
                          'Proceed per inspection sheet'}{' '}
                        {(job.inspection?.visibleDamages || []).length > 0 && (
                          <span style={{ color: '#8A181A', fontWeight: '600' }}>
                            · Damages: {job.inspection.visibleDamages.join(', ')}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                          Assigned Multi-Tech Crew ({crew.length}):
                        </span>
                        {crew.length === 0 ? (
                          <span className="stage-badge badge-danger" style={{ fontSize: '11px' }}>
                            No Technicians Allocated Yet
                          </span>
                        ) : (
                          crew.map((m) => (
                            <span key={m.id} className="stage-badge badge-active" style={{ fontSize: '11px' }}>
                              {m.name} {m.departments.length > 0 ? `(${m.departments.join(', ')})` : ''}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-secondary-action"
                        style={{ padding: '7px 12px', fontSize: '12px' }}
                        onClick={() => setDossierJob(job)}
                      >
                        <Eye size={14} /> Full Work Details
                      </button>
                      <button
                        type="button"
                        className="btn-primary-action"
                        style={{ padding: '7px 14px', fontSize: '12px' }}
                        onClick={() => openAllocateModal(job)}
                      >
                        <Hammer size={14} /> Allocate / Edit Multi-Tech Crew
                      </button>
                    </div>
                  </div>

                  {jobTasks.length === 0 ? (
                    <div
                      style={{
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        background: '#fffdf7',
                      }}
                    >
                      <span style={{ fontSize: '13px', color: '#92400e' }}>
                        {(job.tasks || []).length === 0
                          ? 'No repair bay tasks created for this vehicle yet. Click "Allocate / Edit Multi-Tech Crew" to assign denters, painters, or mechanics.'
                          : 'No tasks match your active technician/bay filter on this vehicle.'}
                      </span>
                      {(job.tasks || []).length === 0 && (
                        <button
                          type="button"
                          className="btn-primary-action"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => openAllocateModal(job)}
                        >
                          <Plus size={14} /> Add Bay Tasks &amp; Technicians
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="wms-table-responsive">
                      <table className="wms-table">
                        <thead>
                          <tr>
                            <th>Work Task &amp; Floor Instructions</th>
                            <th>Trade Bay</th>
                            <th>Priority</th>
                            <th>Assigned Technician (Reassign Inline)</th>
                            <th>Est. Hours</th>
                            <th>Task Status</th>
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
            })
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: QUALITY INSPECTION (?tab=quality)                       */}
      {/* ============================================================== */}
      {currentTab === 'quality' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <div className="wms-header-badges">
                <span className="stage-badge badge-active">Final Quality Gate</span>
                <span className="stage-badge badge-info">5-Point Workshop Certification</span>
              </div>
              <h1>Quality Inspection &amp; Rework Control</h1>
              <p>
                Supervisor <strong>{authUser.name}</strong> • Execute final 5-point alignment, paint shade, road-test, electrical &amp; detailing inspection before releasing vehicles for delivery.
              </p>
            </div>

            <div className="workspace-actions">
              <button type="button" className="btn-secondary-action" onClick={handleFullRefresh}>
                <RefreshCw size={15} /> Refresh QC Queue
              </button>
            </div>
          </div>

          {renderScopeBanner()}
          {renderTabNavBar()}

          {/* 4 QC KPI Cards */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Ready / Pending QC</span>
                <div className="stat-icon-wrapper" style={{ background: '#fff8e6', color: '#b45309' }}>
                  <ClipboardCheck size={20} />
                </div>
              </div>
              <div className="stat-card-value">{isBusy ? '...' : qcQueueJobs.length}</div>
              <div className="stat-card-subtext">In Reassembly / QC Bay</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Passed QC Release</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <ShieldCheck size={20} />
                </div>
              </div>
              <div className="stat-card-value">{isBusy ? '...' : qcPassedCount}</div>
              <div className="stat-card-subtext">Certified for customer handover</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Rework Returned</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <RotateCcw size={20} />
                </div>
              </div>
              <div className="stat-card-value">{isBusy ? '...' : qcReworkCount}</div>
              <div className="stat-card-subtext">Flagged back to repair bay</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Supervisor Queue</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f2f2', color: '#045F60' }}>
                  <Car size={20} />
                </div>
              </div>
              <div className="stat-card-value">{isBusy ? '...' : scopedJobs.length}</div>
              <div className="stat-card-subtext">Handed-over vehicles tracked</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="wms-filter-bar">
            <div className="wms-filter-controls">
              <input
                type="text"
                className="table-search-input"
                placeholder="Search job #, reg #, customer, QC notes..."
                value={activeFilters.search}
                onChange={(e) => patchFilters({ search: e.target.value })}
              />
              <select
                className="wms-select-input"
                value={activeFilters.qcFilter}
                onChange={(e) =>
                  patchFilters({
                    qcFilter: e.target.value as
                      | 'ALL'
                      | 'NEEDS_QC'
                      | 'PASSED'
                      | 'REWORK'
                      | 'PENDING',
                  })
                }
              >
                <option value="ALL">All Jobs (QC Priority Sorted)</option>
                <option value="NEEDS_QC">In Reassembly / QC / Rework Queue</option>
                <option value="REWORK">Rework Flagged Only</option>
                <option value="PASSED">Passed QC Only</option>
                <option value="PENDING">Pending Inspection Only</option>
              </select>
            </div>
            <span className="stage-badge badge-info">{sortedQcJobs.length} Vehicles Listed</span>
          </div>

          {/* QC Queue Table */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <div>
                <h3>5-Point Final Quality Inspection Queue</h3>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  Verify technician task completion across bays before signing off Final Approval or returning for rework.
                </p>
              </div>
              <span className="stage-badge badge-active">Saved Directly to MongoDB</span>
            </div>

            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Job Card #</th>
                    <th>Vehicle &amp; Customer</th>
                    <th>Current Stage</th>
                    <th>Bay Task Sign-Off</th>
                    <th>Crew Involved</th>
                    <th>QC Outcome &amp; Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedQcJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                        No vehicles match your QC filter criteria.
                      </td>
                    </tr>
                  ) : (
                    sortedQcJobs.map((job) => {
                      const qcSt = getQcStatus(job);
                      const crew = getUniqueAssignedTechsForJob(job);
                      const totalT = (job.tasks || []).length;
                      const doneT = (job.tasks || []).filter((t) => t.status === 'Completed').length;
                      const checklist = job.qualityInspection?.checklist;
                      const passedChecks = checklist
                        ? Object.values(checklist).filter(Boolean).length
                        : 0;

                      return (
                        <tr key={job.id}>
                          <td>
                            <code>{job.jobCardNumber}</code>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              Due: {job.estimatedCompletionDate}
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: '#045F60' }}>{job.vehicleRegistration}</strong>
                            <div style={{ fontSize: '12px' }}>{job.vehicleModel}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{job.customerName}</div>
                          </td>
                          <td>
                            <span className="stage-badge badge-warning">{job.currentStage}</span>
                          </td>
                          <td>
                            {totalT === 0 ? (
                              <span className="stage-badge badge-neutral">0 Tasks Logged</span>
                            ) : (
                              <span
                                className={`stage-badge ${
                                  doneT === totalT ? 'badge-active' : 'badge-warning'
                                }`}
                              >
                                {doneT} / {totalT} Completed
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '180px' }}>
                              {crew.length === 0 ? (
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>None</span>
                              ) : (
                                crew.map((c) => (
                                  <span key={c.id} className="stage-badge badge-info" style={{ fontSize: '10px' }}>
                                    {c.name}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td style={{ maxWidth: '250px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <span className={`stage-badge ${getQcBadgeClass(qcSt)}`}>{qcSt}</span>
                              <span style={{ fontSize: '11px', color: '#475569' }}>
                                ({passedChecks}/5 Checks)
                              </span>
                            </div>
                            {(job.qualityInspection?.reworkReason || job.qualityInspection?.notes) && (
                              <div style={{ fontSize: '11px', color: '#475569' }}>
                                {job.qualityInspection.reworkReason || job.qualityInspection.notes}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-primary-action"
                                style={{ padding: '5px 10px', fontSize: '11px' }}
                                onClick={() => openQcModal(job)}
                              >
                                <ClipboardCheck size={13} />{' '}
                                {qcSt === 'Pending' ? 'Run 5-Point QC' : 'Review / Update QC'}
                              </button>
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '5px 9px', fontSize: '11px' }}
                                onClick={() => setDossierJob(job)}
                              >
                                <Eye size={13} /> Dossier
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
      {/* MODAL A: COMPLETE ADVISOR & WORKSHOP JOB CARD DOSSIER          */}
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
                  <span className={`stage-badge ${dossierJob.customerApproved ? 'badge-active' : 'badge-danger'}`}>
                    {dossierJob.customerApproved ? '✓ Client Estimate Approved' : 'Client Approval Pending'}
                  </span>
                  <span className={`stage-badge ${getQcBadgeClass(getQcStatus(dossierJob))}`}>
                    QC: {getQcStatus(dossierJob)}
                  </span>
                </div>
                <h3>Complete Job Card Dossier: {dossierJob.jobCardNumber}</h3>
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
              {/* Advisor Handover Briefing Box */}
              <div
                style={{
                  background: '#f0fdfa',
                  border: '1px solid #045F60',
                  borderRadius: '10px',
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '12px', color: '#045F60', textTransform: 'uppercase' }}>
                    Service Advisor Handover Briefing
                  </strong>
                  <span style={{ fontSize: '11px', color: '#475569' }}>
                    Advisor: <strong>{dossierJob.advisorName || 'Amit Kulkarni'}</strong>
                    {dossierJob.handoverDate
                      ? ` · Handed Over: ${new Date(dossierJob.handoverDate).toLocaleString('en-IN')}`
                      : ''}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#141b1b', lineHeight: 1.5 }}>
                  {dossierJob.handoverNotes ||
                    'Formally handed over from Intake Desk for floor repairs and technician coordination.'}
                </div>
              </div>

              {/* 2x2 Summary Metadata Grid */}
              {(() => {
                const vehSpec = getVehicleDetails(
                  dossierJob.vehicleId,
                  dossierJob.vehicleRegistration
                );
                return (
                  <div className="wms-form-grid-2" style={{ fontSize: '13px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2eeec' }}>
                      <strong style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        VEHICLE &amp; TECHNICAL SPECS
                      </strong>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#045F60' }}>
                        {dossierJob.vehicleRegistration}
                      </div>
                      <div style={{ fontWeight: '700' }}>{dossierJob.vehicleModel}</div>
                      {vehSpec && (
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                          {vehSpec.year} · {vehSpec.color} · {vehSpec.fuelType}
                          <br />
                          <Gauge size={11} style={{ display: 'inline', marginRight: '4px' }} />
                          Odometer: {vehSpec.odometer?.toLocaleString('en-IN')} km · VIN: <code style={{ wordBreak: 'break-all' }}>{vehSpec.vin}</code>
                        </div>
                      )}
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2eeec' }}>
                      <strong style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        CUSTOMER &amp; SCHEDULE
                      </strong>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{dossierJob.customerName}</div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                        <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {dossierJob.customerPhone || 'Not provided'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>
                        Intake Date: <strong>{dossierJob.intakeDate}</strong>
                        <br />
                        Target Delivery: <strong>{dossierJob.estimatedCompletionDate}</strong>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2eeec' }}>
                      <strong style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        INSURANCE &amp; SURVEYOR DETAILS
                      </strong>
                      <div style={{ fontWeight: '700' }}>
                        {dossierJob.inspection?.insuranceProvider || 'Self-Pay / Non-Insurance'}
                      </div>
                      {dossierJob.inspection?.claimNumber && (
                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                          Claim #: <code>{dossierJob.inspection.claimNumber}</code>
                        </div>
                      )}
                      {dossierJob.inspection?.policyNumber && (
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Policy #: {dossierJob.inspection.policyNumber}
                        </div>
                      )}
                      {dossierJob.inspection?.surveyorName && (
                        <div style={{ fontSize: '11px', color: '#045F60', marginTop: '4px' }}>
                          Surveyor: {dossierJob.inspection.surveyorName}{' '}
                          {dossierJob.inspection.surveyorPhone
                            ? `(${dossierJob.inspection.surveyorPhone})`
                            : ''}
                        </div>
                      )}
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2eeec' }}>
                      <strong style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        APPROVED ESTIMATE BREAKDOWN (18% GST)
                      </strong>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#045F60' }}>
                        ₹{(dossierJob.costEstimate?.total || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
                        Labour: ₹{(dossierJob.costEstimate?.labour || 0).toLocaleString('en-IN')} · Parts: ₹
                        {(dossierJob.costEstimate?.spareParts || 0).toLocaleString('en-IN')}
                        <br />
                        Paint: ₹{(dossierJob.costEstimate?.painting || 0).toLocaleString('en-IN')} · GST: ₹
                        {(dossierJob.costEstimate?.taxAmount || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Detailed Damage Assessment, Complaints, Visible Damages */}
              <div style={{ border: '1px solid #f2d7d8', background: '#fffafa', borderRadius: '10px', padding: '14px 16px' }}>
                <strong style={{ fontSize: '12px', color: '#8A181A', textTransform: 'uppercase' }}>
                  Advisor Accident &amp; Damage Inspection Record
                </strong>
                <p style={{ fontSize: '13px', color: '#1e293b', marginTop: '6px', lineHeight: 1.55 }}>
                  {dossierJob.inspection?.accidentDescription || 'No accident narrative recorded.'}
                </p>

                <div className="wms-form-grid-2" style={{ gap: '12px', marginTop: '10px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '5px' }}>
                      CUSTOMER COMPLAINTS
                    </div>
                    {(dossierJob.inspection?.customerComplaints || []).length === 0 ? (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>None listed</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {dossierJob.inspection.customerComplaints.map((cmp, idx) => (
                          <span key={idx} className="stage-badge badge-warning" style={{ whiteSpace: 'normal' }}>
                            {cmp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '5px' }}>
                      VISIBLE PANEL &amp; PART DAMAGES
                    </div>
                    {(dossierJob.inspection?.visibleDamages || []).length === 0 ? (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>None listed</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {dossierJob.inspection.visibleDamages.map((dmg, idx) => (
                          <span key={idx} className="stage-badge badge-danger" style={{ whiteSpace: 'normal' }}>
                            {dmg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {dossierJob.inspection?.inspectionNotes && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f2d7d8', fontSize: '12px', color: '#334155' }}>
                    <strong>Advisor Inspection Notes:</strong> {dossierJob.inspection.inspectionNotes}
                  </div>
                )}
              </div>

              {/* Multi-Technician Tasks Table */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '12px', color: '#045F60', textTransform: 'uppercase' }}>
                    Multi-Technician Repair Allocation ({(dossierJob.tasks || []).length} Tasks)
                  </strong>
                  <button
                    type="button"
                    className="btn-secondary-action"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                    onClick={() => {
                      const j = dossierJob;
                      setDossierJob(null);
                      openAllocateModal(j);
                    }}
                  >
                    <Hammer size={12} /> Modify Crew / Add Tasks
                  </button>
                </div>

                {(dossierJob.tasks || []).length === 0 ? (
                  <div style={{ padding: '12px 14px', background: '#fffbeb', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
                    No technician tasks allocated to this vehicle yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {dossierJob.tasks.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px',
                          padding: '9px 12px',
                          background: '#fafdfc',
                          border: '1px solid #e2eeec',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      >
                        <div>
                          <strong>{t.title}</strong>{' '}
                          <span className={`stage-badge ${getDepartmentBadgeClass(t.department)}`} style={{ fontSize: '10px', marginLeft: '4px' }}>
                            {t.department}
                          </span>
                          <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                            Tech: <strong>{getTechName(t.assignedTechnicianId, t.assignedTechnicianName)}</strong> ·{' '}
                            {t.estimatedHours} hrs
                            {t.description ? ` · ${t.description}` : ''}
                          </div>
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

              {/* Chronological Stage History */}
              {dossierJob.stageHistory && dossierJob.stageHistory.length > 0 && (
                <div>
                  <strong style={{ fontSize: '12px', color: '#045F60', textTransform: 'uppercase' }}>
                    Floor Stage &amp; Handover Audit Trail
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                          <strong>{h.stage}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
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
                className="btn-primary-action"
                onClick={() => {
                  const j = dossierJob;
                  setDossierJob(null);
                  openAllocateModal(j);
                }}
              >
                <Users size={14} /> Allocate Multiple Technicians
              </button>
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => {
                  const j = dossierJob;
                  setDossierJob(null);
                  openStageModal(j);
                }}
              >
                <ArrowRight size={14} /> Update Repair Stage
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
      {/* MODAL B: MULTI-TECHNICIAN TASK ALLOCATION                      */}
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
                  <span className="stage-badge badge-danger">Multi-Technician Bay Assignment</span>
                  <span className="stage-badge badge-info">{allocJob.jobCardNumber}</span>
                </div>
                <h3>
                  Allocate Technicians: {allocJob.vehicleRegistration} ({allocJob.vehicleModel})
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
              {/* Advisor Work Scope Summary inside Modal so supervisor sees what work the car needs */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #d9eae8',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '12px',
                }}
              >
                <div style={{ fontWeight: '800', color: '#045F60', marginBottom: '4px' }}>
                  Advisor Scope &amp; Vehicle Damages:
                </div>
                <div style={{ color: '#1e293b' }}>
                  <strong>Summary:</strong>{' '}
                  {allocJob.handoverNotes || allocJob.inspection?.accidentDescription || 'See complaints below'}
                </div>
                {(allocJob.inspection?.visibleDamages || []).length > 0 && (
                  <div style={{ color: '#8A181A', marginTop: '3px' }}>
                    <strong>Damages:</strong> {allocJob.inspection.visibleDamages.join(' • ')}
                  </div>
                )}
                {(allocJob.inspection?.customerComplaints || []).length > 0 && (
                  <div style={{ color: '#475569', marginTop: '2px' }}>
                    <strong>Complaints:</strong> {allocJob.inspection.customerComplaints.join(' • ')}
                  </div>
                )}
              </div>

              {/* Add Trade Task + Assign Technician Builder */}
              <div
                style={{
                  border: '1px solid #045F60',
                  background: '#f0fdfa',
                  borderRadius: '10px',
                  padding: '14px 16px',
                }}
              >
                <strong style={{ fontSize: '12px', color: '#045F60', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                  + Add Bay Work Item &amp; Assign Specific Technician
                </strong>

                <div className="wms-form-grid-2" style={{ gap: '10px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                      Specific Repair Task Title *
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. LH Fender Dent Pull & Panel Gap Setup, or Spray Booth Clearcoat"
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
                      Assign Specific Technician *
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
                      Task Priority &amp; Est. Hours
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
                        placeholder="Hrs"
                        value={newTaskDraft.estimatedHours}
                        onChange={(e) =>
                          setNewTaskDraft({ ...newTaskDraft, estimatedHours: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                      Bay Instructions for Technician
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="Specific torque, paint code, or OEM part note..."
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
                    <Plus size={14} /> Add Task to Vehicle Crew
                  </button>
                </div>
              </div>

              {/* Active Crew Preview Strip */}
              {(() => {
                const uniqueIds = Array.from(
                  new Set(allocTasks.map((t) => t.assignedTechnicianId).filter(Boolean))
                );
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      padding: '10px 14px',
                      background: '#f8fafc',
                      border: '1px solid #e2eeec',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <strong>Assigned Crew on This Car ({uniqueIds.length} Technician{uniqueIds.length === 1 ? '' : 's'}):</strong>{' '}
                      {uniqueIds.length === 0
                        ? 'None assigned yet'
                        : uniqueIds.map((id) => getTechName(id)).join(' · ')}
                    </div>
                    <span className="stage-badge badge-info">{allocTasks.length} Total Tasks</span>
                  </div>
                );
              })()}

              {/* Editable Task List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allocTasks.length === 0 ? (
                  <div style={{ padding: '18px', textAlign: 'center', color: '#64748b', fontSize: '13px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                    No tasks added to this job card yet. Add department tasks above for each technician working on this car.
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
                          <span className="stage-badge badge-neutral">#{idx + 1}</span>
                          <input
                            type="text"
                            className="table-search-input"
                            style={{ flex: '1 1 160px', minWidth: 0, height: '34px', fontWeight: '700' }}
                            value={t.title}
                            onChange={(e) =>
                              setAllocTasks((prev) =>
                                prev.map((x) => (x.id === t.id ? { ...x, title: e.target.value } : x))
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
                                  ? { ...x, department: e.target.value as RepairTask['department'] }
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
                                  ? { ...x, assignedTechnicianId: tid, assignedTechnicianName: tName }
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
                                  ? { ...x, priority: e.target.value as RepairTask['priority'] }
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

                      <input
                        type="text"
                        className="table-search-input"
                        style={{ height: '32px', width: '100%', fontSize: '12px' }}
                        placeholder="Technician bay instructions / OEM part note..."
                        value={t.description}
                        onChange={(e) =>
                          setAllocTasks((prev) =>
                            prev.map((x) =>
                              x.id === t.id ? { ...x, description: e.target.value } : x
                            )
                          )
                        }
                      />
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
                    <Loader2 size={15} className="animate-spin" /> Saving to MongoDB...
                  </>
                ) : (
                  <>
                    <Check size={15} /> Save Multi-Technician Allocation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL C: STAGE TRANSITION & BAY NOTE                           */}
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
                  <span className="stage-badge badge-info">13-Stage Workflow Update</span>
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

            <form onSubmit={handleConfirmStageTransition}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Target Repair Stage *
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
                    Job Card Operational Status
                  </label>
                  <select
                    className="wms-select-input"
                    style={{ width: '100%' }}
                    value={targetJobStatus}
                    onChange={(e) => setTargetJobStatus(e.target.value as JobCard['jobStatus'])}
                  >
                    <option value="Active">Active (In Workshop Bays)</option>
                    <option value="On Hold">On Hold (Awaiting Parts / Surveyor)</option>
                    <option value="Completed">Completed (Ready for Delivery)</option>
                    <option value="Delivered">Delivered to Customer</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Floor Supervisor Stage Transition Note *
                  </label>
                  <textarea
                    rows={3}
                    className="table-search-input"
                    style={{ width: '100%', height: 'auto', padding: '10px 12px' }}
                    placeholder="Record completed bay tasks, technician sign-off, paint cure timing, or parts pending remarks..."
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
                      <Loader2 size={15} className="animate-spin" /> Saving Stage...
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
      {/* MODAL D: 5-POINT QUALITY INSPECTION & REWORK                   */}
      {/* ============================================================== */}
      {qcJob && (
        <div className="wms-modal-backdrop" onClick={() => !savingQc && setQcJob(null)}>
          <div
            className="wms-modal-card"
            style={{ maxWidth: '680px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="wms-header-badges">
                  <span className="stage-badge badge-active">Final Quality Inspection</span>
                  <span className="stage-badge badge-info">{qcJob.jobCardNumber}</span>
                </div>
                <h3>
                  5-Point QC Checklist: {qcJob.vehicleRegistration} ({qcJob.vehicleModel})
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={savingQc}
                onClick={() => setQcJob(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Technician Tasks Completion Summary */}
              {(() => {
                const tasks = qcJob.tasks || [];
                const completed = tasks.filter((t) => t.status === 'Completed').length;
                if (tasks.length > 0 && completed < tasks.length) {
                  return (
                    <div
                      style={{
                        background: '#fffbeb',
                        border: '1px solid #f59e0b',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '12px',
                        color: '#92400e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                      <span>
                        <strong>Heads up:</strong> Only {completed} of {tasks.length} assigned technician tasks are marked &ldquo;Completed&rdquo;. Verify remaining work before releasing Final Approval.
                      </span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* 5 Checkpoints */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ fontSize: '12px', color: '#045F60', textTransform: 'uppercase' }}>
                  Mandatory Workshop QC Checkpoints
                </strong>
                <button
                  type="button"
                  className="btn-secondary-action"
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                  onClick={() =>
                    setQcChecklist({
                      panelAlignment: true,
                      paintFinishColorMatch: true,
                      mechanicalRoadTest: true,
                      electricalLightsSensors: true,
                      waterLeakDetailing: true,
                    })
                  }
                >
                  Check All 5 Pass
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  {
                    key: 'panelAlignment' as const,
                    title: '1. Panel Alignment & Shut-Lines Verified',
                    desc: 'Uniform bumper, hood, fender & door gaps with zero rattle or clip looseness.',
                  },
                  {
                    key: 'paintFinishColorMatch' as const,
                    title: '2. Paint Finish, Clearcoat Gloss & Shade Match Verified',
                    desc: 'Zero dust nibs, orange peel, solvent pop, or blending shade variance under inspection lamp.',
                  },
                  {
                    key: 'mechanicalRoadTest' as const,
                    title: '3. Mechanical, Suspension & Road Test Passed',
                    desc: 'Steering centered, braking smooth, coolant/oil leak check clear on test drive.',
                  },
                  {
                    key: 'electricalLightsSensors' as const,
                    title: '4. Electrical, Headlamps, Sensors & Cluster Warning Lights Clear',
                    desc: 'Headlight beam alignment, parking sensors, cameras & OBD fault scan verified.',
                  },
                  {
                    key: 'waterLeakDetailing' as const,
                    title: '5. Water-Leak Seal Test & Final Interior/Exterior Detailing Clean',
                    desc: 'High-pressure hose seal test clear, glass cleaned, interior vacuumed & compound swirl-free.',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      background: qcChecklist[item.key] ? '#f0fdfa' : '#f8fafc',
                      border: qcChecklist[item.key] ? '1px solid #045F60' : '1px solid #e2eeec',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={qcChecklist[item.key]}
                      onChange={(e) =>
                        setQcChecklist({ ...qcChecklist, [item.key]: e.target.checked })
                      }
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#141b1b', display: 'block' }}>
                        {item.title}
                      </strong>
                      <span style={{ fontSize: '11px', color: '#475569' }}>{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Target Stages Row for Pass vs Rework */}
              <div className="wms-form-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px', color: '#067a46' }}>
                    Release Stage if QC Passes
                  </label>
                  <select
                    className="wms-select-input"
                    style={{ width: '100%' }}
                    value={qcPassStage}
                    onChange={(e) => setQcPassStage(e.target.value as RepairStage)}
                  >
                    <option value="Final Approval">Final Approval</option>
                    <option value="Ready for Delivery">Ready for Delivery</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px', color: '#8A181A' }}>
                    Return Bay Stage if Rework Required
                  </label>
                  <select
                    className="wms-select-input"
                    style={{ width: '100%' }}
                    value={qcReworkStage}
                    onChange={(e) => setQcReworkStage(e.target.value as RepairStage)}
                  >
                    <option value="Denting & Bodywork">Denting &amp; Bodywork Bay</option>
                    <option value="Mechanical Work">Mechanical Work Bay</option>
                    <option value="Painting">Painting Spray Booth</option>
                    <option value="Reassembly">Reassembly Bay</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                  Supervisor QC Findings / Rework Instructions * (Required if Flagging Rework)
                </label>
                <textarea
                  rows={3}
                  className="table-search-input"
                  style={{ width: '100%', height: 'auto', padding: '10px 12px' }}
                  placeholder="Enter final QC certification notes, or exact defects requiring bay rework (e.g. Slight dust nib on LH fender clearcoat — wet sand & buff required)..."
                  value={qcNotes}
                  onChange={(e) => setQcNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer wms-modal-footer-split">
              <button
                type="button"
                className="btn-secondary-action"
                style={{ borderColor: '#8A181A', color: '#8A181A', fontWeight: '700' }}
                disabled={savingQc}
                onClick={() => handleSubmitQcDecision('Rework Required')}
              >
                <RotateCcw size={14} /> Flag Rework &amp; Return to Bay
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary-action"
                  disabled={savingQc}
                  onClick={() => setQcJob(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary-action"
                  disabled={savingQc}
                  onClick={() => handleSubmitQcDecision('Passed')}
                >
                  {savingQc ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving QC...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} /> Pass QC &amp; Release Stage
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL E: REGISTER WORKSHOP TECHNICIAN                          */}
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
                  <span className="stage-badge badge-active">Saved to MongoDB</span>
                  <span className="stage-badge badge-info">Technician Workbench Access</span>
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
                <div className="wms-form-grid-2">
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
                      Work Email (Login) *
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
                      Portal Password *
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
                      Specialty Trade / Designation *
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
                      Mobile Phone
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
                      <Loader2 size={15} className="animate-spin" /> Saving Technician...
                    </>
                  ) : (
                    <>
                      <Check size={15} /> Save &amp; Add Technician
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
          aria-labelledby="supervisor-popup-title"
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
                  background: popupAlert.tone === 'error' ? '#fbebed' : popupAlert.tone === 'info' ? '#e6f2f2' : '#fff3cd',
                  border: popupAlert.tone === 'error' ? '2px solid #8A181A' : popupAlert.tone === 'info' ? '2px solid #045F60' : '2px solid #f59e0b',
                  color: popupAlert.tone === 'error' ? '#8A181A' : popupAlert.tone === 'info' ? '#045F60' : '#b45309',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <AlertTriangle size={26} />
              </div>

              <h3
                id="supervisor-popup-title"
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
