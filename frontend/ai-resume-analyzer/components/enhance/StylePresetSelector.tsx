"use client";

import {
  STYLE_OPTIONS,
  type EnhanceStyle,
} from "@/lib/enhancementStore";

interface Props {
  value: EnhanceStyle;
  onChange: (style: EnhanceStyle) => void;
}

export default function StylePresetSelector({ value, onChange }: Props) {
  return (
    <fieldset className="glass px-6 py-6">
      <legend className="label-eyebrow px-1">Resume style</legend>
      <p className="mt-1.5 text-[12.5px] text-[#4f667a]">
        Choose a presentation preset. Content stays the same.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3" role="radiogroup">
        {STYLE_OPTIONS.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={
                active
                  ? "group flex min-w-0 flex-col items-start gap-1.5 rounded-[12px] border-2 border-[#0d47a1] bg-[rgba(13,71,161,0.06)] px-4 py-3.5 text-left transition"
                  : "group flex min-w-0 flex-col items-start gap-1.5 rounded-[12px] border border-[rgba(13,71,161,0.14)] bg-white/55 px-4 py-3.5 text-left transition hover:border-[#90caf9]/55 hover:bg-white/80"
              }
            >
              <span className="flex w-full items-center justify-between">
                <span className="text-[14px] font-semibold text-[#0d2740]">
                  {opt.label}
                </span>
                <span
                  aria-hidden
                  className={
                    active
                      ? "h-3 w-3 rounded-full border-[3px] border-[#0d47a1] bg-white"
                      : "h-3 w-3 rounded-full border-[2px] border-[rgba(13,71,161,0.30)] bg-white"
                  }
                />
              </span>
              <span className="text-[12px] leading-relaxed text-[#4f667a]">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
