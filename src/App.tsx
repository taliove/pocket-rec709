import { useConversion } from "./hooks/useConversion";
import { useI18n } from "./hooks/useI18n";
import { DropZone } from "./components/DropZone";
import { FileList } from "./components/FileList";
import { Settings } from "./components/Settings";
import { Controls } from "./components/Controls";
import { LanguageSwitcher } from "./components/LanguageSwitcher";

function App() {
  const { t } = useI18n();
  const {
    files,
    ffmpeg,
    isConverting,
    settings,
    batchResult,
    addFiles,
    removeFile,
    clearFiles,
    start,
    cancel,
    updateSettings,
  } = useConversion();

  if (ffmpeg && !ffmpeg.available) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-10">
        <div className="max-w-md text-center bg-white dark:bg-white/[0.04] rounded-card p-8 shadow-soft border border-black/5 dark:border-white/10">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-warning/15 flex items-center justify-center">
            <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </div>
          <h1 className="text-[17px] font-semibold mb-1.5">{t.ffmpeg.required}</h1>
          <p className="text-[13px] text-black/55 dark:text-white/55 mb-5 leading-relaxed">
            {t.ffmpeg.description}
          </p>
          <div className="bg-black/[0.04] dark:bg-white/[0.06] rounded-input p-3.5 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-black/40 dark:text-white/40 w-14">{t.ffmpeg.macos}</span>
              <code className="font-mono text-[11.5px]">brew install ffmpeg</code>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-black/40 dark:text-white/40 w-14">{t.ffmpeg.windows}</span>
              <code className="font-mono text-[11.5px]">winget install ffmpeg</code>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-black/40 dark:text-white/40 w-14">{t.ffmpeg.linux}</span>
              <code className="font-mono text-[11.5px]">sudo apt install ffmpeg</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasFiles = files.length > 0;

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Reserve space for native macOS title bar */}
      <div className="h-[36px] shrink-0" />

      <div className="flex-1 min-h-0 flex flex-col px-6 pb-3">
        <DropZone onFilesAdded={addFiles} hasFiles={hasFiles} disabled={isConverting} />

        {hasFiles && (
          <div className="flex-1 min-h-0 mt-4 overflow-y-auto pr-1">
            <FileList
              files={files}
              onRemove={removeFile}
              isConverting={isConverting}
            />
          </div>
        )}

        {!hasFiles && <div className="flex-1" />}

        {batchResult && (
          <div className="mt-3 flex items-center justify-center gap-2 text-[12px] text-black/55 dark:text-white/55">
            <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>
              {t.result.summary(batchResult.succeeded, batchResult.total)}
              {batchResult.failed > 0 && (
                <span className="text-danger ml-1.5">· {t.result.failed(batchResult.failed)}</span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="shrink-0 px-6 pt-4 pb-5 border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex items-center gap-5">
          <Settings settings={settings} onChange={updateSettings} disabled={isConverting} />
          <div className="flex-1" />
          <LanguageSwitcher />
          <Controls
            onStart={start}
            onCancel={cancel}
            onClear={clearFiles}
            isConverting={isConverting}
            hasFiles={hasFiles}
            fileCount={files.length}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
