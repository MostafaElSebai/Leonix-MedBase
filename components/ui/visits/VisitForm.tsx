"use client";

import { useState, useEffect } from "react";
import { DateInput } from "@/components/ui/shared/DateInput";

// ── Types ────────────────────────────────────────────────────────────────────

export interface VisitFormData {
  doctorName: string;
  complain: string;
  drugs: string;
  examination: string;
  labs: string;
  investigation: string;
  treatment: string;
  nextVisitDate: string;
  nextVisitType: "consultation" | "examination" | "";
  notes: string;
}

const EMPTY_FORM: VisitFormData = {
  doctorName: "",
  complain: "",
  drugs: "",
  examination: "",
  labs: "",
  investigation: "",
  treatment: "",
  nextVisitDate: "",
  nextVisitType: "",
  notes: "",
};

// Fields that count toward "at least one filled" — Doctor is excluded
const CLINICAL_FIELDS: (keyof VisitFormData)[] = [
  "complain", "drugs", "examination", "labs",
  "investigation", "treatment", "nextVisitDate", "nextVisitType", "notes",
];

// ── Style helpers ─────────────────────────────────────────────────────────────

const SECTION_TITLE: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "1.25rem",
  paddingBottom: "0.625rem",
  borderBottom: "1px solid var(--color-border)",
};

const FIELD_WRAPPER: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
};

const LABEL: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#334155",
};

const READONLY_FIELD: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "0.75rem 1rem",
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--color-brand)",
  backgroundColor: "#F1F5F9",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-input)",
  minHeight: "44px",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface VisitFormProps {
  onSubmit?: (data: VisitFormData) => void;
  /** Pre-populated when editing an existing visit */
  initialData?: Partial<VisitFormData>;
}

export function VisitForm({ onSubmit, initialData }: VisitFormProps) {
  const [form, setForm] = useState<VisitFormData>({
    ...EMPTY_FORM,
    ...initialData,
  });
  const [validationError, setValidationError] = useState("");

  // Sync when initialData arrives asynchronously (e.g. after Supabase fetch)
  useEffect(() => {
    if (initialData) {
      setForm({ ...EMPTY_FORM, ...initialData });
    }
  }, [initialData]);

  const set =
    (field: keyof VisitFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValidationError(""); // clear error as soon as the doctor types
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasAnyValue = CLINICAL_FIELDS.some((f) => form[f]?.toString().trim() !== "");
    if (!hasAnyValue) {
      setValidationError("Please fill in at least one field before saving the visit.");
      return;
    }
    setValidationError("");
    onSubmit?.(form);
  };

  return (
    <form
      id="visit-form"
      onSubmit={handleSubmit}
      noValidate
      style={{
        maxWidth: "42rem",
        margin: "0 auto",
        padding: "2rem 1.5rem 4rem",
        display: "flex",
        flexDirection: "column",
        gap: "2.5rem",
      }}
    >
      {/* ── Section 1: Visit Details ─────────────────────────────────────── */}
      <section aria-labelledby="section-visit">
        <h2 id="section-visit" style={SECTION_TITLE}>
          Visit Details
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Doctor — auto from session, read-only */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="visit-doctor" style={LABEL}>
              Doctor
            </label>
            <div style={READONLY_FIELD} id="visit-doctor" role="status" aria-label="Logged-in doctor">
              {form.doctorName || "—"}
            </div>
          </div>

          {/* Complain */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="visit-complain" style={LABEL}>
              Chief Complaint
            </label>
            <textarea
              id="visit-complain"
              className="form-input"
              placeholder="Patient's main complaint or reason for visit…"
              value={form.complain}
              onChange={set("complain")}
              rows={3}
              style={{ resize: "vertical", minHeight: "80px" }}
            />
          </div>

          {/* Examination */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="visit-examination" style={LABEL}>
              Examination
            </label>
            <textarea
              id="visit-examination"
              className="form-input"
              placeholder="Clinical findings and physical examination notes…"
              value={form.examination}
              onChange={set("examination")}
              rows={4}
              style={{ resize: "vertical", minHeight: "100px" }}
            />
          </div>

          {/* Drugs */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="visit-drugs" style={LABEL}>
              Drugs
            </label>
            <textarea
              id="visit-drugs"
              className="form-input"
              placeholder="Current medications and dosages…"
              value={form.drugs}
              onChange={set("drugs")}
              rows={3}
              style={{ resize: "vertical", minHeight: "80px" }}
            />
          </div>

        </div>
      </section>

      {/* ── Section 2: Investigations ─────────────────────────────────────── */}
      <section aria-labelledby="section-investigations">
        <h2 id="section-investigations" style={SECTION_TITLE}>
          Investigations
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Labs */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="visit-labs" style={LABEL}>
              Labs
            </label>
            <textarea
              id="visit-labs"
              className="form-input"
              placeholder="Laboratory results and values…"
              value={form.labs}
              onChange={set("labs")}
              rows={3}
              style={{ resize: "vertical", minHeight: "80px" }}
            />
          </div>

          {/* Investigation */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="visit-investigation" style={LABEL}>
              Investigation
            </label>
            <textarea
              id="visit-investigation"
              className="form-input"
              placeholder="Imaging, ultrasound, ECG, or other diagnostic findings…"
              value={form.investigation}
              onChange={set("investigation")}
              rows={3}
              style={{ resize: "vertical", minHeight: "80px" }}
            />
          </div>

        </div>
      </section>

      {/* ── Section 3: Treatment ──────────────────────────────────────────── */}
      <section aria-labelledby="section-treatment">
        <h2 id="section-treatment" style={SECTION_TITLE}>
          Treatment Plan
        </h2>

        <div style={FIELD_WRAPPER}>
          <label htmlFor="visit-treatment" style={LABEL}>
            Treatment
          </label>
          <textarea
            id="visit-treatment"
            className="form-input"
            placeholder="Prescribed treatment, procedures, and management plan…"
            value={form.treatment}
            onChange={set("treatment")}
            rows={4}
            style={{ resize: "vertical", minHeight: "100px" }}
          />
        </div>
      </section>

      {/* ── Section 4: Next Visit ─────────────────────────────────────────── */}
      <section aria-labelledby="section-next-visit">
        <h2 id="section-next-visit" style={SECTION_TITLE}>
          Next Visit
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* NV Date */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="visit-nv-date" style={LABEL}>
              Next Visit Date
            </label>
            <DateInput
              id="visit-nv-date"
              className="form-input"
              value={form.nextVisitDate}
              onChange={(val) => setForm(f => ({...f, nextVisitDate: val}))}
            />
          </div>

          {/* NV Type */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="visit-nv-type" style={LABEL}>
              Next Visit Type
            </label>
            <select
              id="visit-nv-type"
              className="form-input"
              value={form.nextVisitType}
              onChange={set("nextVisitType")}
              style={{ cursor: "pointer" }}
            >
              <option value="">— Select —</option>
              <option value="consultation">Consultation</option>
              <option value="examination">Examination</option>
            </select>
          </div>

        </div>
      </section>

      {/* ── Section 5: Notes ──────────────────────────────────────────────── */}
      <section aria-labelledby="section-notes">
        <h2 id="section-notes" style={SECTION_TITLE}>
          Notes
        </h2>

        <div style={FIELD_WRAPPER}>
          <label htmlFor="visit-notes" style={LABEL}>
            Additional Notes
          </label>
          <textarea
            id="visit-notes"
            className="form-input"
            placeholder="Any additional observations or instructions…"
            value={form.notes}
            onChange={set("notes")}
            rows={3}
            style={{ resize: "vertical", minHeight: "80px" }}
          />
        </div>
      </section>

      {/* ── Validation error + Bottom Save ────────────────────────────────── */}
      <div
        style={{
          paddingTop: "0.5rem",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {validationError && (
          <p
            role="alert"
            style={{
              margin: 0,
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-input)",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "var(--color-danger)",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            {validationError}
          </p>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", gap: "0.5rem" }}
          aria-label="Save visit record"
        >
          <svg
            width="16"
            height="16"
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
          Save Visit
        </button>
      </div>
    </form>
  );
}
