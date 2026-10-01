"use client";

import { useState } from "react";
import LandingView from "@/components/landing/LandingView";
import ResultsDashboard from "@/components/dashboard/ResultsDashboard";
import TopNav from "@/components/shell/TopNav";
import type { AnalysisResult } from "@/lib/types";

type Stage = "analyze" | "results";

export default function App() {
  const [stage, setStage] = useState<Stage>("analyze");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const onAnalysisComplete = (r: AnalysisResult) => {
    setResult(r);
    setStage("results");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goAnalyze = () => {
    setStage("analyze");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goDashboard = () => {
    if (!result) return;
    setStage("results");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onNewAnalysis = () => {
    setResult(null);
    goAnalyze();
  };

  return (
    <div className="relative z-10 min-h-screen">
      {stage === "analyze" && (
        <>
          <TopNav
            active="analyze"
            hasAnalysis={!!result}
            onGoToAnalyze={goAnalyze}
            onGoToDashboard={goDashboard}
          />
          <main>
            <LandingView onAnalysisComplete={onAnalysisComplete} />
          </main>
        </>
      )}

      {stage === "results" && result && (
        <main>
          <ResultsDashboard result={result} onNewAnalysis={onNewAnalysis} />
        </main>
      )}
    </div>
  );
}
