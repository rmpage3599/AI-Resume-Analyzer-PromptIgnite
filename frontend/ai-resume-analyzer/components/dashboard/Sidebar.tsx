"use client";

import {
  BarChartIcon,
  BriefcaseIcon,
  HomeIcon,
  LayersIcon,
  SettingsIcon,
} from "@/components/core/Icons";
import BrandMark from "@/components/shell/BrandMark";
import { cn } from "@/lib/cn";

export type SidebarKey = "analysis" | "roles" | "skills" | "reports" | "settings";

interface Item {
  key: SidebarKey;
  label: string;
  icon: typeof HomeIcon;
  targetId: string;
  soon?: boolean;
}

const ITEMS: Item[] = [
  {
    key: "analysis",
    label: "Resume Analysis",
    icon: HomeIcon,
    targetId: "section-analysis",
  },
  {
    key: "roles",
    label: "Job Roles",
    icon: BriefcaseIcon,
    targetId: "section-score",
  },
  {
    key: "skills",
    label: "Skills",
    icon: LayersIcon,
    targetId: "section-alignment",
  },
  {
    key: "reports",
    label: "Reports",
    icon: BarChartIcon,
    targetId: "section-assessment",
  },
  {
    key: "settings",
    label: "Settings",
    icon: SettingsIcon,
    targetId: "",
    soon: true,
  },
];

interface Props {
  active: SidebarKey;
  onSelect: (key: SidebarKey) => void;
}

export default function Sidebar({ active, onSelect }: Props) {
  return (
    <aside
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-40 hidden w-[68px] border-r border-line bg-base/85 backdrop-blur-xl xl:w-[240px] lg:flex lg:flex-col"
    >
      <div className="flex h-16 items-center border-b border-line px-4 xl:px-5">
        <span className="xl:hidden mx-auto">
          <BrandMark withText={false} size={28} />
        </span>
        <span className="hidden xl:flex">
          <BrandMark />
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2.5">
        <p className="eyebrow mx-3 mb-2 mt-2 hidden xl:block">Workspace</p>
        <ul className="space-y-0.5">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = !item.soon && active === item.key;
            const disabled = !!item.soon;
            return (
              <li key={item.key} className="relative">
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute -left-2.5 top-1/2 hidden h-5 w-[2px] -translate-y-1/2 rounded-full bg-azure shadow-[0_0_12px_rgba(144,202,249,0.6)] xl:block"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!disabled) onSelect(item.key);
                  }}
                  disabled={disabled}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-[8px] border border-transparent px-2.5 py-2 text-left transition-all duration-200 xl:px-3",
                    isActive
                      ? "bg-navy/30 text-fg shadow-[inset_0_0_0_1px_rgba(144,202,249,0.18)]"
                      : disabled
                        ? "cursor-not-allowed text-fg-3/70"
                        : "text-fg-2 hover:bg-navy/15 hover:text-fg",
                  )}
                  title={item.label}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border transition-colors",
                      isActive
                        ? "border-azure/40 bg-azure/10 text-azure"
                        : "border-line text-fg-2 group-hover:border-azure/20 group-hover:text-azure",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="hidden flex-1 items-center justify-between xl:flex">
                    <span className="text-[13px] font-medium tracking-[0.01em]">
                      {item.label}
                    </span>
                    {disabled && (
                      <span className="mono text-[9.5px] tracking-[0.18em] text-fg-3/80">
                        SOON
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-3 xl:p-4">
        <div className="flex items-center gap-2.5 rounded-[8px] border border-line bg-base/60 px-3 py-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-azure/50 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-azure" />
          </span>
          <span className="mono hidden text-[10.5px] tracking-[0.18em] text-fg-2 xl:inline">
            PHASE 1 · MVP ONLINE
          </span>
          <span className="mono text-[10.5px] tracking-[0.18em] text-fg-2 xl:hidden">
            MVP
          </span>
        </div>
        <p className="mono mt-3 hidden text-[10px] tracking-[0.14em] text-fg-3 xl:block">
          v0.1 · Temporary processing
        </p>
      </div>
    </aside>
  );
}

export type { SidebarKey as SidebarKeyExport };
