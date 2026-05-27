import type { Codec, Settings as SettingsType } from "../lib/types";
import { useI18n } from "../hooks/useI18n";

interface SettingsProps {
  settings: SettingsType;
  onChange: (settings: Partial<SettingsType>) => void;
  disabled: boolean;
}

const codecs: { value: Codec; label: string }[] = [
  { value: "h264", label: "H.264" },
  { value: "h265", label: "H.265" },
  { value: "prores", label: "ProRes" },
];

export function Settings({ settings, onChange, disabled }: SettingsProps) {
  const { t } = useI18n();
  const showQuality = settings.codec !== "prores";

  return (
    <div className={`flex items-center gap-5 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex items-center gap-1 bg-black/[0.06] dark:bg-white/[0.06] rounded-[9px] p-[2px]">
        {codecs.map((c) => (
          <button
            key={c.value}
            onClick={() => onChange({ codec: c.value })}
            className={`px-3.5 py-[5px] text-[12px] font-medium rounded-[7px] transition-all duration-hover ease-macos ${
              settings.codec === c.value
                ? "bg-white dark:bg-white/[0.18] text-black/85 dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-black/55 dark:text-white/55 hover:text-black/75 dark:hover:text-white/75"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {showQuality ? (
        <div className="flex items-center gap-2.5 min-w-[220px]">
          <span className="text-[11px] text-black/40 dark:text-white/40 select-none">{t.settings.smaller}</span>
          <input
            type="range"
            className="mac-slider flex-1"
            min={14}
            max={28}
            value={settings.crf}
            onChange={(e) => onChange({ crf: parseInt(e.target.value) })}
          />
          <span className="text-[11px] text-black/40 dark:text-white/40 select-none">{t.settings.better}</span>
          <span className="text-[11px] text-black/55 dark:text-white/55 tabular-nums w-12 text-right">
            {t.settings.crf} {settings.crf}
          </span>
        </div>
      ) : (
        <div className="text-[11.5px] text-black/45 dark:text-white/45 min-w-[220px]">
          {t.settings.proresInfo}
        </div>
      )}
    </div>
  );
}
