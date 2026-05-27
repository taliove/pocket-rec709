use crate::ffmpeg::{self, ConversionConfig, FfmpegInfo, VideoMetadata};
use crate::progress;
use base64::Engine;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::sync::Mutex;
use uuid::Uuid;

#[derive(Default)]
pub struct ConversionState {
    pub is_running: bool,
    pub cancel_requested: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileInfo {
    pub path: String,
    pub name: String,
    pub metadata: VideoMetadata,
}

#[derive(Debug, Clone, Serialize)]
pub struct ConversionProgress {
    pub job_id: String,
    pub file_path: String,
    pub percent: f64,
    pub fps: f64,
    pub speed: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ConversionComplete {
    pub job_id: String,
    pub file_path: String,
    pub output_path: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ConversionError {
    pub job_id: String,
    pub file_path: String,
    pub error: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct BatchDone {
    pub total: usize,
    pub succeeded: usize,
    pub failed: usize,
}

#[tauri::command]
pub async fn check_ffmpeg() -> Result<FfmpegInfo, String> {
    Ok(ffmpeg::detect_ffmpeg().await)
}

#[tauri::command]
pub async fn probe_file(path: String) -> Result<FileInfo, String> {
    let metadata = ffmpeg::probe_metadata(&path).await?;
    let p = PathBuf::from(&path);
    let name = p.file_name().unwrap_or_default().to_string_lossy().to_string();
    Ok(FileInfo {
        path,
        name,
        metadata,
    })
}

#[tauri::command]
pub async fn extract_thumbnail(path: String) -> Result<String, String> {
    let bytes = ffmpeg::extract_thumbnail_data(&path).await?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:image/jpeg;base64,{}", b64))
}

#[tauri::command]
pub async fn open_in_finder(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        tokio::process::Command::new("open")
            .arg("-R")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        tokio::process::Command::new("explorer")
            .arg(format!("/select,{}", path))
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        let p = PathBuf::from(&path);
        let target = if p.is_file() {
            p.parent().unwrap_or(&p).to_path_buf()
        } else {
            p
        };
        tokio::process::Command::new("xdg-open")
            .arg(target.to_string_lossy().to_string())
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn start_conversion(
    app: AppHandle,
    state: tauri::State<'_, Arc<Mutex<ConversionState>>>,
    files: Vec<String>,
    codec: String,
    crf: u8,
) -> Result<(), String> {
    {
        let mut s = state.lock().await;
        if s.is_running {
            return Err("Conversion already in progress".to_string());
        }
        s.is_running = true;
        s.cancel_requested = false;
    }

    let state_clone = state.inner().clone();
    let app_clone = app.clone();

    tokio::spawn(async move {
        let total = files.len();
        let mut succeeded = 0usize;
        let mut failed = 0usize;

        let lut_path = resolve_lut_path(&app_clone).await;

        for file_path in &files {
            {
                let s = state_clone.lock().await;
                if s.cancel_requested {
                    break;
                }
            }

            let job_id = Uuid::new_v4().to_string();
            let input = PathBuf::from(file_path);
            let output = ffmpeg::build_output_path(&input, &codec);

            let config = ConversionConfig {
                input: input.clone(),
                output: output.clone(),
                lut_path: lut_path.clone(),
                codec: codec.clone(),
                crf,
            };

            match run_single_conversion(&app_clone, &state_clone, &job_id, file_path, &config).await {
                Ok(_) => {
                    succeeded += 1;
                    let _ = app_clone.emit("conversion://complete", ConversionComplete {
                        job_id,
                        file_path: file_path.clone(),
                        output_path: output.to_string_lossy().to_string(),
                    });
                }
                Err(e) => {
                    failed += 1;
                    let _ = app_clone.emit("conversion://error", ConversionError {
                        job_id,
                        file_path: file_path.clone(),
                        error: e,
                    });
                    let _ = tokio::fs::remove_file(&output).await;
                }
            }
        }

        let _ = app_clone.emit("conversion://batch-done", BatchDone {
            total,
            succeeded,
            failed,
        });

        let mut s = state_clone.lock().await;
        s.is_running = false;
        s.cancel_requested = false;
    });

    Ok(())
}

async fn resolve_lut_path(app: &AppHandle) -> PathBuf {
    let resource_path = app
        .path()
        .resource_dir()
        .unwrap_or_default()
        .join("resources")
        .join("dji-dlog-rec709.cube");

    if resource_path.exists() {
        return resource_path;
    }

    let app_data = app.path().app_data_dir().unwrap_or_default();
    let safe_path = app_data.join("dji-dlog-rec709.cube");

    if !safe_path.exists() {
        let _ = tokio::fs::create_dir_all(&app_data).await;
        let _ = tokio::fs::copy(&resource_path, &safe_path).await;
    }

    safe_path
}

async fn run_single_conversion(
    app: &AppHandle,
    state: &Arc<Mutex<ConversionState>>,
    job_id: &str,
    file_path: &str,
    config: &ConversionConfig,
) -> Result<(), String> {
    let mut child = config.spawn()?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let mut reader = BufReader::new(stdout).lines();
    let duration_us = (ffmpeg::probe_duration(file_path).await.unwrap_or(0.0) * 1_000_000.0) as i64;

    let mut progress_state: HashMap<String, String> = HashMap::new();
    let mut last_emit = std::time::Instant::now();

    loop {
        {
            let s = state.lock().await;
            if s.cancel_requested {
                let _ = child.kill().await;
                return Err("Cancelled".to_string());
            }
        }

        match tokio::time::timeout(std::time::Duration::from_secs(1), reader.next_line()).await {
            Ok(Ok(Some(line))) => {
                progress::parse_progress_line(&line, &mut progress_state);

                if progress::is_progress_end(&progress_state) {
                    let _ = app.emit("conversion://progress", ConversionProgress {
                        job_id: job_id.to_string(),
                        file_path: file_path.to_string(),
                        percent: 100.0,
                        fps: 0.0,
                        speed: String::new(),
                    });
                    break;
                }

                if last_emit.elapsed() >= std::time::Duration::from_millis(500) {
                    if let Some(mut info) = progress::compute_progress(&progress_state, duration_us) {
                        info.job_id = job_id.to_string();
                        let _ = app.emit("conversion://progress", ConversionProgress {
                            job_id: job_id.to_string(),
                            file_path: file_path.to_string(),
                            percent: info.percent,
                            fps: info.fps,
                            speed: info.speed,
                        });
                        last_emit = std::time::Instant::now();
                    }
                }
            }
            Ok(Ok(None)) => break,
            Ok(Err(e)) => return Err(format!("Read error: {}", e)),
            Err(_) => continue,
        }
    }

    let status = child.wait().await.map_err(|e| format!("Process error: {}", e))?;
    if !status.success() {
        return Err(format!("FFmpeg exited with code: {}", status.code().unwrap_or(-1)));
    }

    Ok(())
}

#[tauri::command]
pub async fn cancel_conversion(
    state: tauri::State<'_, Arc<Mutex<ConversionState>>>,
) -> Result<(), String> {
    let mut s = state.lock().await;
    s.cancel_requested = true;
    Ok(())
}
