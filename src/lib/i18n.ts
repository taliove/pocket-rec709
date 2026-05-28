// Lightweight i18n store with subscriber pattern.
// Auto-detects user language and supports manual switch with persistence.

export type SupportedLocale = "zh-CN" | "zh-TW" | "en" | "ja" | "ko";
export type LocaleSetting = "auto" | SupportedLocale;

const STORAGE_KEY = "dlog.locale";

export interface Strings {
  app: {
    title: string;
  };
  ffmpeg: {
    required: string;
    description: string;
    macos: string;
    windows: string;
    linux: string;
  };
  drop: {
    big: string;
    bigDragging: string;
    bigHint: string;
    compact: string;
  };
  status: {
    queued: string;
    ready: string;
    converting: string;
    done: string;
    error: string;
    reveal: string;
    remove: string;
  };
  settings: {
    smaller: string;
    better: string;
    crf: string;
    proresInfo: string;
  };
  controls: {
    convert: string;
    convertN: (n: number) => string;
    cancel: string;
    clear: string;
    allDone: string;
    clearDone: string;
    clearAll: string;
  };
  result: {
    summary: (succeeded: number, total: number) => string;
    failed: (n: number) => string;
  };
  language: {
    title: string;
    auto: string;
    en: string;
    "zh-CN": string;
    "zh-TW": string;
    ja: string;
    ko: string;
  };
}

const en: Strings = {
  app: { title: "D-Log Converter" },
  ffmpeg: {
    required: "FFmpeg Required",
    description: "This app needs FFmpeg installed on your system to convert videos.",
    macos: "macOS",
    windows: "Windows",
    linux: "Linux",
  },
  drop: {
    big: "Drop D-Log videos here",
    bigDragging: "Drop to import",
    bigHint: "or click to browse · MP4 · MOV · MKV · MXF",
    compact: "Drop more files or click to browse",
  },
  status: {
    queued: "Queued",
    ready: "Ready",
    converting: "Converting",
    done: "Done",
    error: "Error",
    reveal: "Reveal",
    remove: "Remove",
  },
  settings: {
    smaller: "Smaller",
    better: "Better",
    crf: "CRF",
    proresInfo: "ProRes 422 HQ · 10-bit · Visually lossless",
  },
  controls: {
    convert: "Convert",
    convertN: (n) => `Convert ${n} ${n === 1 ? "file" : "files"}`,
    cancel: "Cancel",
    clear: "Clear",
    allDone: "All Done",
    clearDone: "Clear Completed",
    clearAll: "Clear All",
  },
  result: {
    summary: (s, t) => `${s} of ${t} converted`,
    failed: (n) => `${n} failed`,
  },
  language: {
    title: "Language",
    auto: "System",
    en: "English",
    "zh-CN": "简体中文",
    "zh-TW": "繁體中文",
    ja: "日本語",
    ko: "한국어",
  },
};

const zhCN: Strings = {
  app: { title: "D-Log 转换器" },
  ffmpeg: {
    required: "需要安装 FFmpeg",
    description: "本应用需要系统已安装 FFmpeg 才能进行视频转换。",
    macos: "macOS",
    windows: "Windows",
    linux: "Linux",
  },
  drop: {
    big: "拖入 D-Log 视频文件",
    bigDragging: "松开以导入",
    bigHint: "或点击浏览 · MP4 · MOV · MKV · MXF",
    compact: "拖入更多文件，或点击浏览",
  },
  status: {
    queued: "排队中",
    ready: "就绪",
    converting: "转换中",
    done: "完成",
    error: "失败",
    reveal: "在 Finder 中显示",
    remove: "移除",
  },
  settings: {
    smaller: "更小",
    better: "更佳",
    crf: "CRF",
    proresInfo: "ProRes 422 HQ · 10-bit · 视觉无损",
  },
  controls: {
    convert: "开始转换",
    convertN: (n) => `转换 ${n} 个文件`,
    cancel: "取消",
    clear: "清空",
    allDone: "全部完成",
    clearDone: "清空已完成",
    clearAll: "清空全部",
  },
  result: {
    summary: (s, t) => `${t} 个文件中已完成 ${s} 个`,
    failed: (n) => `${n} 个失败`,
  },
  language: {
    title: "语言",
    auto: "跟随系统",
    en: "English",
    "zh-CN": "简体中文",
    "zh-TW": "繁體中文",
    ja: "日本語",
    ko: "한국어",
  },
};

const zhTW: Strings = {
  app: { title: "D-Log 轉換器" },
  ffmpeg: {
    required: "需要安裝 FFmpeg",
    description: "此應用程式需要系統已安裝 FFmpeg 才能進行視訊轉換。",
    macos: "macOS",
    windows: "Windows",
    linux: "Linux",
  },
  drop: {
    big: "拖入 D-Log 視訊檔案",
    bigDragging: "放開以匯入",
    bigHint: "或點擊瀏覽 · MP4 · MOV · MKV · MXF",
    compact: "拖入更多檔案，或點擊瀏覽",
  },
  status: {
    queued: "佇列中",
    ready: "就緒",
    converting: "轉換中",
    done: "完成",
    error: "失敗",
    reveal: "在 Finder 中顯示",
    remove: "移除",
  },
  settings: {
    smaller: "更小",
    better: "更佳",
    crf: "CRF",
    proresInfo: "ProRes 422 HQ · 10-bit · 視覺無損",
  },
  controls: {
    convert: "開始轉換",
    convertN: (n) => `轉換 ${n} 個檔案`,
    cancel: "取消",
    clear: "清空",
    allDone: "全部完成",
    clearDone: "清空已完成",
    clearAll: "清空全部",
  },
  result: {
    summary: (s, t) => `${t} 個檔案中已完成 ${s} 個`,
    failed: (n) => `${n} 個失敗`,
  },
  language: {
    title: "語言",
    auto: "跟隨系統",
    en: "English",
    "zh-CN": "简体中文",
    "zh-TW": "繁體中文",
    ja: "日本語",
    ko: "한국어",
  },
};

const ja: Strings = {
  app: { title: "D-Log コンバーター" },
  ffmpeg: {
    required: "FFmpeg が必要です",
    description: "このアプリは動画変換に FFmpeg のインストールが必要です。",
    macos: "macOS",
    windows: "Windows",
    linux: "Linux",
  },
  drop: {
    big: "D-Log 動画をドロップ",
    bigDragging: "ドロップしてインポート",
    bigHint: "またはクリックして選択 · MP4 · MOV · MKV · MXF",
    compact: "さらにドロップ、またはクリックして選択",
  },
  status: {
    queued: "待機中",
    ready: "準備完了",
    converting: "変換中",
    done: "完了",
    error: "エラー",
    reveal: "Finder で表示",
    remove: "削除",
  },
  settings: {
    smaller: "小さく",
    better: "高品質",
    crf: "CRF",
    proresInfo: "ProRes 422 HQ · 10-bit · 視覚的に無損失",
  },
  controls: {
    convert: "変換",
    convertN: (n) => `${n} 件を変換`,
    cancel: "キャンセル",
    clear: "クリア",
    allDone: "すべて完了",
    clearDone: "完了をクリア",
    clearAll: "すべてクリア",
  },
  result: {
    summary: (s, t) => `${t} 件中 ${s} 件が完了`,
    failed: (n) => `${n} 件失敗`,
  },
  language: {
    title: "言語",
    auto: "システム",
    en: "English",
    "zh-CN": "简体中文",
    "zh-TW": "繁體中文",
    ja: "日本語",
    ko: "한국어",
  },
};

const ko: Strings = {
  app: { title: "D-Log 변환기" },
  ffmpeg: {
    required: "FFmpeg 설치 필요",
    description: "이 앱은 동영상 변환을 위해 시스템에 FFmpeg가 설치되어 있어야 합니다.",
    macos: "macOS",
    windows: "Windows",
    linux: "Linux",
  },
  drop: {
    big: "D-Log 동영상을 끌어다 놓으세요",
    bigDragging: "놓아서 가져오기",
    bigHint: "또는 클릭하여 찾아보기 · MP4 · MOV · MKV · MXF",
    compact: "더 많은 파일 끌어오기 또는 클릭하여 찾아보기",
  },
  status: {
    queued: "대기 중",
    ready: "준비됨",
    converting: "변환 중",
    done: "완료",
    error: "오류",
    reveal: "Finder에서 보기",
    remove: "제거",
  },
  settings: {
    smaller: "작게",
    better: "고화질",
    crf: "CRF",
    proresInfo: "ProRes 422 HQ · 10-bit · 시각적 무손실",
  },
  controls: {
    convert: "변환",
    convertN: (n) => `${n}개 변환`,
    cancel: "취소",
    clear: "지우기",
    allDone: "모두 완료",
    clearDone: "완료 항목 지우기",
    clearAll: "모두 지우기",
  },
  result: {
    summary: (s, t) => `${t}개 중 ${s}개 완료`,
    failed: (n) => `${n}개 실패`,
  },
  language: {
    title: "언어",
    auto: "시스템",
    en: "English",
    "zh-CN": "简体中文",
    "zh-TW": "繁體中文",
    ja: "日本語",
    ko: "한국어",
  },
};

const dictionaries: Record<SupportedLocale, Strings> = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  ja,
  ko,
};

export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "zh-CN", "zh-TW", "ja", "ko"];

export function detectSystemLocale(): SupportedLocale {
  const lang = (navigator.language || navigator.languages?.[0] || "en").toLowerCase();
  if (lang.startsWith("zh")) {
    if (lang.includes("tw") || lang.includes("hk") || lang.includes("hant")) {
      return "zh-TW";
    }
    return "zh-CN";
  }
  if (lang.startsWith("ja")) return "ja";
  if (lang.startsWith("ko")) return "ko";
  return "en";
}

// --- Reactive store ---

type Listener = () => void;
const listeners = new Set<Listener>();

let currentSetting: LocaleSetting = loadSetting();

function loadSetting(): LocaleSetting {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "auto" || v === "en" || v === "zh-CN" || v === "zh-TW" || v === "ja" || v === "ko") {
      return v;
    }
  } catch {
    // ignore
  }
  return "auto";
}

export function getLocaleSetting(): LocaleSetting {
  return currentSetting;
}

export function getEffectiveLocale(): SupportedLocale {
  return currentSetting === "auto" ? detectSystemLocale() : currentSetting;
}

export function getStrings(): Strings {
  return dictionaries[getEffectiveLocale()];
}

export function setLocale(setting: LocaleSetting): void {
  currentSetting = setting;
  try {
    localStorage.setItem(STORAGE_KEY, setting);
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
