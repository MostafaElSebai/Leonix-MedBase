"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/watermelon";
import PatientModel from "@/lib/watermelon/model/patient";
import { Q } from "@nozbe/watermelondb";

export function usePatients(searchQuery: string = "") {
  const [patients, setPatients] = useState<PatientModel[]>([]);

  useEffect(() => {
    const collection = database.collections.get<PatientModel>("patients");
    
    // We want all patients that aren't deleted locally
    const query = searchQuery.trim() 
      ? collection.query(
          Q.where('name', Q.like(`%${searchQuery}%`))
        )
      : collection.query();

    const subscription = query.observe().subscribe((data) => {
      setPatients(data);
    });

    return () => subscription.unsubscribe();
  }, [searchQuery]);

  return patients;
}
