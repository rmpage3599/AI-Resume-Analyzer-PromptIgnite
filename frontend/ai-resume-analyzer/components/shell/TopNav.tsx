"use client";

import BrandMark from "@/components/shell/BrandMark";

interface Props {
  active: "analyze" | "dashboard" | "history";
  hasAnalysis: boolean;
  onGoToAnalyze: () => void;
  onGoToDashboard: () => void;
}

export default function TopNav({
  active,
  hasAnalysis,
  onGoToAnalyze,
  onGoToDashboard,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onGoToAnalyze}
          className="flex items-center"
          aria-label="Go to analyze"
        >
          <BrandMark />
        </button>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <NavItem
            label="Analyze"
            active={active === "analyze"}
            onClick={onGoToAnalyze}
          />
          <NavItem
            label="Dashboard"
            active={active === "dashboard"}
            disabled={!hasAnalysis}
            onClick={hasAnalysis ? onGoToDashboard : undefined}
          />
          <NavItem label="History" disabled aria-disabled="true" />
        </nav>

        <button
          type="button"
          onClick={onGoToAnalyze}
          className="btn-primary grad-cta ml-auto hidden rounded-[8px] px-4 py-2 text-[12.5px] font-semibold tracking-[0.04em] md:ml-0 md:inline-flex"
        >
          Analyze Resume
        </button>

        <button
          type="button"
          onClick={onGoToAnalyze}
          aria-label="Analyze resume"
          className="btn-primary grad-cta ml-auto rounded-[8px] px-3.5 py-1.5 text-[12px] font-semibold md:hidden"
        >
          Analyze
        </button>
      </div>
    </header>
  );
}

function NavItem({
  label,
  active,
  disabled,
  onClick,
  ariaDisabled,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  ariaDisabled?: boolean;
  onClick?: () => void;
}) {
  const className = [
    "nav-link",
    active ? "is-active" : "",
    disabled ? "cursor-not-allowed opacity-50" : "",
  ].join(" ");
  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      disabled={disabled}
      aria-disabled={ariaDisabled ?? disabled}
    >
      {label}
    </button>
  );
}

export {};
