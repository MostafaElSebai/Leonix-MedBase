"use client";

import React from "react";

interface KioskCardProps {
  name: string;
  subtitle?: string;
  badgeText?: string;
  isSelected?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function KioskCard({
  name,
  subtitle,
  badgeText,
  isSelected = false,
  onClick,
  children,
}: KioskCardProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Select ${name}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-bg-card)",
        borderRadius: "var(--radius-card)",
        boxShadow: isSelected
          ? "0 0 0 2px var(--color-action), var(--shadow-card-hover)"
          : "var(--shadow-card)",
        transform: isSelected ? "translateY(-1px) scale(1.015)" : "none",
        transition: "box-shadow 150ms ease-in-out, transform 150ms ease-in-out",
        cursor: "pointer",
        minHeight: "10rem",
        padding: "1.5rem",
        outline: "none",
        userSelect: "none",
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow =
          "0 0 0 3px var(--color-bg-app), 0 0 0 5px var(--color-action)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = isSelected
          ? "0 0 0 2px var(--color-action), var(--shadow-card-hover)"
          : "var(--shadow-card)";
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
          e.currentTarget.style.transform = "translateY(-1px) scale(1.015)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = "var(--shadow-card)";
          e.currentTarget.style.transform = "none";
        }
      }}
    >
      {/* Top accent bar */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(to right, var(--color-action), #60a5fa)",
          borderRadius: "var(--radius-card) var(--radius-card) 0 0",
        }}
      />

      {/* Avatar + Name row */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
        {/* Avatar */}
        <div
          aria-hidden="true"
          style={{
            flexShrink: 0,
            width: "3rem",
            height: "3rem",
            borderRadius: "50%",
            backgroundColor: "#dbeafe", /* blue-100 */
            color: "var(--color-brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: "0.025em",
          }}
        >
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "1.0625rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </p>
          {subtitle && (
            <p
              style={{
                margin: "0.125rem 0 0",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--color-text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {badgeText && (
          <span className="badge badge-brand" style={{ flexShrink: 0 }}>
            {badgeText}
          </span>
        )}
      </div>

      {/* Slot for PIN form or CTA */}
      {children ? (
        <div style={{ marginTop: "0.5rem", flex: 1 }}>{children}</div>
      ) : (
        <div
          style={{
            marginTop: "auto",
            paddingTop: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "var(--color-text-muted)",
            fontSize: "0.8125rem",
          }}
        >
          <span>Tap to authenticate</span>
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--color-action)" }}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      )}
    </div>
  );
}
