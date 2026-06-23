"use client";

import React, { useState, useEffect, useRef } from "react";

interface DateInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function DateInput({ id, value, onChange, required, className }: DateInputProps) {
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  // Parse incoming value (assuming YYYY-MM-DD or similar)
  const parts = value ? value.split('-') : [];
  const initialYear = parts[0] || '';
  const initialMonth = parts[1] || '';
  const initialDay = parts[2] || '';

  const [day, setDay] = useState(initialDay);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  // Sync from props in case form is reset or changed externally (like typing in "Age")
  useEffect(() => {
    const p = value ? value.split('-') : [];
    // Only update local state if it differs from the parsed value, 
    // to prevent cursor jumping or interfering with typing.
    if (p[0] !== undefined && p[0] !== year) setYear(p[0]);
    if (p[1] !== undefined && p[1] !== month) setMonth(p[1].replace(/^0+/, ''));
    if (p[2] !== undefined && p[2] !== day) setDay(p[2].replace(/^0+/, ''));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
    setDay(v);
    update(year, month, v);
  };

  const handleMonth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
    setMonth(v);
    update(year, v, day);
  };

  const handleYear = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYear(v);
    update(v, month, day);
  };

  const update = (y: string, m: string, d: string) => {
    if (!y && !m && !d) {
      onChange("");
    } else {
      const paddedMonth = m ? m.padStart(2, '0') : '01';
      const paddedDay = d ? d.padStart(2, '0') : '01';
      onChange(`${y}-${paddedMonth}-${paddedDay}`);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: "day" | "month" | "year"
  ) => {
    const target = e.currentTarget;
    if (e.key === "Enter") {
      e.preventDefault();
      if (field === "day") monthRef.current?.focus();
      else if (field === "month") yearRef.current?.focus();
      else {
        const form = target.form;
        if (form) {
          const elements = Array.from(form.elements) as HTMLElement[];
          const focusable = elements.filter(
            (el) => !el.hasAttribute("disabled") && el.tabIndex >= 0 && el.tagName !== "FIELDSET"
          );
          const index = focusable.indexOf(target);
          if (index > -1 && index < focusable.length - 1) {
            focusable[index + 1].focus();
          }
        }
      }
    } else if (e.key === "ArrowRight") {
      if (target.selectionStart === target.value.length) {
        e.preventDefault();
        if (field === "day") monthRef.current?.focus();
        else if (field === "month") yearRef.current?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      if (target.selectionStart === 0) {
        e.preventDefault();
        if (field === "month") dayRef.current?.focus();
        else if (field === "year") monthRef.current?.focus();
      }
    }
  };

  return (
    <div 
      className={className} 
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "0.25rem", 
        width: "100%", 
        padding: "0 0.5rem" 
      }}
    >
      <input
        id={id}
        ref={dayRef}
        type="text"
        placeholder="DD"
        value={day}
        onChange={handleDay}
        onKeyDown={(e) => handleKeyDown(e, "day")}
        required={required}
        style={{ flex: 1, textAlign: "center", background: "transparent", border: "none", outline: "none", width: "100%", padding: "0.75rem 0" }}
      />
      <span style={{ color: "var(--color-text-muted)", fontWeight: "bold" }}>/</span>
      <input
        ref={monthRef}
        type="text"
        placeholder="MM"
        value={month}
        onChange={handleMonth}
        onKeyDown={(e) => handleKeyDown(e, "month")}
        required={required}
        style={{ flex: 1, textAlign: "center", background: "transparent", border: "none", outline: "none", width: "100%", padding: "0.75rem 0" }}
      />
      <span style={{ color: "var(--color-text-muted)", fontWeight: "bold" }}>/</span>
      <input
        ref={yearRef}
        type="text"
        placeholder="YYYY"
        value={year}
        onChange={handleYear}
        onKeyDown={(e) => handleKeyDown(e, "year")}
        required={required}
        style={{ flex: 1.5, textAlign: "center", background: "transparent", border: "none", outline: "none", width: "100%", padding: "0.75rem 0" }}
      />
    </div>
  );
}
