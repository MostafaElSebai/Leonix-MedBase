"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useCurrentDoctor } from "@/hooks/useCurrentDoctor";
import { SyncButton } from "@/components/ui/shared/SyncButton";
import { supabase } from "@/lib/supabase/db";

interface AppHeaderBarProps {
  /** Page title shown in the header */
  title: string;
  /** Label for the back button. Defaults to "Back". */
  backLabel?: string;
  /** Explicit structural URL to go 'up' a level. Avoids history traps. */
  backHref?: string;
  /**
   * Right-side action slot — pass your primary action button here.
   * The doctor identity is always shown automatically.
   */
  children?: React.ReactNode;
  /** Optional slot for a full-width banner immediately below the header */
  bottomBanner?: React.ReactNode;
}

/**
 * Shared sticky application header.
 * Renders: back button → title → (doctor identity + action slot).
 * Use this as the base for every authenticated page header.
 */
export function AppHeaderBar({
  title,
  backLabel = "Back",
  backHref,
  children,
  bottomBanner,
}: AppHeaderBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { doctor, loading } = useCurrentDoctor();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "var(--color-bg-card)",
        boxShadow: "var(--shadow-card)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          maxWidth: "90rem",
          margin: "0 auto",
          padding: "0 1.5rem",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* ── Left: Back + Title ─────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.875rem",
            minWidth: 0,
          }}
        >
          {pathname !== "/dashboard" && (
            <>
              {backHref !== "/dashboard" && (
                <>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => router.push("/dashboard")}
                    aria-label="Back to Dashboard"
                    title="Back to Dashboard"
                    style={{ flexShrink: 0, gap: "0.375rem" }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>Dashboard</span>
                  </button>

                  <div
                    aria-hidden="true"
                    style={{
                      width: "1px",
                      height: "1.25rem",
                      backgroundColor: "var(--color-border)",
                      flexShrink: 0,
                    }}
                  />
                </>
              )}

              {backHref ? (
                <Link
                  href={backHref}
                  className="btn btn-ghost btn-sm"
                  aria-label={`Go back to ${backLabel}`}
                  style={{ flexShrink: 0, gap: "0.375rem", textDecoration: "none" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  <span>{backLabel}</span>
                </Link>
              ) : (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => router.back()}
                  aria-label={`Go back — ${backLabel}`}
                  style={{ flexShrink: 0, gap: "0.375rem" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  <span>{backLabel}</span>
                </button>
              )}

              <div
                aria-hidden="true"
                style={{
                  width: "1px",
                  height: "1.25rem",
                  backgroundColor: "var(--color-border)",
                  flexShrink: 0,
                }}
              />
            </>
          )}

          <h1
            style={{
              margin: 0,
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--color-brand)",
              letterSpacing: "-0.025em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </h1>
        </div>

        {/* ── Right: Doctor identity + action slot ───────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexShrink: 0,
          }}
        >
          {/* Doctor identity */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            aria-label="Logged in as"
          >
            {/* Avatar circle */}
            <div
              aria-hidden="true"
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "50%",
                backgroundColor: "#dbeafe",
                color: "var(--color-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            {/* Name or skeleton */}
            {loading ? (
              <div
                className="skeleton"
                style={{ width: "7rem", height: "0.875rem", borderRadius: "4px" }}
                aria-label="Loading doctor name"
              />
            ) : (
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "12rem",
                }}
              >
                {doctor?.name ?? "Unknown"}
              </span>
            )}
          </div>

          <SyncButton />

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="btn btn-ghost btn-sm"
            aria-label="Log out"
            title="Log out"
            style={{ color: "var(--color-text-muted)", padding: "0.375rem" }}
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
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>

          {/* Divider before action slot (only shown when children exist) */}
          {children && (
            <div
              aria-hidden="true"
              style={{
                width: "1px",
                height: "1.25rem",
                backgroundColor: "var(--color-border)",
              }}
            />
          )}

          {/* Action slot */}
          {children}
        </div>
      </div>

      {/* ── Bottom Banner ──────────────────────────────────────────────── */}
      {bottomBanner && (
        <div style={{ borderTop: "1px solid var(--color-border)" }}>
          {bottomBanner}
        </div>
      )}
    </header>
  );
}
