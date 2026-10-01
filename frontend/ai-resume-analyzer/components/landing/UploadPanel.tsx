"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import {
  CheckIcon,
  FileTextIcon,
  UploadCloudIcon,
  XIcon,
} from "@/components/core/Icons";
import { ErrorNotice } from "@/components/ui/Notice";
import {
  ResumeValidationError,
  acceptedExtensionsLabel,
  validateResumeFile,
} from "@/lib/validation";
import { formatSize } from "@/lib/types";
import { ACCEPTED_EXTENSIONS } from "@/lib/api/config";
import { cn } from "@/lib/cn";

function fileExtLabel(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "FILE";
  return name.slice(dot + 1).toUpperCase();
}

export interface UploadPanelProps {
  file: File | null;
  error: string | null;
  onFileSelected: (file: File) => void;
  onError: (message: string | null) => void;
  onClear: () => void;
}

export default function UploadPanel({
  file,
  error,
  onFileSelected,
  onError,
  onClear,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const candidate = files[0];
      try {
        validateResumeFile(candidate);
        onError(null);
        onFileSelected(candidate);
      } catch (err) {
        if (err instanceof ResumeValidationError) {
          onError(err.message);
        } else {
          onError("Please upload a valid resume.");
        }
      }
    },
    [onError, onFileSelected],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="label-eyebrow">Resume</span>
        {file && (
          <span className="text-[11px] font-medium text-[#7890a4]">
            Ready
          </span>
        )}
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-[14px] border bg-white/55 backdrop-blur-md transition-all",
          dragActive
            ? "border-[#0d47a1]/60 bg-[rgba(13,71,161,0.06)]"
            : file
              ? "border-[#90caf9]/55"
              : "border-[rgba(13,71,161,0.14)] hover:border-[#90caf9]/55",
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id="resume-file"
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(",")}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          aria-describedby="resume-help"
          aria-invalid={error ? "true" : "false"}
        />

        {file ? (
          <SelectedFileRow
            file={file}
            onClear={() => {
              onClear();
              if (inputRef.current) inputRef.current.value = "";
            }}
          />
        ) : (
          <div className="has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#0d47a1]/40 has-[:focus-visible]:ring-offset-0 rounded-[14px] px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col items-center text-center">
              <span
                className={cn(
                  "mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[rgba(13,71,161,0.08)] text-[#0d47a1] transition-transform",
                  dragActive && "scale-[1.05] bg-[rgba(13,71,161,0.14)]",
                )}
              >
                {dragActive ? (
                  <UploadCloudIcon className="h-6 w-6" />
                ) : (
                  <FileTextIcon className="h-6 w-6" />
                )}
              </span>
              <p className="text-[15.5px] font-medium text-[#0d2740]">
                Upload your resume
              </p>
              <p
                id="resume-help"
                className="mt-1 text-[12.5px] text-[#7890a4]"
              >
                {acceptedExtensionsLabel()} only · Maximum 5MB
              </p>
              <label
                htmlFor="resume-file"
                onClick={(e) => e.stopPropagation()}
                className="mt-5 cursor-pointer rounded-[10px] border border-[rgba(13,71,161,0.25)] bg-white/80 px-4 py-2 text-[13px] font-medium text-[#0d47a1] transition hover:bg-white hover:border-[rgba(13,71,161,0.45)]"
              >
                Choose PDF
              </label>
            </div>
          </div>
        )}
      </div>

      {error && <ErrorNotice title={error} />}
    </div>
  );
}

function SelectedFileRow({
  file,
  onClear,
}: {
  file: File;
  onClear: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 px-4 py-3.5 sm:px-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(13,71,161,0.08)] text-[#0d47a1]">
        <CheckIcon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 truncate text-[14px] font-medium text-[#0d2740]">
            {file.name}
          </p>
          <span className="chip chip-navy shrink-0">{fileExtLabel(file.name)}</span>
        </div>
        <p className="mt-0.5 text-[12px] text-[#7890a4]">
          {formatSize(file.size)}
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove ${file.name}`}
        className="btn-ghost flex shrink-0 items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12px]"
      >
        <XIcon className="h-3.5 w-3.5" />
        Remove
      </button>
    </div>
  );
}
