"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandMark from "@/components/shell/BrandMark";
import { cn } from "@/lib/cn";
import { hasResult } from "@/lib/resultStore";

export default function TopNav() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const isAnalyze = pathname === "/" || pathname.startsWith("/analyze");
  const isResults = pathname.startsWith("/results");
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setHasAnalysis(hasResult());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("resumind:result-updated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("resumind:result-updated", update);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const onNewAnalysis = () => {
    setMobileOpen(false);
    router.push("/analyze");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(13,71,161,0.10)] bg-[rgba(247,251,255,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/analyze"
          className="flex items-center"
          aria-label="Resumind home"
        >
          <BrandMark />
        </Link>

        <nav className="ml-auto hidden items-center gap-1.5 md:flex">
          <NavLink href="/analyze" active={isAnalyze}>
            Analyze
          </NavLink>
          <NavLink
            href={hasAnalysis ? "/results" : "#"}
            active={isResults}
            disabled={!hasAnalysis}
            aria-disabled={!hasAnalysis}
          >
            Results
          </NavLink>
        </nav>

        <Link
          href="/analyze"
          className="btn-primary grad-cta ml-auto hidden rounded-[10px] px-4 py-2 text-[13px] font-semibold md:ml-0 md:inline-flex"
        >
          {isResults ? "New analysis" : "Analyze Resume"}
        </Link>

        <div ref={menuRef} className="relative md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="btn-secondary flex h-9 w-9 items-center justify-center rounded-[10px]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6 6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>

          {mobileOpen && (
            <div className="glass-strong absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-[14px] p-1.5">
              <MenuItem href="/analyze" active={isAnalyze} onSelect={() => setMobileOpen(false)}>
                Analyze
              </MenuItem>
              <MenuItem
                href={hasAnalysis ? "/results" : "#"}
                active={isResults}
                disabled={!hasAnalysis}
                onSelect={() => setMobileOpen(false)}
              >
                Results
              </MenuItem>
              <div className="my-1 border-t border-[rgba(13,71,161,0.08)]" />
              <button
                type="button"
                onClick={onNewAnalysis}
                className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(90deg,#0d47a1,#90caf9)] px-3 py-2.5 text-[13px] font-semibold text-white"
              >
                {isResults ? "New analysis" : "Analyze Resume"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  disabled,
  children,
  ...rest
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (disabled) {
    return (
      <span
        aria-disabled
        className={cn(
          "nav-link",
          "cursor-not-allowed opacity-50",
          active && "is-active",
        )}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn("nav-link", active && "is-active")}
      {...rest}
    >
      {children}
    </Link>
  );
}

function MenuItem({
  href,
  active,
  disabled,
  children,
  onSelect,
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onSelect?: () => void;
}) {
  const className = cn(
    "flex w-full items-center rounded-[10px] px-3 py-2.5 text-[14px] font-medium transition",
    active
      ? "bg-[rgba(13,71,161,0.10)] text-[#0d47a1]"
      : disabled
        ? "cursor-not-allowed text-[#7890a4]"
        : "text-[#0d2740] hover:bg-[rgba(13,71,161,0.06)]",
  );
  if (disabled) {
    return (
      <span aria-disabled className={className}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} onClick={onSelect} className={className}>
      {children}
    </Link>
  );
}
