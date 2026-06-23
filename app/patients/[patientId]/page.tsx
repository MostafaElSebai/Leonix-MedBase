// Profile: Patient details & Visit list
"use client";

import { useParams, useRouter } from "next/navigation";
import { Patient, Visit } from "@/app/types/index";
import { PatientHeader, PatientInfoCard } from "@/components/ui/patients";
import { VisitTable } from "@/components/ui/visits";
import { usePatientById } from "@/hooks/usePatientById";
import { useVisitsByPatient } from "@/hooks/useVisits";
import { deletePatient, deleteVisit } from "@/lib/watermelon/actions";
import { calculateAge } from "@/lib/utils";

// ── Page ────────────────────────────────────────────────────────────────────

export default function PatientProfilePage() {
  const params = useParams();
  const patientId = params?.patientId as string;
  const router = useRouter();

  const { formData: patientData, doctorName, loading: patientLoading } = usePatientById(patientId);
  const visitsData = useVisitsByPatient(patientId);

  if (patientLoading) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", display: "flex", justifyContent: "center" }}>
        Loading patient...
      </div>
    );
  }

  if (!patientData) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", display: "flex", justifyContent: "center" }}>
        Patient not found.
      </div>
    );
  }

  // Map to the UI expected type
  const patient: Patient & any = {
    id: patientId,
    name: patientData.name || "",
    phone: patientData.phone,
    age: patientData.dob ? (calculateAge(patientData.dob) ?? undefined) : undefined,
    dob: patientData.dob,
    address: patientData.address,
    maritalState: patientData.maritalState,
    firstVisitDate: patientData.firstVisitDate,
    obHistory: patientData.obHistory,
    menstrualHistory: patientData.menstrualHistory,
    familialDiseases: patientData.familialDiseases,
    consanguinity: patientData.consanguinity,
    doctorId: patientData.doctorId,
    doctorName: doctorName,
    notes: patientData.notes,
  };

  const visits: Visit[] = visitsData.map((v: any) => ({
    id: v.visit.id,
    patientId: patientId,
    visitDate: new Date(v.visit.createdAt).toISOString().split('T')[0], // Simplified since visitDate wasn't explicitly stored, using created_at
    doctorName: v.doctorName || "—",
    labs: v.visit.labs,
    treatment: v.visit.treatment,
  }));

  const handleDeletePatient = async () => {
    try {
      await deletePatient(patientId);
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to delete patient", err);
      alert("Failed to delete patient.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-app)" }}>

      {/* Sticky header */}
      <PatientHeader
        onAddVisit={() => router.push(`/visits/new?patientId=${patientId}`)}
        onDelete={handleDeletePatient}
        notes={patient.notes}
      />

      {/* Page content */}
      <main
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {/* Patient data */}
        <section aria-labelledby="patient-info-heading">
          <h2
            id="patient-info-heading"
            style={{
              margin: "0 0 1rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Patient Information
          </h2>
          <PatientInfoCard patient={patient} />
        </section>

        {/* Visit history */}
        <section aria-labelledby="visits-heading">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <h2
              id="visits-heading"
              style={{
                margin: 0,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Visit History — {visits.length} {visits.length === 1 ? "visit" : "visits"}
            </h2>
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <VisitTable 
              visits={visits} 
              onDelete={async (visitId) => {
                try {
                  await deleteVisit(String(visitId));
                } catch (err) {
                  console.error("Failed to delete visit", err);
                  alert("Failed to delete visit.");
                }
              }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}