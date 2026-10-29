/// Windows platform scanner using winapi crate (compatible with GNU and MSVC toolchains).
///
/// # APIs used
///
/// - `EnumWindows` — iterates all top-level windows.
/// - `IsWindowVisible` — checks visibility.
/// - `GetWindowLongW(GWL_EXSTYLE)` — reads WS_EX_TOPMOST for always-on-top.
/// - `GetWindowThreadProcessId` — maps HWND to PID.
/// - `OpenProcess` + `GetModuleFileNameExW` — gets exe path.
/// - `GetWindowDisplayAffinity` — reads WDA_* constant for capture exclusion.
///
/// # CRITICAL LIMITATION: GetWindowDisplayAffinity cross-process restriction
///
/// Per MSDN documentation:
///   "This function only works when the caller is the process that created the window."
///
/// Consequence: When this scanner calls GetWindowDisplayAffinity on a window owned by
/// ANOTHER process (e.g. Zoom, Chrome, a notes application), the API returns WDA_NONE
/// (0x0) regardless of the actual affinity setting.
///
/// This is an OS security boundary intentionally designed to prevent one process from
/// inspecting another's window properties. It CANNOT be bypassed without elevated
/// OS privileges or process injection (which this scanner does NOT do).
///
/// Therefore:
/// - A result of WDA_NONE for a foreign window does NOT mean the window is capturable.
/// - A result of WDA_EXCLUDE_FROM_CAPTURE is only reliable for windows this process owns.
/// - The capability is reported as `requires_elevation` to signal this restriction.
///
/// See docs/platform-limitations.md for the full analysis.

use anyhow::Result;
use chrono::Utc;
use event_schema::{
    CapabilityStatus, CaptureAffinity, ObservedValue, Platform, PlatformCapabilities,
    ScanResult, ScannerError, ScannerErrorType, WindowObservation, SCHEMA_VERSION,
};

pub fn scan_platform() -> Result<ScanResult> {
    #[cfg(target_os = "windows")]
    {
        scan_windows_impl()
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(ScanResult {
            schema_version: SCHEMA_VERSION,
            timestamp: Utc::now(),
            platform: Platform::Windows,
            scanner_version: env!("CARGO_PKG_VERSION").to_string(),
            observations: vec![],
            scanner_errors: vec![ScannerError {
                error_type: ScannerErrorType::ApiUnsupported,
                message: "Windows scanner module compiled on non-Windows target".into(),
                window_id: None,
                api_call: None,
                os_error_code: None,
            }],
            capabilities: windows_capabilities(),
        })
    }
}

fn windows_capabilities() -> PlatformCapabilities {
    PlatformCapabilities {
        capture_affinity_inspection: CapabilityStatus::RequiresElevation,
        executable_hash_reading: CapabilityStatus::RequiresElevation,
        opacity_inspection: CapabilityStatus::Unsupported,
        owner_process_inspection: CapabilityStatus::Supported,
        always_on_top_inspection: CapabilityStatus::Supported,
    }
}

#[cfg(target_os = "windows")]
fn scan_windows_impl() -> Result<ScanResult> {
    let (observations, errors) = enumerate_windows();

    Ok(ScanResult {
        schema_version: SCHEMA_VERSION,
        timestamp: Utc::now(),
        platform: Platform::Windows,
        scanner_version: env!("CARGO_PKG_VERSION").to_string(),
        observations,
        scanner_errors: errors,
        capabilities: windows_capabilities(),
    })
}

#[cfg(target_os = "windows")]
fn enumerate_windows() -> (Vec<WindowObservation>, Vec<ScannerError>) {
    use std::collections::HashMap;
    use winapi::shared::minwindef::{BOOL, LPARAM};
    use winapi::shared::windef::HWND;
    use winapi::um::winuser::EnumWindows;

    struct Collector {
        hwnds: Vec<isize>,
    }

    unsafe extern "system" fn callback(hwnd: HWND, lparam: LPARAM) -> BOOL {
        let collector = &mut *(lparam as *mut Collector);
        collector.hwnds.push(hwnd as isize);
        1 // TRUE: continue
    }

    let mut collector = Collector { hwnds: Vec::new() };
    let ok = unsafe {
        EnumWindows(Some(callback), &mut collector as *mut _ as LPARAM)
    };

    let mut observations = Vec::new();
    let mut errors: Vec<ScannerError> = Vec::new();

    if ok == 0 {
        let err_code = unsafe { winapi::um::errhandlingapi::GetLastError() };
        errors.push(ScannerError {
            error_type: ScannerErrorType::EnumerationFailed,
            message: format!(
                "EnumWindows failed with OS error {}. Partial results may follow.",
                err_code
            ),
            window_id: None,
            api_call: Some("EnumWindows".into()),
            os_error_code: Some(err_code as i32),
        });
    }

    let mut exe_cache: HashMap<u32, Option<String>> = HashMap::new();

    for hwnd_raw in collector.hwnds {
        let hwnd = hwnd_raw as winapi::shared::windef::HWND;
        let window_id = format!("hwnd-{:#010x}", hwnd_raw as u64);

        match observe_window(hwnd, &mut exe_cache) {
            Ok(obs) => observations.push(obs),
            Err(e) => {
                errors.push(ScannerError {
                    error_type: ScannerErrorType::Unknown,
                    message: format!("Error processing {}: {}", window_id, e),
                    window_id: Some(window_id),
                    api_call: None,
                    os_error_code: None,
                });
            }
        }
    }

    (observations, errors)
}

#[cfg(target_os = "windows")]
fn observe_window(
    hwnd: winapi::shared::windef::HWND,
    exe_cache: &mut std::collections::HashMap<u32, Option<String>>,
) -> Result<WindowObservation> {
    use winapi::um::winuser::{
        GetWindowLongW, GetWindowThreadProcessId, IsWindowVisible, GWL_EXSTYLE,
        WS_EX_TOPMOST,
    };

    let window_id = format!("hwnd-{:#010x}", hwnd as u64);
    let is_visible = unsafe { IsWindowVisible(hwnd) != 0 };

    let ex_style = unsafe { GetWindowLongW(hwnd, GWL_EXSTYLE) } as u32;
    let always_on_top = ObservedValue::Confirmed((ex_style & WS_EX_TOPMOST) != 0);

    let mut pid: u32 = 0;
    unsafe { GetWindowThreadProcessId(hwnd, &mut pid) };

    let exe_path = exe_cache
        .entry(pid)
        .or_insert_with(|| query_exe_path(pid));

    let process_name = match exe_path {
        Some(path) => {
            let name = std::path::Path::new(path)
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("unknown")
                .to_lowercase();
            ObservedValue::Confirmed(name)
        }
        None => ObservedValue::PermissionDenied,
    };

    let capture_affinity = read_capture_affinity(hwnd);

    Ok(WindowObservation {
        window_id,
        process_name,
        executable_hash: ObservedValue::Unsupported,
        capture_affinity,
        always_on_top,
        opacity: ObservedValue::Unsupported,
        owner_process_id: ObservedValue::Confirmed(pid),
        is_visible: ObservedValue::Confirmed(is_visible),
        source_api: "EnumWindows/GetWindowLongW/GetWindowDisplayAffinity".into(),
    })
}

#[cfg(target_os = "windows")]
fn query_exe_path(pid: u32) -> Option<String> {
    use winapi::um::handleapi::CloseHandle;
    use winapi::um::processthreadsapi::OpenProcess;
    use winapi::um::psapi::GetModuleFileNameExW;
    use winapi::um::winnt::PROCESS_QUERY_LIMITED_INFORMATION;

    unsafe {
        let handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid);
        if handle.is_null() {
            return None;
        }
        let mut buf = vec![0u16; 1024];
        let len = GetModuleFileNameExW(
            handle,
            std::ptr::null_mut(),
            buf.as_mut_ptr(),
            buf.len() as u32,
        );
        CloseHandle(handle);
        if len == 0 {
            return None;
        }
        Some(String::from_utf16_lossy(&buf[..len as usize]))
    }
}

/// Reads WDA_* for this window.
///
/// IMPORTANT: For windows owned by another process, this will return WDA_NONE
/// due to the OS cross-process restriction. The returned value is still reported
/// but should be interpreted with the `requires_elevation` capability flag in mind.
#[cfg(target_os = "windows")]
fn read_capture_affinity(hwnd: winapi::shared::windef::HWND) -> ObservedValue<CaptureAffinity> {
    // GetWindowDisplayAffinity is in user32.dll; declare it manually for winapi crate.
    use winapi::shared::minwindef::UINT;
    use winapi::shared::windef::HWND as HWND_T;
    use winapi::um::errhandlingapi::GetLastError;

    extern "system" {
        fn GetWindowDisplayAffinity(hWnd: HWND_T, pdwAffinity: *mut UINT) -> winapi::shared::minwindef::BOOL;
    }

    const WDA_NONE: u32 = 0x00000000;
    const WDA_MONITOR: u32 = 0x00000001;
    const WDA_EXCLUDEFROMCAPTURE: u32 = 0x00000011;

    let mut affinity: u32 = 0;
    let success = unsafe { GetWindowDisplayAffinity(hwnd, &mut affinity) };

    if success == 0 {
        let err = unsafe { GetLastError() };
        if err == 5 {
            // ERROR_ACCESS_DENIED — cross-process restriction.
            return ObservedValue::PermissionDenied;
        }
        log::debug!("GetWindowDisplayAffinity failed: OS error {}", err);
        return ObservedValue::Unknown;
    }

    let ca = match affinity {
        WDA_NONE => CaptureAffinity::None,
        WDA_MONITOR => CaptureAffinity::MonitorOnly,
        WDA_EXCLUDEFROMCAPTURE => CaptureAffinity::ExcludeFromCapture,
        other => CaptureAffinity::UnrecognizedValue(other),
    };

    ObservedValue::Confirmed(ca)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scan_returns_valid_result() {
        let result = scan_platform().expect("scan should succeed");
        assert_eq!(result.schema_version, SCHEMA_VERSION);
        assert_eq!(result.platform, Platform::Windows);
        assert!(!result.scanner_version.is_empty());
        // Serializes without error.
        let json = serde_json::to_string(&result).expect("serialize");
        assert!(!json.is_empty());
    }

    #[test]
    fn test_capture_affinity_limitation_documented_in_capabilities() {
        let result = scan_platform().expect("scan");
        assert_eq!(
            result.capabilities.capture_affinity_inspection,
            CapabilityStatus::RequiresElevation,
            "Must report RequiresElevation to signal cross-process limitation"
        );
    }

    #[test]
    fn test_window_ids_are_unique() {
        let result = scan_platform().expect("scan");
        let mut ids = std::collections::HashSet::new();
        for obs in &result.observations {
            assert!(
                ids.insert(obs.window_id.clone()),
                "Duplicate window_id: {}",
                obs.window_id
            );
        }
    }

    #[test]
    fn test_no_observation_has_fabricated_false_for_unknown() {
        let result = scan_platform().expect("scan");
        // Opacity must never be Confirmed(false) — it's Unsupported on Windows.
        for obs in &result.observations {
            assert!(
                !matches!(&obs.opacity, ObservedValue::Confirmed(_)),
                "Opacity should be Unsupported on Windows, not a fabricated value"
            );
        }
    }
}
