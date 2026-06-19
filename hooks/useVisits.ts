"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/watermelon";
import VisitModel from "@/lib/watermelon/model/visit";
import { Q } from "@nozbe/watermelondb";

export function useVisitsByPatient(patientId: string | undefined) {
  const [visits, setVisits] = useState<VisitModel[]>([]);

  useEffect(() => {
    if (!patientId) return;

    const collection = database.collections.get<VisitModel>("visits");
    
    const subscription = collection
      .query(Q.where("patient_id", patientId))
      .observe()
      .subscribe((data) => {
        // Sort by visit date descending in JS (Watermelon LokiJS query sort is possible but this is easier)
        const sorted = data.sort((a, b) => b.createdAt - a.createdAt);
        setVisits(sorted);
      });

    return () => subscription.unsubscribe();
  }, [patientId]);

  return visits;
}
