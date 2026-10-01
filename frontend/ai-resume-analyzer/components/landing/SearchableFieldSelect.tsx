"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/core/Icons";
import { cn } from "@/lib/cn";

interface Props {
  fields: string[];
  selectedField: string;
  onSelectField: (field: string) => void;
  getRoleCount?: (field: string) => number;
  disabled?: boolean;
}

export default function SearchableFieldSelect({
  fields,
  selectedField,
  onSelectField,
  getRoleCount,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const filteredFields = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return fields;
    return fields.filter((f) => f.toLowerCase().includes(q));
  }, [fields, search]);

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="label-eyebrow mb-1.5 block text-slate-600">
        1. Choose Career Field
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-[12px] border bg-white/70 px-4 py-2.5 text-left transition",
          disabled
            ? "cursor-not-allowed opacity-60"
            : open
            ? "border-[#0d47a1]/50 bg-white ring-2 ring-[#0d47a1]/10"
            : "border-slate-200 hover:border-slate-300 hover:bg-white"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="truncate text-[14px] font-semibold text-[#0d2740]">
            {selectedField || "Select a field..."}
          </span>
          {getRoleCount && selectedField && (
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {getRoleCount(selectedField)} roles
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
              placeholder="Search field (e.g. Software, Data, Cloud)..."
              className="w-full rounded-[9px] border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-[13px] text-[#0d2740] placeholder-slate-400 focus:border-[#0d47a1] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Field options list */}
          <ul className="max-h-[220px] overflow-y-auto space-y-0.5">
            {filteredFields.length === 0 ? (
              <li className="px-3 py-3 text-center text-xs text-slate-400">
                No matching fields found
              </li>
            ) : (
              filteredFields.map((f) => {
                const isSelected = f === selectedField;
                const count = getRoleCount ? getRoleCount(f) : null;
                return (
                  <li key={f}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectField(f);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[9px] px-3 py-2 text-left text-[13px] transition",
                        isSelected
                          ? "bg-blue-50 font-semibold text-[#0d47a1]"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <span className="truncate">{f}</span>
                      <div className="ml-2 flex items-center gap-1.5 shrink-0">
                        {count !== null && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                              isSelected
                                ? "bg-blue-100 text-[#0d47a1]"
                                : "bg-slate-100 text-slate-500"
                            )}
                          >
                            {count} roles
                          </span>
                        )}
                        {isSelected && (
                          <CheckIcon className="h-3.5 w-3.5 text-[#0d47a1]" />
                        )}
                      </div>
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
