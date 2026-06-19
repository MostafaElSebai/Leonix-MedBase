"use client";

import { useRouter } from "next/navigation";
import { AppHeaderBar } from "@/components/ui/shared/AppHeaderBar";

export function DashboardHeader() {
  const router = useRouter();

  return (
    <AppHeaderBar title="Patient Dashboard">
      <button
        className="btn btn-primary btn-sm"
        onClick={() => router.push("/patients/new")}
        aria-label="Add a new patient"
        style={{ gap: "0.375rem" }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>Add Patient</span>
      </button>
    </AppHeaderBar>
  );
}
