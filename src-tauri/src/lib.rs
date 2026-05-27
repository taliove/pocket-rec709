mod commands;
mod ffmpeg;
mod progress;

use commands::ConversionState;
use std::sync::Arc;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state = Arc::new(Mutex::new(ConversionState::default()));

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::check_ffmpeg,
            commands::probe_file,
            commands::extract_thumbnail,
            commands::start_conversion,
            commands::cancel_conversion,
            commands::open_in_finder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
