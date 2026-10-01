"use client";

import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@/components/core/Icons";

interface Props {
  improvementsCount?: number;
}

const HIGHLIGHTS = [
  "AI STAR experience rewrites",
  "High-impact action verbs",
  "Tailored executive positioning",
  "A4 print & layout optimization",
];

export default function EnhancementCard({
  improvementsCount,
}: Props) {
  const headline =
    typeof improvementsCount === "number" && improvementsCount > 0
      ? "Upgrade your resume wording & presentation."
      : "Optimize your resume wording & layout.";
  return (
    <article className="glass-strong anim-rise px-6 py-6 sm:px-8 sm:py-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <span className="label-eyebrow">Resume enhancement</span>
          <h2 className="mt-2 text-[19px] font-semibold tracking-[-0.01em] text-[#0d2740]">
            {headline}
          </h2>
          <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-[#4f667a]">
            Apply AI STAR rewrites, strong action verbs, and publication-ready
            formatting to elevate your resume.
          </p>

          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {HIGHLIGHTS.map((h) => (
              <li
                key={h}
                className="flex items-center gap-2 text-[12.5px] text-[#4f667a]"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(13,71,161,0.10)] text-[#0d47a1]">
                  <CheckIcon className="h-2.5 w-2.5" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-stretch gap-2 lg:items-end">
          <Link
            href="/enhance"
            className="btn-primary grad-cta inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-[13px] font-semibold"
          >
            Enhance Resume
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
          <span className="text-[11.5px] text-[#7890a4]">
            STAR rewrites & formatting · Zero fabrication
          </span>
        </div>
      </div>
    </article>
  );
}
