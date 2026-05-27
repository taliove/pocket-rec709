export interface FfmpegInfo {
  available: boolean;
  version: string;
  path: string;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  pix_fmt: string;
  bit_depth: number;
  color_space: string;
  size_bytes: number;
}

export interface FileInfo {
  path: string;
  name: string;
  metadata: VideoMetadata;
}

export interface FileEntry {
  id: string;
  path: string;
  name: string;
  metadata: VideoMetadata;
  thumbnail?: string;
  status: "queued" | "converting" | "done" | "error";
  progress: number;
  fps: number;
  speed: string;
  error?: string;
  outputPath?: string;
}

export interface ConversionProgress {
  job_id: string;
  file_path: string;
  percent: number;
  fps: number;
  speed: string;
}

export interface ConversionComplete {
  job_id: string;
  file_path: string;
  output_path: string;
}

export interface ConversionError {
  job_id: string;
  file_path: string;
  error: string;
}

export interface BatchDone {
  total: number;
  succeeded: number;
  failed: number;
}

export type Codec = "h264" | "h265" | "prores";

export interface Settings {
  codec: Codec;
  crf: number;
}
