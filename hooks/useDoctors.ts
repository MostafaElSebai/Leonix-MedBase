"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/watermelon";
import { Q } from "@nozbe/watermelondb";

interface DoctorData {
  id: string;
  name: string;
}

export function useDoctors() {
  const [doctors, setDoctors] = useState<DoctorData[]>([]);

  useEffect(() => {
    // Attempt to load from local DB first
    const collection = database.collections.get("doctors");
    const subscription = collection.query().observe().subscribe(async (data) => {
      let docList = data.map((d: any) => ({
        id: d.id,
        name: d.name,
      }));

      // Fallback: If local db is empty (e.g. sync hasn't completed or doctors weren't pulled),
      // fetch directly from Supabase so the UI isn't broken.
      if (docList.length === 0 && navigator.onLine) {
        try {
          const { supabase } = await import("@/lib/supabase/db");
          const { data: remoteData } = await supabase.from("doctors").select("id, name");
          if (remoteData && remoteData.length > 0) {
            docList = remoteData;
          }
        } catch (e) {
          console.error("Failed to fetch doctors from Supabase", e);
        }
      }

      setDoctors(docList);
    });

    return () => subscription.unsubscribe();
  }, []);

  return doctors;
}
