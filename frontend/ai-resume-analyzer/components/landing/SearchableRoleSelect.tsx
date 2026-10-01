"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/core/Icons";
import type { JobRole } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Props {
  roles: JobRole[];
  value: string;
  onChange: (id: string) => void;
  loading?: boolean;
  disabled?: boolean;
  fieldLabel?: string;
}

export default function SearchableRoleSelect({
  roles,
  value,
  onChange,
  loading,
  disabled,
  fieldLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const current = useMemo(
    () => roles.find((r) => r.id === value) ?? roles[0],
    [roles, value]
  );

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);

    const onPointer = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.requiredSkills && r.requiredSkills.some((s) => s.toLowerCase().includes(q)))
    );
  }, [roles, search]);

  if (!current && loading) {
    return (
      <div className="rounded-[12px] border border-slate-200 bg-white/60 px-4 py-3 text-[13px] text-slate-400">
        Loading job roles...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="label-eyebrow block text-slate-600">
          2. Choose Target Job Role
        </label>
        {fieldLabel && (
          <span className="text-[11px] font-medium text-slate-400">
            {roles.length} available in this field
          </span>
        )}
      </div>

      <button
        type="button"
        disabled={disabled || roles.length === 0}
        onClick={() => !disabled && roles.length > 0 && setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-[12px] border bg-white/70 px-4 py-2.5 text-left transition",
          disabled || roles.length === 0
            ? "cursor-not-allowed opacity-60"
            : open
            ? "border-[#0d47a1]/50 bg-white ring-2 ring-[#0d47a1]/10"
            : "border-slate-200 hover:border-slate-300 hover:bg-white"
        )}
      >
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold text-[#0d2740]">
            {current ? current.title : "Select a role..."}
          </span>
          {current && (
            <span className="mt-0.5 block truncate text-[12px] text-slate-500">
              {current.description}
            </span>
          )}
        </div>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
            open && "rotate-180 text-[#0d47a1]"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 rounded-[14px] border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
          {/* Search input */}
          <div className="relative mb-2">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role or skill (e.g. React, Python, AWS)..."
              className="w-full rounded-[9px] border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-[13px] text-[#0d2740] placeholder-slate-400 focus:border-[#0d47a1] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Role options list */}
          <ul className="max-h-[260px] overflow-y-auto space-y-1">
            {filteredRoles.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-slate-400">
                No matching roles found in this field
              </li>
            ) : (
              filteredRoles.map((role) => {
                const isSelected = current && role.id === current.id;
                return (
                  <li key={role.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(role.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-start justify-between rounded-[10px] p-2.5 text-left transition",
                        isSelected
                          ? "bg-blue-50 border border-blue-200/60"
                          : "hover:bg-slate-50 border border-transparent"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-[13px] leading-tight",
                            isSelected
                              ? "font-semibold text-[#0d47a1]"
                              : "font-medium text-slate-800"
                          )}
                        >
                          {role.title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-[11.5px] text-slate-500">
                          {role.description}
                        </p>
                        {role.requiredSkills && role.requiredSkills.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {role.requiredSkills.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600"
                              >
                                {s}
                              </span>
                            ))}
                            {role.requiredSkills.length > 3 && (
                              <span className="text-[10px] text-slate-400">
                                +{role.requiredSkills.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <CheckIcon className="ml-2 mt-0.5 h-4 w-4 shrink-0 text-[#0d47a1]" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
