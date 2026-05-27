import { useEffect, useRef, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { useI18n } from "../hooks/useI18n";

interface DropZoneProps {
  onFilesAdded: (paths: string[]) => void;
  hasFiles: boolean;
  disabled: boolean;
}

const VIDEO_EXTENSIONS = [
  ".mp4", ".mov", ".avi", ".mkv", ".mxf", ".m4v", ".mts", ".m2ts",
];

export function DropZone({ onFilesAdded, hasFiles, disabled }: DropZoneProps) {
  const { t } = useI18n();
  const [isDragOver, setIsDragOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const appWindow = getCurrentWebviewWindow();
    const unlistenDrop = appWindow.onDragDropEvent((event) => {
      if (disabled) return;

      if (event.payload.type === "over") {
        setIsDragOver(true);
      } else if (event.payload.type === "drop") {
        setIsDragOver(false);
        const paths = event.payload.paths.filter((p) =>
          VIDEO_EXTENSIONS.some((ext) => p.toLowerCase().endsWith(ext.toLowerCase()))
        );
        if (paths.length > 0) {
          onFilesAdded(paths);
        }
      } else if (event.payload.type === "leave") {
        setIsDragOver(false);
      }
    });

    return () => {
      unlistenDrop.then((u) => u());
    };
  }, [onFilesAdded, disabled]);

  const handleBrowse = async () => {
    if (disabled) return;
    const selected = await openDialog({
      multiple: true,
      filters: [
        {
          name: "Video",
          extensions: ["mp4", "mov", "avi", "mkv", "mxf", "m4v", "mts", "m2ts"],
        },
      ],
    });
    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      onFilesAdded(paths);
    }
  };

  const isCompact = hasFiles;

  return (
    <div
      ref={dropRef}
      onClick={handleBrowse}
      className={`
        relative cursor-pointer overflow-hidden
        rounded-card border border-dashed
        transition-all duration-layout ease-macos
        ${isCompact ? "h-[72px]" : "h-[220px]"}
        ${isDragOver
          ? "border-macblue bg-macblue/[0.08] scale-[1.005] shadow-glow"
          : "border-black/15 dark:border-white/15 bg-white/70 dark:bg-white/[0.04] hover:bg-white/90 dark:hover:bg-white/[0.06]"
        }
        ${disabled ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {isCompact ? (
          <div className="flex items-center gap-3 text-[13px] text-black/55 dark:text-white/55">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
            </svg>
            <span>{t.drop.compact}</span>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-macblue/10 flex items-center justify-center">
              <svg
                className={`w-7 h-7 text-macblue transition-transform duration-layout ease-macos ${isDragOver ? "scale-110" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-[15px] font-medium text-black/85 dark:text-white/90 mb-1">
              {isDragOver ? t.drop.bigDragging : t.drop.big}
            </p>
            <p className="text-[12px] text-black/45 dark:text-white/45">
              {t.drop.bigHint}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
