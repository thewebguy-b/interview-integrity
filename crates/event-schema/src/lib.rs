/// event-schema: Shared data types for scanner observations and events.
/// All types are serializable to/from JSON and versioned via schema_version.
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Current schema version. Increment on breaking changes.
pub const SCHEMA_VERSION: u32 = 1;

/// The top-level envelope emitted by the scanner for each scan run.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    pub schema_version: u32,
    pub timestamp: DateTime<Utc>,
    pub platform: Platform,
    pub scanner_version: String,
    pub observations: Vec<WindowObservation>,
    pub scanner_errors: Vec<ScannerError>,
    pub capabilities: PlatformCapabilities,
}

/// The OS platform the scanner is running on.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Platform {
    Windows,
    Macos,
    Linux,
    Unknown,
}

impl Platform {
    pub fn current() -> Self {
        if cfg!(target_os = "windows") {
            Platform::Windows
        } else if cfg!(target_os = "macos") {
            Platform::Macos
        } else if cfg!(target_os = "linux") {
            Platform::Linux
        } else {
            Platform::Unknown
        }
    }
}

/// A single observed window's metadata.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowObservation {
    /// Platform-scoped stable identifier (e.g., HWND on Windows).
    pub window_id: String,
    /// Process name without path.
    pub process_name: ObservedValue<String>,
    /// SHA-256 of the executable, if readable.
    pub executable_hash: ObservedValue<String>,
    /// Display affinity / capture exclusion state.
    pub capture_affinity: ObservedValue<CaptureAffinity>,
    /// Whether the window is configured as always-on-top.
    pub always_on_top: ObservedValue<bool>,
    /// Window opacity/transparency [0.0–1.0], if readable.
    pub opacity: ObservedValue<f32>,
    /// Owner process ID, if available.
    pub owner_process_id: ObservedValue<u32>,
    /// Window visibility state.
    pub is_visible: ObservedValue<bool>,
    /// Source API used to obtain data for this window.
    pub source_api: String,
}

/// Represents a value that may be confirmed, unsupported, permission-denied, or unknown.
/// This avoids conflating a real `false` with "we couldn't read the value".
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "status", content = "value", rename_all = "snake_case")]
pub enum ObservedValue<T> {
    /// The value was successfully read from the OS.
    Confirmed(T),
    /// The API to read this value is not supported on this OS/version.
    Unsupported,
    /// Reading this value was denied by OS permissions or security policy.
    PermissionDenied,
    /// The value could not be determined for an unexpected reason.
    Unknown,
}

impl<T> ObservedValue<T> {
    pub fn is_confirmed(&self) -> bool {
        matches!(self, ObservedValue::Confirmed(_))
    }

    pub fn as_confirmed(&self) -> Option<&T> {
        if let ObservedValue::Confirmed(v) = self {
            Some(v)
        } else {
            None
        }
    }
}

/// Display-affinity / capture-exclusion state for a window.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum CaptureAffinity {
    /// WDA_NONE (0x0) — window is included in captures normally.
    None,
    /// WDA_MONITOR (0x1) — window is mirrored to monitor only (legacy).
    MonitorOnly,
    /// WDA_EXCLUDEFROMCAPTURE (0x11) — window is excluded from captures.
    ExcludeFromCapture,
    /// Value returned by the OS but not in a known set.
    UnrecognizedValue(u32),
}

/// What the scanner is capable of reading on this platform.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformCapabilities {
    pub capture_affinity_inspection: CapabilityStatus,
    pub executable_hash_reading: CapabilityStatus,
    pub opacity_inspection: CapabilityStatus,
    pub owner_process_inspection: CapabilityStatus,
    pub always_on_top_inspection: CapabilityStatus,
}

/// Whether a specific OS capability is available.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum CapabilityStatus {
    Supported,
    Unsupported,
    RequiresElevation,
    Unknown,
}

/// A structured error from the scanner, including the affected window if applicable.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScannerError {
    pub error_type: ScannerErrorType,
    pub message: String,
    pub window_id: Option<String>,
    pub api_call: Option<String>,
    pub os_error_code: Option<i32>,
}

/// Category of scanner error.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ScannerErrorType {
    EnumerationFailed,
    PermissionDenied,
    ApiUnsupported,
    ParseError,
    ProcessQueryFailed,
    HashComputationFailed,
    Unknown,
}

/// Errors that can occur when constructing a ScanResult.
#[derive(Debug, Error)]
pub enum SchemaError {
    #[error("Serialization failed: {0}")]
    Serialization(#[from] serde_json::Error),
}

impl ScanResult {
    /// Serialize to a JSON string.
    pub fn to_json(&self) -> Result<String, SchemaError> {
        Ok(serde_json::to_string_pretty(self)?)
    }

    /// Validate basic invariants of a scan result.
    pub fn validate(&self) -> Result<(), Vec<String>> {
        let mut issues = Vec::new();
        if self.schema_version != SCHEMA_VERSION {
            issues.push(format!(
                "Unexpected schema version: {}",
                self.schema_version
            ));
        }
        if self.scanner_version.is_empty() {
            issues.push("scanner_version must not be empty".into());
        }
        if issues.is_empty() {
            Ok(())
        } else {
            Err(issues)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_observation(id: &str) -> WindowObservation {
        WindowObservation {
            window_id: id.to_string(),
            process_name: ObservedValue::Confirmed("test.exe".into()),
            executable_hash: ObservedValue::Unsupported,
            capture_affinity: ObservedValue::Confirmed(CaptureAffinity::None),
            always_on_top: ObservedValue::Confirmed(false),
            opacity: ObservedValue::Unknown,
            owner_process_id: ObservedValue::Confirmed(1234),
            is_visible: ObservedValue::Confirmed(true),
            source_api: "EnumWindows/GetWindowDisplayAffinity".into(),
        }
    }

    fn make_result(obs: Vec<WindowObservation>) -> ScanResult {
        ScanResult {
            schema_version: SCHEMA_VERSION,
            timestamp: Utc::now(),
            platform: Platform::Windows,
            scanner_version: "0.1.0".into(),
            observations: obs,
            scanner_errors: vec![],
            capabilities: PlatformCapabilities {
                capture_affinity_inspection: CapabilityStatus::Supported,
                executable_hash_reading: CapabilityStatus::RequiresElevation,
                opacity_inspection: CapabilityStatus::Unsupported,
                owner_process_inspection: CapabilityStatus::Supported,
                always_on_top_inspection: CapabilityStatus::Supported,
            },
        }
    }

    #[test]
    fn test_serialize_round_trip() {
        let obs = make_observation("hwnd-1");
        let result = make_result(vec![obs]);
        let json = result.to_json().expect("serialize");
        let parsed: ScanResult = serde_json::from_str(&json).expect("deserialize");
        assert_eq!(parsed.schema_version, SCHEMA_VERSION);
        assert_eq!(parsed.observations.len(), 1);
    }

    #[test]
    fn test_validate_ok() {
        let result = make_result(vec![]);
        assert!(result.validate().is_ok());
    }

    #[test]
    fn test_validate_bad_version() {
        let mut result = make_result(vec![]);
        result.schema_version = 99;
        assert!(result.validate().is_err());
    }

    #[test]
    fn test_observed_value_confirmed() {
        let v: ObservedValue<bool> = ObservedValue::Confirmed(true);
        assert!(v.is_confirmed());
        assert_eq!(v.as_confirmed(), Some(&true));
    }

    #[test]
    fn test_observed_value_unsupported_not_false() {
        // Critical: unsupported must NOT serialize as false.
        let v: ObservedValue<bool> = ObservedValue::Unsupported;
        let json = serde_json::to_string(&v).unwrap();
        assert!(!json.contains("false"));
        assert!(json.contains("unsupported"));
        assert!(!v.is_confirmed());
        assert_eq!(v.as_confirmed(), None);
    }

    #[test]
    fn test_observed_value_permission_denied() {
        let v: ObservedValue<String> = ObservedValue::PermissionDenied;
        let json = serde_json::to_string(&v).unwrap();
        assert!(json.contains("permission_denied"));
    }

    #[test]
    fn test_capture_affinity_exclude() {
        let obs = WindowObservation {
            capture_affinity: ObservedValue::Confirmed(CaptureAffinity::ExcludeFromCapture),
            ..make_observation("hwnd-2")
        };
        let result = make_result(vec![obs]);
        let json = result.to_json().unwrap();
        assert!(json.contains("exclude_from_capture"));
    }

    #[test]
    fn test_scanner_error_serializes() {
        let err = ScannerError {
            error_type: ScannerErrorType::PermissionDenied,
            message: "Access denied to process 4".into(),
            window_id: Some("hwnd-3".into()),
            api_call: Some("OpenProcess".into()),
            os_error_code: Some(5),
        };
        let json = serde_json::to_string_pretty(&err).unwrap();
        assert!(json.contains("permission_denied"));
        assert!(json.contains("OpenProcess"));
    }

    #[test]
    fn test_platform_current_is_not_unknown() {
        let p = Platform::current();
        // On any CI/dev machine we run, Unknown would indicate a problem.
        assert_ne!(p, Platform::Unknown);
    }

    #[test]
    fn test_empty_observations_valid() {
        let result = make_result(vec![]);
        assert_eq!(result.observations.len(), 0);
        assert!(result.validate().is_ok());
    }
}
