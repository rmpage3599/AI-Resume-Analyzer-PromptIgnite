"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import {
  CheckIcon,
  FilePdfIcon,
  UploadCloudIcon,
  XIcon,
} from "@/components/core/Icons";
import { ErrorNotice } from "@/components/ui/Notice";
import { AnalysisError, validateResumeFile } from "@/lib/analyze";
import { cn } from "@/lib/cn";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const candidate = files[0];
      try {
        await validateResumeFile(candidate);
        onError(null);
        onFileSelected(candidate);
      } catch (err) {
        if (err instanceof AnalysisError) {
          onError(err.message);
        } else {
          onError("Please upload a PDF resume.");
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
        <span className="eyebrow eyebrow-azure">01 · Resume Upload</span>
        {file && (
          <span className="mono text-[10.5px] tracking-[0.16em] text-fg-3">
            STEP COMPLETE
          </span>
        )}
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-[10px] border bg-base/60 transition-all duration-200",
          dragActive
            ? "border-azure/55 bg-navy/15"
            : file
              ? "border-azure/25"
              : "border-line hover:border-azure/25",
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id="resume-file"
          type="file"
          accept="application/pdf,.pdf"
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
          <div className="has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-azure/60 has-[:focus-visible]:ring-offset-0 rounded-[10px] p-7 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <span
                className={cn(
                  "mb-4 flex h-12 w-12 items-center justify-center rounded-[10px] border border-azure/30 bg-navy/20 text-azure transition-all duration-200",
                  dragActive && "scale-[1.05] border-azure/60 bg-azure/15",
                )}
              >
                {dragActive ? (
                  <UploadCloudIcon className="h-6 w-6" />
                ) : (
                  <FilePdfIcon className="h-6 w-6" />
                )}
              </span>
              <p className="text-[15.5px] font-medium text-fg">
                Drop your resume here
              </p>
              <p id="resume-help" className="mt-1.5 text-[12.5px] text-fg-3">
                PDF files only · Maximum 10MB
              </p>
              <label
                htmlFor="resume-file"
                onClick={(e) => e.stopPropagation()}
                className="btn-ghost mt-5 cursor-pointer rounded-[8px] px-4 py-2 text-[13px] font-medium"
              >
                Browse Resume
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
    <div className="flex items-center gap-4 p-4 sm:px-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-azure/35 bg-azure/10 text-azure">
        <CheckIcon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <p className="truncate text-[14px] font-medium text-fg">
            {file.name}
          </p>
          <span className="chip">PDF</span>
        </div>
        <p className="mono mt-1 text-[11px] tracking-[0.12em] text-fg-3">
          {formatSize(file.size)} · READY
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove ${file.name}`}
        className="btn-ghost flex items-center gap-1.5 rounded-[7px] px-2.5 py-1.5 text-[12px]"
      >
        <XIcon className="h-3.5 w-3.5" />
        Remove
      </button>
    </div>
  );
}
