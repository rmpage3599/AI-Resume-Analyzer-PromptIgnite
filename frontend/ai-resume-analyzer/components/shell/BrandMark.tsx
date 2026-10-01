export default function BrandMark({
  size = 30,
  withText = true,
  textClassName,
  monochrome = false,
}: {
  size?: number;
  withText?: boolean;
  textClassName?: string;
  monochrome?: boolean;
}) {
  const bgFill = monochrome ? "#0d47a1" : "url(#bm-grad)";
  return (
    <div className="flex items-center gap-2.5">
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
            <stop offset="100%" stopColor="#5b9cdd" />
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="8"
          fill={bgFill}
          stroke="rgba(13,71,161,0.18)"
          strokeWidth="1"
        />
        <rect x="7" y="7" width="14" height="1.6" rx="0.8" fill="#e3f2fd" />
        <rect x="7" y="11.5" width="18" height="1.6" rx="0.8" fill="#90caf9" opacity="0.85" />
        <rect x="7" y="16" width="12" height="1.6" rx="0.8" fill="#90caf9" opacity="0.55" />
        <path
          d="m18 22 2.2 2.2L26 18.5"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {withText && (
        <span className="flex flex-col leading-none">
          <span
            className={`text-[15px] font-semibold tracking-[0.2em] text-[#0d2740] ${
              textClassName ?? ""
            }`}
          >
            RESUMIND
          </span>
          <span className="mt-1 text-[9.5px] font-medium tracking-[0.22em] text-[#7890a4]">
            AI RESUME INTELLIGENCE
          </span>
        </span>
      )}
    </div>
  );
}
