// Edit existing visit — /visits/[visitId]/edit
"use client";

import { useRouter, useParams } from "next/navigation";
import { useVisitById } from "@/hooks/useVisitById";
import { VisitHeader, VisitForm, VisitFormData } from "@/components/ui/visits";
import { updateVisit, deleteVisit } from "@/lib/watermelon/actions";

// ── Skeleton ────────────────────────────────────────────────────────────────

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
      {[56, 80, 100, 80, 80, 80, 100, 56, 56, 80].map((h, i) => (
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

export default function EditVisitPage() {
  const params = useParams();
  const visitId = params?.visitId as string;
  const router = useRouter();

  const { formData, patientId, loading, error } = useVisitById(visitId);

  const handleSave = async (data: VisitFormData) => {
    try {
      await updateVisit(visitId, data);
      if (patientId) {
        router.push(`/patients/${patientId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to update visit", err);
      alert("Failed to update visit. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVisit(visitId);
      if (patientId) {
        router.push(`/patients/${patientId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to delete visit", err);
      alert("Failed to delete visit. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-app)" }}>
      <VisitHeader 
        title="Edit Visit" 
        saveLabel="Save Changes" 
        onDelete={handleDelete}
        formId="visit-form"
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
            <p style={{ fontWeight: 600 }}>Failed to load visit</p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.375rem" }}>{error}</p>
          </div>
        ) : loading ? (
          <FormSkeleton />
        ) : (
          <VisitForm onSubmit={handleSave} initialData={formData ?? undefined} />
        )}
      </main>
    </div>
  );
}
