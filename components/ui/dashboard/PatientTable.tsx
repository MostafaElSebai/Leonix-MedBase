"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Patient } from "@/app/types/index";
import { formatDate, sortDataByDate } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/shared/ConfirmDialog";
import { SortableHeader } from "@/components/ui/shared/SortableHeader";
import { useCurrentDoctor } from "@/hooks/useCurrentDoctor";

interface PatientTableProps {
  patients: Patient[];
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
  verticalAlign: "middle",
  borderBottom: "1px solid var(--color-border)",
  whiteSpace: "nowrap",
};

const COL_MUTED: React.CSSProperties = {
  ...COL_CELL,
  color: "var(--color-text-muted)",
  fontSize: "0.875rem",
};

export function PatientTable({ patients, onDelete }: PatientTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const { doctor } = useCurrentDoctor();

  // Sorting state
  const [sortField, setSortField] = useState<"firstVisitDate" | "lastVisitDate" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (field: "firstVisitDate" | "lastVisitDate") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedPatients = sortDataByDate(patients, sortField, sortOrder);

  if (patients.length === 0) {
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
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p style={{ margin: 0, fontSize: "1rem", fontWeight: 500 }}>No patients found</p>
        <p style={{ margin: "0.375rem 0 0", fontSize: "0.875rem" }}>
          Try adjusting your search or add a new patient.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className="card"
        style={{ padding: 0, overflow: "hidden" }}
      >
        {/* Horizontally scrollable on small screens */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px" }}
            aria-label="Patient list"
          >
            <thead>
              <tr>
                <th scope="col" style={COL_HEADER}>Patient Name</th>
                <th scope="col" style={COL_HEADER}>Phone</th>
                <th scope="col" style={COL_HEADER}>Age</th>
                <th scope="col" style={COL_HEADER}>Address</th>
                <SortableHeader 
                  field="firstVisitDate" 
                  label="First Visit" 
                  currentSortField={sortField as string} 
                  currentSortOrder={sortOrder} 
                  onSort={handleSort} 
                  style={COL_HEADER} 
                />
                <SortableHeader 
                  field="lastVisitDate" 
                  label="Last Visit" 
                  currentSortField={sortField as string} 
                  currentSortOrder={sortOrder} 
                  onSort={handleSort} 
                  style={COL_HEADER} 
                />
                <th scope="col" style={COL_HEADER}>Assigned Doctor</th>
                <th scope="col" style={{ ...COL_HEADER, width: "3rem", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPatients.map((patient, idx) => (
                <tr
                  key={patient.id}
                  onClick={() => router.push(`/patients/${patient.id}`)}
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
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && router.push(`/patients/${patient.id}`)}
                  aria-label={`View profile for ${patient.name}`}
                >
                  {/* Name */}
                  <td style={COL_CELL}>
                    <span style={{ fontWeight: 600, color: "var(--color-brand)" }}>
                      {patient.name}
                    </span>
                  </td>

                  {/* Phone */}
                  <td style={COL_MUTED}>{patient.phone ?? "—"}</td>

                  {/* Age */}
                  <td style={COL_CELL}>
                    {patient.age != null ? (
                      patient.age === -1 ? (
                        <span className="badge badge-error" style={{ backgroundColor: "var(--color-danger-light)", color: "var(--color-danger)" }}>❌</span>
                      ) : (
                        <span className="badge badge-neutral">{patient.age} yrs</span>
                      )
                    ) : (
                      <span style={{ color: "var(--color-text-muted)" }}>—</span>
                    )}
                  </td>

                  {/* Address */}
                  <td
                    style={{
                      ...COL_MUTED,
                      maxWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={patient.address}
                  >
                    {patient.address ?? "—"}
                  </td>

                  {/* First Visit */}
                  <td style={COL_MUTED}>{formatDate(patient.firstVisitDate)}</td>

                  {/* Last Visit */}
                  <td style={COL_MUTED}>{formatDate(patient.lastVisitDate)}</td>

                  {/* Assigned Doctor */}
                  <td style={COL_CELL}>
                    {patient.assignedDoctorName ? (
                      <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                        {patient.assignedDoctorName}
                      </span>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)" }}>—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ ...COL_CELL, textAlign: "center", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/patients/${patient.id}/edit`);
                        }}
                        style={{ padding: "0.25rem 0.5rem", minHeight: "0", height: "auto", fontSize: "0.75rem", gap: "0.25rem" }}
                        aria-label="Edit patient"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(patient.id);
                        }}
                        style={{ color: "var(--color-danger)", padding: "0.25rem", minHeight: "0", height: "auto" }}
                        aria-label="Delete patient"
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Patient"
        message="Are you sure you want to delete this patient? All their visits will also be marked as deleted. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        requirePin={doctor?.pin}
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
