// View visit details — /visits/[visitId]
"use client";

import { useRouter, useParams } from "next/navigation";
import { useVisitById } from "@/hooks/useVisitById";
import { VisitViewHeader, VisitViewCard } from "@/components/ui/visits/view";
import { deleteVisit } from "@/lib/watermelon/actions";

// ── Skeleton ────────────────────────────────────────────────────────────────

function ViewSkeleton() {
  return (
    <div
      style={{
        maxWidth: "48rem",
        margin: "0 auto",
        padding: "2rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      {[100, 150, 150, 150].map((h, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: `${h}px`, borderRadius: "var(--radius-card)" }}
        />
      ))}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function ViewVisitPage() {
  const params = useParams();
  const visitId = params?.visitId as string;
  const router = useRouter();

  const { formData, patientId, loading, error } = useVisitById(visitId);

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
      <VisitViewHeader 
        visitId={visitId}
        patientId={patientId ?? ""}
        visitDate={formData?.visitDate}
        doctorName={formData?.doctorName}
        onDelete={handleDelete}
      />
      <main style={{ padding: "2rem 1.5rem" }}>
        {error ? (
          <div
            style={{
              maxWidth: "48rem",
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
          <ViewSkeleton />
        ) : (
          <VisitViewCard data={formData ?? {}} />
        )}
      </main>
    </div>
  );
}
