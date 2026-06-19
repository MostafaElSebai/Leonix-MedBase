"use client";

import { useState } from "react";
import { Patient } from "@/app/types/index";
import { calculateAge, formatDate } from "@/lib/utils";

interface PatientInfoCardProps {
  patient: Patient & {
    dob?: string;
    maritalState?: string;
    obHistory?: string;
    menstrualHistory?: string;
    familialDiseases?: string;
    consanguinity?: string;
    doctorId?: string;
    doctorName?: string;
  };
}

const LABEL: React.CSSProperties = {
  fontSize: "0.6875rem",
  fontWeight: 600,
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "0.2rem",
};

const VALUE: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--color-text-primary)",
  fontWeight: 500,
  lineHeight: 1.4,
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p style={{ ...LABEL, margin: 0 }}>{label}</p>
      <p style={{ ...VALUE, margin: 0 }}>{value ?? "—"}</p>
    </div>
  );
}

function LongField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p style={{ ...LABEL, margin: "0 0 0.25rem" }}>{label}</p>
      <p
        style={{
          ...VALUE,
          margin: 0,
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: value ? "var(--color-text-primary)" : "var(--color-text-muted)",
          fontSize: "0.875rem",
        }}
      >
        {value || "Not recorded"}
      </p>
    </div>
  );
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
  const [showClinical, setShowClinical] = useState(false);
  const age = patient.dob ? calculateAge(patient.dob) : patient.age;

  const consanguinityLabel =
    patient.consanguinity === "positive"
      ? "Positive"
      : patient.consanguinity === "negative"
      ? "Negative"
      : "Not recorded";

  return (
    <div
      className="card"
      style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: 0 }}
    >
      {/* ── Name row ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
        {/* Avatar */}
        <div
          aria-hidden="true"
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-brand) 0%, #1e40af 100%)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
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
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--color-brand)",
              letterSpacing: "-0.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {patient.name}
          </h2>
          {age != null && (
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
              {age === -1 ? "❌ Invalid Age" : `${age} years old`} · {patient.maritalState ?? ""}
            </p>
          )}
        </div>
      </div>

      {/* ── Key facts grid ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "0.875rem 1.25rem",
          marginTop: "1rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <Field label="Phone" value={patient.phone} />
        <Field label="Date of Birth" value={formatDate(patient.dob)} />
        <Field label="Assigned Doctor" value={patient.doctorName} />
        <Field label="Address" value={patient.address} />
        <Field label="First Visit" value={formatDate(patient.firstVisitDate)} />
        <Field label="Consanguinity" value={consanguinityLabel} />
      </div>

      {/* ── Clinical history toggle ─────────────────────────────────────── */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setShowClinical((v) => !v)}
        aria-expanded={showClinical}
        style={{
          alignSelf: "flex-start",
          marginTop: "0.75rem",
          gap: "0.375rem",
          color: "var(--color-action)",
          fontSize: "0.8125rem",
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            transform: showClinical ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 150ms ease-in-out",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        {showClinical ? "Hide" : "Show"} clinical history
      </button>

      {/* ── Clinical history (expandable) ───────────────────────────────── */}
      {showClinical && (
        <div
          style={{
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <LongField label="OB History" value={patient.obHistory} />
          <hr className="divider" />
          <LongField label="Menstrual History" value={patient.menstrualHistory} />
          <hr className="divider" />
          <LongField label="Familial Diseases" value={patient.familialDiseases} />
        </div>
      )}
    </div>
  );
}
