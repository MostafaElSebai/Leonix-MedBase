import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/db";
import { Doctor } from "@/app/types/index";

interface UseCurrentDoctorResult {
  doctor: Pick<Doctor, "id" | "name" | "email" | "pin"> | null;
  loading: boolean;
  error: string;
}

export function useCurrentDoctor(): UseCurrentDoctorResult {
  const [doctor, setDoctor] = useState<Pick<Doctor, "id" | "name" | "email" | "pin"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrentDoctor = async () => {
      setLoading(true);
      setError("");

      // Step 1: Get the authenticated session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError("No active session.");
        setLoading(false);
        return;
      }

      const email = session.user.email;
      if (!email) {
        setError("Session has no email.");
        setLoading(false);
        return;
      }

      // Step 2: Fetch the matching doctor row (Try local WatermelonDB first)
      try {
        const { database } = await import("@/lib/watermelon");
        const { Q } = await import("@nozbe/watermelondb");
        const collection = database.collections.get("doctors");
        const localDocs = await collection.query(Q.where("email", email)).fetch();
        if (localDocs.length > 0) {
          const localDoc = localDocs[0] as any;
          setDoctor({
            id: localDoc.id,
            name: localDoc.name,
            email: localDoc.email,
            pin: localDoc.pin,
          });
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Local doctor fetch failed, falling back to Supabase", e);
      }

      // Step 3: Fallback to network (Supabase) if not found locally
      if (navigator.onLine) {
        const { data, error: dbError } = await supabase
          .from("doctors")
          .select("id, name, email, pin")
          .eq("email", email)
          .single();

        if (!dbError && data) {
          setDoctor(data as Pick<Doctor, "id" | "name" | "email" | "pin">);
          setLoading(false);
          return;
        }
      }

      console.log("useCurrentDoctor: failed to find doctor");
      setError("Doctor not found locally or network is offline.");
      setLoading(false);
    };

    fetchCurrentDoctor();
  }, []);

  return { doctor, loading, error };
}
