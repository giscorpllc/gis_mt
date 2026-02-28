"use client";

import { useRef, type ChangeEvent, type KeyboardEvent, type ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SLOTS = 6;

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  /** Derive each slot's character from the controlled value string. */
  const slots = Array.from({ length: SLOTS }, (_, i) => value[i] ?? "");

  function updateAt(index: number, digit: string) {
    const chars = Array.from({ length: SLOTS }, (_, i) => value[i] ?? "");
    chars[index] = digit;
    onChange(chars.join(""));
  }

  function handleChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    if (!digits) return;
    // onFocus selects existing text, so after typing the slot value is replaced
    updateAt(index, digits[0]);
    if (index < SLOTS - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (slots[index]) {
        updateAt(index, "");
      } else if (index > 0) {
        updateAt(index - 1, "");
        refs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < SLOTS - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, SLOTS);
    if (!pasted) return;
    onChange(pasted);
    refs.current[Math.min(pasted.length, SLOTS - 1)]?.focus();
  }

  return (
    <div className="flex justify-center gap-2">
      {slots.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-12 w-12 rounded-md border border-input bg-background",
            "text-center text-lg font-semibold",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      ))}
    </div>
  );
}
