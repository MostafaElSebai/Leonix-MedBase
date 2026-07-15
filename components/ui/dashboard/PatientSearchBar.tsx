"use client";

interface PatientSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PatientSearchBar({ value, onChange, placeholder }: PatientSearchBarProps) {
  return (
    <div style={{ position: "relative" }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "1rem",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--color-text-muted)",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
        }}
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
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <input
        type="search"
        className="form-input"
        placeholder={placeholder || "Search by name, phone, or addressss…"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search patients"
        style={{ paddingLeft: "2.875rem" }}
      />
    </div>
  );
}
