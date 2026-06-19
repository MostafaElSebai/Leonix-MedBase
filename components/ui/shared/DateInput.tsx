"use client";

import { useState, useEffect, useRef } from "react";

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function DateInput({ value, onChange, ...props }: DateInputProps) {
  const [text, setText] = useState("");
  const lastReportedValue = useRef<string>(value);

  // Sync incoming YYYY-MM-DD to DD/MM/YYYY text ONLY if changed from outside
  useEffect(() => {
    if (value !== lastReportedValue.current) {
      if (value) {
        const parts = value.split("-");
        if (parts.length === 3) {
          setText(`${parts[2]}/${parts[1]}/${parts[0]}`);
        } else {
          setText(value); // Fallback
        }
      } else {
        setText("");
      }
      lastReportedValue.current = value;
    }
  }, [value]);

  const triggerChange = (newVal: string) => {
    lastReportedValue.current = newVal;
    onChange(newVal);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // Allow clearing completely
    if (!input) {
      setText("");
      triggerChange("");
      return;
    }

    // If user is deleting (backspace), just allow it without re-formatting immediately
    if (input.length < text.length) {
      setText(input);
      triggerChange("");
      return;
    }

    // User is typing/pasting
    let digits = input.replace(/\D/g, "");
    let chars = digits.split("");
    let res = "";

    // Helper to find 19XX or 20XX anchor
    const extractDMY = (dStr: string) => {
      let yIdx = -1;
      for (let i = 2; i <= 4; i++) {
        if (i + 1 < dStr.length || i + 1 === dStr.length) {
          const sub = dStr.slice(i, i + 2);
          if (sub === "19" || sub === "20") {
            yIdx = i;
            break;
          }
        }
      }

      if (yIdx !== -1) {
        const dm = dStr.slice(0, yIdx);
        const y = dStr.slice(yIdx);
        
        if (dm.length === 2) {
          let d = parseInt(dm[0]);
          let m = parseInt(dm[1]);
          if (d >= 1 && d <= 31 && m >= 1 && m <= 12) return { d: dm[0], m: dm[1], y };
        } else if (dm.length === 3) {
          let d1 = parseInt(dm.slice(0, 2)), m1 = parseInt(dm.slice(2, 3));
          let v1 = d1 >= 1 && d1 <= 31 && m1 >= 1 && m1 <= 12;
          let d2 = parseInt(dm.slice(0, 1)), m2 = parseInt(dm.slice(1, 3));
          let v2 = d2 >= 1 && d2 <= 31 && m2 >= 1 && m2 <= 12;
          
          if (v1 && !v2) return { d: dm.slice(0, 2), m: dm.slice(2, 3), y };
          if (!v1 && v2) return { d: dm.slice(0, 1), m: dm.slice(1, 3), y };
          if (v1 && v2) return { d: dm.slice(0, 2), m: dm.slice(2, 3), y }; // prefer DD M
        } else if (dm.length === 4) {
          let d = parseInt(dm.slice(0, 2)), m = parseInt(dm.slice(2, 4));
          if (d >= 1 && d <= 31 && m >= 1 && m <= 12) return { d: dm.slice(0, 2), m: dm.slice(2, 4), y };
        }
      }
      return null;
    };

    const parsed = extractDMY(digits);
    if (parsed) {
      let { d, m, y } = parsed;
      if (d.length === 1) d = "0" + d;
      if (m.length === 1) m = "0" + m;
      res = `${d}/${m}/${y}`;
    } else {
      // Fallback: Greedy left-to-right logic
      // Day
      if (chars.length > 0) {
        let d1 = parseInt(chars[0]);
        if (d1 > 3) {
          res += "0" + chars[0] + "/";
          chars.shift();
        } else if (chars.length > 1) {
          let d2 = parseInt(chars[1]);
          if (d1 === 3 && d2 > 1) {
            res += "03/";
            chars.shift();
          } else if (d1 === 0 && d2 === 0) {
            res += "01/";
            chars.splice(0, 2);
          } else {
            res += chars[0] + chars[1] + "/";
            chars.splice(0, 2);
          }
        } else {
          res += chars[0];
          chars.shift();
        }
      }

      // Month
      if (chars.length > 0) {
        let m1 = parseInt(chars[0]);
        if (m1 > 1) {
          res += "0" + chars[0] + "/";
          chars.shift();
        } else if (chars.length > 1) {
          let m2 = parseInt(chars[1]);
          if (m1 === 1 && m2 > 2) {
            res += "01/";
            chars.shift();
          } else if (m1 === 0 && m2 === 0) {
            res += "01/";
            chars.splice(0, 2);
          } else {
            res += chars[0] + chars[1] + "/";
            chars.splice(0, 2);
          }
        } else {
          res += chars[0];
          chars.shift();
        }
      }

      // Year
      if (chars.length > 0) {
        res += chars.slice(0, 4).join("");
      }

      // Support manual slash typing for early padding
      if (input.endsWith("/")) {
        if (digits.length === 1) {
          res = "0" + digits[0] + "/";
        } else if (digits.length === 3) {
          res = res.slice(0, 3) + "0" + digits[2] + "/";
        }
      }
    }

    setText(res);
    
    // If we have a full date, convert back to YYYY-MM-DD for the parent form state
    if (res.length === 10) {
      const [dd, mm, yyyy] = res.split("/");
      const d = new Date(`${yyyy}-${mm}-${dd}`);
      if (!isNaN(d.getTime())) {
        triggerChange(`${yyyy}-${mm}-${dd}`);
      } else {
        triggerChange("");
      }
    } else {
      triggerChange("");
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="DD/MM/YYYY"
      value={text}
      onChange={handleChange}
      {...props}
    />
  );
}
