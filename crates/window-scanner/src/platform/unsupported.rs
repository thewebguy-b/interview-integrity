/// Unsupported platform stub.
/// Returns a clear error result; the scanner does not crash on unsupported platforms.

use anyhow::Result;
use chrono::Utc;
use event_schema::{
    CapabilityStatus, Platform, PlatformCapabilities, ScanResult, ScannerError,
    ScannerErrorType, SCHEMA_VERSION,
};

pub fn scan_platform() -> Result<ScanResult> {
    Ok(ScanResult {
        schema_version: SCHEMA_VERSION,
        timestamp: Utc::now(),
        platform: Platform::Unknown,
        scanner_version: env!("CARGO_PKG_VERSION").to_string(),
        observations: vec![],
        scanner_errors: vec![ScannerError {
            error_type: ScannerErrorType::ApiUnsupported,
            message: format!(
                "Platform '{}' is not supported. Supported platforms: Windows, macOS.",
                std::env::consts::OS
            ),
            window_id: None,
            api_call: None,
            os_error_code: None,
        }],
        capabilities: PlatformCapabilities {
            capture_affinity_inspection: CapabilityStatus::Unsupported,
            executable_hash_reading: CapabilityStatus::Unsupported,
            opacity_inspection: CapabilityStatus::Unsupported,
            owner_process_inspection: CapabilityStatus::Unsupported,
            always_on_top_inspection: CapabilityStatus::Unsupported,
        },
    })
}
