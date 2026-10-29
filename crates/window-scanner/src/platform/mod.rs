/// platform: Dispatches to the OS-specific scanner implementation.
///
/// Each platform module must expose a `scan_platform()` function returning
/// a `ScanResult`. Platform differences are isolated here; the event schema
/// remains shared.

use anyhow::Result;
use event_schema::ScanResult;

#[cfg(target_os = "windows")]
mod windows;

#[cfg(target_os = "macos")]
mod macos;

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
mod unsupported;

/// Run a single scan on the current platform.
pub fn scan() -> Result<ScanResult> {
    #[cfg(target_os = "windows")]
    {
        windows::scan_platform()
    }
    #[cfg(target_os = "macos")]
    {
        macos::scan_platform()
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        unsupported::scan_platform()
    }
}
