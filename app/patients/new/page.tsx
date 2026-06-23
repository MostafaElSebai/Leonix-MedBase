// Add a new patient
"use client";

import { useRouter } from "next/navigation";
import { useCurrentDoctor } from "@/hooks/useCurrentDoctor";
import { NewPatientHeader, NewPatientForm, NewPatientFormData, PatientFormSkeleton } from "@/components/ui/patients";
import { createPatient } from "@/lib/watermelon/actions";

export default function NewPatientPage() {
  const router = useRouter();
  const { loading: doctorLoading } = useCurrentDoctor();

  const handleSave = async (data: NewPatientFormData) => {
    try {
      const newPatient = await createPatient(data);
      router.replace(`/patients/${newPatient.id}`);
    } catch (error) {
      console.error("Failed to create patient", error);
      alert("Failed to save patient. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-app)" }}>
      <NewPatientHeader backHref="/dashboard" formId="patient-form" />
      <main>
        {doctorLoading ? <PatientFormSkeleton /> : <NewPatientForm onSubmit={handleSave} />}
      </main>
    </div>
  );
}