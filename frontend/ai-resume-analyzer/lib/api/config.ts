/**
 * Single source of truth for the backend base URL.
 *
 * Set NEXT_PUBLIC_BACKEND_URL in .env.local to point at a different
 * environment (staging, deployed server, etc.) without touching components.
 */
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB — matches backend
export const ACCEPTED_EXTENSIONS = [".pdf", ".docx"] as const;
export const ACCEPTED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
