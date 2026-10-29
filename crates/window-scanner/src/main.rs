/// window-scanner: Main entry point.
///
/// Performs one scan of all top-level windows, emits a structured JSON
/// ScanResult to stdout, and exits. Errors are emitted as structured
/// scanner_errors inside the JSON envelope — the process does not crash.
///
/// Usage:
///   window-scanner [--pretty] [--output <path>]
///
/// Environment:
///   RUST_LOG=debug   — enable verbose diagnostic logging to stderr.
///
/// The scanner NEVER: takes screenshots, reads window contents, logs
/// keystrokes, accesses the clipboard, or communicates with the internet.

use anyhow::Result;
use env_logger::Env;
use event_schema::{ScanResult, ScannerError, ScannerErrorType};
use std::process;

mod platform;

fn main() {
    // Log to stderr so stdout stays clean JSON.
    env_logger::Builder::from_env(Env::default().default_filter_or("warn")).init();

    let args: Vec<String> = std::env::args().collect();
    let pretty = args.contains(&"--pretty".to_string());

    match run_scan(pretty) {
        Ok(json) => {
            println!("{}", json);
            process::exit(0);
        }
        Err(e) => {
            // Even on unexpected failure, emit valid JSON with an error record.
            let error_result = build_error_envelope(e.to_string());
            let json = serde_json::to_string_pretty(&error_result)
                .unwrap_or_else(|_| r#"{"fatalError":"failed to serialize error envelope"}"#.to_string());
            eprintln!("{}", json);
            process::exit(1);
        }
    }
}

fn run_scan(pretty: bool) -> Result<String> {
    let result = platform::scan()?;

    // Validate before emitting.
    if let Err(issues) = result.validate() {
        log::warn!("ScanResult validation issues: {:?}", issues);
    }

    let json = if pretty {
        serde_json::to_string_pretty(&result)?
    } else {
        serde_json::to_string(&result)?
    };

    Ok(json)
}

fn build_error_envelope(message: String) -> ScanResult {
    use chrono::Utc;
    use event_schema::{CapabilityStatus, Platform, PlatformCapabilities, SCHEMA_VERSION};

    ScanResult {
        schema_version: SCHEMA_VERSION,
        timestamp: Utc::now(),
        platform: Platform::current(),
        scanner_version: env!("CARGO_PKG_VERSION").to_string(),
        observations: vec![],
        scanner_errors: vec![ScannerError {
            error_type: ScannerErrorType::Unknown,
            message,
            window_id: None,
            api_call: None,
            os_error_code: None,
        }],
        capabilities: PlatformCapabilities {
            capture_affinity_inspection: CapabilityStatus::Unknown,
            executable_hash_reading: CapabilityStatus::Unknown,
            opacity_inspection: CapabilityStatus::Unknown,
            owner_process_inspection: CapabilityStatus::Unknown,
            always_on_top_inspection: CapabilityStatus::Unknown,
        },
    }
}
