// Edit existing patient — app/patients/[patientId]/edit/page.tsx
"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePatientById } from "@/hooks/usePatientById";
import { NewPatientHeader, NewPatientForm, NewPatientFormData } from "@/components/ui/patients";
import { updatePatient } from "@/lib/watermelon/actions";

// ── Loading skeleton ────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div
      style={{
        maxWidth: "42rem",
        margin: "0 auto",
        padding: "2rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      {[120, 56, 56, 56, 56, 100, 100, 80].map((h, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: `${h}px`, borderRadius: "var(--radius-input)" }}
        />
      ))}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

function EditPatientContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('id') as string;
  const router = useRouter();

  const { formData, loading, error } = usePatientById(patientId);

  const handleSave = async (data: NewPatientFormData) => {
    try {
      await updatePatient(patientId, data);
      router.replace(`/patients/profile?id=${patientId}`);
    } catch (err) {
      console.error("Failed to update patient", err);
      alert("Failed to update patient. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-app)" }}>
      <NewPatientHeader 
        title="Edit Patient" 
        saveLabel="Save Changes" 
        backHref={`/patients/profile?id=${patientId}`}
        formId="patient-form" 
      />

      <main>
        {error ? (
          <div
            style={{
              maxWidth: "42rem",
              margin: "2rem auto",
              padding: "1.5rem",
              textAlign: "center",
              color: "var(--color-danger)",
            }}
          >
            <p style={{ fontWeight: 600 }}>Failed to load patient data</p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.375rem" }}>{error}</p>
          </div>
        ) : loading ? (
          <FormSkeleton />
        ) : (
          <NewPatientForm onSubmit={handleSave} initialData={formData ?? undefined} />
        )}
      </main>
    </div>
  );
}

export default function EditPatientPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", padding: "2rem", display: "flex", justifyContent: "center" }}>Loading...</div>}>
      <EditPatientContent />
    </Suspense>
  );
}
