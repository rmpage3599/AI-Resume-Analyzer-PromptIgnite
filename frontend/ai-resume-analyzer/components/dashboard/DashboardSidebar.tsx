"use client";

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
  icon: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "overview",
    label: "Overview & Scores",
    sublabel: "Match & ATS Rubric",
    icon: "📊",
  },
  {
    id: "multi-role",
    label: "Multi-Role Benchmark",
    sublabel: "12-Role Compatibility",
    icon: "🏆",
    badge: "12 Roles",
  },
  {
    id: "improvements",
    label: "AI Improvements",
    sublabel: "STAR Rewrites & Tips",
    icon: "💡",
    badge: "Groq AI",
  },
  {
    id: "skills",
    label: "Skill Gap Analysis",
    sublabel: "Matched vs Missing",
    icon: "🎯",
  },
  {
    id: "experience",
    label: "Experience & Report",
    sublabel: "Timeline & Download",
    icon: "💼",
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
    <aside className="w-full lg:w-72 shrink-0">
      {/* Mobile Horizontal Pill Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex shrink-0 items-center gap-2 rounded-[10px] px-3.5 py-2 text-[13px] font-semibold transition ${
                isActive
                  ? "bg-[#0d47a1] text-white shadow-sm"
                  : "glass text-[#4f667a] hover:text-[#0d2740]"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Vertical Aeroglass Sidebar */}
      <div className="hidden lg:block glass-strong sticky top-20 rounded-[16px] p-3 shadow-sm">
        <div className="border-b border-[rgba(13,71,161,0.08)] px-3 pb-3 pt-2">
          <span className="label-eyebrow">Analysis Navigation</span>
          <p className="mt-1 text-[12.5px] text-[#4f667a]">
            Switch sections without scrolling
          </p>
        </div>

        <nav className="mt-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`group flex w-full items-center justify-between rounded-[12px] px-3.5 py-3 text-left transition ${
                  isActive
                    ? "border border-[rgba(13,71,161,0.18)] bg-white/90 text-[#0d47a1] shadow-sm"
                    : "text-[#4f667a] hover:bg-white/60 hover:text-[#0d2740]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[18px]">{item.icon}</span>
                  <div className="min-w-0">
                    <p className={`text-[13.5px] font-semibold leading-tight ${isActive ? "text-[#0d47a1]" : "text-[#0d2740]"}`}>
                      {item.label}
                    </p>
                    <p className="text-[11.5px] text-[#7890a4] leading-tight mt-0.5">
                      {item.sublabel}
                    </p>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${
                      isActive
                        ? "bg-[#0d47a1]/10 text-[#0d47a1]"
                        : "bg-[rgba(13,71,161,0.06)] text-[#7890a4]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Candidate Mini Card */}
        <div className="mt-4 border-t border-[rgba(13,71,161,0.08)] p-3">
          <div className="rounded-[10px] bg-white/60 p-2.5 border border-[rgba(13,71,161,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7890a4]">
                Candidate
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                {matchScore}% Match
              </span>
            </div>
            <p className="mt-1 font-semibold text-[13px] text-[#0d2740] truncate">
              {candidateName || "Evaluated Candidate"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
