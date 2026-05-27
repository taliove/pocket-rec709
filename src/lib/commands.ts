import { invoke } from "@tauri-apps/api/core";
import type { FfmpegInfo, FileInfo } from "./types";

export async function checkFfmpeg(): Promise<FfmpegInfo> {
  return invoke<FfmpegInfo>("check_ffmpeg");
}

export async function probeFile(path: string): Promise<FileInfo> {
  return invoke<FileInfo>("probe_file", { path });
}

export async function extractThumbnail(path: string): Promise<string> {
  return invoke<string>("extract_thumbnail", { path });
}

export async function startConversion(
  files: string[],
  codec: string,
  crf: number
): Promise<void> {
  return invoke("start_conversion", { files, codec, crf });
}

export async function cancelConversion(): Promise<void> {
  return invoke("cancel_conversion");
}

export async function openInFinder(path: string): Promise<void> {
  return invoke("open_in_finder", { path });
}
