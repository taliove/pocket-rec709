import { useCallback, useEffect, useReducer } from "react";
import { listen } from "@tauri-apps/api/event";
import {
  checkFfmpeg,
  probeFile,
  extractThumbnail,
  startConversion,
  cancelConversion,
} from "../lib/commands";
import type {
  FileEntry,
  FfmpegInfo,
  ConversionProgress,
  ConversionComplete,
  ConversionError,
  BatchDone,
  Settings,
} from "../lib/types";

interface State {
  files: FileEntry[];
  ffmpeg: FfmpegInfo | null;
  isConverting: boolean;
  settings: Settings;
  batchResult: BatchDone | null;
}

type Action =
  | { type: "SET_FFMPEG"; payload: FfmpegInfo }
  | { type: "ADD_FILES"; payload: FileEntry[] }
  | { type: "SET_THUMB"; payload: { id: string; thumbnail: string } }
  | { type: "REMOVE_FILE"; payload: string }
  | { type: "CLEAR_FILES" }
  | { type: "START_CONVERTING" }
  | { type: "PROGRESS"; payload: ConversionProgress }
  | { type: "COMPLETE"; payload: ConversionComplete }
  | { type: "ERROR"; payload: ConversionError }
  | { type: "BATCH_DONE"; payload: BatchDone }
  | { type: "SET_SETTINGS"; payload: Partial<Settings> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FFMPEG":
      return { ...state, ffmpeg: action.payload };
    case "ADD_FILES":
      return {
        ...state,
        files: [
          ...state.files,
          ...action.payload.filter(
            (f) => !state.files.some((e) => e.path === f.path)
          ),
        ],
      };
    case "SET_THUMB":
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.payload.id ? { ...f, thumbnail: action.payload.thumbnail } : f
        ),
      };
    case "REMOVE_FILE":
      return {
        ...state,
        files: state.files.filter((f) => f.id !== action.payload),
      };
    case "CLEAR_FILES":
      return { ...state, files: [], batchResult: null };
    case "START_CONVERTING":
      return {
        ...state,
        isConverting: true,
        batchResult: null,
        files: state.files.map((f) => ({
          ...f,
          status: "queued" as const,
          progress: 0,
          error: undefined,
        })),
      };
    case "PROGRESS":
      return {
        ...state,
        files: state.files.map((f) =>
          f.path === action.payload.file_path
            ? {
                ...f,
                status: "converting" as const,
                progress: action.payload.percent,
                fps: action.payload.fps,
                speed: action.payload.speed,
              }
            : f
        ),
      };
    case "COMPLETE":
      return {
        ...state,
        files: state.files.map((f) =>
          f.path === action.payload.file_path
            ? {
                ...f,
                status: "done" as const,
                progress: 100,
                outputPath: action.payload.output_path,
              }
            : f
        ),
      };
    case "ERROR":
      return {
        ...state,
        files: state.files.map((f) =>
          f.path === action.payload.file_path
            ? {
                ...f,
                status: "error" as const,
                error: action.payload.error,
              }
            : f
        ),
      };
    case "BATCH_DONE":
      return {
        ...state,
        isConverting: false,
        batchResult: action.payload,
      };
    case "SET_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    default:
      return state;
  }
}

const initialState: State = {
  files: [],
  ffmpeg: null,
  isConverting: false,
  settings: { codec: "h264", crf: 18 },
  batchResult: null,
};

export function useConversion() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    checkFfmpeg().then((info) => dispatch({ type: "SET_FFMPEG", payload: info }));
  }, []);

  useEffect(() => {
    const unlisteners: (() => void)[] = [];

    listen<ConversionProgress>("conversion://progress", (event) => {
      dispatch({ type: "PROGRESS", payload: event.payload });
    }).then((u) => unlisteners.push(u));

    listen<ConversionComplete>("conversion://complete", (event) => {
      dispatch({ type: "COMPLETE", payload: event.payload });
    }).then((u) => unlisteners.push(u));

    listen<ConversionError>("conversion://error", (event) => {
      dispatch({ type: "ERROR", payload: event.payload });
    }).then((u) => unlisteners.push(u));

    listen<BatchDone>("conversion://batch-done", (event) => {
      dispatch({ type: "BATCH_DONE", payload: event.payload });
    }).then((u) => unlisteners.push(u));

    return () => {
      unlisteners.forEach((u) => u());
    };
  }, []);

  const addFiles = useCallback(async (paths: string[]) => {
    const entries: FileEntry[] = [];
    for (const path of paths) {
      try {
        const info = await probeFile(path);
        entries.push({
          id: crypto.randomUUID(),
          path: info.path,
          name: info.name,
          metadata: info.metadata,
          status: "queued",
          progress: 0,
          fps: 0,
          speed: "",
        });
      } catch {
        entries.push({
          id: crypto.randomUUID(),
          path,
          name: path.split(/[/\\]/).pop() || path,
          metadata: {
            duration: 0,
            width: 0,
            height: 0,
            fps: 0,
            codec: "",
            pix_fmt: "",
            bit_depth: 0,
            color_space: "",
            size_bytes: 0,
          },
          status: "queued",
          progress: 0,
          fps: 0,
          speed: "",
        });
      }
    }
    dispatch({ type: "ADD_FILES", payload: entries });

    entries.forEach((entry) => {
      extractThumbnail(entry.path)
        .then((thumb) => {
          dispatch({ type: "SET_THUMB", payload: { id: entry.id, thumbnail: thumb } });
        })
        .catch(() => {});
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    dispatch({ type: "REMOVE_FILE", payload: id });
  }, []);

  const clearFiles = useCallback(() => {
    dispatch({ type: "CLEAR_FILES" });
  }, []);

  const start = useCallback(async () => {
    if (state.files.length === 0) return;
    dispatch({ type: "START_CONVERTING" });
    const paths = state.files.map((f) => f.path);
    await startConversion(paths, state.settings.codec, state.settings.crf);
  }, [state.files, state.settings]);

  const cancel = useCallback(async () => {
    await cancelConversion();
  }, []);

  const updateSettings = useCallback((settings: Partial<Settings>) => {
    dispatch({ type: "SET_SETTINGS", payload: settings });
  }, []);

  return {
    ...state,
    addFiles,
    removeFile,
    clearFiles,
    start,
    cancel,
    updateSettings,
  };
}
