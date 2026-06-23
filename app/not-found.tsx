"use client";

import { useRouter } from "next/navigation";
import { useCurrentDoctor } from "@/hooks/useCurrentDoctor";
import { useEffect, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const { doctor, loading } = useCurrentDoctor();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg-app)",
        padding: "2rem",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "28rem",
          width: "100%",
          textAlign: "center",
          padding: "3rem 2rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{
            width: "4rem",
            height: "4rem",
            borderRadius: "50%",
            backgroundColor: "var(--color-brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            color: "white"
          }}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>

        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: "0.5rem",
          }}
        >
          Page Not Found
        </h1>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.9375rem",
            marginBottom: "2.5rem",
            lineHeight: 1.5,
          }}
        >
          The page you are looking for doesn't exist or has been moved. Please check the URL and try again.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={() => {
              if (doctor) {
                router.push("/dashboard");
              } else {
                router.push("/");
              }
            }}
            disabled={!mounted || loading}
            style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "0.5rem" }}
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {loading ? "Checking Status..." : doctor ? "Go to Dashboard" : "Return to Login"}
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => router.back()}
            style={{ width: "100%", justifyContent: "center", padding: "0.75rem", border: "1px solid var(--color-border)" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "0.5rem" }}
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
