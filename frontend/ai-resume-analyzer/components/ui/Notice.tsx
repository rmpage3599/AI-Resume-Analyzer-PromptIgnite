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
      className={`flex items-start gap-3 rounded-[10px] border border-[rgba(13,71,161,0.20)] bg-[rgba(13,71,161,0.06)] px-3.5 ${
        compact ? "py-2.5" : "py-3"
      }`}
    >
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-white text-[#0d47a1]">
        <AlertIcon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug text-[#0d2740]">{title}</p>
        {detail && (
          <p className="mt-0.5 text-[12px] leading-snug text-[#4f667a]">{detail}</p>
        )}
      </div>
    </div>
  );
}
