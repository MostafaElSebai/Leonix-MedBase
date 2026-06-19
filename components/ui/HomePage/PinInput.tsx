"use client";

import React, { useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

export function PinInput({
  length = 4,
  value,
  onChange,
  onSubmit,
  disabled = false,
  error = false,
  autoFocus = false,
}: PinInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0]?.focus();
    }
  }, [autoFocus]);

  // After a failed auth the hook clears the PIN (value → "").
  // Refocus the first cell so the doctor can immediately re-type.
  useEffect(() => {
    if (error && value === "" && inputsRef.current[0]) {
      inputsRef.current[0]?.focus();
    }
  }, [error, value]);

  const handleChange = (index: number, char: string) => {
    // Accept only a single digit
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, i) => (i === index ? digit : d));
    onChange(next.join(""));
    // Move focus forward
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.();
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        // Clear current cell
        const next = digits.map((d, i) => (i === index ? "" : d));
        onChange(next.join(""));
      } else if (index > 0) {
        // Move to previous cell and clear it
        const next = digits.map((d, i) => (i === index - 1 ? "" : d));
        onChange(next.join(""));
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted.padEnd(length, "").slice(0, length));
    // Focus on last filled or last cell
    const lastIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[lastIndex]?.focus();
  };

  return (
    <div
      className="flex items-center gap-3"
      role="group"
      aria-label="PIN entry"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el; }}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`PIN digit ${index + 1}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          style={{
            width: "3.25rem",
            height: "3.75rem",
            textAlign: "center",
            fontSize: "1.5rem",
            fontFamily: "var(--font-mono, monospace)",
            fontWeight: 700,
            backgroundColor: "var(--color-bg-card)",
            color: "var(--color-text-primary)",
            border: `2px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
            borderRadius: "var(--radius-input)",
            outline: "none",
            transition: "border-color 150ms, box-shadow 150ms",
            cursor: disabled ? "not-allowed" : "text",
            opacity: disabled ? 0.5 : 1,
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = error
              ? "var(--color-danger)"
              : "var(--color-action)";
            e.currentTarget.style.boxShadow = error
              ? "0 0 0 3px rgb(220 38 38 / 0.15)"
              : "0 0 0 3px rgb(37 99 235 / 0.15)";
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = error
              ? "var(--color-danger)"
              : "var(--color-border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      ))}
    </div>
  );
}
