use std::collections::HashMap;

#[derive(Debug, Clone, serde::Serialize)]
pub struct ProgressInfo {
    pub job_id: String,
    pub percent: f64,
    pub fps: f64,
    pub speed: String,
}

pub fn parse_progress_line(line: &str, state: &mut HashMap<String, String>) -> Option<()> {
    let line = line.trim();
    if let Some((key, value)) = line.split_once('=') {
        state.insert(key.trim().to_string(), value.trim().to_string());
    }
    None
}

pub fn compute_progress(state: &HashMap<String, String>, duration_us: i64) -> Option<ProgressInfo> {
    let out_time_us = state.get("out_time_us")?
        .parse::<i64>().ok()?;

    if duration_us <= 0 {
        return None;
    }

    let percent = (out_time_us as f64 / duration_us as f64 * 100.0).min(100.0).max(0.0);

    let fps = state.get("fps")
        .and_then(|s| s.parse::<f64>().ok())
        .unwrap_or(0.0);

    let speed = state.get("speed")
        .cloned()
        .unwrap_or_default();

    Some(ProgressInfo {
        job_id: String::new(),
        percent,
        fps,
        speed,
    })
}

pub fn is_progress_end(state: &HashMap<String, String>) -> bool {
    state.get("progress").map(|v| v == "end").unwrap_or(false)
}
