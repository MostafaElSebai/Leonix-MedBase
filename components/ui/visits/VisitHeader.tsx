"use client";

import { useState } from "react";
import { AppHeaderBar } from "@/components/ui/shared/AppHeaderBar";
import { ConfirmDialog } from "@/components/ui/shared/ConfirmDialog";
import { useCurrentDoctor } from "@/hooks/useCurrentDoctor";

interface VisitHeaderProps {
  title?: string;
  saveLabel?: string;
  backHref?: string;
  onSave?: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  formId?: string;
}

export function VisitHeader({
  title = "New Visit",
  saveLabel = "Save Visit",
  backHref,
  onSave,
  onDelete,
  isSaving = false,
  formId,
}: VisitHeaderProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { doctor } = useCurrentDoctor();

  return (
    <>
    <AppHeaderBar 
      title={title}
      backLabel="Cancel"
      backHref={backHref}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {onDelete && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowConfirm(true)}
            aria-label="Delete visit"
            style={{ gap: "0.375rem", color: "var(--color-danger)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            <span>Delete Visit</span>
          </button>
        )}
        
        <button
          type={formId ? "submit" : "button"}
          form={formId}
          className="btn btn-primary btn-sm"
          onClick={onSave}
          disabled={isSaving}
          aria-label={saveLabel}
        style={{ gap: "0.375rem" }}
      >
        {isSaving ? (
          <span className="spinner" aria-label="Saving…" role="status" />
        ) : (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        )}
        <span>{isSaving ? "Saving…" : saveLabel}</span>
      </button>
      </div>
    </AppHeaderBar>

    <ConfirmDialog
      isOpen={showConfirm}
      title="Delete Visit"
      message="Are you sure you want to delete this visit? This action cannot be undone."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      requirePin={doctor?.pin}
      onConfirm={() => {
        setShowConfirm(false);
        onDelete?.();
      }}
      onCancel={() => setShowConfirm(false)}
      isDestructive
    />
    </>
  );
}
