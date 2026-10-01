import { ACCEPTED_EXTENSIONS, ACCEPTED_MIME, MAX_FILE_BYTES } from "./api/config";

export type ValidationErrorCode =
  | "missing-file"
  | "unsupported-format"
  | "too-large";

export class ResumeValidationError extends Error {
  code: ValidationErrorCode;
  constructor(code: ValidationErrorCode, message: string) {
    super(message);
    this.name = "ResumeValidationError";
    this.code = code;
  }
}

/**
 * Cheap synchronous validation — runs before we hand the file to the API.
 * The backend remains authoritative; this just gives the user faster
 * feedback for the obvious cases.
 */
export function validateResumeFile(file: File | null): void {
  if (!file) {
    throw new ResumeValidationError(
      "missing-file",
      "Please attach a resume before analyzing.",
    );
  }
  const lowerName = file.name.toLowerCase();
  const okExt = (ACCEPTED_EXTENSIONS as readonly string[]).some((ext) =>
    lowerName.endsWith(ext),
  );
  const okMime = (ACCEPTED_MIME as readonly string[]).includes(file.type);
  if (!okExt && !okMime) {
    throw new ResumeValidationError(
      "unsupported-format",
      "Unsupported file format. Please upload a PDF or DOCX resume.",
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ResumeValidationError(
      "too-large",
      "Your resume exceeds the 5MB limit.",
    );
  }
}

export function acceptedExtensionsLabel(): string {
  return ACCEPTED_EXTENSIONS.map((e) => e.replace(".", "").toUpperCase()).join(
    " or ",
  );
}
