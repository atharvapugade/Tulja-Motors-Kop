'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  X,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Building2,
  FileCheck,
} from 'lucide-react';
import { generateAdminReportPdf, AdminReportPage, ReportPeriod } from '@/lib/utils/pdfGenerator';
import CenterPopupModal, { CenterPopupState } from '@/lib/components/CenterPopupModal';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: AdminReportPage;
  pageTitle: string;
  data: {
    stats?: any;
    employees?: any[];
    jobCards?: any[];
    invoices?: any[];
    payments?: any[];
    expenses?: any[];
    activityLogs?: any[];
  };
  onSuccess?: (msg: string) => void;
}

export default function ExportPdfModal({
  isOpen,
  onClose,
  page,
  pageTitle,
  data,
  onSuccess,
}: ExportPdfModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('daily');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfErrorPopup, setPdfErrorPopup] = useState<CenterPopupState | null>(null);

  if (!isOpen) return null;

  const handleDownload = async (periodOverride?: ReportPeriod) => {
    const period = periodOverride || selectedPeriod;
    setIsGenerating(true);

    try {
      // Small timeout to allow UI rendering of loader
      await new Promise((resolve) => setTimeout(resolve, 300));
      const fileName = generateAdminReportPdf({
        page,
        period,
        data,
      });

      if (onSuccess) {
        onSuccess(`Official ${period.toUpperCase()} PDF Report downloaded successfully: ${fileName}`);
      }
      onClose();
    } catch (err: unknown) {
      console.error('Error generating PDF report:', err);
      setPdfErrorPopup({
        title: 'PDF Generation Failed',
        message: 'Failed to generate PDF: ' + (err instanceof Error ? err.message : String(err)),
        tone: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const periodOptions: { id: ReportPeriod; label: string; tag: string; desc: string }[] = [
    {
      id: 'daily',
      label: 'Daily Report',
      tag: 'Live Snapshot',
      desc: "Today's live workshop operations, real-time bay status, presence & immediate intake.",
    },
    {
      id: 'weekly',
      label: 'Weekly Report',
      tag: 'Last 7 Days',
      desc: 'Week-to-date repair throughput, technician productivity, parts issued & collections.',
    },
    {
      id: 'monthly',
      label: 'Monthly Report',
      tag: 'Executive Master',
      desc: 'Full month comprehensive management statement, GST ledger, payroll & compliance audit.',
    },
  ];

  return (
    <div className="wms-modal-backdrop" onClick={() => !isGenerating && onClose()}>
      <div
        className="wms-modal-card"
        style={{ maxWidth: '620px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="modal-header">
          <div>
            <div className="wms-header-badges">
              <span className="stage-badge badge-active">Executive PDF Export</span>
              <span className="stage-badge badge-info">Tulja Motors Official</span>
            </div>
            <h3>Download {pageTitle} Report (PDF)</h3>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
              Generates an executive-formatted PDF with Tulja Motors letterhead logo, KPI metrics, and certified data.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            disabled={isGenerating}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="modal-body" style={{ padding: '20px 24px' }}>
          {/* 1. SELECT REPORT PERIOD */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '10px',
              }}
            >
              Choose Report Frequency / Period:
            </label>

            <div className="wms-pdf-period-grid">
              {periodOptions.map((opt) => {
                const isSelected = selectedPeriod === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedPeriod(opt.id)}
                    style={{
                      border: isSelected ? '2px solid #045F60' : '1px solid #e2e8f0',
                      background: isSelected ? '#f0fdfa' : '#ffffff',
                      borderRadius: '8px',
                      padding: '12px 10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                      <span
                        className={`stage-badge ${isSelected ? 'badge-active' : 'badge-neutral'}`}
                        style={{ fontSize: '10px' }}
                      >
                        {opt.tag}
                      </span>
                    </div>
                    <strong style={{ fontSize: '13px', color: isSelected ? '#045F60' : '#1e293b', display: 'block' }}>
                      {opt.label}
                    </strong>
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', lineHeight: 1.3 }}>
                      {opt.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. REPORT SPECIFICATION PREVIEW */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '14px 16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
              Report Document Specification:
            </div>
            <div className="wms-modal-spec-grid" style={{ fontSize: '12px', color: '#475569' }}>
              <div>
                • <strong>Document:</strong> {pageTitle}
              </div>
              <div>
                • <strong>Frequency:</strong> {selectedPeriod.toUpperCase()}
              </div>
              <div>
                • <strong>Branding:</strong> Official Tulja Motors Letterhead
              </div>
              <div>
                • <strong>Orientation:</strong> {page === 'overview' ? 'A4 Portrait Brief' : 'A4 Landscape Table'}
              </div>
              <div>
                • <strong>Audit Seal:</strong> SHA-256 System Certified
              </div>
              <div>
                • <strong>Target Audience:</strong> Managing Director & Board
              </div>
            </div>
          </div>

          {/* QUICK TRIGGER BUTTONS */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Instant Download:</span>
            <button
              type="button"
              className="stage-badge badge-info"
              style={{ cursor: 'pointer', padding: '4px 8px', fontSize: '11px' }}
              onClick={() => handleDownload('daily')}
              disabled={isGenerating}
            >
              ⚡ Daily PDF
            </button>
            <button
              type="button"
              className="stage-badge badge-warning"
              style={{ cursor: 'pointer', padding: '4px 8px', fontSize: '11px' }}
              onClick={() => handleDownload('weekly')}
              disabled={isGenerating}
            >
              ⚡ Weekly PDF
            </button>
            <button
              type="button"
              className="stage-badge badge-active"
              style={{ cursor: 'pointer', padding: '4px 8px', fontSize: '11px' }}
              onClick={() => handleDownload('monthly')}
              disabled={isGenerating}
            >
              ⚡ Monthly PDF
            </button>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary-action"
            disabled={isGenerating}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn-primary-action"
            style={{ background: '#045F60' }}
            disabled={isGenerating}
            onClick={() => handleDownload()}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Rendering PDF...
              </>
            ) : (
              <>
                <Download size={16} /> Download {selectedPeriod.toUpperCase()} PDF
              </>
            )}
          </button>
        </div>
      </div>

      <CenterPopupModal
        popup={pdfErrorPopup}
        onClose={() => setPdfErrorPopup(null)}
        titleId="export-pdf-popup-title"
      />
    </div>
  );
}

