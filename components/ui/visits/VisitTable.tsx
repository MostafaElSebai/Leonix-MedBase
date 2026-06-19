"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Visit } from "@/app/types/index";
import { formatDate } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/shared/ConfirmDialog";

interface VisitTableProps {
  visits: Visit[];
  onDelete?: (id: string | number) => void;
}

const COL_HEADER: React.CSSProperties = {
  padding: "0.75rem 1rem",
  textAlign: "left",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
  borderBottom: "1px solid var(--color-border)",
  backgroundColor: "var(--color-bg-app)",
};

const COL_CELL: React.CSSProperties = {
  padding: "0.875rem 1rem",
  fontSize: "0.9375rem",
  color: "var(--color-text-primary)",
  verticalAlign: "top",
  borderBottom: "1px solid var(--color-border)",
};

const COL_MUTED: React.CSSProperties = {
  ...COL_CELL,
  color: "var(--color-text-muted)",
  fontSize: "0.875rem",
};

export function VisitTable({ visits, onDelete }: VisitTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | number | null>(null);

  if (visits.length === 0) {
    return (
      <div
        className="card"
        style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--color-text-muted)" }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ margin: "0 auto 1rem", display: "block", opacity: 0.4 }}
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <p style={{ margin: 0, fontSize: "1rem", fontWeight: 500 }}>No visits recorded</p>
        <p style={{ margin: "0.375rem 0 0", fontSize: "0.875rem" }}>
          Use "Add Visit" to record this patient's first visit.
        </p>
      </div>
    );
  }

  return (
    <>
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}
          aria-label="Visit history"
        >
          <thead>
            <tr>
              <th scope="col" style={COL_HEADER}>#</th>
              <th scope="col" style={COL_HEADER}>Visit Date</th>
              <th scope="col" style={COL_HEADER}>Doctor</th>
              <th scope="col" style={COL_HEADER}>Labs</th>
              <th scope="col" style={COL_HEADER}>Treatment</th>
              <th scope="col" style={{ ...COL_HEADER, width: "3rem", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit, idx) => (
              <tr
                key={visit.id}
                onClick={() => router.push(`/visits/${visit.id}/edit`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && router.push(`/visits/${visit.id}/edit`)}
                style={{
                  backgroundColor: idx % 2 === 0 ? "var(--color-bg-card)" : "var(--color-bg-app)",
                  transition: "background-color 150ms ease-in-out",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#EFF6FF";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                    idx % 2 === 0 ? "var(--color-bg-card)" : "var(--color-bg-app)";
                }}
              >
                {/* Row number */}
                <td style={{ ...COL_MUTED, width: "3rem" }}>{idx + 1}</td>

                {/* Visit Date */}
                <td style={COL_CELL}>
                  <span style={{ fontWeight: 600, color: "var(--color-brand)" }}>
                    {formatDate(visit.visitDate)}
                  </span>
                </td>

                {/* Doctor */}
                <td style={COL_CELL}>
                  {visit.doctorName ?? (
                    <span style={{ color: "var(--color-text-muted)" }}>—</span>
                  )}
                </td>

                {/* Labs */}
                <td
                  style={{
                    ...COL_MUTED,
                    maxWidth: "220px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {visit.labs ?? "—"}
                </td>

                {/* Treatment */}
                <td
                  style={{
                    ...COL_CELL,
                    maxWidth: "260px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontSize: "0.875rem",
                  }}
                >
                  {visit.treatment ?? (
                    <span style={{ color: "var(--color-text-muted)" }}>—</span>
                  )}
                </td>

                {/* Actions */}
                <td style={{ ...COL_CELL, textAlign: "center", verticalAlign: "middle" }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(visit.id);
                    }}
                    style={{ color: "var(--color-danger)", padding: "0.25rem", minHeight: "0", height: "auto" }}
                    aria-label="Delete visit"
                  >
                    <svg
                      width="16"
                      height="16"
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
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <ConfirmDialog
      isOpen={deleteId !== null}
      title="Delete Visit"
      message="Are you sure you want to delete this visit? This action cannot be undone."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={() => {
        if (deleteId !== null) {
          onDelete?.(deleteId);
          setDeleteId(null);
        }
      }}
      onCancel={() => setDeleteId(null)}
      isDestructive
    />
    </>
  );
}
