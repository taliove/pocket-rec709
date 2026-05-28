import { useI18n } from "../hooks/useI18n";

interface ControlsProps {
  onStart: () => void;
  onCancel: () => void;
  onClear: () => void;
  onClearDone: () => void;
  isConverting: boolean;
  hasFiles: boolean;
  pendingCount: number;
  doneCount: number;
}

export function Controls({
  onStart,
  onCancel,
  onClear,
  onClearDone,
  isConverting,
  hasFiles,
  pendingCount,
  doneCount,
}: ControlsProps) {
  const { t } = useI18n();

  const allDone = hasFiles && pendingCount === 0 && doneCount > 0;

  return (
    <div className="flex items-center gap-2">
      {!isConverting && hasFiles && (
        <button
          onClick={doneCount > 0 ? onClearDone : onClear}
          className="h-[32px] px-3.5 rounded-btn text-[12.5px] font-medium text-black/65 dark:text-white/65 bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:scale-[0.98] transition-all duration-hover ease-macos"
        >
          {doneCount > 0 ? t.controls.clearDone : t.controls.clearAll}
        </button>
      )}

      {isConverting ? (
        <button
          onClick={onCancel}
          className="h-[32px] px-5 rounded-btn text-[12.5px] font-semibold text-white bg-danger hover:brightness-110 active:scale-[0.98] transition-all duration-hover ease-macos shadow-soft"
        >
          {t.controls.cancel}
        </button>
      ) : (
        <button
          onClick={onStart}
          disabled={!hasFiles || pendingCount === 0}
          className="h-[32px] px-5 rounded-btn text-[12.5px] font-semibold text-white bg-macblue hover:bg-macblue-hover disabled:bg-black/[0.08] dark:disabled:bg-white/[0.08] disabled:text-black/30 dark:disabled:text-white/30 active:scale-[0.98] transition-all duration-hover ease-macos shadow-soft disabled:shadow-none"
        >
          {allDone ? t.controls.allDone : hasFiles ? t.controls.convertN(pendingCount) : t.controls.convert}
        </button>
      )}
    </div>
  );
}
