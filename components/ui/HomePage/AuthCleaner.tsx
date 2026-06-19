// Ensures user logs out on fresh load
// Still not working well

"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/db";
import { useRouter } from "next/navigation";

export function AuthCleaner() {
  const router = useRouter();
  useEffect(() => {
    const enforceLogout = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
      }
    };
    enforceLogout();
    router.refresh();
  }, [router]);
  return null;
}