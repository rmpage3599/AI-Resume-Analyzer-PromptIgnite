// Deterministic pseudo-random so server + client render identical nodes.
function rnd(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const PARTICLES = Array.from({ length: 22 }, (_, i) => {
  const r1 = rnd(i + 1);
  const r2 = rnd(i + 100);
  const r3 = rnd(i + 200);
  const r4 = rnd(i + 300);
  const r5 = rnd(i + 400);
  const r6 = rnd(i + 500);
  return {
    left: r1 * 100,
    top: r2 * 100,
    size: 1.5 + r3 * 1.8,
    duration: 32 + r4 * 38,
    delay: -r5 * 40,
    peakOpacity: 0.32 + r6 * 0.35,
    dx: (rnd(i + 600) - 0.5) * 80,
    dy: -(30 + rnd(i + 700) * 60),
    twinkle: i % 5 === 0,
  };
});

const GLOW_POINTS = [
  {
    className:
      "absolute -top-44 left-[14%] h-[460px] w-[680px] rounded-full blur-[120px]",
    style: {
      background:
        "radial-gradient(circle, rgba(13,71,161,0.42), transparent 65%)",
    },
    anim: "anim-glow-a",
  },
  {
    className:
      "absolute top-[28%] right-[-10%] h-[420px] w-[560px] rounded-full blur-[110px]",
    style: {
      background:
        "radial-gradient(circle, rgba(13,71,161,0.28), transparent 70%)",
    },
    anim: "anim-glow-b",
  },
  {
    className:
      "absolute bottom-[-18%] left-[40%] h-[500px] w-[700px] rounded-full blur-[130px]",
    style: {
      background:
        "radial-gradient(circle, rgba(144,202,249,0.10), transparent 70%)",
    },
    anim: "anim-glow-a",
  },
] as const;

const FLOW_PATHS = [
  "M-120 470 C 260 360, 460 540, 800 410 S 1280 240, 1620 320",
  "M-120 240 C 300 160, 600 320, 940 200 S 1340 60, 1620 140",
  "M-120 560 C 360 520, 620 620, 1000 520 S 1340 430, 1620 470",
  "M-120 120 C 360 60, 720 200, 1100 90 S 1380 20, 1620 60",
];

export default function TechnicalBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-stage"
    >
      {/* Subtle grid */}
      <div className="absolute inset-0 grid-overlay opacity-80 bg-mask-edges" />

      {/* Soft drifting radial glows */}
      {GLOW_POINTS.map((g, i) => (
        <div
          key={i}
          className={`${g.className} ${g.anim}`}
          style={{
            ...g.style,
            animation: `${g.anim === "anim-glow-a" ? "glow-drift-a" : "glow-drift-b"} ${
              26 + i * 4
            }s ease-in-out infinite`,
          }}
        />
      ))}

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
              stroke="rgba(144,202,249,0.06)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            {/* Traveling light pulse */}
            <path
              d={d}
              fill="none"
              stroke="rgba(144,202,249,0.55)"
              strokeWidth="1.4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="160 2400"
              style={{
                animation: `flow-line ${24 + i * 5}s linear infinite`,
                animationDelay: `${-i * 4}s`,
                filter: "drop-shadow(0 0 4px rgba(144,202,249,0.55))",
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
                "radial-gradient(circle, rgba(227,242,253,0.95), rgba(144,202,249,0.4) 60%, transparent)",
              boxShadow: "0 0 6px rgba(144,202,249,0.45)",
              animation: `${p.twinkle ? "twinkle" : "particle-float"} ${
                p.duration
              }s linear infinite`,
              animationDelay: `${p.delay}s`,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              opacity: 0,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Bottom vignette to anchor content */}
      <div
        className="absolute inset-x-0 bottom-0 h-64"
        style={{
          background:
            "linear-gradient(to top, #050a12 0%, rgba(5,10,18,0) 100%)",
        }}
      />
    </div>
  );
}
