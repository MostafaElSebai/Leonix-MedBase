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

      // Step 2: Fetch the matching doctor row
      const { data, error: dbError } = await supabase
        .from("doctors")
        .select("id, name, email, pin")
        .eq("email", email)
        .single();

      if (dbError || !data) {
        setError(dbError?.message ?? "Doctor not found.");
        setLoading(false);
        return;
      }

      setDoctor(data as Pick<Doctor, "id" | "name" | "email" | "pin">);
      setLoading(false);
    };

    fetchCurrentDoctor();
  }, []);

  return { doctor, loading, error };
}
