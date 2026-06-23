"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeaderBar } from "@/components/ui/shared/AppHeaderBar";
import { ConfirmDialog } from "@/components/ui/shared/ConfirmDialog";
import { useCurrentDoctor } from "@/hooks/useCurrentDoctor";
import { formatDate } from "@/lib/utils";

interface VisitViewHeaderProps {
  visitId: string;
  patientId: string;
  visitDate?: string;
  doctorName?: string;
  onDelete?: () => void;
}

export function VisitViewHeader({
  visitId,
  patientId,
  visitDate,
  doctorName,
  onDelete,
}: VisitViewHeaderProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const { doctor } = useCurrentDoctor();

  const title = visitDate ? `Visit on ${formatDate(visitDate)}` : "Visit Details";
  const subtitle = doctorName ? `Assigned to Dr. ${doctorName}` : undefined;

  return (
    <>
      <AppHeaderBar 
        title={title}
        backLabel="Patient Profile"
        backHref={`/patients/${patientId}`}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => router.push(`/visits/new?patientId=${patientId}`)}
            aria-label="Add a new visit for this patient"
            style={{ gap: "0.375rem" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Add Visit</span>
          </button>

          <div
            style={{
              width: 1,
              height: "1.5rem",
              backgroundColor: "var(--color-border)",
              margin: "0 0.25rem",
            }}
            aria-hidden="true"
          />

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => router.push(`/visits/${visitId}/edit`)}
            aria-label="Edit visit data"
            style={{ gap: "0.375rem" }}
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
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit</span>
          </button>

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
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              <span>Delete</span>
            </button>
          )}
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
