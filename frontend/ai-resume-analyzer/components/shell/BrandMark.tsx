export default function BrandMark({
  size = 30,
  withText = true,
  textClassName,
}: {
  size?: number;
  withText?: boolean;
  textClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        aria-hidden
        className="shrink-0"
      >
        <defs>
          <linearGradient id="bm-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d47a1" />
            <stop offset="100%" stopColor="#1e63b8" />
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="7"
          fill="url(#bm-grad)"
          stroke="rgba(144,202,249,0.45)"
          strokeWidth="1"
        />
        <rect x="7" y="7" width="14" height="1.6" rx="0.8" fill="#e3f2fd" />
        <rect x="7" y="11.5" width="18" height="1.6" rx="0.8" fill="#90caf9" opacity="0.85" />
        <rect x="7" y="16" width="12" height="1.6" rx="0.8" fill="#90caf9" opacity="0.55" />
        <path
          d="m18 22 2.2 2.2L26 18.5"
          stroke="#e3f2fd"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {withText && (
        <span className="flex flex-col leading-none">
          <span
            className={`text-[15px] font-semibold tracking-[0.2em] text-fg ${
              textClassName ?? ""
            }`}
          >
            RESUMIND
          </span>
          <span className="mt-1 font-mono text-[9.5px] tracking-[0.28em] text-fg-3">
            AI RESUME INTELLIGENCE
          </span>
        </span>
      )}
    </div>
  );
}
