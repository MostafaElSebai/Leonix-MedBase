"use client";

import { useState } from "react";
import { sync } from "@/lib/watermelon/sync";

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await sync();
      setLastSync(new Date());
    } catch (error) {
      console.error("Manual sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      title={lastSync ? `Last synced: ${lastSync.toLocaleTimeString()}` : "Sync Database"}
      aria-label="Sync Database"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.375rem",
        padding: "0.375rem 0.75rem",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "0.375rem",
        color: "var(--color-text)",
        fontSize: "0.75rem",
        fontWeight: 600,
        cursor: isSyncing ? "not-allowed" : "pointer",
        opacity: isSyncing ? 0.7 : 1,
        transition: "all 0.2s",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          animation: isSyncing ? "spin 1s linear infinite" : "none"
        }}
      >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 21v-5h5" />
      </svg>
      {isSyncing ? "Syncing..." : "Sync"}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </button>
  );
}
