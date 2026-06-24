import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/db";
import { Doctor, AuthStatus } from "@/app/types/index";
import { Session } from "@supabase/supabase-js";

export function useDoctorAuth() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [pin, setPin] = useState("");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle");
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("doctors").select("*");
      if (error) {
        console.error("Supabase error:", error);
        setFetchError(error.message);
      } else {
        setDoctors(data || []);
      }
      setLoading(false);
    };

    fetchDoctors();
  }, []);

  const handleCardClick = (id: string | number, email: string) => {
    if (selectedId === id) return;
    setSelectedId(id);
    setDoctorEmail(email)
    setPin("");
    setAuthStatus("idle");
  };

  const handleCancel = () => {
    setSelectedId(null);
    setPin("");
    setAuthStatus("idle");
  };

  const doVerify = async () => {
    if (!selectedId || !pin) return;
    setAuthStatus("loading");

    const { error } = await supabase.auth.signInWithPassword({
      email: doctorEmail,
      password: pin,
    });

    if (error) {
      setAuthStatus("error");
      setPin(""); // clear so the doctor can immediately re-type
    } else {
      setAuthStatus("success");
      // Trigger an immediate background sync as soon as they log in
      import("@/lib/watermelon/sync").then(({ sync }) => {
        sync().catch(err => console.error("Sync after login failed", err));
      });
      setTimeout(goToDashboard, 300);
    }
  }

  // const doVerify = async () => {
  //   if (!selectedId || !pin) return;
  //   setAuthStatus("loading");

  //   const { data, error } = await supabase
  //     .from("doctors")
  //     .select("id")
  //     .eq("id", selectedId)
  //     .eq("pin", pin)
  //     .single();

  //   if (error || !data) {
  //     setAuthStatus("error");
  //   } else {
  //     setAuthStatus("success");
  //     setTimeout(goToDashboard, 600);
  //   }
  // };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  const verifyPin = (e?: React.FormEvent) => {
    e?.preventDefault();
    doVerify();
  };

  const fetchSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    setSession(session);

    if (error) {
      router.push("/login")
    }
  };


  return {
    doctors,
    loading,
    fetchError,
    selectedId,
    pin,
    setPin,
    authStatus,
    handleCardClick,
    handleCancel,
    verifyPin,
    fetchSession,
    session
  };
}
