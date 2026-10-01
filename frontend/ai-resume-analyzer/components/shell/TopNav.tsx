"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandMark from "@/components/shell/BrandMark";
import { clearResult } from "@/lib/resultStore";

export default function TopNav() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const isResults = pathname.startsWith("/results");

  const onNewAnalysis = () => {
    clearResult();
    window.dispatchEvent(new Event("resumind:result-updated"));
    router.push("/analyze");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex h-16 w-full items-center justify-between px-6 lg:px-8">
        <Link
          href="/analyze"
          className="flex items-center"
          aria-label="Resumind home"
        >
          <BrandMark />
        </Link>

        {isResults && (
          <button
            type="button"
            onClick={onNewAnalysis}
            className="btn-primary grad-cta rounded-[10px] px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            New analysis
          </button>
        )}
      </div>
    </header>
  );
}

