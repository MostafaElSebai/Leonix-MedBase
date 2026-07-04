"use client";

import React, { useRef } from "react";

export interface DateFilterValue {
  day: string;
  month: string;
  year: string;
}

interface DateFilterProps {
  value: DateFilterValue;
  onChange: (val: DateFilterValue) => void;
  className?: string;
}

export function DateFilter({ value, onChange, className }: DateFilterProps) {
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const handleDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 2);
    
    // Auto pad if 4-9 since days can be up to 31.
    // If it starts with 4, 5, 6, 7, 8, 9 it must be a single-digit day under 10.
    if (v.length === 1 && /^[4-9]$/.test(v)) {
      v = `0${v}`;
      setTimeout(() => monthRef.current?.focus(), 10);
    } else if (v.length === 2) {
      setTimeout(() => monthRef.current?.focus(), 10);
    }
    
    onChange({ ...value, day: v });
  };

  const handleMonth = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 2);
    
    // Auto pad if 2-9 since months can only go up to 12.
    // If it starts with 2, 3, 4, 5, 6, 7, 8, 9 it must be a single-digit month.
    if (v.length === 1 && /^[2-9]$/.test(v)) {
      v = `0${v}`;
      setTimeout(() => yearRef.current?.focus(), 10);
    } else if (v.length === 2) {
      setTimeout(() => yearRef.current?.focus(), 10);
    }
    
    onChange({ ...value, month: v });
  };

  const handleYear = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
    onChange({ ...value, year: v });
  };

  const handleBlurDay = () => {
    if (value.day.length === 1) {
      onChange({ ...value, day: `0${value.day}` });
    }
  };

  const handleBlurMonth = () => {
    if (value.month.length === 1) {
      onChange({ ...value, month: `0${value.month}` });
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: "day" | "month" | "year"
  ) => {
    const target = e.currentTarget;
    if (e.key === "Backspace" && target.value === "") {
      if (field === "month") {
        dayRef.current?.focus();
      } else if (field === "year") {
        monthRef.current?.focus();
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
      className={`form-input ${className || ""}`}
      title="filter by first visit date"
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "0.25rem", 
        padding: "0 0.5rem",
        height: "100%", // Match height of other inputs
        minHeight: "2.5rem",
        backgroundColor: "var(--color-bg-card)"
      }}
    >
      <input
        ref={dayRef}
        type="text"
        placeholder="DD"
        value={value.day}
        onChange={handleDay}
        onBlur={handleBlurDay}
        onKeyDown={(e) => handleKeyDown(e, "day")}
        autoComplete="off"
        style={{ flex: 1, textAlign: "center", background: "transparent", border: "none", outline: "none", width: "100%" }}
      />
      <span style={{ color: "var(--color-text-muted)", fontWeight: "bold" }}>/</span>
      <input
        ref={monthRef}
        type="text"
        placeholder="MM"
        value={value.month}
        onChange={handleMonth}
        onBlur={handleBlurMonth}
        onKeyDown={(e) => handleKeyDown(e, "month")}
        autoComplete="off"
        style={{ flex: 1, textAlign: "center", background: "transparent", border: "none", outline: "none", width: "100%" }}
      />
      <span style={{ color: "var(--color-text-muted)", fontWeight: "bold" }}>/</span>
      <input
        ref={yearRef}
        type="text"
        placeholder="YYYY"
        value={value.year}
        onChange={handleYear}
        onKeyDown={(e) => handleKeyDown(e, "year")}
        autoComplete="off"
        style={{ flex: 1.5, textAlign: "center", background: "transparent", border: "none", outline: "none", width: "100%" }}
      />
    </div>
  );
}
