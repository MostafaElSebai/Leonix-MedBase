"use client";

import { useState, useEffect } from "react";
import { calculateAge } from "@/lib/utils";
import { DateInput } from "@/components/ui/shared/DateInput";
import { useDoctors } from "@/hooks/useDoctors";
import { useCurrentDoctor } from "@/hooks/useCurrentDoctor";

// ── Types ────────────────────────────────────────────────────────────────────

export interface NewPatientFormData {
  name: string;
  phone: string;
  dob: string;
  firstVisitDate: string;
  address: string;
  maritalState: string;
  obHistory: string;
  menstrualHistory: string;
  familialDiseases: string;
  consanguinity: "positive" | "negative" | "";
  doctorId: string;
  notes: string;
}

const EMPTY_FORM: NewPatientFormData = {
  name: "",
  phone: "",
  dob: "",
  firstVisitDate: "",
  address: "",
  maritalState: "",
  obHistory: "",
  menstrualHistory: "",
  familialDiseases: "",
  consanguinity: "",
  doctorId: "",
  notes: "",
};

// ── Shared style helpers ─────────────────────────────────────────────────────

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



const HELPER: React.CSSProperties = {
  fontSize: "0.8125rem",
  color: "var(--color-text-muted)",
};

// ── Component ────────────────────────────────────────────────────────────────

interface NewPatientFormProps {
  onSubmit?: (data: NewPatientFormData) => void;
  /** Pre-populated values when editing an existing patient */
  initialData?: Partial<NewPatientFormData>;
}

export function NewPatientForm({ onSubmit, initialData }: NewPatientFormProps) {
  const [form, setForm] = useState<NewPatientFormData>({
    ...EMPTY_FORM,
    ...initialData,
  });

  const doctors = useDoctors();
  const { doctor: currentDoctor } = useCurrentDoctor();

  // Set default doctor ID if it's a new form and we have a logged in doctor
  useEffect(() => {
    if (currentDoctor?.id && !form.doctorId && !initialData?.doctorId) {
      // eslint-disable-next-line
      setForm((prev) => ({ ...prev, doctorId: String(currentDoctor.id) }));
    }
  }, [currentDoctor?.id, form.doctorId, initialData?.doctorId]);

  // Sync when initialData arrives asynchronously (e.g. after Supabase fetch)
  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line
      setForm({ ...EMPTY_FORM, ...initialData });
    }
  }, [initialData]);

  const age = form.dob ? calculateAge(form.dob) : null;

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      setForm((prev) => ({ ...prev, dob: "" }));
      return;
    }

    const ageValue = parseInt(val, 10);
    if (!isNaN(ageValue) && ageValue >= 0) {
      const today = new Date();
      const birthYear = today.getFullYear() - ageValue;
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setForm((prev) => ({ ...prev, dob: `${birthYear}-${month}-${day}` }));
    }
  };

  const set = (field: keyof NewPatientFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && !e.isDefaultPrevented()) {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      // Allow Enter to work naturally in textareas and buttons
      if (tagName !== "textarea" && tagName !== "button") {
        e.preventDefault();
        const form = e.currentTarget;
        const elements = Array.from(form.elements) as HTMLElement[];
        const focusable = elements.filter(
          (el) => !el.hasAttribute("disabled") && el.tabIndex >= 0 && el.tagName !== "FIELDSET"
        );
        const index = focusable.indexOf(target);
        if (index > -1 && index < focusable.length - 1) {
          focusable[index + 1].focus();
        }
      }
    }
  };

  return (
    <form
      id="patient-form"
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      style={{
        maxWidth: "42rem",
        margin: "0 auto",
        padding: "2rem 1.5rem 4rem",
        display: "flex",
        flexDirection: "column",
        gap: "2.5rem",
      }}
    >
      {/* ── Section 1: Basic Information ─────────────────────────────────── */}
      <section aria-labelledby="section-basic">
        <h2 id="section-basic" style={SECTION_TITLE}>
          Basic Information
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Name */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="patient-name" style={LABEL}>
              Full Name <span aria-hidden="true" style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <input
              id="patient-name"
              type="text"
              className="form-input"
              placeholder="e.g. Sarah Al-Rashid"
              value={form.name}
              onChange={set("name")}
              required
              autoComplete="name"
            />
          </div>

          {/* Phone */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="patient-phone" style={LABEL}>
              Phone Number <span aria-hidden="true" style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <input
              id="patient-phone"
              type="tel"
              className="form-input"
              placeholder="e.g. +966 50 123 4567"
              value={form.phone}
              onChange={set("phone")}
              required
              autoComplete="tel"
              inputMode="tel"
            />
          </div>

          {/* DOB + Age (2-column pair — exception to single-column for related derived fields) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "1rem",
              alignItems: "end",
            }}
          >
            <div style={FIELD_WRAPPER}>
              <label htmlFor="patient-dob" style={LABEL}>
                Date of Birth <span aria-hidden="true" style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <DateInput
                id="patient-dob"
                className="form-input"
                value={form.dob}
                onChange={(val) => setForm(f => ({ ...f, dob: val }))}
                required
              />
            </div>

            <div style={{ ...FIELD_WRAPPER, minWidth: "7rem" }}>
              <label htmlFor="patient-age" style={LABEL}>
                Age
              </label>
              <input
                id="patient-age"
                type="number"
                className="form-input"
                value={age !== null && age !== -1 ? age : ""}
                onChange={handleAgeChange}
                placeholder="e.g. 30"
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Address */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="patient-address" style={LABEL}>
              Address <span aria-hidden="true" style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <input
              id="patient-address"
              type="text"
              className="form-input"
              placeholder="e.g. Al Olaya, Riyadh"
              value={form.address}
              onChange={set("address")}
              required
              autoComplete="street-address"
            />
          </div>

          {/* Marital Status */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="patient-marital" style={LABEL}>
              Marital Status <span aria-hidden="true" style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <input
              id="patient-marital"
              type="text"
              className="form-input"
              placeholder="e.g. Single, Married, Divorced…"
              value={form.maritalState}
              onChange={set("maritalState")}
              required
            />
          </div>

          {/* Doctor */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="patient-doctor" style={LABEL}>
              Assigned Doctor <span aria-hidden="true" style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <select
              id="patient-doctor"
              className="form-input"
              value={form.doctorId}
              onChange={set("doctorId")}
              required
              style={{ cursor: "pointer" }}
            >
              <option value="">— Select Doctor —</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </section>

      {/* ── Section 2: Clinical History ───────────────────────────────────── */}
      <section aria-labelledby="section-clinical">
        <h2 id="section-clinical" style={SECTION_TITLE}>
          Clinical History
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* First Visit Date */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="patient-first-visit" style={LABEL}>
              First Visit Date <span aria-hidden="true" style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <DateInput
              id="patient-first-visit"
              className="form-input"
              value={form.firstVisitDate}
              onChange={(val) => setForm(f => ({ ...f, firstVisitDate: val }))}
              required
            />
          </div>

          {/* OB History */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="patient-ob" style={LABEL}>
              OB History <span aria-hidden="true" style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <textarea
              id="patient-ob"
              className="form-input"
              placeholder="Enter obstetric history…"
              value={form.obHistory}
              onChange={set("obHistory")}
              required
              rows={4}
              style={{ resize: "vertical", minHeight: "100px" }}
            />
          </div>

          {/* Menstrual History */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="patient-menstrual" style={LABEL}>
              Menstrual History <span aria-hidden="true" style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <textarea
              id="patient-menstrual"
              className="form-input"
              placeholder="Enter menstrual history…"
              value={form.menstrualHistory}
              onChange={set("menstrualHistory")}
              required
              rows={4}
              style={{ resize: "vertical", minHeight: "100px" }}
            />
          </div>

          {/* Familial Diseases */}
          <div style={FIELD_WRAPPER}>
            <label htmlFor="patient-familial" style={LABEL}>
              Familial Diseases <span aria-hidden="true" style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <textarea
              id="patient-familial"
              className="form-input"
              placeholder="List any hereditary or familial conditions…"
              value={form.familialDiseases}
              onChange={set("familialDiseases")}
              required
              rows={3}
              style={{ resize: "vertical", minHeight: "80px" }}
            />
          </div>

        </div>
      </section>

      {/* ── Section 3: Family Background ──────────────────────────────────── */}
      <section aria-labelledby="section-family">
        <h2 id="section-family" style={SECTION_TITLE}>
          Family Background
        </h2>

        {/* Consanguinity */}
        <div style={FIELD_WRAPPER}>
          <label htmlFor="patient-consanguinity" style={LABEL}>
            Family Consanguinity <span aria-hidden="true" style={{ color: "var(--color-danger)" }}>*</span>
          </label>
          <select
            id="patient-consanguinity"
            className="form-input"
            value={form.consanguinity}
            onChange={set("consanguinity")}
            required
            style={{ cursor: "pointer" }}
          >
            <option value="">— Select —</option>
            <option value="negative">Negative</option>
            <option value="positive">Positive</option>
          </select>
          <p style={HELPER}>
            Whether the patient&apos;s parents share a common ancestor.
          </p>
        </div>

        {/* Notes */}
        <div style={{ ...FIELD_WRAPPER, marginTop: "1.25rem" }}>
          <label htmlFor="patient-notes" style={LABEL}>
            Notes
          </label>
          <textarea
            id="patient-notes"
            className="form-input"
            placeholder="Any additional notes or important information…"
            value={form.notes}
            onChange={set("notes")}
            rows={4}
            style={{ resize: "vertical", minHeight: "100px" }}
          />
        </div>
      </section>

      {/* ── Bottom Save Button ────────────────────────────────────────────── */}
      <div style={{ paddingTop: "0.5rem", borderTop: "1px solid var(--color-border)" }}>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", gap: "0.5rem" }}
          aria-label="Save new patient record"
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
          Save Patient
        </button>
      </div>
    </form>
  );
}
