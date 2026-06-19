"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/watermelon";
import type Patient from "@/lib/watermelon/model/patient";
import type { NewPatientFormData } from "@/components/ui/patients";

interface UsePatientByIdResult {
  formData: Partial<NewPatientFormData> | null;
  doctorName: string;
  loading: boolean;
  error: string;
}

export function usePatientById(patientId: string): UsePatientByIdResult {
  const [formData, setFormData] = useState<Partial<NewPatientFormData> | null>(null);
  const [doctorName, setDoctorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientId) return;

    const fetchPatient = async () => {
      setLoading(true);
      setError("");

      try {
        const patientsCollection = database.collections.get<Patient>("patients");
        const patient = await patientsCollection.find(patientId);

        let dName = "";
        if (patient.doctorId) {
          try {
            const doctorsCollection = database.collections.get("doctors");
            const doc = await doctorsCollection.find(patient.doctorId);
            dName = (doc as any).name;
          } catch (e) {
            // Document not found
          }
        }
        
        setDoctorName(dName);

        setFormData({
          name:                patient.name                 ?? "",
          phone:               patient.phone                ?? "",
          dob:                 patient.dob                  ?? "",
          firstVisitDate:      patient.historicalFirstVisit ?? "",
          address:             patient.address              ?? "",
          maritalState:        patient.maritalState         ?? "",
          obHistory:           patient.obHistory            ?? "",
          menstrualHistory:    patient.menstrualHistory     ?? "",
          familialDiseases:    patient.familialDiseases     ?? "",
          consanguinity:       (patient.consanguinity as any) ?? "",
          doctorId:            patient.doctorId             ?? "",
          notes:               patient.notes                ?? "",
        });
      } catch (dbError: any) {
        setError(dbError?.message ?? "Patient not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  return { formData, doctorName, loading, error };
}
