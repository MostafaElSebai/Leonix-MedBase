import React from "react";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "brand";

interface BadgeProps {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "neutral",
  icon,
  children,
  className = "",
}: BadgeProps) {
  const variantClass = {
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    neutral: "badge-neutral",
    brand: "badge-brand",
  }[variant];

  return (
    <span className={`badge ${variantClass} ${className}`}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
