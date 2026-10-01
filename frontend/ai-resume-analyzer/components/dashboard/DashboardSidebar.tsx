"use client";

import type { ComponentType } from "react";
import {
  BarChartIcon,
  TrophyIcon,
  SparkIcon,
  TargetIcon,
  BriefcaseIcon,
} from "@/components/core/Icons";

export type DashboardTab =
  | "overview"
  | "multi-role"
  | "improvements"
  | "skills"
  | "experience";

interface NavItem {
  id: DashboardTab;
  label: string;
  sublabel: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "overview",
    label: "Overview & Scores",
    sublabel: "Match & ATS Rubric",
    icon: BarChartIcon,
  },
  {
    id: "multi-role",
    label: "Multi-Role Benchmark",
    sublabel: "12-Role Compatibility",
    icon: TrophyIcon,
    badge: "12 Roles",
  },
  {
    id: "improvements",
    label: "AI Improvements",
    sublabel: "STAR Rewrites & Tips",
    icon: SparkIcon,
    badge: "Groq AI",
  },
  {
    id: "skills",
    label: "Skill Gap Analysis",
    sublabel: "Matched vs Missing",
    icon: TargetIcon,
  },
  {
    id: "experience",
    label: "Experience & Report",
    sublabel: "Timeline & Download",
    icon: BriefcaseIcon,
  },
];

interface Props {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  candidateName?: string;
  matchScore: number;
}

export default function DashboardSidebar({
  activeTab,
  onTabChange,
  candidateName,
  matchScore,
}: Props) {
  return (
    <>
      {/* Mobile Horizontal Tab Navigation (< lg) */}
      <div className="lg:hidden w-full bg-white border-b border-slate-200 px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-[#0d47a1] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Hard White Sidebar (lg+) */}
      <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] sticky top-16 flex-col justify-between p-4 z-20">
        <div>
          <div className="px-3 pb-3 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Analysis Navigation
            </span>
            <p className="mt-0.5 text-xs text-slate-500">
              Switch sections without scrolling
            </p>
          </div>

          <nav className="mt-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left transition-all ${
                    isActive
                      ? "bg-blue-50/80 text-[#0d47a1] font-semibold border border-blue-200/60 shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? "bg-white text-[#0d47a1] shadow-xs"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/70 group-hover:text-slate-800"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-[13px] leading-tight ${
                          isActive
                            ? "font-semibold text-[#0d47a1]"
                            : "font-medium text-slate-800"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">
                        {item.sublabel}
                      </p>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Candidate Bottom Card */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Candidate
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                {matchScore}% Match
              </span>
            </div>
            <p className="mt-1 font-semibold text-[13px] text-slate-800 truncate">
              {candidateName || "Evaluated Candidate"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
