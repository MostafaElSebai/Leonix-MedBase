"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/watermelon";
import VisitModel from "@/lib/watermelon/model/visit";
import { Q } from "@nozbe/watermelondb";

export type EnhancedVisit = {
  visit: VisitModel;
  doctorName?: string;
};

export function useVisitsByPatient(patientId: string | undefined) {
  const [visits, setVisits] = useState<EnhancedVisit[]>([]);

  useEffect(() => {
    if (!patientId) return;

    const collection = database.collections.get<VisitModel>("visits");
    
    const subscription = collection
      .query(Q.where("patient_id", patientId))
      .observe()
      .subscribe(async (data) => {
        // Sort by visit date descending in JS (Watermelon LokiJS query sort is possible but this is easier)
        const sorted = data.sort((a, b) => b.createdAt - a.createdAt);
        
        const enhanced = await Promise.all(
          sorted.map(async (v) => {
            let doctorName = undefined;
            try {
              const doctor = await v.doctor.fetch();
              if (doctor) {
                doctorName = doctor.name;
              }
            } catch (err) {
              console.error("Error fetching doctor for visit", err);
            }
            return { visit: v, doctorName };
          })
        );
        
        setVisits(enhanced);
      });

    return () => subscription.unsubscribe();
  }, [patientId]);

  return visits;
}
