'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  TrendingUp,
  Layers,
  Wrench,
  ShieldAlert,
  ArrowRight,
  Eye,
  Pencil,
  Trash2,
  X,
  Loader2,
  Car,
  FileText,
  AlertCircle,
  Building2,
  Phone,
  Calendar,
  Check,
} from 'lucide-react';
import type {
  Employee,
  JobCard,
  SparePart,
  SparePartCategory,
  PartRequisition,
  PurchaseOrder,
} from '@/lib/models/types';
import CenterPopupModal, { CenterPopupState } from '@/lib/components/CenterPopupModal';

interface SparePartsManagerDashboardProps {
  activeTab: string;
  jobCards: JobCard[];
  employees: Employee[];
  loading: boolean;
  onRefresh: () => Promise<void> | void;
  onNotify: (msg: string) => void;
}

const CATEGORIES: SparePartCategory[] = [
  'Denting & Body',
  'Body Panels',
  'Electrical & Lights',
  'Paints & Consumables',
  'Lubricants & Oils',
  'Mechanical Bay',
  'Body Glass',
  'Fasteners & Clips',
  'Other',
];

export default function SparePartsManagerDashboard({
  activeTab,
  jobCards,
  employees,
  loading: parentLoading,
  onRefresh,
  onNotify,
}: SparePartsManagerDashboardProps) {
  const currentTab =
    activeTab === 'parts' || activeTab === 'requisitions' || activeTab === 'orders'
      ? activeTab
      : 'overview';

  // State
  const [parts, setParts] = useState<SparePart[]>([]);
  const [requisitions, setPartRequisitions] = useState<PartRequisition[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [poStatusFilter, setPoStatusFilter] = useState('ALL');
  const [reqStatusFilter, setReqStatusFilter] = useState('ALL');

  // Popup Modal
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

  // Modals
  const [showPartModal, setShowPartModal] = useState(false);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [submittingPart, setSubmittingPart] = useState(false);
  const [partForm, setPartForm] = useState({
    partNumber: '',
    name: '',
    description: '',
    category: 'Denting & Body' as SparePartCategory,
    compatibleModels: '',
    stockQuantity: '1',
    minThreshold: '2',
    unitPrice: '1000',
    locationBin: 'Rack A-01',
    supplierName: 'OEM Supplier',
  });

  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedPartForStock, setSelectedPartForStock] = useState<SparePart | null>(null);
  const [stockDelta, setStockDelta] = useState(5);
  const [stockReason, setStockReason] = useState('Regular Restock');
  const [submittingStock, setSubmittingStock] = useState(false);

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueJobCardId, setIssueJobCardId] = useState('');
  const [issuePartId, setIssuePartId] = useState('');
  const [issueQty, setIssueQty] = useState(1);
  const [issueNotes, setIssueNotes] = useState('');
  const [submittingIssue, setSubmittingIssue] = useState(false);
  const [approvingReqId, setApprovingReqId] = useState<string | null>(null);

  const [showPoModal, setShowPoModal] = useState(false);
  const [poSupplierName, setPoSupplierName] = useState('Bosch India Kolhapur');
  const [poSupplierContact, setPoSupplierContact] = useState('+91 94220 12345');
  const [poExpectedDate, setPoExpectedDate] = useState(() => {
    const d = new Date(Date.now() + 5 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [poItems, setPoItems] = useState<
    { partId: string; partNumber: string; partName: string; quantity: number; unitCost: number }[]
  >([]);
  const [poNotes, setPoNotes] = useState('');
  const [submittingPo, setSubmittingPo] = useState(false);

  // Fetch Parts Data
  const fetchPartsData = useCallback(async () => {
    try {
      setLoadingData(true);
      const res = await fetch('/api/spare-parts');
      const data = await res.json();
      if (data.success) {
        setParts(data.parts || []);
        setPartRequisitions(data.requisitions || []);
        setPurchaseOrders(data.purchaseOrders || []);
      }
    } catch (err) {
      console.error('Failed to fetch spare parts:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchPartsData();
  }, [fetchPartsData]);

  // Calculations & KPIs
  const totalValuation = useMemo(() => {
    return parts.reduce((acc, p) => acc + (p.stockQuantity || 0) * (p.unitPrice || 0), 0);
  }, [parts]);

  const lowStockParts = useMemo(() => {
    return parts.filter(
      (p) => (p.stockQuantity || 0) <= (p.minThreshold || 2)
    );
  }, [parts]);

  const pendingRequisitions = useMemo(() => {
    return requisitions.filter(
      (r) => r.status === 'Requested' || r.status === 'Pending Stock'
    );
  }, [requisitions]);

  // Filtered Parts
  const filteredParts = useMemo(() => {
    return parts.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.partNumber.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        p.compatibleModels.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q) ||
        p.locationBin.toLowerCase().includes(q);

      const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;

      return matchSearch && matchCat && matchStatus;
    });
  }, [parts, searchQuery, categoryFilter, statusFilter]);

  // Filtered Requisitions
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.jobCardNumber.toLowerCase().includes(q) ||
        r.vehicleRegistration.toLowerCase().includes(q) ||
        r.vehicleModel.toLowerCase().includes(q) ||
        r.partNumber.toLowerCase().includes(q) ||
        r.partName.toLowerCase().includes(q) ||
        r.requestedBy.toLowerCase().includes(q);

      const matchStatus = reqStatusFilter === 'ALL' || r.status === reqStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [requisitions, searchQuery, reqStatusFilter]);

  // Filtered POs
  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        po.poNumber.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q) ||
        (po.notes || '').toLowerCase().includes(q);

      const matchStatus = poStatusFilter === 'ALL' || po.status === poStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [purchaseOrders, searchQuery, poStatusFilter]);

  // Handlers
  const handleOpenAddPart = () => {
    setEditingPartId(null);
    setPartForm({
      partNumber: `TM-PRT-${String(parts.length + 1).padStart(3, '0')}`,
      name: '',
      description: '',
      category: 'Denting & Body',
      compatibleModels: 'Universal',
      stockQuantity: '5',
      minThreshold: '2',
      unitPrice: '1500',
      locationBin: 'Rack A-01',
      supplierName: 'OEM Supplier',
    });
    setShowPartModal(true);
  };

  const handleOpenEditPart = (p: SparePart) => {
    setEditingPartId(p.id);
    setPartForm({
      partNumber: p.partNumber,
      name: p.name,
      description: p.description || '',
      category: p.category,
      compatibleModels: p.compatibleModels,
      stockQuantity: String(p.stockQuantity),
      minThreshold: String(p.minThreshold),
      unitPrice: String(p.unitPrice),
      locationBin: p.locationBin,
      supplierName: p.supplierName,
    });
    setShowPartModal(true);
  };

  const handleSavePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partForm.partNumber.trim() || !partForm.name.trim()) {
      showCenterPopup('Please fill in Part Code and Part Name.', 'Validation Error', 'error');
      return;
    }

    setSubmittingPart(true);
    try {
      if (editingPartId) {
        // Update
        const res = await fetch('/api/spare-parts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_part',
            id: editingPartId,
            updates: {
              name: partForm.name.trim(),
              description: partForm.description.trim(),
              category: partForm.category,
              compatibleModels: partForm.compatibleModels.trim(),
              stockQuantity: Number(partForm.stockQuantity) || 0,
              minThreshold: Number(partForm.minThreshold) || 2,
              unitPrice: Number(partForm.unitPrice) || 0,
              locationBin: partForm.locationBin.trim(),
              supplierName: partForm.supplierName.trim(),
            },
          }),
        });
        const data = await res.json();
        if (data.success) {
          setShowPartModal(false);
          await fetchPartsData();
          onNotify(data.message || 'Spare part updated successfully.');
        } else {
          showCenterPopup(data.message || 'Failed to update spare part.', 'Error', 'error');
        }
      } else {
        // Add
        const res = await fetch('/api/spare-parts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add_part',
            ...partForm,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setShowPartModal(false);
          await fetchPartsData();
          onNotify(data.message || 'New spare part added to catalog.');
        } else {
          showCenterPopup(data.message || 'Failed to add spare part.', 'Error', 'error');
        }
      }
    } catch (err: unknown) {
      showCenterPopup('Network error while saving part.', 'Connection Error', 'error');
    } finally {
      setSubmittingPart(false);
    }
  };

  const handleDeletePart = (p: SparePart) => {
    showCenterPopup(
      `Are you sure you want to delete "${p.name}" (${p.partNumber}) from the catalog? This cannot be undone.`,
      'Confirm Deletion',
      'warning',
      {
        confirmLabel: 'Delete Part',
        onConfirm: async () => {
          try {
            const res = await fetch('/api/spare-parts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'delete_part', id: p.id }),
            });
            const data = await res.json();
            if (data.success) {
              await fetchPartsData();
              onNotify(`Part "${p.name}" removed from catalog.`);
            } else {
              showCenterPopup(data.message || 'Failed to delete part.', 'Error', 'error');
            }
          } catch {
            showCenterPopup('Failed to delete part.', 'Error', 'error');
          }
        },
      }
    );
  };

  const handleOpenStockAdjust = (p: SparePart, defaultDelta = 5) => {
    setSelectedPartForStock(p);
    setStockDelta(defaultDelta);
    setStockReason(defaultDelta > 0 ? 'Batch Restock' : 'Floor Damaged / Write-off');
    setShowStockModal(true);
  };

  const handleSaveStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartForStock) return;
    setSubmittingStock(true);
    try {
      const res = await fetch('/api/spare-parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust_stock',
          id: selectedPartForStock.id,
          delta: Number(stockDelta),
          reason: stockReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowStockModal(false);
        await fetchPartsData();
        onNotify(data.message || 'Stock quantity updated.');
      } else {
        showCenterPopup(data.message || 'Failed to adjust stock.', 'Error', 'error');
      }
    } catch {
      showCenterPopup('Failed to adjust stock.', 'Error', 'error');
    } finally {
      setSubmittingStock(false);
    }
  };

  const handleOpenIssueModal = (defaultJobId = '') => {
    setIssueJobCardId(defaultJobId || (jobCards[0]?.id || ''));
    setIssuePartId(parts[0]?.id || '');
    setIssueQty(1);
    setIssueNotes('Floor requisition for active vehicle repair.');
    setShowIssueModal(true);
  };

  const handleConfirmIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueJobCardId || !issuePartId) {
      showCenterPopup('Please select both a Job Card and a Spare Part.', 'Error', 'error');
      return;
    }
    const part = parts.find((p) => p.id === issuePartId);
    if (!part || part.stockQuantity < issueQty) {
      showCenterPopup(
        `Insufficient stock! Only ${part?.stockQuantity || 0} units available in warehouse.`,
        'Stock Alert',
        'warning'
      );
      return;
    }

    setSubmittingIssue(true);
    try {
      const res = await fetch('/api/spare-parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'issue_to_job',
          jobCardId: issueJobCardId,
          partId: issuePartId,
          quantity: issueQty,
          notes: issueNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowIssueModal(false);
        await Promise.all([fetchPartsData(), onRefresh()]);
        onNotify(data.message || 'Parts issued to job card successfully!');
      } else {
        showCenterPopup(data.message || 'Failed to issue parts.', 'Error', 'error');
      }
    } catch {
      showCenterPopup('Failed to issue parts.', 'Error', 'error');
    } finally {
      setSubmittingIssue(false);
    }
  };

  const handleApproveAndIssue = async (req: PartRequisition) => {
    const part = parts.find((p) => p.id === req.partId || p.partNumber === req.partNumber);
    if (part && part.stockQuantity < req.quantity) {
      showCenterPopup(
        `Insufficient stock! Warehouse only has ${part.stockQuantity} pcs of "${part.name}", but the floor requested ${req.quantity} pcs. Please create a Purchase Order to restock.`,
        'Low Stock Warning',
        'warning',
        {
          confirmLabel: 'Order Stock (Create PO)',
          onConfirm: () => handleOpenPoModal(part),
        }
      );
      return;
    }

    setApprovingReqId(req.id);
    try {
      const res = await fetch('/api/spare-parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_and_issue',
          requisitionId: req.id,
          issuedBy: 'Sachin K. Mane (Spare Parts Manager)',
        }),
      });
      const data = await res.json();
      if (data.success) {
        await Promise.all([fetchPartsData(), onRefresh()]);
        onNotify(data.message || `Requisition approved! ${req.quantity}x ${req.partName} issued to floor.`);
      } else {
        if (data.needsRestock && data.part) {
          showCenterPopup(
            data.message || 'Insufficient stock to approve this requisition.',
            'Stock Shortage',
            'warning',
            {
              confirmLabel: 'Order Stock',
              onConfirm: () => handleOpenPoModal(data.part),
            }
          );
        } else {
          showCenterPopup(data.message || 'Failed to approve requisition.', 'Error', 'error');
        }
      }
    } catch {
      showCenterPopup('Failed to approve requisition due to network or server error.', 'Error', 'error');
    } finally {
      setApprovingReqId(null);
    }
  };

  const handleOpenPoModal = (prefillPart?: SparePart) => {
    if (prefillPart) {
      setPoItems([
        {
          partId: prefillPart.id,
          partNumber: prefillPart.partNumber,
          partName: prefillPart.name,
          quantity: Math.max(5, (prefillPart.minThreshold || 2) * 2),
          unitCost: Math.round(prefillPart.unitPrice * 0.8),
        },
      ]);
      setPoSupplierName(prefillPart.supplierName || 'Bosch India Kolhapur');
    } else {
      setPoItems(
        parts.slice(0, 2).map((p) => ({
          partId: p.id,
          partNumber: p.partNumber,
          partName: p.name,
          quantity: 5,
          unitCost: Math.round(p.unitPrice * 0.8),
        }))
      );
      setPoSupplierName('Mahindra OEM Spares Pune');
    }
    setShowPoModal(true);
  };

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierName.trim() || poItems.length === 0) {
      showCenterPopup('Please specify a supplier and at least one item.', 'Error', 'error');
      return;
    }

    setSubmittingPo(true);
    try {
      const res = await fetch('/api/spare-parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_po',
          supplierName: poSupplierName,
          supplierContact: poSupplierContact,
          expectedDeliveryDate: poExpectedDate,
          items: poItems,
          notes: poNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPoModal(false);
        await fetchPartsData();
        onNotify(data.message || 'Purchase Order generated.');
      } else {
        showCenterPopup(data.message || 'Failed to create PO.', 'Error', 'error');
      }
    } catch {
      showCenterPopup('Failed to create PO.', 'Error', 'error');
    } finally {
      setSubmittingPo(false);
    }
  };

  const handleReceivePo = (po: PurchaseOrder) => {
    showCenterPopup(
      `Confirm receipt of goods for Purchase Order "${po.poNumber}" from ${po.supplierName}? This will automatically add ${po.items.length} items to active warehouse inventory stock.`,
      'Confirm Goods Receipt',
      'info',
      {
        confirmLabel: 'Confirm Receipt & Restock',
        onConfirm: async () => {
          try {
            const res = await fetch('/api/spare-parts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'receive_po',
                poId: po.id,
              }),
            });
            const data = await res.json();
            if (data.success) {
              await fetchPartsData();
              onNotify(data.message || 'Purchase Order received and inventory replenished!');
            } else {
              showCenterPopup(data.message || 'Failed to receive PO.', 'Error', 'error');
            }
          } catch {
            showCenterPopup('Failed to receive PO.', 'Error', 'error');
          }
        },
      }
    );
  };

  const loading = parentLoading || loadingData;

  return (
    <div>
      {/* ============================================================== */}
      {/* TAB 1: INVENTORY OVERVIEW (DEFAULT)                            */}
      {/* ============================================================== */}
      {currentTab === 'overview' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>Spare Parts & Inventory Operations</h1>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-secondary-action"
                style={{ borderColor: '#D97706', color: '#D97706', fontWeight: '700' }}
                onClick={() => handleOpenPoModal()}
              >
                <Truck size={15} /> New Order
              </button>

              <button
                type="button"
                className="btn-primary-action"
                style={{ background: '#D97706', borderColor: '#D97706' }}
                onClick={handleOpenAddPart}
              >
                <Plus size={16} /> Add Part
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Catalog SKUs</span>
                <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#D97706' }}>
                  <Package size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : `${parts.length} Parts`}</div>
              <div className="stat-card-subtext">Across 8 workshop categories</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Warehouse Stock Valuation</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `₹${totalValuation.toLocaleString('en-IN')}`}
              </div>
              <div className="stat-card-subtext">Active warehouse asset value</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Low / Out of Stock</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `${lowStockParts.length} Alerts`}
              </div>
              <div className="stat-card-subtext" style={{ color: '#8A181A' }}>
                Purchase orders recommended
              </div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Pending Floor Requisitions</span>
                <div className="stat-icon-wrapper" style={{ background: '#eef7f6', color: '#045F60' }}>
                  <Clock size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : `${pendingRequisitions.length} Pending`}
              </div>
              <div className="stat-card-subtext">Active repair job demands</div>
            </div>
          </div>

          {/* Quick Actions & Stock Alerts */}
          <div className="wms-grid-2col">
            {/* Urgent Low Stock Alerts Card */}
            <div className="wms-panel-card">
              <div className="panel-card-header">
                <h3>Urgent Restock Alerts ({lowStockParts.length})</h3>
                <Link
                  href="/panels/spare-parts-manager/dashboard?tab=orders"
                  className="btn-secondary-action"
                  style={{ fontSize: '11px', padding: '5px 10px' }}
                >
                  View POs →
                </Link>
              </div>
              <div style={{ padding: '14px' }}>
                {lowStockParts.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#067a46' }}>
                    <CheckCircle2 size={28} style={{ margin: '0 auto 8px', display: 'block' }} />
                    <strong>All stock levels healthy!</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      All catalog items exceed their minimum safety thresholds.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {lowStockParts.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          background: p.stockQuantity === 0 ? '#fff5f5' : '#fffdfa',
                          border: `1px solid ${p.stockQuantity === 0 ? '#fed7d7' : '#feebc8'}`,
                          borderRadius: '8px',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            <code>{p.partNumber}</code> · {p.compatibleModels} · Bin: {p.locationBin}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            className={`stage-badge ${
                              p.stockQuantity === 0 ? 'badge-danger' : 'badge-warning'
                            }`}
                          >
                            {p.stockQuantity} / {p.minThreshold} pcs
                          </span>

                          <button
                            type="button"
                            className="btn-secondary-action"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => handleOpenStockAdjust(p, 5)}
                            title="Quick Add 5 Stock"
                          >
                            +5 Restock
                          </button>

                          <button
                            type="button"
                            className="btn-primary-action"
                            style={{ padding: '4px 8px', fontSize: '11px', background: '#D97706', borderColor: '#D97706' }}
                            onClick={() => handleOpenPoModal(p)}
                            title="Generate Purchase Order"
                          >
                            Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Floor Requisitions Card */}
            <div className="wms-panel-card">
              <div className="panel-card-header">
                <h3>Live Floor Job Requisitions</h3>
                <Link
                  href="/panels/spare-parts-manager/dashboard?tab=requisitions"
                  className="btn-secondary-action"
                  style={{ fontSize: '11px', padding: '5px 10px' }}
                >
                  Requisitions →
                </Link>
              </div>
              <div style={{ padding: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {jobCards.slice(0, 4).map((job) => {
                    const partsCost = job.costEstimate?.spareParts || 0;
                    const isPartsBottleneck = job.bottleneckInfo?.category === 'Spare Parts Pending';
                    return (
                      <div
                        key={job.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          background: '#fcfdfd',
                          border: isPartsBottleneck ? '1px solid #f87171' : '1px solid #e0e9e8',
                          borderRadius: '8px',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                            {job.vehicleModel} ({job.vehicleRegistration})
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            Job Card: <strong>{job.jobCardNumber}</strong> · Stage: {job.currentStage}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#045F60', fontWeight: '700', marginTop: '3px' }}>
                            Allocated Parts Budget: ₹{partsCost.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isPartsBottleneck && (
                            <span className="stage-badge badge-danger">Parts Hold</span>
                          )}
                          <button
                            type="button"
                            className="btn-primary-action"
                            style={{ padding: '5px 10px', fontSize: '11.5px' }}
                            onClick={() => handleOpenIssueModal(job.id)}
                          >
                            Issue Part
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SPARE PARTS CATALOG (?tab=parts)                        */}
      {/* ============================================================== */}
      {currentTab === 'parts' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>Spare Parts Catalog & Warehouse Inventory</h1>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-primary-action"
                style={{ background: '#D97706', borderColor: '#D97706' }}
                onClick={handleOpenAddPart}
              >
                <Plus size={16} /> Add Part
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">In-Stock Parts</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : parts.filter((p) => p.status === 'In Stock').length}
              </div>
              <div className="stat-card-subtext">Adequate floor stock</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Low Stock Items</span>
                <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#D97706' }}>
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : parts.filter((p) => p.status === 'Low Stock').length}
              </div>
              <div className="stat-card-subtext">At or below threshold</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Out of Stock</span>
                <div className="stat-icon-wrapper" style={{ background: '#fbebed', color: '#8A181A' }}>
                  <AlertCircle size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : parts.filter((p) => p.status === 'Out of Stock').length}
              </div>
              <div className="stat-card-subtext">Replenishment needed</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Warehouse Units</span>
                <div className="stat-icon-wrapper" style={{ background: '#eef7f6', color: '#045F60' }}>
                  <Layers size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : parts.reduce((acc, p) => acc + (p.stockQuantity || 0), 0)} pcs
              </div>
              <div className="stat-card-subtext">Total physical components</div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="wms-filter-bar">
            <div className="wms-filter-controls">
              <input
                type="text"
                className="table-search-input"
                placeholder="Search part code, name, model, bin, supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select
                className="wms-select-input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories ({parts.length})</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                className="wms-select-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Stock Statuses</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <span className="stage-badge badge-info">
              Showing {filteredParts.length} of {parts.length} Parts
            </span>
          </div>

          {/* Parts Master Table */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>Spare Parts Master Catalog</h3>
              <button
                type="button"
                className="btn-secondary-action"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={handleOpenAddPart}
              >
                <Plus size={14} /> Add Part
              </button>
            </div>

            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Part Code</th>
                    <th>Part Name & Description</th>
                    <th>Compatible Model</th>
                    <th>Category</th>
                    <th>Bin Location</th>
                    <th>Stock Qty</th>
                    <th>Min Level</th>
                    <th>Unit Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                        No spare parts match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredParts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <code>{p.partNumber}</code>
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                          {p.description && (
                            <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '280px' }}>
                              {p.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="stage-badge badge-neutral">{p.compatibleModels}</span>
                        </td>
                        <td>{p.category}</td>
                        <td>
                          <span style={{ fontSize: '11.5px', color: '#045F60', fontWeight: '600' }}>
                            {p.locationBin}
                          </span>
                        </td>
                        <td>
                          <strong
                            style={{
                              fontSize: '13px',
                              color: p.stockQuantity === 0 ? '#b91c1c' : p.stockQuantity <= p.minThreshold ? '#b45309' : '#0f172a',
                            }}
                          >
                            {p.stockQuantity} pcs
                          </strong>
                        </td>
                        <td style={{ color: '#64748b' }}>{p.minThreshold} pcs</td>
                        <td>
                          <strong>₹{p.unitPrice.toLocaleString('en-IN')}</strong>
                        </td>
                        <td>
                          <span
                            className={`stage-badge ${
                              p.status === 'In Stock'
                                ? 'badge-active'
                                : p.status === 'Low Stock'
                                ? 'badge-warning'
                                : 'badge-danger'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn-secondary-action"
                              style={{ padding: '5px 8px', fontSize: '11px' }}
                              onClick={() => handleOpenStockAdjust(p, 5)}
                              title="Adjust Stock"
                            >
                              Stock ±
                            </button>
                            <button
                              type="button"
                              className="btn-secondary-action"
                              style={{ padding: '5px 8px', fontSize: '11px' }}
                              onClick={() => handleOpenEditPart(p)}
                              title="Edit Details"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              className="btn-secondary-action"
                              style={{ padding: '5px 8px', fontSize: '11px', color: '#b91c1c', borderColor: '#fca5a5' }}
                              onClick={() => handleDeletePart(p)}
                              title="Delete Part"
                            >
                              <Trash2 size={12} />
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
      {/* TAB 3: JOB REQUISITIONS (?tab=requisitions)                     */}
      {/* ============================================================== */}
      {currentTab === 'requisitions' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>Workshop Floor Requisitions & Job Allocation</h1>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-primary-action"
                style={{ background: '#D97706', borderColor: '#D97706' }}
                onClick={() => handleOpenIssueModal()}
              >
                <Plus size={16} /> Issue Part
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Active Repair Jobs</span>
                <div className="stat-icon-wrapper" style={{ background: '#eef7f6', color: '#045F60' }}>
                  <Car size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : jobCards.length} Vehicles</div>
              <div className="stat-card-subtext">Floor capacity in progress</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Parts Requisitions Fulfilled</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : requisitions.filter((r) => r.status === 'Issued').length} Issued
              </div>
              <div className="stat-card-subtext">Delivered to repair floor</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Pending Parts Demands</span>
                <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#D97706' }}>
                  <Clock size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : requisitions.filter((r) => r.status !== 'Issued').length}
              </div>
              <div className="stat-card-subtext">Awaiting allocation or receipt</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Parts Allocated</span>
                <div className="stat-icon-wrapper" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading
                  ? '...'
                  : `₹${jobCards
                      .reduce((acc, j) => acc + (j.costEstimate?.spareParts || 0), 0)
                      .toLocaleString('en-IN')}`}
              </div>
              <div className="stat-card-subtext">Estimated floor parts cost</div>
            </div>
          </div>

          {/* Incoming Floor Requisitions (Supervisor Approval Queue) */}
          <div className="wms-panel-card" style={{ marginBottom: '24px' }}>
            <div className="panel-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={18} style={{ color: '#D97706' }} />
                  Incoming Floor Requisitions (Supervisor Approval Queue)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Live parts requested by workshop floor supervisors for active repairs
                </p>
              </div>
              <div>
                <span className={`stage-badge ${pendingRequisitions.length > 0 ? 'badge-warning' : 'badge-active'}`}>
                  {pendingRequisitions.length} Pending Approval
                </span>
              </div>
            </div>

            {pendingRequisitions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                <CheckCircle2 size={36} style={{ color: '#059669', margin: '0 auto 8px' }} />
                <div style={{ fontWeight: '600', color: '#1e293b' }}>No Pending Floor Requisitions</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>All parts requested by workshop floor supervisors have been processed and issued.</div>
              </div>
            ) : (
              <div className="wms-table-responsive">
                <table className="wms-table">
                  <thead>
                    <tr>
                      <th>Job Card &amp; Vehicle</th>
                      <th>Requested Part</th>
                      <th>Qty</th>
                      <th>Warehouse Stock</th>
                      <th>Supervisor Notes</th>
                      <th>Requested By</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequisitions.map((req) => {
                      const matchedPart = parts.find((p) => p.id === req.partId || p.partNumber === req.partNumber);
                      const currentStock = matchedPart ? matchedPart.stockQuantity : 0;
                      const hasSufficientStock = currentStock >= req.quantity;

                      return (
                        <tr key={req.id}>
                          <td>
                            <strong>{req.jobCardNumber}</strong>
                            <div style={{ color: '#045F60', fontWeight: '600', fontSize: '12px' }}>
                              {req.vehicleRegistration}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {req.vehicleModel}
                            </div>
                          </td>
                          <td>
                            <strong>{req.partName}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              SKU: <code>{req.partNumber}</code> · ₹{req.unitPrice}
                            </div>
                          </td>
                          <td>
                            <strong style={{ fontSize: '13px' }}>{req.quantity} pcs</strong>
                            <div style={{ fontSize: '11px', color: '#045F60' }}>
                              Total: ₹{req.totalPrice.toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td>
                            {matchedPart ? (
                              hasSufficientStock ? (
                                <span className="stage-badge badge-active" title="Available in warehouse">
                                  {currentStock} in stock
                                </span>
                              ) : (
                                <span className="stage-badge badge-danger" title="Warehouse stock is less than requested">
                                  Only {currentStock} in stock
                                </span>
                              )
                            ) : (
                              <span className="stage-badge badge-neutral">Part Not Found</span>
                            )}
                          </td>
                          <td style={{ maxWidth: '220px', fontSize: '12px', color: '#334155' }}>
                            {req.notes || '—'}
                          </td>
                          <td>
                            <div style={{ fontSize: '12px', fontWeight: '500' }}>{req.requestedBy}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {new Date(req.requestedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {hasSufficientStock ? (
                                <button
                                  type="button"
                                  className="btn-primary-action"
                                  style={{
                                    padding: '5px 10px',
                                    fontSize: '11px',
                                    background: '#067a46',
                                    borderColor: '#067a46',
                                  }}
                                  disabled={approvingReqId === req.id}
                                  onClick={() => handleApproveAndIssue(req)}
                                  title="Deduct stock & issue to job card"
                                >
                                  {approvingReqId === req.id ? (
                                    <>
                                      <Loader2 size={12} className="animate-spin" /> Issuing...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 size={12} /> Approve &amp; Issue
                                    </>
                                  )}
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="btn-secondary-action"
                                    style={{
                                      padding: '5px 9px',
                                      fontSize: '11px',
                                      borderColor: '#D97706',
                                      color: '#B45309',
                                    }}
                                    onClick={() => handleOpenPoModal(matchedPart)}
                                    title="Create Purchase Order for this part"
                                  >
                                    <Truck size={12} /> Order Stock
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-secondary-action"
                                    style={{
                                      padding: '5px 8px',
                                      fontSize: '11px',
                                    }}
                                    disabled={approvingReqId === req.id}
                                    onClick={() => handleApproveAndIssue(req)}
                                    title="Attempt issue or mark pending"
                                  >
                                    Check &amp; Issue
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Job Cards Table */}
          <div className="wms-panel-card" style={{ marginBottom: '24px' }}>
            <div className="panel-card-header">
              <h3>Active Job Cards Requiring Floor Parts</h3>
              <span className="stage-badge badge-info">Real-time Floor Sync</span>
            </div>

            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Job Card No</th>
                    <th>Vehicle Details</th>
                    <th>Customer</th>
                    <th>Current Stage</th>
                    <th>Assigned Supervisor</th>
                    <th>Spare Parts Budget</th>
                    <th>Parts Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobCards.map((job) => {
                    const isDelayedForParts = job.bottleneckInfo?.category === 'Spare Parts Pending';
                    const partsVal = job.costEstimate?.spareParts || 0;
                    return (
                      <tr key={job.id}>
                        <td>
                          <strong>{job.jobCardNumber}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Intake: {job.intakeDate}</div>
                        </td>
                        <td>
                          <strong style={{ color: '#045F60' }}>{job.vehicleRegistration}</strong>
                          <div style={{ fontSize: '12px', color: '#475569' }}>{job.vehicleModel}</div>
                        </td>
                        <td>
                          <div>{job.customerName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{job.customerPhone}</div>
                        </td>
                        <td>
                          <span className="stage-badge badge-neutral">{job.currentStage}</span>
                        </td>
                        <td>{job.assignedSupervisorName || 'Mahesh Jadhav'}</td>
                        <td>
                          <strong>₹{partsVal.toLocaleString('en-IN')}</strong>
                        </td>
                        <td>
                          {isDelayedForParts ? (
                            <span className="stage-badge badge-danger">Hold: Waiting Parts</span>
                          ) : partsVal > 0 ? (
                            <span className="stage-badge badge-active">Allocated</span>
                          ) : (
                            <span className="stage-badge badge-neutral">Labour Only</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-primary-action"
                            style={{ padding: '5px 10px', fontSize: '11.5px', background: '#D97706', borderColor: '#D97706' }}
                            onClick={() => handleOpenIssueModal(job.id)}
                          >
                            Issue Part
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Requisitions Log Table */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>Requisitions Fulfillment History</h3>
              <div className="wms-filter-controls">
                <select
                  className="wms-select-input"
                  value={reqStatusFilter}
                  onChange={(e) => setReqStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Requested">Requested (Floor)</option>
                  <option value="Issued">Issued</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Pending Stock">Pending Stock</option>
                </select>
              </div>
            </div>

            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Job Card</th>
                    <th>Vehicle</th>
                    <th>Part Code &amp; Name</th>
                    <th>Qty</th>
                    <th>Unit Cost</th>
                    <th>Total Value</th>
                    <th>Status</th>
                    <th>Requested By</th>
                    <th>Issued At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequisitions.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No parts requisitions recorded.
                      </td>
                    </tr>
                  ) : (
                    filteredRequisitions.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <strong>{req.jobCardNumber}</strong>
                        </td>
                        <td>
                          <div>{req.vehicleRegistration}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{req.vehicleModel}</div>
                        </td>
                        <td>
                          <code>{req.partNumber}</code> · <strong>{req.partName}</strong>
                        </td>
                        <td>
                          <strong>{req.quantity} pcs</strong>
                        </td>
                        <td>₹{req.unitPrice.toLocaleString('en-IN')}</td>
                        <td>
                          <strong>₹{req.totalPrice.toLocaleString('en-IN')}</strong>
                        </td>
                        <td>
                          <span
                            className={`stage-badge ${
                              req.status === 'Issued'
                                ? 'badge-active'
                                : req.status === 'Allocated'
                                ? 'badge-info'
                                : req.status === 'Requested'
                                ? 'badge-warning'
                                : 'badge-danger'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px' }}>{req.requestedBy}</td>
                        <td style={{ fontSize: '11px', color: '#64748b' }}>
                          {req.issuedAt ? new Date(req.issuedAt).toLocaleDateString('en-IN') : 'Pending'}
                        </td>
                        <td>
                          {req.status === 'Requested' || req.status === 'Pending Stock' ? (
                            <button
                              type="button"
                              className="btn-primary-action"
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                background: '#067a46',
                                borderColor: '#067a46',
                              }}
                              disabled={approvingReqId === req.id}
                              onClick={() => handleApproveAndIssue(req)}
                              title="Approve and issue part to floor"
                            >
                              {approvingReqId === req.id ? 'Issuing...' : 'Approve & Issue'}
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Fulfilled</span>
                          )}
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
      {/* TAB 4: PURCHASE ORDERS (?tab=orders)                           */}
      {/* ============================================================== */}
      {currentTab === 'orders' && (
        <div>
          <div className="workspace-header">
            <div className="workspace-title-box">
              <h1>Purchase Orders & Supplier Procurement</h1>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                className="btn-primary-action"
                style={{ background: '#D97706', borderColor: '#D97706' }}
                onClick={() => handleOpenPoModal()}
              >
                <Plus size={16} /> New Order
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="wms-stats-grid">
            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Purchase Orders</span>
                <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#D97706' }}>
                  <Truck size={20} />
                </div>
              </div>
              <div className="stat-card-value">{loading ? '...' : purchaseOrders.length}</div>
              <div className="stat-card-subtext">Vendor order records</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Active In-Transit Orders</span>
                <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  <Clock size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : purchaseOrders.filter((po) => po.status === 'Placed').length}
              </div>
              <div className="stat-card-subtext">Dispatched from suppliers</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Orders Received</span>
                <div className="stat-icon-wrapper" style={{ background: '#e6f7ef', color: '#067a46' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading ? '...' : purchaseOrders.filter((po) => po.status === 'Received').length}
              </div>
              <div className="stat-card-subtext">Restocked to warehouse</div>
            </div>

            <div className="wms-stat-card">
              <div className="stat-card-top">
                <span className="stat-card-title">Total Procurement Value</span>
                <div className="stat-icon-wrapper" style={{ background: '#eef7f6', color: '#045F60' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {loading
                  ? '...'
                  : `₹${purchaseOrders
                      .reduce((acc, po) => acc + (po.totalAmount || 0), 0)
                      .toLocaleString('en-IN')}`}
              </div>
              <div className="stat-card-subtext">Suppliers procurement ledger</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="wms-filter-bar">
            <div className="wms-filter-controls">
              <input
                type="text"
                className="table-search-input"
                placeholder="Search PO number, supplier, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select
                className="wms-select-input"
                value={poStatusFilter}
                onChange={(e) => setPoStatusFilter(e.target.value)}
              >
                <option value="ALL">All Order Statuses</option>
                <option value="Placed">Placed / In Transit</option>
                <option value="Received">Received & Stocked</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <span className="stage-badge badge-info">
              Showing {filteredPurchaseOrders.length} of {purchaseOrders.length} POs
            </span>
          </div>

          {/* PO Table */}
          <div className="wms-panel-card">
            <div className="panel-card-header">
              <h3>Supplier Purchase Orders Ledger</h3>
              <button
                type="button"
                className="btn-primary-action"
                style={{ padding: '6px 12px', fontSize: '12px', background: '#D97706', borderColor: '#D97706' }}
                onClick={() => handleOpenPoModal()}
              >
                <Plus size={14} /> New Order
              </button>
            </div>

            <div className="wms-table-responsive">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Supplier Name & Contact</th>
                    <th>Order Date</th>
                    <th>Expected Delivery</th>
                    <th>Ordered Items</th>
                    <th>Total Value</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchaseOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                        No purchase orders match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchaseOrders.map((po) => (
                      <tr key={po.id}>
                        <td>
                          <strong>{po.poNumber}</strong>
                        </td>
                        <td>
                          <strong>{po.supplierName}</strong>
                          {po.supplierContact && (
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {po.supplierContact}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '12px' }}>{po.orderDate}</td>
                        <td style={{ fontSize: '12px' }}>{po.expectedDeliveryDate}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {po.items.map((item, idx) => (
                              <div key={idx} style={{ fontSize: '11.5px', color: '#334155' }}>
                                • {item.partName} <strong>(x{item.quantity})</strong>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong>₹{po.totalAmount.toLocaleString('en-IN')}</strong>
                        </td>
                        <td>
                          <span
                            className={`stage-badge ${
                              po.status === 'Received'
                                ? 'badge-active'
                                : po.status === 'Placed'
                                ? 'badge-info'
                                : 'badge-neutral'
                            }`}
                          >
                            {po.status === 'Placed' ? 'In Transit' : po.status}
                          </span>
                        </td>
                        <td>
                          {po.status === 'Placed' ? (
                            <button
                              type="button"
                              className="btn-primary-action"
                              style={{ padding: '5px 10px', fontSize: '11.5px', background: '#045F60', borderColor: '#045F60' }}
                              onClick={() => handleReceivePo(po)}
                            >
                              <Check size={12} /> Receive Order
                            </button>
                          ) : (
                            <span style={{ fontSize: '11.5px', color: '#067a46', fontWeight: '700' }}>
                              ✓ Restocked
                            </span>
                          )}
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
      {/* MODAL 1: ADD / EDIT SPARE PART                                 */}
      {/* ============================================================== */}
      {showPartModal && (
        <div className="wms-modal-backdrop" onClick={() => setShowPartModal(false)}>
          <div className="wms-modal-card" style={{ maxWidth: '580px', background: '#ffffff', backgroundColor: '#ffffff' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{editingPartId ? 'Edit Spare Part' : 'Add New Spare Part to Catalog'}</h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Manage item SKU, compatible vehicles, inventory threshold, and pricing.
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowPartModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePart}>
              <div className="modal-body" style={{ maxHeight: 'calc(80vh - 140px)', overflowY: 'auto' }}>
                <div className="wms-form-grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Part Code (SKU) *
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. TM-PRT-015"
                      value={partForm.partNumber}
                      onChange={(e) => setPartForm({ ...partForm, partNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Category *
                    </label>
                    <select
                      className="wms-select-input"
                      style={{ width: '100%' }}
                      value={partForm.category}
                      onChange={(e) => setPartForm({ ...partForm, category: e.target.value as SparePartCategory })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    Part Name *
                  </label>
                  <input
                    type="text"
                    className="table-search-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. Front Radiator Grille Assembly"
                    value={partForm.name}
                    onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    Compatible Vehicle Models
                  </label>
                  <input
                    type="text"
                    className="table-search-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. Mahindra Thar 2020-2024 / Scorpio-N"
                    value={partForm.compatibleModels}
                    onChange={(e) => setPartForm({ ...partForm, compatibleModels: e.target.value })}
                  />
                </div>

                <div className="wms-form-grid-3" style={{ marginTop: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Current Stock (pcs) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={partForm.stockQuantity}
                      onChange={(e) => setPartForm({ ...partForm, stockQuantity: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Min Threshold (pcs) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={partForm.minThreshold}
                      onChange={(e) => setPartForm({ ...partForm, minThreshold: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Unit Price (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      value={partForm.unitPrice}
                      onChange={(e) => setPartForm({ ...partForm, unitPrice: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="wms-form-grid-2" style={{ marginTop: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Warehouse Storage Location / Bin
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Rack B-04 / Shelf 2"
                      value={partForm.locationBin}
                      onChange={(e) => setPartForm({ ...partForm, locationBin: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Primary OEM / Vendor Supplier
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Mahindra OEM Spares"
                      value={partForm.supplierName}
                      onChange={(e) => setPartForm({ ...partForm, supplierName: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    Specification Notes
                  </label>
                  <textarea
                    className="table-search-input"
                    rows={2}
                    style={{ width: '100%', resize: 'vertical' }}
                    placeholder="OEM part number, material grade, coating specifications..."
                    value={partForm.description}
                    onChange={(e) => setPartForm({ ...partForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setShowPartModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ background: '#D97706', borderColor: '#D97706' }}
                  disabled={submittingPart}
                >
                  {submittingPart ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : editingPartId ? (
                    'Save Changes'
                  ) : (
                    'Register Spare Part'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: STOCK QUANTITY ADJUSTMENT                             */}
      {/* ============================================================== */}
      {showStockModal && selectedPartForStock && (
        <div className="wms-modal-backdrop" onClick={() => setShowStockModal(false)}>
          <div className="wms-modal-card" style={{ maxWidth: '440px', background: '#ffffff', backgroundColor: '#ffffff' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Adjust Warehouse Stock</h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {selectedPartForStock.name} ({selectedPartForStock.partNumber})
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowStockModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjust}>
              <div className="modal-body">
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '14px',
                    fontSize: '12.5px',
                  }}
                >
                  <div>
                    Current Stock: <strong>{selectedPartForStock.stockQuantity} pcs</strong>
                  </div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>
                    Bin Location: <strong>{selectedPartForStock.locationBin}</strong> · Unit Price: ₹{selectedPartForStock.unitPrice}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    Stock Adjustment Units (+ to add, - to deduct) *
                  </label>
                  <input
                    type="number"
                    className="table-search-input"
                    style={{ width: '100%' }}
                    value={stockDelta}
                    onChange={(e) => setStockDelta(Number(e.target.value) || 0)}
                    required
                  />
                  <div style={{ fontSize: '11.5px', color: '#045F60', marginTop: '4px' }}>
                    Resulting new stock balance: <strong>{Math.max(0, selectedPartForStock.stockQuantity + stockDelta)} pcs</strong>
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    Adjustment Reason
                  </label>
                  <select
                    className="wms-select-input"
                    style={{ width: '100%' }}
                    value={stockReason}
                    onChange={(e) => setStockReason(e.target.value)}
                  >
                    <option value="Batch Restock">Batch Restock / Delivery Received</option>
                    <option value="Physical Count Correction">Physical Inventory Count Audit</option>
                    <option value="Floor Damaged / Write-off">Floor Damaged / Scrap Write-off</option>
                    <option value="Direct Sales Issue">Direct Over-the-Counter Issue</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setShowStockModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ background: '#D97706', borderColor: '#D97706' }}
                  disabled={submittingStock}
                >
                  {submittingStock ? 'Updating...' : 'Confirm Stock Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: ISSUE PARTS TO JOB CARD                               */}
      {/* ============================================================== */}
      {showIssueModal && (
        <div className="wms-modal-backdrop" onClick={() => setShowIssueModal(false)}>
          <div className="wms-modal-card" style={{ maxWidth: '520px', background: '#ffffff', backgroundColor: '#ffffff' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Issue Spare Parts to Repair Floor</h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Direct allocation to an active repair job card.
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowIssueModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmIssue}>
              <div className="modal-body">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    Select Target Active Job Card *
                  </label>
                  <select
                    className="wms-select-input"
                    style={{ width: '100%' }}
                    value={issueJobCardId}
                    onChange={(e) => setIssueJobCardId(e.target.value)}
                    required
                  >
                    {jobCards.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.jobCardNumber} — {j.vehicleModel} ({j.vehicleRegistration}) [{j.currentStage}]
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    Select Spare Part from Catalog *
                  </label>
                  <select
                    className="wms-select-input"
                    style={{ width: '100%' }}
                    value={issuePartId}
                    onChange={(e) => setIssuePartId(e.target.value)}
                    required
                  >
                    {parts.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.stockQuantity === 0}>
                        {p.partNumber} - {p.name} (Available: {p.stockQuantity} pcs) — ₹{p.unitPrice}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    Quantity to Issue (pcs) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={parts.find((p) => p.id === issuePartId)?.stockQuantity || 1}
                    className="table-search-input"
                    style={{ width: '100%' }}
                    value={issueQty}
                    onChange={(e) => setIssueQty(Math.max(1, Number(e.target.value) || 1))}
                    required
                  />
                  {parts.find((p) => p.id === issuePartId) && (
                    <div style={{ fontSize: '11.5px', color: '#045F60', marginTop: '4px' }}>
                      Total Allocation Value:{' '}
                      <strong>
                        ₹
                        {(
                          (parts.find((p) => p.id === issuePartId)?.unitPrice || 0) * issueQty
                        ).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    Requisition Notes / Receiving Bay
                  </label>
                  <input
                    type="text"
                    className="table-search-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. Handed to technician Sagar Kamble in Denting Bay"
                    value={issueNotes}
                    onChange={(e) => setIssueNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setShowIssueModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ background: '#D97706', borderColor: '#D97706' }}
                  disabled={submittingIssue}
                >
                  {submittingIssue ? 'Processing Issue...' : 'Confirm Floor Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: CREATE PURCHASE ORDER                                 */}
      {/* ============================================================== */}
      {showPoModal && (
        <div className="wms-modal-backdrop" onClick={() => setShowPoModal(false)}>
          <div className="wms-modal-card" style={{ maxWidth: '600px', background: '#ffffff', backgroundColor: '#ffffff' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Create Supplier Purchase Order</h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Restock warehouse inventory from OEM distributors.
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowPoModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePo}>
              <div className="modal-body" style={{ maxHeight: 'calc(80vh - 140px)', overflowY: 'auto' }}>
                <div className="wms-form-grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Supplier / Distributor Name *
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Mahindra OEM Spares"
                      value={poSupplierName}
                      onChange={(e) => setPoSupplierName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Vendor Contact Phone
                    </label>
                    <input
                      type="text"
                      className="table-search-input"
                      style={{ width: '100%' }}
                      placeholder="+91 94220 12345"
                      value={poSupplierContact}
                      onChange={(e) => setPoSupplierContact(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    Expected Delivery Date *
                  </label>
                  <input
                    type="date"
                    className="table-search-input"
                    style={{ width: '100%' }}
                    value={poExpectedDate}
                    onChange={(e) => setPoExpectedDate(e.target.value)}
                    required
                  />
                </div>

                {/* Items to order */}
                <div style={{ marginTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700' }}>Order Line Items ({poItems.length})</label>
                    <button
                      type="button"
                      className="btn-secondary-action"
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                      onClick={() => {
                        const nextPart = parts.find((p) => !poItems.some((item) => item.partId === p.id)) || parts[0];
                        if (nextPart) {
                          setPoItems([
                            ...poItems,
                            {
                              partId: nextPart.id,
                              partNumber: nextPart.partNumber,
                              partName: nextPart.name,
                              quantity: 5,
                              unitCost: Math.round(nextPart.unitPrice * 0.8),
                            },
                          ]);
                        }
                      }}
                    >
                      + Add Item
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {poItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="wms-po-item-row"
                        style={{
                          background: '#f8fafc',
                          padding: '8px 10px',
                          borderRadius: '6px',
                        }}
                      >
                        <select
                          className="wms-select-input"
                          style={{ fontSize: '11.5px', padding: '4px' }}
                          value={item.partId}
                          onChange={(e) => {
                            const selected = parts.find((p) => p.id === e.target.value);
                            if (selected) {
                              const updated = [...poItems];
                              updated[idx] = {
                                ...updated[idx],
                                partId: selected.id,
                                partNumber: selected.partNumber,
                                partName: selected.name,
                                unitCost: Math.round(selected.unitPrice * 0.8),
                              };
                              setPoItems(updated);
                            }
                          }}
                        >
                          {parts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.partNumber} - {p.name}
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          className="table-search-input"
                          style={{ fontSize: '12px', padding: '4px' }}
                          title="Quantity"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...poItems];
                            updated[idx].quantity = Math.max(1, Number(e.target.value) || 1);
                            setPoItems(updated);
                          }}
                        />

                        <input
                          type="number"
                          min="0"
                          className="table-search-input"
                          style={{ fontSize: '12px', padding: '4px' }}
                          title="Cost Per Unit"
                          value={item.unitCost}
                          onChange={(e) => {
                            const updated = [...poItems];
                            updated[idx].unitCost = Number(e.target.value) || 0;
                            setPoItems(updated);
                          }}
                        />

                        <button
                          type="button"
                          className="btn-secondary-action"
                          style={{ padding: '4px 6px', color: '#b91c1c' }}
                          onClick={() => {
                            setPoItems(poItems.filter((_, i) => i !== idx));
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '8px', textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#045F60' }}>
                    Total Order Estimated Cost: ₹
                    {poItems
                      .reduce((acc, i) => acc + (i.quantity || 0) * (i.unitCost || 0), 0)
                      .toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    Order Instructions / Shipping Terms
                  </label>
                  <textarea
                    className="table-search-input"
                    rows={2}
                    style={{ width: '100%', resize: 'vertical' }}
                    placeholder="Standard delivery terms, dock receiving bay notes..."
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setShowPoModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ background: '#D97706', borderColor: '#D97706' }}
                  disabled={submittingPo}
                >
                  {submittingPo ? 'Generating PO...' : 'Dispatch Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Center popup modal for notifications / confirmations */}
      <CenterPopupModal popup={popupAlert} onClose={() => setPopupAlert(null)} />
    </div>
  );
}