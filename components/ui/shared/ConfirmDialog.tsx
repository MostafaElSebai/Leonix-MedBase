"use client";

import React, { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(2px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--color-bg-card)",
          borderRadius: "var(--radius-card)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          width: "100%",
          maxWidth: "24rem",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "1.5rem" }}>
          <h2
            id="dialog-title"
            style={{
              margin: "0 0 0.5rem",
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {title}
          </h2>
          <p
            id="dialog-description"
            style={{
              margin: 0,
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "var(--color-bg-app)",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <button
            className="btn btn-ghost btn-sm"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={onConfirm}
            style={
              isDestructive
                ? { backgroundColor: "var(--color-danger)", color: "white", border: "none" }
                : undefined
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
