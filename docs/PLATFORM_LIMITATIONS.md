# Platform Limitations & OS Security Boundaries

## 1. Windows Display Affinity (`SetWindowDisplayAffinity`)

### The Cross-Process Security Boundary
`SetWindowDisplayAffinity` is a Win32 API used to prevent window content from being captured in screen shares, recordings, or screenshots (`WDA_EXCLUDEFROMCAPTURE` / `WDA_MONITOR`).

While any application can set display affinity on its **own** windows, calling `GetWindowDisplayAffinity` on a window belonging to a **different process** behaves with documented security constraints in Windows 10/11:
1. `GetWindowDisplayAffinity` queries window properties stored within the Desktop Window Manager (DWM) context.
2. Cross-process queries against elevated or sandboxed processes (e.g. UAC prompts, security software) fail with `ERROR_ACCESS_DENIED` or return default values unless running with administrative privilege.
3. The scanner engine handles this boundary explicitly by recording the status as `permission_denied` or `unsupported`, rather than fabricating a false negative (`none`).

---

## 2. Linux (Wayland vs. X11)

### Wayland Protocol Boundaries
Under modern Wayland compositors (GNOME Shell, Sway, KDE Plasma 6):
- Window coordinates, titles, and cross-client window enumerations are intentionally hidden from unprivileged clients for security and privacy.
- Screen sharing is mediated exclusively via `xdg-desktop-portal` with user authorization.
- Window metadata scanner fallback operates via compositors with protocol extensions (e.g. `wlr-foreign-toplevel-management`) or returns `unsupported` status without crashing.

### X11
- Window enumeration via `_NET_CLIENT_LIST` and `_NET_ACTIVE_WINDOW` is supported.
- Display affinity flags do not exist natively in the X11 protocol.

---

## 3. macOS (Screen Recording Permissions)
- Window lists can be retrieved via `CGWindowListCopyWindowInfo`.
- Window titles and process names require explicit candidate consent under **System Preferences > Security & Privacy > Screen Recording**.
- If permission is denied, macOS returns window bounds and window IDs, but redacts the `kCGWindowName` property.
