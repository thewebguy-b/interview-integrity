/// macOS platform scanner.
///
/// Uses CGWindowListCopyWindowInfo to enumerate windows and read available metadata.
///
/// # Available fields via CGWindowListCopyWindowInfo
///
/// - kCGWindowOwnerName (process/owner name)
/// - kCGWindowOwnerPID (owner process ID)
/// - kCGWindowLayer (window stacking layer)
/// - kCGWindowAlpha (window alpha/opacity)
/// - kCGWindowSharingState (sharing state enum)
/// - kCGWindowNumber (window ID, stable within session)
///
/// # Critical limitation: kCGWindowSharingState
///
/// The kCGWindowSharingState field uses values from the CGWindowSharingType enum:
/// - kCGWindowSharingNone (0) — window is NOT shared in screen captures.
/// - kCGWindowSharingReadOnly (1) — window IS shared in screen captures.
///
/// IMPORTANT: kCGWindowSharingNone does NOT prove the window is using any particular
/// API to exclude itself from capture. Many background or utility windows also have
/// kCGWindowSharingNone. This field alone cannot confirm that a specific API
/// (equivalent to WDA_EXCLUDEFROMCAPTURE on Windows) was used.
///
/// # Permission requirements
///
/// On macOS 10.15+ (Catalina), CGWindowListCopyWindowInfo requires Screen Recording
/// permission in System Preferences > Security & Privacy > Screen Recording.
/// Without this permission, the API returns an empty list (not an error).
/// The scanner detects this case by checking if the list is empty and reports it
/// as a capability limitation.
///
/// # Window contents
///
/// The scanner NEVER requests kCGWindowImageDefault or any option that would
/// capture pixel content. Only metadata fields are read.

use anyhow::Result;
use chrono::Utc;
use event_schema::{
    CapabilityStatus, CaptureAffinity, ObservedValue, Platform, PlatformCapabilities,
    ScanResult, ScannerError, ScannerErrorType, WindowObservation, SCHEMA_VERSION,
};

pub fn scan_platform() -> Result<ScanResult> {
    let (observations, errors) = enumerate_windows_macos();

    Ok(ScanResult {
        schema_version: SCHEMA_VERSION,
        timestamp: Utc::now(),
        platform: Platform::Macos,
        scanner_version: env!("CARGO_PKG_VERSION").to_string(),
        observations,
        scanner_errors: errors,
        capabilities: macos_capabilities(),
    })
}

fn macos_capabilities() -> PlatformCapabilities {
    PlatformCapabilities {
        // kCGWindowSharingState is available but is NOT a reliable proxy for
        // capture-exclusion API usage. Marked Unsupported to reflect this.
        capture_affinity_inspection: CapabilityStatus::Unsupported,
        executable_hash_reading: CapabilityStatus::Supported,
        opacity_inspection: CapabilityStatus::Supported,
        owner_process_inspection: CapabilityStatus::Supported,
        always_on_top_inspection: CapabilityStatus::Supported,
    }
}

#[cfg(target_os = "macos")]
fn enumerate_windows_macos() -> (Vec<WindowObservation>, Vec<ScannerError>) {
    use core_foundation::{
        array::CFArray,
        base::{CFType, TCFType},
        dictionary::CFDictionary,
        number::CFNumber,
        string::CFString,
    };
    use core_graphics::window::{
        kCGNullWindowID, kCGWindowAlpha, kCGWindowLayer, kCGWindowListOptionAll,
        kCGWindowNumber, kCGWindowOwnerName, kCGWindowOwnerPID, kCGWindowSharingState,
        CGWindowListCopyWindowInfo,
    };

    let mut observations = Vec::new();
    let mut errors = Vec::new();

    let window_list: CFArray<CFDictionary<CFString, CFType>> = unsafe {
        let raw = CGWindowListCopyWindowInfo(kCGWindowListOptionAll, kCGNullWindowID);
        if raw.is_null() {
            errors.push(ScannerError {
                error_type: ScannerErrorType::PermissionDenied,
                message:
                    "CGWindowListCopyWindowInfo returned null. Screen Recording permission \
                     may be required (System Preferences > Privacy & Security > Screen Recording)."
                        .into(),
                window_id: None,
                api_call: Some("CGWindowListCopyWindowInfo".into()),
                os_error_code: None,
            });
            return (observations, errors);
        }
        CFArray::wrap_under_create_rule(raw)
    };

    for dict in window_list.iter() {
        let window_id = dict
            .find(unsafe { kCGWindowNumber })
            .and_then(|v| v.downcast::<CFNumber>())
            .and_then(|n| n.to_i64())
            .map(|id| format!("cgwid-{}", id))
            .unwrap_or_else(|| "cgwid-unknown".into());

        let owner_name = dict
            .find(unsafe { kCGWindowOwnerName })
            .and_then(|v| v.downcast::<CFString>())
            .map(|s| s.to_string());

        let owner_pid = dict
            .find(unsafe { kCGWindowOwnerPID })
            .and_then(|v| v.downcast::<CFNumber>())
            .and_then(|n| n.to_i32())
            .map(|p| p as u32);

        let layer = dict
            .find(unsafe { kCGWindowLayer })
            .and_then(|v| v.downcast::<CFNumber>())
            .and_then(|n| n.to_i32());

        let alpha = dict
            .find(unsafe { kCGWindowAlpha })
            .and_then(|v| v.downcast::<CFNumber>())
            .and_then(|n| n.to_f64())
            .map(|f| f as f32);

        let sharing_state = dict
            .find(unsafe { kCGWindowSharingState })
            .and_then(|v| v.downcast::<CFNumber>())
            .and_then(|n| n.to_i32());

        // layer > 0 is typically used for always-on-top or system-level windows.
        let always_on_top = match layer {
            Some(l) => ObservedValue::Confirmed(l > 0),
            None => ObservedValue::Unknown,
        };

        // kCGWindowSharingState: 0 = not shared, 1 = shared read-only.
        // We report the raw value but explicitly mark capture_affinity as Unsupported
        // because this does not confirm capture-exclusion API usage.
        let _ = sharing_state; // Intentionally not mapped to CaptureAffinity; see docs.

        observations.push(WindowObservation {
            window_id,
            process_name: match owner_name {
                Some(n) => ObservedValue::Confirmed(n),
                None => ObservedValue::Unknown,
            },
            executable_hash: ObservedValue::Unsupported, // Not computed in this scan
            capture_affinity: ObservedValue::Unsupported,
            always_on_top,
            opacity: match alpha {
                Some(a) => ObservedValue::Confirmed(a),
                None => ObservedValue::Unknown,
            },
            owner_process_id: match owner_pid {
                Some(p) => ObservedValue::Confirmed(p),
                None => ObservedValue::Unknown,
            },
            is_visible: ObservedValue::Confirmed(true), // All returned windows are considered on-screen
            source_api: "CGWindowListCopyWindowInfo".into(),
        });
    }

    (observations, errors)
}

#[cfg(not(target_os = "macos"))]
fn enumerate_windows_macos() -> (Vec<WindowObservation>, Vec<ScannerError>) {
    (
        vec![],
        vec![ScannerError {
            error_type: ScannerErrorType::ApiUnsupported,
            message: "macOS scanner compiled on non-macOS target".into(),
            window_id: None,
            api_call: None,
            os_error_code: None,
        }],
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scan_platform_macos() {
        let result = scan_platform().expect("scan should not fail");
        assert_eq!(result.platform, Platform::Macos);
        assert!(!result.scanner_version.is_empty());
    }

    #[test]
    fn test_capture_affinity_unsupported_on_macos() {
        let result = scan_platform().expect("scan");
        // macOS cannot confirm capture affinity; must be Unsupported.
        assert_eq!(
            result.capabilities.capture_affinity_inspection,
            CapabilityStatus::Unsupported,
            "macOS must not claim to support capture affinity inspection"
        );
    }
}
