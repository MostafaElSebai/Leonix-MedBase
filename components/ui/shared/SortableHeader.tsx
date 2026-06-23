import React from "react";

interface SortableHeaderProps {
  field: string;
  label: string;
  currentSortField: string | null;
  currentSortOrder: "asc" | "desc";
  onSort: (field: any) => void;
  style?: React.CSSProperties;
}

export function SortableHeader({
  field,
  label,
  currentSortField,
  currentSortOrder,
  onSort,
  style,
}: SortableHeaderProps) {
  return (
    <th 
      scope="col" 
      style={{ ...style, cursor: "pointer", userSelect: "none" }}
      onClick={() => onSort(field)}
      title={`Sort by ${label}`}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
        {label}
        <span style={{ fontSize: "0.7rem", color: currentSortField === field ? "var(--color-brand)" : "var(--color-border)", transition: "color 150ms" }}>
          {currentSortField === field && currentSortOrder === "asc" ? "▲" : "▼"}
        </span>
      </div>
    </th>
  );
}
