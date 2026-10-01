"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/core/Icons";
import type { JobRole } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Props {
  roles: JobRole[];
  value: string;
  onChange: (id: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function RoleSelect({
  roles,
  value,
  onChange,
  loading,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = roles.find((r) => r.id === value) ?? roles[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const focusIndex = (i: number) => {
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(
      "button[data-option]",
    );
    if (!buttons || buttons.length === 0) return;
    const idx = (i + buttons.length) % buttons.length;
    buttons[idx].focus();
  };

  if (!current) {
    return (
      <div className="rounded-[14px] border border-[rgba(13,71,161,0.14)] bg-white/55 px-4 py-3.5 backdrop-blur-md">
        <p className="text-[13px] text-[#7890a4]">Loading job roles…</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <label
        id="role-label"
        className="label-eyebrow mb-2 block"
      >
        Target role
      </label>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="role-label role-value"
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (disabled) return;
            setOpen(true);
            requestAnimationFrame(() => focusIndex(0));
          }
        }}
        disabled={disabled}
        className={cn(
          "group flex w-full items-center justify-between gap-3 rounded-[14px] border bg-white/55 px-4 py-3 text-left backdrop-blur-md transition-all",
          disabled
            ? "cursor-not-allowed opacity-60"
            : open
              ? "border-[#0d47a1]/55 bg-white/80"
              : "border-[rgba(13,71,161,0.14)] hover:border-[#90caf9]/55",
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="min-w-0">
            <span
              id="role-value"
              className="block truncate text-[14.5px] font-medium text-[#0d2740]"
            >
              {current.title}
            </span>
            <span className="mt-0.5 block truncate text-[12px] text-[#7890a4]">
              {current.description}
            </span>
          </span>
        </span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 shrink-0 text-[#7890a4] transition-transform duration-200",
            open && "rotate-180 text-[#0d47a1]",
          )}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-labelledby="role-label"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[340px] overflow-y-auto overflow-x-hidden rounded-[14px] border border-[rgba(13,71,161,0.14)] bg-white/95 p-1.5 shadow-[0_18px_45px_-18px_rgba(13,71,161,0.30)] backdrop-blur-xl"
        >
          {roles.map((role, i) => {
            const selected = role.id === value;
            return (
              <li key={role.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  data-option
                  onClick={() => {
                    onChange(role.id);
                    setOpen(false);
                    requestAnimationFrame(() => buttonRef.current?.focus());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      focusIndex(i + 1);
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      focusIndex(i - 1);
                    } else if (e.key === "Home") {
                      e.preventDefault();
                      focusIndex(0);
                    } else if (e.key === "End") {
                      e.preventDefault();
                      focusIndex(roles.length - 1);
                    }
                  }}
                  className={cn(
                    "relative flex w-full items-start gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors",
                    selected
                      ? "bg-[rgba(13,71,161,0.08)]"
                      : "hover:bg-[rgba(13,71,161,0.05)]",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium text-[#0d2740]">
                      {role.title}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-[#7890a4]">
                      {role.description}
                    </span>
                  </span>
                  {selected && (
                    <span className="mt-0.5 text-[#0d47a1]">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
