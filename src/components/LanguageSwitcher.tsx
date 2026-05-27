import { useEffect, useRef, useState } from "react";
import { useI18n } from "../hooks/useI18n";
import type { LocaleSetting } from "../lib/i18n";

const ORDER: LocaleSetting[] = ["auto", "en", "zh-CN", "zh-TW", "ja", "ko"];

export function LanguageSwitcher() {
  const { t, locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const labels: Record<LocaleSetting, string> = {
    auto: t.language.auto,
    en: t.language.en,
    "zh-CN": t.language["zh-CN"],
    "zh-TW": t.language["zh-TW"],
    ja: t.language.ja,
    ko: t.language.ko,
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title={t.language.title}
        className="h-[32px] w-[32px] flex items-center justify-center rounded-btn text-black/55 dark:text-white/55 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-[0.96] transition-all duration-hover ease-macos"
      >
        <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 bottom-[calc(100%+6px)] min-w-[160px] rounded-card border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#2c2c2e] shadow-soft py-1 z-50 item-appear"
        >
          <div className="px-3 pt-1.5 pb-1 text-[10.5px] font-medium uppercase tracking-wider text-black/35 dark:text-white/35">
            {t.language.title}
          </div>
          {ORDER.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setLocale(opt);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] text-black/80 dark:text-white/85 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors duration-hover"
            >
              <span>{labels[opt]}</span>
              {locale === opt && (
                <svg className="w-3.5 h-3.5 text-macblue ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
