"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/shell/TopNav";
import EnhancePage from "@/components/enhance/EnhancePage";
import { loadResult } from "@/lib/resultStore";
import type { AnalysisResult } from "@/lib/types";

export default function EnhanceRoute() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisResult | null | undefined>(
    undefined,
  );

  useEffect(() => {
    const stored = loadResult();
    if (!stored) {
      setAnalysis(null);
      return;
    }
    setAnalysis(stored);
  }, []);

  if (analysis === undefined) {
    return (
      <>
        <TopNav />
        <main className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-center text-[#7890a4]">Loading…</p>
        </main>
      </>
    );
  }

  if (analysis === null) {
    if (typeof window !== "undefined") router.replace("/analyze");
    return (
      <>
        <TopNav />
        <main className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md rounded-[14px] border border-[rgba(13,71,161,0.14)] bg-white/55 px-6 py-6 text-center backdrop-blur-md">
            <p className="text-[14px] text-[#0d2740]">
              Analyze your resume first to use Resume Enhancement.
            </p>
            <button
              type="button"
              onClick={() => router.replace("/analyze")}
              className="btn-primary grad-cta mt-4 rounded-[10px] px-4 py-2 text-[13px] font-semibold"
            >
              Go to Analyze
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopNav />
      <main className="relative z-10 mx-auto w-full max-w-[1280px] px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <EnhancePage analysis={analysis} />
      </main>
    </>
  );
}
