"use client";

import { useCallback, useId, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/cn";

type MediaDropzoneProps = {
  onFiles: (files: File[]) => void | Promise<void>;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  uploading?: boolean;
  progress?: number;
  compact?: boolean;
  className?: string;
  label?: string;
  hint?: string;
};

export function MediaDropzone({
  onFiles,
  accept = "image/*,video/*,application/pdf,.webp",
  multiple = true,
  disabled,
  uploading,
  progress = 0,
  compact,
  className,
  label = "Drag & drop files here",
  hint = "or click to browse from your computer",
}: MediaDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const busy = Boolean(disabled || uploading);

  const takeFiles = useCallback(
    (list: FileList | File[] | null) => {
      if (!list || busy) return;
      const files = Array.from(list).filter(Boolean);
      if (!files.length) return;
      void onFiles(files);
    },
    [busy, onFiles],
  );

  return (
    <div
      role="button"
      tabIndex={busy ? -1 : 0}
      aria-disabled={busy}
      aria-label={label}
      onKeyDown={(e) => {
        if (busy) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onClick={() => {
        if (!busy) inputRef.current?.click();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!busy) setDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!busy) setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        takeFiles(e.dataTransfer.files);
      }}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition",
        compact ? "gap-2 px-4 py-6" : "gap-3 px-6 py-10 sm:py-12",
        dragOver
          ? "border-synergy bg-synergy-muted/60 shadow-soft"
          : "border-border bg-surface-muted/50 hover:border-synergy/50 hover:bg-synergy-muted/30",
        busy && "pointer-events-none opacity-70",
        className,
      )}
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={busy}
        onChange={(e) => {
          takeFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-synergy/10 text-synergy",
          compact ? "h-10 w-10" : "h-14 w-14",
        )}
        aria-hidden
      >
        {uploading ? (
          <Loader2 className={cn("animate-spin", compact ? "h-5 w-5" : "h-7 w-7")} />
        ) : (
          <ImagePlus className={compact ? "h-5 w-5" : "h-7 w-7"} />
        )}
      </span>

      <div>
        <p className={cn("font-semibold text-ink", compact ? "text-sm" : "text-base")}>
          {uploading ? `Uploading… ${progress}%` : label}
        </p>
        <p className={cn("mt-1 text-ink-muted", compact ? "text-xs" : "text-sm")}>{hint}</p>
      </div>

      {!uploading ? (
        <span className="inline-flex items-center gap-2 rounded-lg bg-synergy px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
          <Upload className="h-3.5 w-3.5" />
          Browse files
        </span>
      ) : (
        <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-synergy transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
