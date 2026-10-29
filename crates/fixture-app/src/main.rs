/// fixture-app: Test fixture for the window-scanner.
///
/// This application creates clearly labeled test windows to verify scanner behavior:
/// 1. Normal visible window
/// 2. Always-on-top window (WS_EX_TOPMOST)
/// 3. WDA_EXCLUDEFROMCAPTURE window — ONLY works for windows this process owns.
///
/// PURPOSE: Validate scanner detection for windows owned by THIS process.
/// This demonstrates the key limitation: GetWindowDisplayAffinity can only read
/// the affinity of windows in the same process. Third-party applications cannot be inspected.
///
/// The fixture displays its state in the window title and accepts keyboard commands:
/// - Press 'N' — create normal window
/// - Press 'T' — create always-on-top window
/// - Press 'E' — create WDA_EXCLUDEFROMCAPTURE window
/// - Press 'R' — reset all windows to normal
/// - Press 'Q' — quit
///
/// This fixture is explicitly named and not disguised as a third-party application.

#[cfg(target_os = "windows")]
mod windows_fixture;

#[cfg(not(target_os = "windows"))]
fn main() {
    println!("Fixture app: Windows-only. On this platform, the fixture cannot be run.");
    println!("macOS fixture would use NSWindow APIs — not implemented in this phase.");
}

#[cfg(target_os = "windows")]
fn main() {
    env_logger::init();
    windows_fixture::run();
}
