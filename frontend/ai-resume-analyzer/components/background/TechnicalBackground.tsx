// Deterministic pseudo-random so server + client render identical nodes.
function rnd(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const PARTICLES = Array.from({ length: 9 }, (_, i) => {
  const r1 = rnd(i + 1);
  const r2 = rnd(i + 100);
  const r3 = rnd(i + 200);
  const r4 = rnd(i + 300);
  const r5 = rnd(i + 400);
  const r6 = rnd(i + 500);
  return {
    left: r1 * 100,
    top: r2 * 100,
    size: 1.5 + r3 * 1.2,
    duration: 48 + r4 * 50,
    delay: -r5 * 40,
    peakOpacity: 0.08 + r6 * 0.12,
    dx: (rnd(i + 600) - 0.5) * 70,
    dy: -(30 + rnd(i + 700) * 60),
    twinkle: i % 3 === 0,
  };
});

const FLOW_PATHS = [
  "M-120 470 C 260 360, 460 540, 800 410 S 1280 240, 1620 320",
  "M-120 240 C 300 160, 600 320, 940 200 S 1340 60, 1620 140",
  "M-120 560 C 360 520, 620 620, 1000 520 S 1340 430, 1620 470",
];

export default function TechnicalBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-stage"
    >
      {/* Subtle grid */}
      <div className="absolute inset-0 grid-overlay opacity-60 bg-mask-edges" />

      {/* Curved data-flow lines */}
      <svg
        className="absolute inset-x-0 top-0 h-full w-full"
        viewBox="0 0 1440 700"
        preserveAspectRatio="none"
        aria-hidden
      >
        {FLOW_PATHS.map((d, i) => (
          <g key={i}>
            {/* Faint base curve */}
            <path
              d={d}
              fill="none"
              stroke="rgba(13,71,161,0.06)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            {/* Traveling light pulse */}
            <path
              d={d}
              fill="none"
              stroke="rgba(13,71,161,0.18)"
              strokeWidth="1.2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="120 2200"
              style={{
                animation: `flow-line ${28 + i * 4}s linear infinite`,
                animationDelay: `${-i * 6}s`,
              }}
            />
          </g>
        ))}
      </svg>

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background:
                "radial-gradient(circle, rgba(13,71,161,0.55), rgba(13,71,161,0.15) 60%, transparent)",
              animation: `${p.twinkle ? "twinkle" : "particle-drift"} ${
                p.duration
              }s linear infinite`,
              animationDelay: `${p.delay}s`,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              "--peak": p.peakOpacity,
              opacity: 0,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
