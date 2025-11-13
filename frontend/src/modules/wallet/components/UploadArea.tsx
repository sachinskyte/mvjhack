import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CloudUpload, FolderOpen } from "lucide-react";

type UploadAreaProps = {
  onFilesSelected: (files: FileList | File[]) => void;
  disabled?: boolean;
};

export const UploadArea = ({ onFilesSelected, disabled }: UploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      if (!files || disabled) return;
      onFilesSelected(files);
      setIsDragging(false);
    },
    [onFilesSelected, disabled]
  );

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(event.target.files ?? []);
      event.target.value = "";
    },
    [handleFiles]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }, [disabled]);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-muted-foreground/30 bg-muted/30 px-6 py-10 text-center transition-colors",
        isDragging && "border-primary/60 bg-primary/5",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-primary/30 bg-primary/10 text-primary transition-colors group-hover:border-primary/50 group-hover:text-primary/80">
        <CloudUpload className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          Drop verifiable credential bundles, DID docs, or secure notes.
        </p>
        <p className="text-xs text-muted-foreground">
          Pandora&apos;s Vault will encrypt locally, derive a mock CID, and stage for replication.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <FolderOpen className="h-4 w-4" />
          Browse files
        </Button>
        <span className="text-xs text-muted-foreground">or drag &amp; drop</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        onChange={onInputChange}
        accept=".json,.jsonld,.zip,.txt,.pdf"
        disabled={disabled}
      />
    </div>
  );
};

