"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/watermelon";
import type Visit from "@/lib/watermelon/model/visit";
import type { VisitFormData } from "@/components/ui/visits";

interface UseVisitByIdResult {
  formData: Partial<VisitFormData> | null;
  patientId: string | null;
  loading: boolean;
  error: string;
}

export function useVisitById(visitId: string): UseVisitByIdResult {
  const [formData, setFormData] = useState<Partial<VisitFormData> | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visitId) return;

    const fetchVisit = async () => {
      setLoading(true);
      setError("");

      try {
        const visitsCollection = database.collections.get<Visit>("visits");
        const visit = await visitsCollection.find(visitId);

        // We need the doctor name. Let's fetch it from the relations.
        const doctor = await visit.doctor.fetch();

        setPatientId(visit.patient.id);

        setFormData({
          visitDate:     new Date(visit.createdAt).toISOString(),
          doctorName:    doctor?.name          ?? "",
          complain:      visit.complaint       ?? "",
          drugs:         visit.drugs           ?? "",
          examination:   visit.examination     ?? "",
          labs:          visit.labs            ?? "",
          investigation: visit.investigations   ?? "",
          treatment:     visit.treatment       ?? "",
          nextVisitDate: visit.nextVisitDate   ?? "",
          nextVisitType: (visit.nextVisitType as any) ?? "",
          notes:         visit.notes           ?? "",
        });
      } catch (dbError: any) {
        setError(dbError?.message ?? "Visit not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchVisit();
  }, [visitId]);

  return { formData, patientId, loading, error };
}
