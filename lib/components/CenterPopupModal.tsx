'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export type PopupTone = 'warning' | 'error' | 'info';

export interface CenterPopupState {
  title: string;
  message: string;
  tone?: PopupTone;
  confirmLabel?: string;
  onConfirm?: () => void | Promise<void>;
}

interface CenterPopupModalProps {
  popup: CenterPopupState | null;
  onClose: () => void;
  titleId?: string;
}

export default function CenterPopupModal({
  popup,
  onClose,
  titleId = 'wms-center-popup-title',
}: CenterPopupModalProps) {
  useEffect(() => {
    if (!popup) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [popup, onClose]);

  if (!popup) return null;

  const tone: PopupTone = popup.tone || 'warning';

  const iconPalette =
    tone === 'error'
      ? {
          bg: '#fbebed',
          border: '2px solid #8A181A',
          color: '#8A181A',
          Icon: ShieldAlert,
        }
      : tone === 'info'
      ? {
          bg: '#e6f2f2',
          border: '2px solid #045F60',
          color: '#045F60',
          Icon: Info,
        }
      : {
          bg: '#fff3cd',
          border: '2px solid #f59e0b',
          color: '#b45309',
          Icon: AlertTriangle,
        };

  const { Icon } = iconPalette;
  const isConfirm = typeof popup.onConfirm === 'function';

  return (
    <div
      className="wms-modal-backdrop"
      style={{
        zIndex: 1300,
        background: 'rgba(10, 25, 25, 0.62)',
        backdropFilter: 'blur(4px)',
      }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
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
              background: iconPalette.bg,
              border: iconPalette.border,
              color: iconPalette.color,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon size={26} />
          </div>

          <h3
            id={titleId}
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '800',
              color: '#141b1b',
            }}
          >
            {popup.title}
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: 1.55,
              color: '#475569',
            }}
          >
            {popup.message}
          </p>
        </div>

        <div
          style={{
            padding: '14px 24px 22px',
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            background: '#fafdfc',
            borderTop: '1px solid #e2eeec',
          }}
        >
          {isConfirm ? (
            <>
              <button
                type="button"
                className="btn-secondary-action"
                style={{
                  minWidth: '110px',
                  justifyContent: 'center',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: '700',
                }}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                autoFocus
                className="btn-primary-action"
                style={{
                  minWidth: '130px',
                  justifyContent: 'center',
                  padding: '9px 22px',
                  fontSize: '13px',
                  fontWeight: '700',
                }}
                onClick={async () => {
                  const fn = popup.onConfirm;
                  onClose();
                  if (fn) await fn();
                }}
              >
                {popup.confirmLabel || 'OK'}
              </button>
            </>
          ) : (
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
              onClick={onClose}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

