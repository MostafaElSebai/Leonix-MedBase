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

export function usePatients(searchQuery1: string = "", searchQuery2: string = "", doctorIdFilter: string = "") {
  const [patients, setPatients] = useState<EnhancedPatient[]>([]);

  useEffect(() => {
    const collection = database.collections.get<PatientModel>("patients");
    
    const conditions: any[] = [];

    const buildCondition = (term: string) => {
      const safeTerm = `%${term.trim()}%`;
      return Q.or(
        Q.where('name', Q.like(safeTerm)),
        Q.where('phone', Q.like(safeTerm)),
        Q.where('address', Q.like(safeTerm)),
        Q.where('historical_first_visit', Q.like(safeTerm))
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

    const query = collection.query(...conditions);

    const subscription = query.observe().subscribe(async (data) => {
      const enhanced = await Promise.all(
        data.map(async (p) => {
          let lastVisitDate = undefined;
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
          } catch (err) {
            console.error("Error fetching patient relation info", err);
          }

          return {
            patient: p,
            lastVisitDate,
            assignedDoctorName
          };
        })
      );
      
      setPatients(enhanced);
    });

    return () => subscription.unsubscribe();
  }, [searchQuery1, searchQuery2, doctorIdFilter]);

  return patients;
}
