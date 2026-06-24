"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/watermelon";
import PatientModel from "@/lib/watermelon/model/patient";
import VisitModel from "@/lib/watermelon/model/visit";
import { Q } from "@nozbe/watermelondb";

export type EnhancedPatient = {
  patient: PatientModel;
  lastVisitDate?: string;
  assignedDoctorName?: string;
};

export function usePatients(
  searchQuery1: string = "", 
  searchQuery2: string = "", 
  doctorIdFilter: string = "",
  dateFilter: { day: string; month: string; year: string } = { day: "", month: "", year: "" }
) {
  const [patients, setPatients] = useState<EnhancedPatient[]>([]);

  useEffect(() => {
    const collection = database.collections.get<PatientModel>("patients");
    
    const conditions: any[] = [];

    const buildCondition = (term: string) => {
      // We replace regex special characters with '_' (SQL wildcard) to prevent 
      // WatermelonDB from crashing on memory regex compilation, while leaving 
      // Arabic and other non-English characters completely intact.
      const sanitized = term.trim().replace(/[.*+?^${}()|[\]\\]/g, '_');
      const safeTerm = `%${sanitized}%`;
      return Q.or(
        Q.where('name', Q.like(safeTerm)),
        Q.where('phone', Q.like(safeTerm)),
        Q.where('address', Q.like(safeTerm))
      );
    };

    if (searchQuery1.trim()) {
      conditions.push(buildCondition(searchQuery1));
    }

    if (searchQuery2.trim()) {
      conditions.push(buildCondition(searchQuery2));
    }

    if (doctorIdFilter.trim()) {
      conditions.push(Q.where('doctor_id', doctorIdFilter));
    }

    if (dateFilter.day || dateFilter.month || dateFilter.year) {
      const y = dateFilter.year || "%";
      const m = dateFilter.month || "%";
      const d = dateFilter.day || "%";
      // This builds a strict LIKE pattern, e.g., "2024-05-%", "%-05-19", "%-%-19"
      const datePattern = `${y}-${m}-${d}`;
      conditions.push(Q.where('historical_first_visit', Q.like(datePattern)));
    }

    // Default ordering by most recently updated
    conditions.push(Q.sortBy('updated_at', Q.desc));

    const query = collection.query(...conditions);

    const subscription = query.observe().subscribe(async (data) => {
      const enhanced = await Promise.all(
        data.map(async (p) => {
          let lastVisitDate = undefined;
          let latestVisitUpdate = 0;
          let assignedDoctorName = undefined;

          try {
            // Fetch assigned doctor
            if (p.doctorId) {
              const assignedDoctor = await p.assignedDoctor.fetch();
              if (assignedDoctor) {
                assignedDoctorName = assignedDoctor.name;
              }
            }

            // Fetch last visit
            const visits = await p.visits.extend(
              Q.sortBy('created_at', Q.desc),
              Q.take(1)
            ).fetch() as VisitModel[];

            if (visits.length > 0) {
              const lastVisit = visits[0];
              lastVisitDate = new Date(lastVisit.createdAt).toISOString();
            }

            // Fetch latest updated visit for sorting
            const updatedVisits = await p.visits.extend(
              Q.sortBy('updated_at', Q.desc),
              Q.take(1)
            ).fetch() as VisitModel[];

            if (updatedVisits.length > 0) {
              latestVisitUpdate = updatedVisits[0].updatedAt;
            }
          } catch (err) {
            console.error("Error fetching patient relation info", err);
          }

          return {
            patient: p,
            lastVisitDate,
            latestVisitUpdate,
            assignedDoctorName
          };
        })
      );

      // Sort in JS to ensure patients with recently updated visits float to the top
      enhanced.sort((a, b) => {
        const aTime = Math.max(a.patient.updatedAt || 0, a.latestVisitUpdate || 0);
        const bTime = Math.max(b.patient.updatedAt || 0, b.latestVisitUpdate || 0);
        return bTime - aTime; // descending
      });
      
      setPatients(enhanced);
    });

    return () => subscription.unsubscribe();
  }, [searchQuery1, searchQuery2, doctorIdFilter, dateFilter.day, dateFilter.month, dateFilter.year]);

  return patients;
}
