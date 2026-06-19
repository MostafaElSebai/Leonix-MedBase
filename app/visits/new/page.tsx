// Add a new visit — /visits/new?patientId=X
"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useCurrentDoctor } from "@/hooks/useCurrentDoctor";
import { VisitHeader, VisitForm, VisitFormData } from "@/components/ui/visits";
import { createVisit } from "@/lib/watermelon/actions";

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

// ── Inner content (Suspense boundary for useSearchParams) ───────────────────

function NewVisitContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  const router = useRouter();
  const { doctor, loading: doctorLoading } = useCurrentDoctor();

  const handleSave = async (data: VisitFormData) => {
    if (!patientId || !doctor?.id) return;
    try {
      await createVisit(patientId, String(doctor.id), data);
      router.push(`/patients/${patientId}`);
    } catch (err) {
      console.error("Failed to create visit", err);
      alert("Failed to create visit. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-app)" }}>
      <VisitHeader title="New Visit" saveLabel="Save Visit" formId="visit-form" />
      <main>
        {doctorLoading ? (
          <FormSkeleton />
        ) : (
          <VisitForm
            onSubmit={handleSave}
            initialData={{ doctorName: doctor?.name ?? "" }}
          />
        )}
      </main>
    </div>
  );
}

// ── Page export ─────────────────────────────────────────────────────────────

export default function NewVisitPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <NewVisitContent />
    </Suspense>
  );
}
