import type { FileEntry } from "../lib/types";
import { openInFinder } from "../lib/commands";
import { useI18n } from "../hooks/useI18n";

interface FileItemProps {
  file: FileEntry;
  onRemove: () => void;
  isConverting: boolean;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "--:--";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[i]}`;
}

function formatFps(fps: number): string {
  if (fps <= 0) return "";
  if (Math.abs(fps - Math.round(fps)) < 0.01) return `${Math.round(fps)}fps`;
  return `${fps.toFixed(2).replace(/\.?0+$/, "")}fps`;
}

function formatResolution(w: number, h: number): string {
  if (!w || !h) return "";
  if (h >= 2160) return "4K";
  if (h >= 1080) return "1080p";
  if (h >= 720) return "720p";
  return `${w}×${h}`;
}

export function FileItem({ file, onRemove, isConverting }: FileItemProps) {
  const { t } = useI18n();
  const meta = file.metadata;
  const resolution = formatResolution(meta.width, meta.height);
  const fps = formatFps(meta.fps);
  const isDLog = meta.bit_depth >= 10;

  return (
    <div className="group item-appear h-[72px] flex items-center gap-3 px-3 py-2 rounded-input transition-colors duration-hover ease-macos hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
      <div className="relative shrink-0 w-[112px] h-[63px] rounded-[10px] overflow-hidden bg-black/10 dark:bg-white/10">
        {file.thumbnail ? (
          <img src={file.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-6 h-6 text-black/25 dark:text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {file.status === "converting" && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
            <ProgressRing percent={file.progress} />
          </div>
        )}
        {file.status === "done" && (
          <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center shadow-soft">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
        {file.status === "error" && (
          <div className="absolute inset-0 bg-danger/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-danger flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-black/85 dark:text-white/90 truncate" title={file.path}>
          {file.name}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-black/45 dark:text-white/45">
          {resolution && <span className="font-medium">{resolution}</span>}
          {fps && (
            <>
              {resolution && <Dot />}
              <span>{fps}</span>
            </>
          )}
          {isDLog && (
            <>
              <Dot />
              <span className="font-medium text-macblue/85">D-Log {meta.bit_depth}-bit</span>
            </>
          )}
          {meta.duration > 0 && (
            <>
              <Dot />
              <span>{formatDuration(meta.duration)}</span>
            </>
          )}
          {meta.size_bytes > 0 && (
            <>
              <Dot />
              <span>{formatBytes(meta.size_bytes)}</span>
            </>
          )}
        </div>

        {file.status === "converting" && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-[3px] bg-black/[0.08] dark:bg-white/[0.1] rounded-full overflow-hidden">
              <div
                className="h-full bg-macblue rounded-full transition-all duration-300 ease-macos"
                style={{ width: `${file.progress}%` }}
              />
            </div>
            {file.fps > 0 && (
              <span className="text-[10.5px] text-black/45 dark:text-white/45 tabular-nums">
                {Math.round(file.fps)}fps · {file.speed}
              </span>
            )}
          </div>
        )}
        {file.status === "error" && file.error && (
          <div className="mt-0.5 text-[11px] text-danger truncate" title={file.error}>
            {file.error}
          </div>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-1">
        {file.status === "queued" && !isConverting && (
          <span className="text-[11px] text-black/35 dark:text-white/35 mr-2">{t.status.ready}</span>
        )}
        {file.status === "queued" && isConverting && (
          <span className="text-[11px] text-black/35 dark:text-white/35 mr-2">{t.status.queued}</span>
        )}
        {file.status === "converting" && (
          <span className="text-[11.5px] font-medium text-macblue tabular-nums mr-2">
            {Math.round(file.progress)}%
          </span>
        )}

        {file.status === "done" && file.outputPath && (
          <button
            onClick={() => openInFinder(file.outputPath!)}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-hover px-2 py-1 rounded-md text-[11px] text-black/55 dark:text-white/55 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
            title={t.status.reveal}
          >
            {t.status.reveal}
          </button>
        )}

        {!isConverting && (
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-hover w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
            title={t.status.remove}
          >
            <svg className="w-3.5 h-3.5 text-black/45 dark:text-white/45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function Dot() {
  return <span className="text-black/25 dark:text-white/25">·</span>;
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 300ms cubic-bezier(0.25,0.1,0.25,1)" }}
      />
    </svg>
  );
}
