import { AlertIcon } from "@/components/core/Icons";

export function ErrorNotice({
  title,
  detail,
  compact,
}: {
  title: string;
  detail?: string;
  compact?: boolean;
}) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-[8px] border border-azure/25 bg-navy/15 px-3.5 ${
        compact ? "py-2.5" : "py-3"
      }`}
    >
      <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-[5px] border border-azure/30 bg-azure/10 text-azure">
        <AlertIcon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug text-fg">{title}</p>
        {detail && (
          <p className="mt-0.5 text-[12px] leading-snug text-fg-2">{detail}</p>
        )}
      </div>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  trailing,
  id,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 flex items-center gap-2.5">
            <span className="h-px w-6 bg-azure/40" />
            <span className="eyebrow eyebrow-azure">{eyebrow}</span>
          </div>
        )}
        <h2 className="text-[16px] font-semibold tracking-[0.04em] text-fg">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-[13px] leading-relaxed text-fg-2">
            {subtitle}
          </p>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}
