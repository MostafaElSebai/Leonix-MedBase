"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppHeaderBar } from "@/components/ui/shared/AppHeaderBar";
import { ConfirmDialog } from "@/components/ui/shared/ConfirmDialog";
import { useCurrentDoctor } from "@/hooks/useCurrentDoctor";

interface PatientHeaderProps {
  onAddVisit?: () => void;
  onDelete?: () => void;
  notes?: string;
}

export function PatientHeader({ onAddVisit, onDelete, notes }: PatientHeaderProps) {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.patientId;
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { doctor } = useCurrentDoctor();

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirm(false);
    onDelete?.();
  };

  return (
    <>
      <AppHeaderBar
        title="Patient Profile"
        backLabel="Dashboard"
        backHref="/dashboard"
        bottomBanner={
          notes ? (
            <div
              onClick={() => setNotesExpanded(!notesExpanded)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setNotesExpanded(!notesExpanded);
                }
              }}
              style={{
                backgroundColor: "#FFFBEB",
                padding: "0.5rem 1.5rem",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FEF3C7")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFBEB")}
            >
              <div style={{
                display: "flex",
                alignItems: notesExpanded ? "flex-start" : "center",
                justifyContent: "center",
                position: "relative"
              }}>
                <div style={{ minWidth: 0, textAlign: "center", maxWidth: "800px", padding: "0 2rem" }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: "#D97706",
                    textTransform: "uppercase",
                    marginRight: notesExpanded ? "0" : "0.5rem",
                    display: notesExpanded ? "block" : "inline",
                    marginBottom: notesExpanded ? "0.25rem" : "0"
                  }}>
                    ⚠️ Important Notes:
                  </span>
                  <span style={{
                    color: "#92400E",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    display: notesExpanded ? "block" : "inline",
                    whiteSpace: notesExpanded ? "pre-wrap" : "nowrap",
                    overflow: notesExpanded ? "visible" : "hidden",
                    textOverflow: notesExpanded ? "clip" : "ellipsis",
                  }}>
                    {notes}
                  </span>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    flexShrink: 0,
                    transform: notesExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    position: "absolute",
                    right: 0,
                    top: notesExpanded ? "0.125rem" : "auto"
                  }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          ) : null
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Global Action: Add Patient */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => router.push("/patients/new")}
            aria-label="Create a new patient record"
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span>Add Patient</span>
          </button>

          {/* Visual Divider */}
          <div
            style={{
              width: 1,
              height: "1.5rem",
              backgroundColor: "var(--color-border)",
              margin: "0 0.25rem"
            }}
            aria-hidden="true"
          />

          {/* Current Patient Actions */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => router.push(`/patients/profile/edit?id=${patientId}`)}
            aria-label="Edit patient data"
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

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleDelete}
            aria-label="Delete patient"
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

          <button
            className="btn btn-primary btn-sm"
            onClick={onAddVisit}
            aria-label="Add a new visit for this patient"
            style={{ gap: "0.375rem", marginLeft: "0.25rem" }}
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
        </div>
      </AppHeaderBar>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Patient"
        message="Are you sure you want to delete this patient? All their visits will also be marked as deleted. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        requirePin={doctor?.pin}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
        isDestructive
      />
    </>
  );
}
