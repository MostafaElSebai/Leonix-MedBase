"use client";

import { AppHeaderBar } from "@/components/ui/shared/AppHeaderBar";

interface NewPatientHeaderProps {
  title?: string;
  saveLabel?: string;
  backHref?: string;
  onSave?: () => void;
  isSaving?: boolean;
  formId?: string;
}

export function NewPatientHeader({ title = "New Patient", saveLabel = "Save Patient", backHref, onSave, isSaving = false, formId }: NewPatientHeaderProps) {
  return (
    <AppHeaderBar 
      title={title}
      backLabel="Cancel"
      backHref={backHref}
    >
      <button
        type={formId ? "submit" : "button"}
        form={formId}
        className="btn btn-primary btn-sm"
        onClick={onSave}
        disabled={isSaving}
        aria-label="Save new patient"
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
    </AppHeaderBar>
  );
}
