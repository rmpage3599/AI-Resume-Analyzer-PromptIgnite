const STEPS = [
  { n: "01", label: "Upload" },
  { n: "02", label: "Extract" },
  { n: "03", label: "Match" },
  { n: "04", label: "Improve" },
];

export default function PipelineStrip() {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-fg-3">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <span className="mono text-[10.5px] tracking-[0.18em] text-azure/80">
              {s.n}
            </span>
            <span className="text-[11.5px] font-medium uppercase tracking-[0.22em] text-fg-2">
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <span className="hidden h-px w-8 bg-line sm:inline-block" />
          )}
        </div>
      ))}
    </div>
  );
}
