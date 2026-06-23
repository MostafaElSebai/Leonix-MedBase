// Edit existing patient — app/patients/[patientId]/edit/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
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

export default function EditPatientPage() {
  const params = useParams();
  const patientId = params?.patientId as string;
  const router = useRouter();

  const { formData, loading, error } = usePatientById(patientId);

  const handleSave = async (data: NewPatientFormData) => {
    try {
      await updatePatient(patientId, data);
      router.replace(`/patients/${patientId}`);
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
        backHref={`/patients/${patientId}`}
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
