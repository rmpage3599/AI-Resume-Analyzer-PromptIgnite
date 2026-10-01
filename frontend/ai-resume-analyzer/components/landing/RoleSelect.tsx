"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon, TargetIcon } from "@/components/core/Icons";
import { JOB_ROLES } from "@/lib/jobRoles";
import type { JobRoleId } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Props {
  value: JobRoleId;
  onChange: (id: JobRoleId) => void;
}

export default function RoleSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = JOB_ROLES.find((r) => r.id === value) ?? JOB_ROLES[3];

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
    if (!buttons) return;
    const idx = (i + buttons.length) % buttons.length;
    buttons[idx].focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <label
        id="role-label"
        className="mb-2 flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.18em] text-fg-3"
      >
        <span className="h-px w-4 bg-azure/40" />
        02 · Target Job Role
      </label>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="role-label role-value"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => focusIndex(0));
          }
        }}
        className={cn(
          "group relative flex w-full items-center justify-between gap-3 rounded-[10px] border bg-base/60 px-4 py-3 text-left transition-all duration-200",
          open
            ? "border-azure/50 bg-navy/10"
            : "border-line hover:border-azure/30",
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] border border-azure/25 bg-navy/15 text-azure">
            <TargetIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span
              id="role-value"
              className="block truncate text-[14.5px] font-medium text-fg"
            >
              {current.label}
            </span>
            <span className="block truncate text-[11.5px] text-fg-3">
              {current.descriptor}
            </span>
          </span>
        </span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 text-fg-3 transition-transform duration-200",
            open && "rotate-180 text-azure",
          )}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-labelledby="role-label"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-[10px] border border-azure/25 bg-panel-hi shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95)]"
        >
          {JOB_ROLES.map((role, i) => {
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
                      focusIndex(JOB_ROLES.length - 1);
                    }
                  }}
                  className={cn(
                    "relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                    selected
                      ? "bg-navy/30"
                      : "hover:bg-navy/15",
                  )}
                >
                  {selected && (
                    <span
                      aria-hidden
                      className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-azure"
                    />
                  )}
                  <span className="mono mt-0.5 text-[10.5px] tracking-[0.16em] text-fg-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium text-fg">
                      {role.label}
                    </span>
                    <span className="block text-[11.5px] text-fg-3">
                      {role.descriptor}
                    </span>
                  </span>
                  {selected && (
                    <span className="mt-1 text-azure">
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
