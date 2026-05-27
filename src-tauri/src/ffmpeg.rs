use std::path::PathBuf;
use std::process::Stdio;
use tokio::process::Command;

#[derive(Debug, Clone, serde::Serialize)]
pub struct FfmpegInfo {
    pub available: bool,
    pub version: String,
    pub path: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct VideoMetadata {
    pub duration: f64,
    pub width: u32,
    pub height: u32,
    pub fps: f64,
    pub codec: String,
    pub pix_fmt: String,
    pub bit_depth: u32,
    pub color_space: String,
    pub size_bytes: u64,
}

pub async fn detect_ffmpeg() -> FfmpegInfo {
    let cmd = if cfg!(target_os = "windows") {
        "where"
    } else {
        "which"
    };

    let path = match Command::new(cmd).arg("ffmpeg").output().await {
        Ok(output) if output.status.success() => {
            String::from_utf8_lossy(&output.stdout).trim().lines().next().unwrap_or("").to_string()
        }
        _ => String::new(),
    };

    if path.is_empty() {
        return FfmpegInfo {
            available: false,
            version: String::new(),
            path: String::new(),
        };
    }

    let version = match Command::new("ffmpeg").arg("-version").output().await {
        Ok(output) if output.status.success() => {
            let full = String::from_utf8_lossy(&output.stdout).to_string();
            full.lines().next().unwrap_or("").to_string()
        }
        _ => String::new(),
    };

    FfmpegInfo {
        available: true,
        version,
        path,
    }
}

#[derive(Debug, Clone)]
pub struct ConversionConfig {
    pub input: PathBuf,
    pub output: PathBuf,
    pub lut_path: PathBuf,
    pub codec: String,
    pub crf: u8,
}

impl ConversionConfig {
    pub fn build_args(&self) -> Vec<String> {
        let lut_filter = format!("lut3d='{}'", self.lut_path.to_string_lossy().replace('\\', "/"));

        let mut args = vec![
            "-y".to_string(),
            "-i".to_string(),
            self.input.to_string_lossy().to_string(),
            "-vf".to_string(),
            lut_filter,
        ];

        match self.codec.as_str() {
            "h265" => {
                args.extend([
                    "-c:v".to_string(),
                    "libx265".to_string(),
                    "-crf".to_string(),
                    self.crf.to_string(),
                    "-preset".to_string(),
                    "medium".to_string(),
                    "-tag:v".to_string(),
                    "hvc1".to_string(),
                ]);
            }
            "prores" => {
                args.extend([
                    "-c:v".to_string(),
                    "prores_ks".to_string(),
                    "-profile:v".to_string(),
                    "3".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv422p10le".to_string(),
                ]);
            }
            _ => {
                args.extend([
                    "-c:v".to_string(),
                    "libx264".to_string(),
                    "-crf".to_string(),
                    self.crf.to_string(),
                    "-preset".to_string(),
                    "medium".to_string(),
                ]);
            }
        }

        args.extend([
            "-c:a".to_string(),
            "copy".to_string(),
            "-progress".to_string(),
            "pipe:1".to_string(),
            self.output.to_string_lossy().to_string(),
        ]);

        args
    }

    pub fn spawn(&self) -> Result<tokio::process::Child, String> {
        let args = self.build_args();
        Command::new("ffmpeg")
            .args(&args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn ffmpeg: {}", e))
    }
}

pub fn build_output_path(input: &PathBuf, codec: &str) -> PathBuf {
    let stem = input.file_stem().unwrap_or_default().to_string_lossy();
    let ext = if codec == "prores" { "mov" } else { "mp4" };
    let mut output_name = format!("{}_rec709.{}", stem, ext);
    let parent = input.parent().unwrap_or(input);
    let mut candidate = parent.join(&output_name);

    let mut counter = 2;
    while candidate.exists() {
        output_name = format!("{}_rec709_{}.{}", stem, counter, ext);
        candidate = parent.join(&output_name);
        counter += 1;
    }
    candidate
}

pub async fn probe_metadata(path: &str) -> Result<VideoMetadata, String> {
    let output = Command::new("ffprobe")
        .args([
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            path,
        ])
        .output()
        .await
        .map_err(|e| format!("Failed to run ffprobe: {}", e))?;

    if !output.status.success() {
        return Err("ffprobe failed".to_string());
    }

    let json: serde_json::Value = serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("Failed to parse ffprobe output: {}", e))?;

    let duration = json["format"]["duration"]
        .as_str()
        .and_then(|s| s.parse::<f64>().ok())
        .unwrap_or(0.0);

    let size_bytes = json["format"]["size"]
        .as_str()
        .and_then(|s| s.parse::<u64>().ok())
        .unwrap_or(0);

    let video_stream = json["streams"]
        .as_array()
        .and_then(|arr| arr.iter().find(|s| s["codec_type"].as_str() == Some("video")))
        .ok_or_else(|| "No video stream found".to_string())?;

    let width = video_stream["width"].as_u64().unwrap_or(0) as u32;
    let height = video_stream["height"].as_u64().unwrap_or(0) as u32;
    let codec = video_stream["codec_name"].as_str().unwrap_or("").to_string();
    let pix_fmt = video_stream["pix_fmt"].as_str().unwrap_or("").to_string();
    let color_space = video_stream["color_space"].as_str().unwrap_or("").to_string();

    let fps = video_stream["r_frame_rate"]
        .as_str()
        .and_then(|s| {
            let parts: Vec<&str> = s.split('/').collect();
            if parts.len() == 2 {
                let num: f64 = parts[0].parse().ok()?;
                let den: f64 = parts[1].parse().ok()?;
                if den > 0.0 { Some(num / den) } else { None }
            } else {
                None
            }
        })
        .unwrap_or(0.0);

    let bit_depth = if pix_fmt.contains("p10") {
        10
    } else if pix_fmt.contains("p12") {
        12
    } else {
        8
    };

    Ok(VideoMetadata {
        duration,
        width,
        height,
        fps,
        codec,
        pix_fmt,
        bit_depth,
        color_space,
        size_bytes,
    })
}

pub async fn probe_duration(path: &str) -> Result<f64, String> {
    probe_metadata(path).await.map(|m| m.duration)
}

pub async fn extract_thumbnail_data(path: &str) -> Result<Vec<u8>, String> {
    use tokio::time::{timeout, Duration};

    let output = timeout(
        Duration::from_secs(15),
        Command::new("ffmpeg")
            .args([
                "-y",
                "-ss", "0.5",
                "-i", path,
                "-vframes", "1",
                "-vf", "scale=264:-1",
                "-f", "image2",
                "-c:v", "mjpeg",
                "-q:v", "5",
                "pipe:1",
            ])
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .output(),
    )
    .await
    .map_err(|_| "Thumbnail extraction timed out".to_string())?
    .map_err(|e| format!("Failed to run ffmpeg: {}", e))?;

    if !output.status.success() || output.stdout.is_empty() {
        return Err("Failed to extract thumbnail".to_string());
    }

    Ok(output.stdout)
}
