"use client";

import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/ui";
import { errorMessage } from "./ui";
import { thumb, useCloudinaryUpload, type Folder, type Uploaded } from "./upload";

/** Drag-and-drop target that hands the chosen files to `onFiles`. */
export function Dropzone({
  onFiles,
  accept = "image/*",
  multiple,
  busy,
  children,
  className,
}: {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  busy?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!busy && e.dataTransfer.files.length) onFiles(Array.from(e.dataTransfer.files));
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-6 py-8 text-center transition-colors",
        over ? "border-cord bg-cord-soft" : "border-cord-line",
        className,
      )}
    >
      {busy ? <Loader2 className="size-6 animate-spin text-cord" aria-hidden="true" /> : <Upload className="size-6 text-cord" aria-hidden="true" />}
      <div className="text-[0.92rem] text-ink-muted">{children ?? "Drag files here, or"}</div>
      <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
        Browse files
      </Button>
      <input
        ref={input}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          if (e.target.files?.length) onFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}

/**
 * A single image stored on Cloudinary. `value` is the delivery URL saved in
 * Convex. When `alt` handlers are given, alt text is shown and required.
 */
export function ImageField({
  folder,
  value,
  onChange,
  alt,
  onAltChange,
  aspect = "aspect-[16/9]",
}: {
  folder: Folder;
  value?: string;
  onChange: (url: string | undefined, upload?: Uploaded) => void;
  alt?: string;
  onAltChange?: (alt: string) => void;
  aspect?: string;
}) {
  const upload = useCloudinaryUpload(folder);
  const [progress, setProgress] = useState<number | null>(null);
  const altId = useId();

  async function handle(files: File[]) {
    setProgress(0);
    try {
      const res = await upload(files[0], { onProgress: setProgress });
      onChange(res.url, res);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className={cn("group relative overflow-hidden rounded-card border border-cord-line bg-cord-soft", aspect)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb(value, 900)} alt={alt ?? ""} className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3">
            <ReplaceButton onFile={(f) => handle([f])} busy={progress !== null} />
            <Button type="button" size="sm" variant="secondary" onClick={() => onChange(undefined)}>
              <Trash2 aria-hidden="true" />
              Remove
            </Button>
          </div>
          {progress !== null && <Progress value={progress} />}
        </div>
      ) : (
        <Dropzone onFiles={handle} busy={progress !== null} className={aspect}>
          {progress !== null ? (
            `Uploading… ${progress}%`
          ) : (
            <span className="inline-flex items-center gap-2">
              <ImagePlus className="size-4" aria-hidden="true" /> Drop an image (max 10 MB)
            </span>
          )}
        </Dropzone>
      )}
      {onAltChange && value && (
        <div>
          <label htmlFor={altId} className="mb-1.5 block text-[0.88rem] font-bold">
            Alt text <span className="text-danger">*</span>
          </label>
          <Input
            id={altId}
            value={alt ?? ""}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder="Describe the image for people using screen readers"
            aria-invalid={!alt?.trim()}
          />
        </div>
      )}
    </div>
  );
}

function ReplaceButton({ onFile, busy }: { onFile: (f: File) => void; busy: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
        <Upload aria-hidden="true" />
        Replace
      </Button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="absolute inset-x-0 top-0 h-1 bg-black/20" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full bg-brass transition-[width]" style={{ width: `${value}%` }} />
    </div>
  );
}
