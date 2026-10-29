/// Windows fixture using winapi crate.
/// Creates labeled test windows to verify scanner detection capabilities.
///
/// This application is explicitly NOT disguised as a third-party application.
/// It creates clearly labeled "[FIXTURE]" windows.
///
/// KEY DEMONSTRATION: The fixture proves that GetWindowDisplayAffinity CAN
/// detect WDA_EXCLUDEFROMCAPTURE — but ONLY for windows owned by this process.
/// Third-party windows cannot be inspected cross-process.

use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;
use winapi::{
    shared::{
        minwindef::{LPARAM, LRESULT, UINT, WPARAM},
        windef::HWND,
    },
    um::{
        libloaderapi::GetModuleHandleW,
        winuser::{
            CreateWindowExW, DefWindowProcW, DispatchMessageW, GetMessageW, PostQuitMessage,
            RegisterClassW, SetWindowLongW, SetWindowPos, ShowWindow,
            TranslateMessage, CS_HREDRAW, CS_VREDRAW, GWL_EXSTYLE, HWND_TOPMOST, MSG,
            SW_SHOW, SWP_NOMOVE, SWP_NOSIZE,
            WM_DESTROY, WNDCLASSW, WS_EX_TOPMOST, WS_OVERLAPPEDWINDOW,
        },
        wingdi::{GetStockObject, WHITE_BRUSH},
    },
};

// WDA_EXCLUDEFROMCAPTURE = 0x11 — not exported by winapi crate; defined manually.
const WDA_EXCLUDEFROMCAPTURE: u32 = 0x00000011;

// SetWindowDisplayAffinity declared manually (winapi crate doesn't export it).
extern "system" {
    fn SetWindowDisplayAffinity(hWnd: HWND, dwAffinity: u32) -> i32;
}

fn to_wide(s: &str) -> Vec<u16> {
    OsStr::new(s).encode_wide().chain(std::iter::once(0)).collect()
}

pub fn run() {
    unsafe {
        let class_name = to_wide("IntegrityFixture");
        let hinstance = GetModuleHandleW(std::ptr::null());

        let wc = WNDCLASSW {
            style: CS_HREDRAW | CS_VREDRAW,
            lpfnWndProc: Some(window_proc),
            hInstance: hinstance,
            lpszClassName: class_name.as_ptr(),
            hbrBackground: GetStockObject(WHITE_BRUSH as i32) as _,
            ..std::mem::zeroed()
        };

        if RegisterClassW(&wc) == 0 {
            eprintln!("[FIXTURE] Failed to register window class");
            return;
        }

        // Create the control window.
        let title_main = to_wide("[FIXTURE] Interview Integrity Scanner Test — Controls in stderr log");
        let hwnd_main = CreateWindowExW(
            0,
            class_name.as_ptr(),
            title_main.as_ptr(),
            WS_OVERLAPPEDWINDOW,
            50, 50, 750, 100,
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            hinstance,
            std::ptr::null_mut(),
        );

        if hwnd_main.is_null() {
            eprintln!("[FIXTURE] Failed to create main window");
            return;
        }
        ShowWindow(hwnd_main, SW_SHOW);

        // Normal window — no special properties.
        let _hwnd_normal = create_window(
            class_name.as_ptr(),
            "[FIXTURE] Normal Window — WDA_NONE, no WS_EX_TOPMOST",
            hinstance,
            200, 180, 550, 80,
        );

        // Always-on-top window — WS_EX_TOPMOST via SetWindowLongW.
        let hwnd_topmost = create_window(
            class_name.as_ptr(),
            "[FIXTURE] Always-On-Top Window — WS_EX_TOPMOST set",
            hinstance,
            200, 280, 550, 80,
        );

        if let Some(hwnd) = hwnd_topmost {
            let ex = winapi::um::winuser::GetWindowLongW(hwnd, GWL_EXSTYLE) as u32;
            SetWindowLongW(hwnd, GWL_EXSTYLE, (ex | WS_EX_TOPMOST) as i32);
            SetWindowPos(
                hwnd, HWND_TOPMOST,
                0, 0, 0, 0,
                SWP_NOMOVE | SWP_NOSIZE,
            );
            eprintln!("[FIXTURE] WS_EX_TOPMOST applied to topmost window");
        }

        // Capture-excluded window — WDA_EXCLUDEFROMCAPTURE applied.
        let hwnd_exclude = create_window(
            class_name.as_ptr(),
            "[FIXTURE] Capture-Excluded Window — WDA_EXCLUDEFROMCAPTURE (this-process only)",
            hinstance,
            200, 380, 700, 80,
        );

        if let Some(hwnd) = hwnd_exclude {
            let result = SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE);
            if result != 0 {
                eprintln!(
                    "[FIXTURE] WDA_EXCLUDEFROMCAPTURE applied successfully."
                );
                eprintln!(
                    "[FIXTURE] The scanner CAN read this value because it owns this window."
                );
                eprintln!(
                    "[FIXTURE] CRITICAL: Third-party windows (Zoom, Chrome, etc.) CANNOT be"
                );
                eprintln!(
                    "[FIXTURE]           read cross-process. This is an OS security boundary."
                );
            } else {
                let err = winapi::um::errhandlingapi::GetLastError();
                eprintln!("[FIXTURE] Failed to apply WDA_EXCLUDEFROMCAPTURE: error {}", err);
            }
        }

        eprintln!("[FIXTURE] 3 test windows created. Run window-scanner --pretty to observe.");
        eprintln!("[FIXTURE] Close any window to exit.");

        let mut msg: MSG = std::mem::zeroed();
        while GetMessageW(&mut msg, std::ptr::null_mut(), 0, 0) > 0 {
            TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }
    }
}

unsafe fn create_window(
    class_name: *const u16,
    title: &str,
    hinstance: winapi::shared::minwindef::HINSTANCE,
    x: i32, y: i32, w: i32, h: i32,
) -> Option<HWND> {
    let title_wide = to_wide(title);
    let hwnd = CreateWindowExW(
        0,
        class_name,
        title_wide.as_ptr(),
        WS_OVERLAPPEDWINDOW,
        x, y, w, h,
        std::ptr::null_mut(),
        std::ptr::null_mut(),
        hinstance,
        std::ptr::null_mut(),
    );
    if hwnd.is_null() {
        return None;
    }
    ShowWindow(hwnd, SW_SHOW);
    Some(hwnd)
}

unsafe extern "system" fn window_proc(
    hwnd: HWND,
    msg: UINT,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    match msg {
        WM_DESTROY => {
            PostQuitMessage(0);
            0
        }
        _ => DefWindowProcW(hwnd, msg, wparam, lparam),
    }
}
