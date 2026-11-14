'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  Filter,
  Hammer,
  Layers,
  Loader2,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
  X,
} from 'lucide-react';
import type { Employee, JobCard, RepairStage, RepairTask } from '@/lib/models/types';
import CenterPopupModal, { CenterPopupState } from '@/lib/components/CenterPopupModal';

interface TechnicianDashboardProps {
  activeTab: string;
  jobCards: JobCard[];
  employees: Employee[];
  loading: boolean;
  onRefresh: () => Promise<void> | void;
  onNotify: (msg: string) => void;
}

interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export default function TechnicianDashboard({
  activeTab,
  jobCards,
  employees,
  loading: parentLoading,
  onRefresh,
  onNotify,
}: TechnicianDashboardProps) {
  const currentTab =
    activeTab === 'tasks' || activeTab === 'notes' ? activeTab : 'overview';

  // Auth User
  const [authUser, setAuthUser] = useState<AuthSessionUser | null>(null);

  // Active Technician Selection (for switching or admin preview)
  const [selectedTechId, setSelectedTechId] = useState<string>('usr_tech_01');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Modals
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

  // Task Update / Note Modal
  const [activeTaskModal, setActiveTaskModal] = useState<{
    job: JobCard;
    task: RepairTask;
  } | null>(null);
  const [taskNoteInput, setTaskNoteInput] = useState('');
  const [taskStatusInput, setTaskStatusInput] = useState<RepairTask['status']>('In Progress');
  const [submittingTaskUpdate, setSubmittingTaskUpdate] = useState(false);

  // Vehicle Inspection Dossier Modal
  const [dossierJob, setDossierJob] = useState<JobCard | null>(null);

  // New Floor Note Modal
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [noteJobCardId, setNoteJobCardId] = useState<string>('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Load Auth Session
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setAuthUser(data.user);
            if (data.user.role === 'technician') {
              setSelectedTechId(data.user.id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load session for technician:', err);
      }
    })();
  }, []);

  // Filter floor technicians from employee list
  const technicians = useMemo(() => {
    const list = employees.filter(
      (e) => e.role === 'technician' && e.status !== 'resigned' && e.status !== 'terminated'
    );
    if (list.length === 0) {
      return [
        { id: 'usr_tech_01', name: 'Sagar Kamble', designation: 'Master Denting Technician' },
        { id: 'usr_tech_02', name: 'Prakash Shinde', designation: 'Senior Paint Specialist' },
        { id: 'usr_tech_03', name: 'Nitin Patil', designation: 'Mechanical Bay Lead' },
        { id: 'usr_tech_04', name: 'Amol Bhosale', designation: 'Auto Electrician' },
      ];
    }
    return list;
  }, [employees]);

  // Current active technician name
  const currentTechName = useMemo(() => {
    if (selectedTechId === 'ALL') return 'All Floor Technicians';
    const found = technicians.find((t) => t.id === selectedTechId || (t as Employee).userId === selectedTechId);
    return found?.name || 'Sagar Kamble';
  }, [technicians, selectedTechId]);

  // Filter jobs relevant to the selected technician (or all if 'ALL')
  const technicianJobs = useMemo(() => {
    return jobCards.filter((job) => {
      // Must have tasks or be assigned to technician
      if (selectedTechId === 'ALL') return true;
      const hasTask = (job.tasks || []).some(
        (t) => t.assignedTechnicianId === selectedTechId || t.assignedTechnicianName?.toLowerCase() === currentTechName.toLowerCase()
      );
      const isAssigned = (job.assignedTechnicianIds || []).includes(selectedTechId);
      return hasTask || isAssigned;
    });
  }, [jobCards, selectedTechId, currentTechName]);

  // Extract all tasks for this technician across all jobs
  const technicianTasks = useMemo(() => {
    const result: { job: JobCard; task: RepairTask }[] = [];
    jobCards.forEach((job) => {
      (job.tasks || []).forEach((t) => {
        const matchesTech =
          selectedTechId === 'ALL' ||
          t.assignedTechnicianId === selectedTechId ||
          t.assignedTechnicianName?.toLowerCase() === currentTechName.toLowerCase();
        if (matchesTech) {
          result.push({ job, task: t });
        }
      });
    });
    return result;
  }, [jobCards, selectedTechId, currentTechName]);

  // Filtered Tasks for ?tab=tasks
  const filteredTasks = useMemo(() => {
    return technicianTasks.filter(({ job, task }) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        task.title.toLowerCase().includes(q) ||
        job.jobCardNumber.toLowerCase().includes(q) ||
        job.vehicleRegistration.toLowerCase().includes(q) ||
        job.vehicleModel.toLowerCase().includes(q) ||
        (task.notes || '').toLowerCase().includes(q);

      const matchStatus = statusFilter === 'ALL' || task.status === statusFilter;
      const matchDept = departmentFilter === 'ALL' || task.department === departmentFilter;

      return matchSearch && matchStatus && matchDept;
    });
  }, [technicianTasks, searchQuery, statusFilter, departmentFilter]);

  // Filtered Jobs for Overview
  const filteredJobs = useMemo(() => {
    return technicianJobs.filter((job) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        job.jobCardNumber.toLowerCase().includes(q) ||
        job.vehicleRegistration.toLowerCase().includes(q) ||
        job.vehicleModel.toLowerCase().includes(q) ||
        job.currentStage.toLowerCase().includes(q)
      );
    });
  }, [technicianJobs, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = technicianTasks.length;
    const inProgress = technicianTasks.filter((t) => t.task.status === 'In Progress').length;
    const pending = technicianTasks.filter((t) => t.task.status === 'Pending').length;
    const completed = technicianTasks.filter((t) => t.task.status === 'Completed').length;
    return {
      total,
      inProgress,
      pending,
      completed,
      activeVehicles: technicianJobs.length,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [technicianTasks, technicianJobs]);

  // Handle Quick Task Status Change (Start Work / Mark Complete)
  const handleQuickStatusChange = async (
    job: JobCard,
    task: RepairTask,
    newStatus: RepairTask['status']
  ) => {
    const nowIso = new Date().toISOString();
    const updatedTasks = (job.tasks || []).map((t) => {
      if (t.id === task.id) {
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'Completed' ? nowIso : t.completedAt,
        };
      }
      return t;
    });

    try {
      const res = await fetch('/api/job-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: job.id,
          tasks: updatedTasks,
          stageNote: `Technician ${currentTechName} marked "${task.title}" as ${newStatus}.`,
          updatedBy: currentTechName,
          userRole: 'technician',
        }),
      });
      const data = await res.json();
      if (data.success) {
        await onRefresh();
        onNotify(`Task "${task.title}" updated to ${newStatus}.`);

        // Check if all tasks completed on this job
        const remaining = updatedTasks.filter((t) => t.status !== 'Completed').length;
        if (remaining === 0 && newStatus === 'Completed') {
          showCenterPopup(
            `All repair tasks for ${job.vehicleRegistration} (${job.vehicleModel}) are now Completed! The vehicle is ready for Supervisor Quality Inspection (QC).`,
            'All Tasks Completed!',
            'info'
          );
        }
      } else {
        showCenterPopup(data.message || 'Failed to update task status.', 'Error', 'error');
      }
    } catch {
      showCenterPopup('Network error while updating task.', 'Error', 'error');
    }
  };

  // Open Task Note/Edit Modal
  const handleOpenTaskModal = (job: JobCard, task: RepairTask) => {
    setActiveTaskModal({ job, task });
    setTaskNoteInput(task.notes || '');
    setTaskStatusInput(task.status);
  };

  // Save Task Update from Modal
  const handleSaveTaskModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaskModal) return;

    setSubmittingTaskUpdate(true);
    const { job, task } = activeTaskModal;
    const nowIso = new Date().toISOString();

    const updatedTasks = (job.tasks || []).map((t) => {
      if (t.id === task.id) {
        return {
          ...t,
          status: taskStatusInput,
          notes: taskNoteInput.trim(),
          completedAt: taskStatusInput === 'Completed' ? nowIso : t.completedAt,
        };
      }
      return t;
    });

    try {
      const res = await fetch('/api/job-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: job.id,
          tasks: updatedTasks,
          stageNote: `Technician ${currentTechName} updated "${task.title}": ${taskStatusInput}.${taskNoteInput ? ` Notes: ${taskNoteInput.trim()}` : ''}`,
          updatedBy: currentTechName,
          userRole: 'technician',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveTaskModal(null);
        await onRefresh();
        onNotify(`Task "${task.title}" updated successfully.`);
      } else {
        showCenterPopup(data.message || 'Failed to save task update.', 'Error', 'error');
      }
    } catch {
      showCenterPopup('Failed to save task update.', 'Error', 'error');
    } finally {
      setSubmittingTaskUpdate(false);
    }
  };

  // Save New Floor Note on a Job Card
  const handleSaveNewNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteJobCardId || !newNoteContent.trim()) {
      showCenterPopup('Please select a vehicle and enter observation notes.', 'Validation Error', 'error');
      return;
    }

    const targetJob = jobCards.find((j) => j.id === noteJobCardId);
    if (!targetJob) return;

    setSubmittingNote(true);
    const timeFormatted = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    const appendedNote = `[${timeFormatted} - ${currentTechName}]: ${newNoteContent.trim()}`;

    try {
      const res = await fetch('/api/job-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: targetJob.id,
          stageNote: appendedNote,
          updatedBy: currentTechName,
          userRole: 'technician',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowNewNoteModal(false);
        setNewNoteContent('');
        await onRefresh();
        onNotify('Floor observation note logged successfully!');
      } else {
        showCenterPopup(data.message || 'Failed to log note.', 'Error', 'error');
      }
    } catch {
      showCenterPopup('Failed to log note.', 'Error', 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  const getDepartmentBadgeClass = (dept: RepairTask['department']) => {
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
  };

  const getPriorityBadgeClass = (priority?: string) => {
    if (priority === 'Critical' || priority === 'Urgent') return 'badge-danger';
    if (priority === 'High') return 'badge-purple';
    if (priority === 'Medium') return 'badge-warning';
    return 'badge-neutral';
  };

  const getStatusBadgeClass = (status: RepairTask['status']) => {
    switch (status) {
      case 'Completed':
        return 'badge-active';
      case 'In Progress':
        return 'badge-info';
      case 'Under Review':
        return 'badge-purple';
      case 'Pending':
      default:
        return 'badge-warning';
    }
  };

  return (
    <div>
      {/* Workspace Header with Technician Selector */}
      <div className="workspace-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="workspace-title-box">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Hammer size={24} style={{ color: '#8A181A' }} />
            Technician Floor Workbench
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Active repair tasks, job execution progress, floor observations, and completion sign-off
          </p>
        </div>

        <div className="workspace-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Active Technician Switcher (helpful for supervisors & team preview) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Active Tech:</span>
            <select
              className="wms-select-input"
              style={{ minWidth: '180px', fontWeight: '700' }}
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
            >
              <option value="ALL">All Floor Technicians</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({(t as Employee).designation || 'Technician'})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn-secondary-action"
            style={{ borderColor: '#8A181A', color: '#8A181A', fontWeight: '700' }}
            onClick={() => {
              setNoteJobCardId(technicianJobs[0]?.id || '');
              setShowNewNoteModal(true);
            }}
          >
            <FileText size={15} /> Add Floor Note
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="wms-stats-grid">
        <div className="wms-stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">Assigned Vehicles</span>
            <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
              <Car size={20} />
            </div>
          </div>
          <div className="stat-card-value">
            {parentLoading ? '...' : `${metrics.activeVehicles} Cars`}
          </div>
          <div className="stat-card-subtext">Active repair bay assignments</div>
        </div>

        <div className="wms-stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">Total Assigned Tasks</span>
            <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#D97706' }}>
              <ClipboardList size={20} />
            </div>
          </div>
          <div className="stat-card-value">
            {parentLoading ? '...' : `${metrics.total} Tasks`}
          </div>
          <div className="stat-card-subtext">Detailed work items allocated</div>
        </div>

        <div className="wms-stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">In Progress (Active)</span>
            <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Wrench size={20} />
            </div>
          </div>
          <div className="stat-card-value">
            {parentLoading ? '...' : `${metrics.inProgress} Active`}
          </div>
          <div className="stat-card-subtext">Underway on workshop floor</div>
        </div>

        <div className="wms-stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">Completed Work</span>
            <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-card-value">
            {parentLoading ? '...' : `${metrics.completed} / ${metrics.total}`}
          </div>
          <div className="stat-card-subtext">{metrics.completionRate}% completion rate</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: OVERVIEW — MY ASSIGNED JOBS (DEFAULT)                   */}
      {/* ============================================================== */}
      {currentTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Job Cards for this Technician */}
          <div className="wms-panel-card">
            <div className="panel-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0 }}>My Active Repair Vehicles ({filteredJobs.length})</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Vehicles currently in bay with tasks assigned to {currentTechName}
                </p>
              </div>

              <div className="wms-filter-controls">
                <input
                  type="text"
                  placeholder="Search vehicle or job no..."
                  className="table-search-input"
                  style={{ minWidth: '220px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                <Hammer size={36} style={{ color: '#cbd5e1', margin: '0 auto 8px' }} />
                <div style={{ fontWeight: '600', color: '#1e293b' }}>No Assigned Vehicles Found</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  No active repair vehicles match the current filter for {currentTechName}.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px' }}>
                {filteredJobs.map((job) => {
                  const tasksForTech = (job.tasks || []).filter(
                    (t) =>
                      selectedTechId === 'ALL' ||
                      t.assignedTechnicianId === selectedTechId ||
                      t.assignedTechnicianName?.toLowerCase() === currentTechName.toLowerCase()
                  );
                  const completedCount = tasksForTech.filter((t) => t.status === 'Completed').length;
                  const progressPct =
                    tasksForTech.length > 0 ? Math.round((completedCount / tasksForTech.length) * 100) : 0;
                  const isDelayed = job.bottleneckInfo?.isDelayed;

                  return (
                    <div
                      key={job.id}
                      style={{
                        background: '#fafdfc',
                        border: '1px solid #e2eeec',
                        borderRadius: '10px',
                        padding: '16px 18px',
                        boxShadow: '0 2px 8px rgba(10, 25, 25, 0.04)',
                      }}
                    >
                      {/* Vehicle Header Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '16px', color: '#141b1b' }}>
                              {job.vehicleRegistration}
                            </strong>
                            <span style={{ fontSize: '14px', color: '#475569' }}>
                              · {job.vehicleModel}
                            </span>
                            <span className="stage-badge badge-neutral" style={{ fontSize: '11px' }}>
                              {job.jobCardNumber}
                            </span>
                            <span className={`stage-badge ${getPriorityBadgeClass(job.priority)}`} style={{ fontSize: '10px' }}>
                              {job.priority || 'Normal'}
                            </span>
                          </div>

                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            Stage: <strong style={{ color: '#045F60' }}>{job.currentStage}</strong> · Supervisor: <strong>{job.assignedSupervisorName || 'Mahesh Jadhav'}</strong> · Intake: {job.intakeDate}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn-secondary-action"
                            style={{ padding: '5px 10px', fontSize: '11px' }}
                            onClick={() => setDossierJob(job)}
                          >
                            <Eye size={12} /> Inspection Details
                          </button>
                        </div>
                      </div>

                      {/* Bottleneck Notice if Delayed */}
                      {isDelayed && (
                        <div
                          style={{
                            marginTop: '10px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '12px',
                            color: '#991b1b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                          <span>
                            <strong>Floor Alert:</strong> {job.bottleneckInfo?.reason || 'Repair delayed waiting for spare parts or approval.'}
                          </span>
                        </div>
                      )}

                      {/* Task Progress Bar */}
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                          <span>
                            Tasks Completion: <strong>{completedCount} of {tasksForTech.length} done</strong>
                          </span>
                          <span>{progressPct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${progressPct}%`,
                              height: '100%',
                              background: progressPct === 100 ? '#059669' : '#045F60',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </div>

                      {/* Task Items on this Vehicle */}
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {tasksForTech.map((t) => (
                          <div
                            key={t.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '8px',
                              padding: '8px 12px',
                              background: '#ffffff',
                              border: '1px solid #e2eeec',
                              borderRadius: '6px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span className={`stage-badge ${getDepartmentBadgeClass(t.department)}`} style={{ fontSize: '10px' }}>
                                {t.department}
                              </span>
                              <strong style={{ fontSize: '13px', color: '#1e293b' }}>{t.title}</strong>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>({t.estimatedHours} hrs est.)</span>
                              <span className={`stage-badge ${getStatusBadgeClass(t.status)}`} style={{ fontSize: '10px' }}>
                                {t.status}
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {t.status === 'Pending' && (
                                <button
                                  type="button"
                                  className="btn-primary-action"
                                  style={{ padding: '4px 9px', fontSize: '11px' }}
                                  onClick={() => handleQuickStatusChange(job, t, 'In Progress')}
                                  title="Start working on this task"
                                >
                                  <Play size={11} /> Start Work
                                </button>
                              )}
                              {t.status === 'In Progress' && (
                                <button
                                  type="button"
                                  className="btn-primary-action"
                                  style={{ padding: '4px 9px', fontSize: '11px', background: '#067a46', borderColor: '#067a46' }}
                                  onClick={() => handleQuickStatusChange(job, t, 'Completed')}
                                  title="Mark task as complete"
                                >
                                  <Check size={12} /> Complete
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-secondary-action"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                onClick={() => handleOpenTaskModal(job, t)}
                                title="Update notes or status"
                              >
                                <FileText size={11} /> Notes
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: TASKS — INTERACTIVE TASK CHECKLIST (?tab=tasks)         */}
      {/* ============================================================== */}
      {currentTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="wms-panel-card">
            <div className="panel-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Repair Task Execution Board</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Interactive checklist of assigned workshop floor tasks
                </p>
              </div>

              {/* Filters */}
              <div className="wms-filter-controls" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search task or car..."
                  className="table-search-input"
                  style={{ minWidth: '180px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                  className="wms-select-input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <select
                  className="wms-select-input"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="ALL">All Departments</option>
                  <option value="Denting">Denting</option>
                  <option value="Painting">Painting</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Assembly">Assembly</option>
                  <option value="Detailing">Detailing</option>
                </select>
              </div>
            </div>

            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Task &amp; Department</th>
                    <th>Vehicle Details</th>
                    <th>Priority</th>
                    <th>Est. Time</th>
                    <th>Status</th>
                    <th>Notes &amp; Instructions</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        No tasks match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map(({ job, task }) => (
                      <tr key={task.id}>
                        <td>
                          <strong>{task.title}</strong>
                          <div style={{ marginTop: '4px' }}>
                            <span className={`stage-badge ${getDepartmentBadgeClass(task.department)}`} style={{ fontSize: '10px' }}>
                              {task.department}
                            </span>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: '#045F60' }}>{job.vehicleRegistration}</strong>
                          <div style={{ fontSize: '11px', color: '#475569' }}>{job.vehicleModel}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{job.jobCardNumber}</div>
                        </td>
                        <td>
                          <span className={`stage-badge ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td>
                          <strong>{task.estimatedHours} hrs</strong>
                        </td>
                        <td>
                          <span className={`stage-badge ${getStatusBadgeClass(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td style={{ maxWidth: '240px', fontSize: '12px', color: '#334155' }}>
                          {task.notes ? (
                            <div style={{ whiteSpace: 'pre-line' }}>{task.notes}</div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {task.status === 'Pending' && (
                              <button
                                type="button"
                                className="btn-primary-action"
                                style={{ padding: '5px 9px', fontSize: '11px' }}
                                onClick={() => handleQuickStatusChange(job, task, 'In Progress')}
                                title="Start work"
                              >
                                <Play size={12} /> Start
                              </button>
                            )}
                            {task.status === 'In Progress' && (
                              <button
                                type="button"
                                className="btn-primary-action"
                                style={{ padding: '5px 9px', fontSize: '11px', background: '#067a46', borderColor: '#067a46' }}
                                onClick={() => handleQuickStatusChange(job, task, 'Completed')}
                                title="Mark completed"
                              >
                                <Check size={12} /> Complete
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-secondary-action"
                              style={{ padding: '5px 8px', fontSize: '11px' }}
                              onClick={() => handleOpenTaskModal(job, task)}
                              title="Update Task"
                            >
                              <FileText size={12} /> Update
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
      {/* TAB 3: NOTES — FLOOR OBSERVATIONS & LOGS (?tab=notes)           */}
      {/* ============================================================== */}
      {currentTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="wms-panel-card">
            <div className="panel-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Repair Floor Observations &amp; Activity Log</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Floor audit trail, technician updates, and vehicle damage inspection logs
                </p>
              </div>

              <button
                type="button"
                className="btn-primary-action"
                style={{ background: '#8A181A', borderColor: '#8A181A' }}
                onClick={() => {
                  setNoteJobCardId(technicianJobs[0]?.id || '');
                  setShowNewNoteModal(true);
                }}
              >
                <FileText size={14} /> Log New Observation
              </button>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {technicianJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No vehicle notes recorded yet.
                </div>
              ) : (
                technicianJobs.map((job) => {
                  const stageLogs = job.stageHistory || [];
                  const tasksWithNotes = (job.tasks || []).filter((t) => Boolean(t.notes));

                  return (
                    <div
                      key={job.id}
                      style={{
                        background: '#fafdfc',
                        border: '1px solid #e2eeec',
                        borderRadius: '8px',
                        padding: '14px 16px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '15px', color: '#045F60' }}>{job.vehicleRegistration}</strong>
                          <span style={{ fontSize: '13px', color: '#334155', marginLeft: '6px' }}>
                            ({job.vehicleModel}) · {job.jobCardNumber}
                          </span>
                        </div>
                        <span className="stage-badge badge-neutral">{job.currentStage}</span>
                      </div>

                      {/* Accident and Complaint reference */}
                      {job.inspection?.accidentDescription && (
                        <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                          <strong>Damage Assessment:</strong> {job.inspection.accidentDescription}
                        </div>
                      )}

                      {/* Task-Specific Notes */}
                      {tasksWithNotes.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                            Technician Task Notes:
                          </span>
                          <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {tasksWithNotes.map((t) => (
                              <div
                                key={t.id}
                                style={{
                                  fontSize: '12px',
                                  padding: '6px 10px',
                                  background: '#ffffff',
                                  border: '1px solid #e2eeec',
                                  borderRadius: '6px',
                                }}
                              >
                                <span style={{ fontWeight: '600', color: '#1e293b' }}>[{t.department}] {t.title}:</span>{' '}
                                <span style={{ color: '#475569' }}>{t.notes}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stage History */}
                      {stageLogs.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                            Stage History &amp; Handover Notes:
                          </span>
                          <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {stageLogs.slice(-3).map((h, i) => (
                              <div key={i} style={{ fontSize: '11px', color: '#475569' }}>
                                • <strong>{h.stage}</strong> ({h.updatedBy}): {h.notes || 'Stage updated'}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: TASK UPDATE & FLOOR NOTE MODAL                         */}
      {/* ============================================================== */}
      {activeTaskModal && (
        <div
          className="wms-modal-backdrop"
          onClick={() => !submittingTaskUpdate && setActiveTaskModal(null)}
        >
          <div
            className="wms-modal-card"
            style={{ maxWidth: '540px', backgroundColor: '#ffffff', background: '#ffffff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="wms-header-badges">
                  <span className={`stage-badge ${getDepartmentBadgeClass(activeTaskModal.task.department)}`}>
                    {activeTaskModal.task.department}
                  </span>
                  <span className="stage-badge badge-info">{activeTaskModal.job.vehicleRegistration}</span>
                </div>
                <h3 style={{ margin: '6px 0 2px', fontSize: '18px', fontWeight: '800', color: '#141b1b' }}>
                  Update Task: {activeTaskModal.task.title}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  {activeTaskModal.job.vehicleModel} · Job Card {activeTaskModal.job.jobCardNumber}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={submittingTaskUpdate}
                onClick={() => setActiveTaskModal(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTaskModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#1e293b' }}>
                    Task Status *
                  </label>
                  <select
                    className="wms-select-input"
                    style={{ width: '100%' }}
                    value={taskStatusInput}
                    onChange={(e) => setTaskStatusInput(e.target.value as RepairTask['status'])}
                  >
                    <option value="Pending">Pending (Not Started)</option>
                    <option value="In Progress">In Progress (Active Bay Work)</option>
                    <option value="Under Review">Under Review (Checking with Supervisor)</option>
                    <option value="Completed">Completed (Work Finished)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#1e293b' }}>
                    Technician Floor Notes &amp; Observations
                  </label>
                  <textarea
                    rows={4}
                    className="table-search-input"
                    style={{ width: '100%', resize: 'vertical' }}
                    placeholder="Enter repair details, observations, filler layers applied, parts fitted, or issues encountered..."
                    value={taskNoteInput}
                    onChange={(e) => setTaskNoteInput(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2eeec',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: '#475569',
                  }}
                >
                  Estimated duration: <strong>{activeTaskModal.task.estimatedHours} hours</strong>. Updates are recorded under technician <strong>{currentTechName}</strong>.
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  disabled={submittingTaskUpdate}
                  onClick={() => setActiveTaskModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={submittingTaskUpdate}
                  style={{ background: '#8A181A', borderColor: '#8A181A' }}
                >
                  {submittingTaskUpdate ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check size={15} /> Save Task Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: VEHICLE INSPECTION DOSSIER MODAL                       */}
      {/* ============================================================== */}
      {dossierJob && (
        <div
          className="wms-modal-backdrop"
          onClick={() => setDossierJob(null)}
        >
          <div
            className="wms-modal-card"
            style={{ maxWidth: '640px', backgroundColor: '#ffffff', background: '#ffffff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="wms-header-badges">
                  <span className="stage-badge badge-active">{dossierJob.currentStage}</span>
                  <span className="stage-badge badge-info">{dossierJob.jobCardNumber}</span>
                </div>
                <h3 style={{ margin: '6px 0 2px', fontSize: '18px', fontWeight: '800', color: '#141b1b' }}>
                  {dossierJob.vehicleRegistration} — {dossierJob.vehicleModel}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Customer: {dossierJob.customerName} · Supervisor: {dossierJob.assignedSupervisorName}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDossierJob(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div>
                <strong style={{ fontSize: '12px', color: '#045F60', textTransform: 'uppercase' }}>
                  Accident &amp; Damage Description (Service Advisor Intake)
                </strong>
                <p style={{ fontSize: '13px', color: '#1e293b', marginTop: '4px', background: '#f8fafc', padding: '10px 12px', borderRadius: '6px' }}>
                  {dossierJob.inspection?.accidentDescription || 'No detailed damage description provided.'}
                </p>
              </div>

              {dossierJob.inspection?.visibleDamages && dossierJob.inspection.visibleDamages.length > 0 && (
                <div>
                  <strong style={{ fontSize: '12px', color: '#045F60', textTransform: 'uppercase' }}>
                    Visible Damages Recorded
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {dossierJob.inspection.visibleDamages.map((dmg, idx) => (
                      <span key={idx} className="stage-badge badge-danger" style={{ fontSize: '11px' }}>
                        {dmg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {dossierJob.inspection?.customerComplaints && dossierJob.inspection.customerComplaints.length > 0 && (
                <div>
                  <strong style={{ fontSize: '12px', color: '#045F60', textTransform: 'uppercase' }}>
                    Customer Complaints
                  </strong>
                  <ul style={{ margin: '6px 0 0 16px', fontSize: '13px', color: '#334155' }}>
                    {dossierJob.inspection.customerComplaints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {dossierJob.bottleneckInfo?.isDelayed && (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#92400e',
                  }}
                >
                  <strong>Floor Delay Notice:</strong> {dossierJob.bottleneckInfo.reason}
                </div>
              )}
            </div>

            <div className="modal-footer">
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
      {/* MODAL 3: ADD NEW FLOOR NOTE MODAL                               */}
      {/* ============================================================== */}
      {showNewNoteModal && (
        <div
          className="wms-modal-backdrop"
          onClick={() => !submittingNote && setShowNewNoteModal(false)}
        >
          <div
            className="wms-modal-card"
            style={{ maxWidth: '520px', backgroundColor: '#ffffff', background: '#ffffff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#141b1b' }}>
                  Log Repair Floor Observation
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Recorded into vehicle stage history and visible to Workshop Supervisor
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={submittingNote}
                onClick={() => setShowNewNoteModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNewNote}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#1e293b' }}>
                    Select Vehicle / Job Card *
                  </label>
                  <select
                    className="wms-select-input"
                    style={{ width: '100%' }}
                    value={noteJobCardId}
                    onChange={(e) => setNoteJobCardId(e.target.value)}
                    required
                  >
                    {jobCards.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.vehicleRegistration} — {j.vehicleModel} ({j.jobCardNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#1e293b' }}>
                    Observation / Floor Note *
                  </label>
                  <textarea
                    rows={4}
                    className="table-search-input"
                    style={{ width: '100%', resize: 'vertical' }}
                    placeholder="Enter observation notes, additional dent spotted, paint code verified, alignment check result..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  disabled={submittingNote}
                  onClick={() => setShowNewNoteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={submittingNote}
                  style={{ background: '#8A181A', borderColor: '#8A181A' }}
                >
                  {submittingNote ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Logging Note...
                    </>
                  ) : (
                    <>
                      <Check size={15} /> Save Floor Note
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Centered Popup Alert Modal */}
      <CenterPopupModal popup={popupAlert} onClose={() => setPopupAlert(null)} />
    </div>
  );
}

