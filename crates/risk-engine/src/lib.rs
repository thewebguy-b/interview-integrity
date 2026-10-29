/// risk-engine: Deterministic, explainable signal classification.
///
/// Each rule produces a RuleResult with a risk category, rule identifier,
/// evidence list, plain-language explanation, and known limitations.
///
/// IMPORTANT: No result in this engine claims to prove misconduct.
/// All results are signals for human review.

use chrono::{DateTime, Utc};
use event_schema::{CaptureAffinity, ObservedValue, WindowObservation};
use serde::{Deserialize, Serialize};
use thiserror::Error;

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

/// Risk category assigned to an observation.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RiskCategory {
    /// No suspicious signals detected or all signals are allowlisted.
    Clear,
    /// Low-priority signal; may warrant logging but not immediate action.
    Low,
    /// Medium-priority signal; warrants interviewer attention.
    Medium,
    /// High-priority signal; multiple independent indicators warrant prompt review.
    High,
    /// Operational issue (not a candidate-risk classification).
    Operational,
}

/// Evidence quality for a particular reading.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EvidenceQuality {
    /// The OS API confirmed the value for a window owned by this process.
    ConfirmedOwnProcess,
    /// The OS API returned a value but cross-process restriction may apply.
    LimitedCrossProcess,
    /// The value could not be determined.
    Unavailable,
}

/// A piece of evidence used to evaluate a rule.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Evidence {
    pub field: String,
    pub value: String,
    pub quality: EvidenceQuality,
    pub source_api: String,
}

/// The result of evaluating one observation against all rules.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuleResult {
    pub window_id: String,
    pub process_name: String,
    pub category: RiskCategory,
    pub rule_id: String,
    pub evidence: Vec<Evidence>,
    pub explanation: String,
    pub limitations: Vec<String>,
    pub allowlist_matched: bool,
    pub evaluated_at: DateTime<Utc>,
}

/// Allowlist entry. Only normalized executable name matching is supported.
/// No broad wildcards are permitted.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AllowlistEntry {
    /// Normalized (lowercase, no path) executable name, e.g. "zoom.exe".
    pub normalized_name: String,
    /// Optional SHA-256 hash for stronger verification.
    pub executable_hash: Option<String>,
    /// Human-readable reason for this allowlist entry.
    pub reason: String,
}

/// Errors from the risk engine.
#[derive(Debug, Error)]
pub enum RiskEngineError {
    #[error("Allowlist entry missing required field: {0}")]
    InvalidAllowlistEntry(String),
}

// ─────────────────────────────────────────────────────────────────────────────
// Core evaluation function
// ─────────────────────────────────────────────────────────────────────────────

/// Evaluate a single window observation against the allowlist and risk rules.
///
/// Returns a RuleResult with a deterministic, explainable classification.
/// Unknown or unsupported values never trigger unsupported conclusions.
pub fn evaluate_observation(
    observation: &WindowObservation,
    allowlist: &[AllowlistEntry],
) -> RuleResult {
    let process_name = observation
        .process_name
        .as_confirmed()
        .cloned()
        .unwrap_or_else(|| "unknown".to_string());

    let allowlist_matched = is_allowlisted(observation, allowlist);

    // Collect independently verified signals.
    let capture_signal = evaluate_capture_affinity(observation);
    let topmost_signal = evaluate_always_on_top(observation);

    // Apply rules in priority order.
    let result = if let Some(capture) = capture_signal {
        if allowlist_matched {
            // Rule R001: Allowlisted capture affinity — low priority.
            RuleResult {
                window_id: observation.window_id.clone(),
                process_name: process_name.clone(),
                category: RiskCategory::Low,
                rule_id: "R001".into(),
                evidence: vec![capture],
                explanation: format!(
                    "A capture-exclusion property was observed for '{}', but this application \
                     is on the allowlist. No action required unless the allowlist entry is incorrect.",
                    process_name
                ),
                limitations: capture_affinity_limitations(),
                allowlist_matched: true,
                evaluated_at: Utc::now(),
            }
        } else if topmost_signal.is_some() {
            // Rule R003: Capture affinity + always-on-top — high priority for human review.
            let mut evidence = vec![capture];
            if let Some(top) = topmost_signal {
                evidence.push(top);
            }
            RuleResult {
                window_id: observation.window_id.clone(),
                process_name: process_name.clone(),
                category: RiskCategory::High,
                rule_id: "R003".into(),
                evidence,
                explanation: format!(
                    "Two independent indicators were observed for '{}': a capture-exclusion \
                     property and always-on-top positioning. Both signals were independently \
                     verified. This combination warrants immediate interviewer review. \
                     These indicators do not prove misconduct; they are signals for human judgment.",
                    process_name
                ),
                limitations: capture_affinity_limitations(),
                allowlist_matched: false,
                evaluated_at: Utc::now(),
            }
        } else {
            // Rule R002: Capture affinity only — medium priority.
            RuleResult {
                window_id: observation.window_id.clone(),
                process_name: process_name.clone(),
                category: RiskCategory::Medium,
                rule_id: "R002".into(),
                evidence: vec![capture],
                explanation: format!(
                    "A capture-exclusion property was observed for '{}'. This application is \
                     not on the allowlist. Capture-exclusion properties can be set by legitimate \
                     applications (e.g. password managers). This is a signal for interviewer \
                     attention, not a conclusion about misconduct.",
                    process_name
                ),
                limitations: capture_affinity_limitations(),
                allowlist_matched: false,
                evaluated_at: Utc::now(),
            }
        }
    } else {
        // Rule R000: No significant signals.
        RuleResult {
            window_id: observation.window_id.clone(),
            process_name: process_name.clone(),
            category: RiskCategory::Clear,
            rule_id: "R000".into(),
            evidence: vec![],
            explanation: format!(
                "No capture-exclusion signals detected for '{}'. Note: the absence of a \
                 signal does not guarantee the window is not excluded from capture — the \
                 scanner cannot inspect all window properties across all processes.",
                process_name
            ),
            limitations: vec![
                "Cross-process capture affinity inspection is not supported by the OS API.".into(),
                "Windows owned by other processes may have undisclosed properties.".into(),
            ],
            allowlist_matched,
            evaluated_at: Utc::now(),
        }
    };

    result
}

// ─────────────────────────────────────────────────────────────────────────────
// Signal helpers
// ─────────────────────────────────────────────────────────────────────────────

fn evaluate_capture_affinity(obs: &WindowObservation) -> Option<Evidence> {
    match &obs.capture_affinity {
        ObservedValue::Confirmed(CaptureAffinity::ExcludeFromCapture) => Some(Evidence {
            field: "captureAffinity".into(),
            value: "WDA_EXCLUDEFROMCAPTURE".into(),
            quality: EvidenceQuality::ConfirmedOwnProcess,
            source_api: obs.source_api.clone(),
        }),
        ObservedValue::Confirmed(CaptureAffinity::MonitorOnly) => Some(Evidence {
            field: "captureAffinity".into(),
            value: "WDA_MONITOR".into(),
            quality: EvidenceQuality::LimitedCrossProcess,
            source_api: obs.source_api.clone(),
        }),
        // WDA_NONE, Unsupported, PermissionDenied, Unknown → no signal.
        _ => None,
    }
}

fn evaluate_always_on_top(obs: &WindowObservation) -> Option<Evidence> {
    match &obs.always_on_top {
        ObservedValue::Confirmed(true) => Some(Evidence {
            field: "alwaysOnTop".into(),
            value: "true (WS_EX_TOPMOST)".into(),
            quality: EvidenceQuality::ConfirmedOwnProcess,
            source_api: obs.source_api.clone(),
        }),
        _ => None,
    }
}

fn is_allowlisted(obs: &WindowObservation, allowlist: &[AllowlistEntry]) -> bool {
    let proc_name = match obs.process_name.as_confirmed() {
        Some(n) => n.to_lowercase(),
        None => return false,
    };

    for entry in allowlist {
        let normalized = entry.normalized_name.to_lowercase();
        if proc_name == normalized {
            // If a hash is specified, verify it.
            if let Some(ref expected_hash) = entry.executable_hash {
                if let Some(actual_hash) = obs.executable_hash.as_confirmed() {
                    return actual_hash == expected_hash;
                }
                // Hash required but unavailable — do not allowlist.
                return false;
            }
            return true;
        }
    }
    false
}

fn capture_affinity_limitations() -> Vec<String> {
    vec![
        "GetWindowDisplayAffinity (Windows) can only read properties of windows owned by this process. \
         Cross-process inspection is not permitted by the OS API."
            .into(),
        "On macOS, kCGWindowSharingState does not confirm capture-exclusion API usage.".into(),
        "A capture-exclusion property may be set by legitimate software (password managers, \
         security tools, DRM-protected content)."
            .into(),
        "The absence of a detected signal does not guarantee the window is not excluded \
         from capture in the actual screen-sharing session."
            .into(),
    ]
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use event_schema::{CaptureAffinity, ObservedValue, WindowObservation};

    fn base_obs(id: &str) -> WindowObservation {
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

    fn exclude_obs(proc: &str) -> WindowObservation {
        WindowObservation {
            process_name: ObservedValue::Confirmed(proc.to_string()),
            capture_affinity: ObservedValue::Confirmed(CaptureAffinity::ExcludeFromCapture),
            ..base_obs("hwnd-test")
        }
    }

    fn topmost_exclude_obs(proc: &str) -> WindowObservation {
        WindowObservation {
            process_name: ObservedValue::Confirmed(proc.to_string()),
            capture_affinity: ObservedValue::Confirmed(CaptureAffinity::ExcludeFromCapture),
            always_on_top: ObservedValue::Confirmed(true),
            ..base_obs("hwnd-test")
        }
    }

    // ── R000: Clear ──────────────────────────────────────────────────────────

    #[test]
    fn test_r000_clear_no_signals() {
        let obs = base_obs("hwnd-1");
        let result = evaluate_observation(&obs, &[]);
        assert_eq!(result.rule_id, "R000");
        assert_eq!(result.category, RiskCategory::Clear);
        assert!(result.evidence.is_empty());
        assert!(!result.allowlist_matched);
    }

    #[test]
    fn test_r000_unsupported_capture_affinity_is_clear() {
        let obs = WindowObservation {
            capture_affinity: ObservedValue::Unsupported,
            ..base_obs("hwnd-2")
        };
        let result = evaluate_observation(&obs, &[]);
        assert_eq!(result.rule_id, "R000");
        assert_eq!(result.category, RiskCategory::Clear);
    }

    #[test]
    fn test_r000_permission_denied_is_clear_not_suspicious() {
        // A PermissionDenied on capture_affinity MUST NOT trigger a risk rule.
        let obs = WindowObservation {
            capture_affinity: ObservedValue::PermissionDenied,
            ..base_obs("hwnd-3")
        };
        let result = evaluate_observation(&obs, &[]);
        assert_eq!(result.rule_id, "R000");
        assert_eq!(result.category, RiskCategory::Clear);
    }

    #[test]
    fn test_r000_unknown_capture_affinity_is_clear() {
        let obs = WindowObservation {
            capture_affinity: ObservedValue::Unknown,
            ..base_obs("hwnd-4")
        };
        let result = evaluate_observation(&obs, &[]);
        assert_eq!(result.rule_id, "R000", "Unknown values must not trigger risk rules");
    }

    // ── R001: Allowlisted ────────────────────────────────────────────────────

    #[test]
    fn test_r001_allowlisted_capture_exclusion() {
        let allowlist = vec![AllowlistEntry {
            normalized_name: "test.exe".into(),
            executable_hash: None,
            reason: "Test fixture".into(),
        }];
        let obs = exclude_obs("test.exe");
        let result = evaluate_observation(&obs, &allowlist);
        assert_eq!(result.rule_id, "R001");
        assert_eq!(result.category, RiskCategory::Low);
        assert!(result.allowlist_matched);
    }

    #[test]
    fn test_r001_allowlist_case_insensitive() {
        let allowlist = vec![AllowlistEntry {
            normalized_name: "ZOOM.EXE".into(),
            executable_hash: None,
            reason: "Meeting app".into(),
        }];
        let obs = WindowObservation {
            process_name: ObservedValue::Confirmed("zoom.exe".into()),
            capture_affinity: ObservedValue::Confirmed(CaptureAffinity::ExcludeFromCapture),
            ..base_obs("hwnd-zoom")
        };
        let result = evaluate_observation(&obs, &allowlist);
        assert_eq!(result.rule_id, "R001");
        assert!(result.allowlist_matched);
    }

    #[test]
    fn test_r001_allowlist_requires_hash_match_when_specified() {
        let allowlist = vec![AllowlistEntry {
            normalized_name: "secure-tool.exe".into(),
            executable_hash: Some("abc123".into()),
            reason: "Verified hash".into(),
        }];
        // Hash required but not available → should NOT match.
        let obs = WindowObservation {
            process_name: ObservedValue::Confirmed("secure-tool.exe".into()),
            capture_affinity: ObservedValue::Confirmed(CaptureAffinity::ExcludeFromCapture),
            executable_hash: ObservedValue::Unsupported,
            ..base_obs("hwnd-secure")
        };
        let result = evaluate_observation(&obs, &allowlist);
        assert!(!result.allowlist_matched, "Hash required but unavailable should not allowlist");
        assert_eq!(result.rule_id, "R002");
    }

    // ── R002: Medium — capture exclusion, not allowlisted ───────────────────

    #[test]
    fn test_r002_medium_capture_exclusion_not_allowlisted() {
        let obs = exclude_obs("suspicious.exe");
        let result = evaluate_observation(&obs, &[]);
        assert_eq!(result.rule_id, "R002");
        assert_eq!(result.category, RiskCategory::Medium);
        assert!(!result.allowlist_matched);
        assert!(!result.evidence.is_empty());
    }

    #[test]
    fn test_r002_explanation_contains_process_name() {
        let obs = exclude_obs("cheater-notes.exe");
        let result = evaluate_observation(&obs, &[]);
        assert!(result.explanation.contains("cheater-notes.exe"));
    }

    // ── R003: High — capture exclusion + always-on-top ───────────────────────

    #[test]
    fn test_r003_high_multiple_indicators() {
        let obs = topmost_exclude_obs("mystery.exe");
        let result = evaluate_observation(&obs, &[]);
        assert_eq!(result.rule_id, "R003");
        assert_eq!(result.category, RiskCategory::High);
        assert_eq!(result.evidence.len(), 2);
    }

    #[test]
    fn test_r003_not_triggered_without_capture_exclusion() {
        // Always-on-top alone should not trigger R003.
        let obs = WindowObservation {
            always_on_top: ObservedValue::Confirmed(true),
            capture_affinity: ObservedValue::Confirmed(CaptureAffinity::None),
            ..base_obs("hwnd-toponly")
        };
        let result = evaluate_observation(&obs, &[]);
        assert_ne!(result.rule_id, "R003");
        assert_eq!(result.category, RiskCategory::Clear);
    }

    // ── General invariants ───────────────────────────────────────────────────

    #[test]
    fn test_every_result_has_explanation() {
        let cases: Vec<WindowObservation> = vec![
            base_obs("h1"),
            exclude_obs("a.exe"),
            topmost_exclude_obs("b.exe"),
            WindowObservation {
                capture_affinity: ObservedValue::PermissionDenied,
                ..base_obs("h2")
            },
        ];
        for obs in &cases {
            let r = evaluate_observation(obs, &[]);
            assert!(!r.explanation.is_empty(), "Explanation must never be empty");
            assert!(!r.rule_id.is_empty(), "Rule ID must never be empty");
        }
    }

    #[test]
    fn test_limitations_always_present() {
        // Every high-risk result must disclose limitations.
        let obs = topmost_exclude_obs("x.exe");
        let result = evaluate_observation(&obs, &[]);
        assert!(!result.limitations.is_empty(), "High-risk results must include limitations");
    }

    #[test]
    fn test_password_manager_false_positive_scenario() {
        // 1Password, Bitwarden, etc. legitimately use capture exclusion.
        let legitimate_apps = ["1password.exe", "bitwarden.exe", "keepass.exe"];
        let allowlist: Vec<AllowlistEntry> = legitimate_apps
            .iter()
            .map(|name| AllowlistEntry {
                normalized_name: name.to_string(),
                executable_hash: None,
                reason: "Legitimate password manager with capture exclusion for security".into(),
            })
            .collect();

        for app in &legitimate_apps {
            let obs = exclude_obs(app);
            let result = evaluate_observation(&obs, &allowlist);
            assert_eq!(
                result.rule_id, "R001",
                "{} should be allowlisted to low priority",
                app
            );
            assert!(result.allowlist_matched);
        }
    }

    #[test]
    fn test_meeting_app_false_positive_scenario() {
        // Zoom and Teams may have capture-excluded sub-windows.
        let meeting_apps = ["zoom.exe", "teams.exe", "meet.exe", "slack.exe"];
        let allowlist: Vec<AllowlistEntry> = meeting_apps
            .iter()
            .map(|name| AllowlistEntry {
                normalized_name: name.to_string(),
                executable_hash: None,
                reason: "Interview platform — capture exclusion expected for self-view rendering"
                    .into(),
            })
            .collect();

        for app in &meeting_apps {
            let obs = exclude_obs(app);
            let result = evaluate_observation(&obs, &allowlist);
            assert_eq!(result.rule_id, "R001", "{} meeting app should be low priority", app);
        }
    }

    #[test]
    fn test_unknown_process_name_is_clear() {
        let obs = WindowObservation {
            process_name: ObservedValue::Unknown,
            capture_affinity: ObservedValue::Confirmed(CaptureAffinity::None),
            ..base_obs("hwnd-unknown")
        };
        let result = evaluate_observation(&obs, &[]);
        assert_eq!(result.category, RiskCategory::Clear);
    }

    #[test]
    fn test_allowlist_no_wildcards_partial_match_fails() {
        let allowlist = vec![AllowlistEntry {
            normalized_name: "zoom".into(), // Missing .exe — exact match required
            executable_hash: None,
            reason: "Test".into(),
        }];
        let obs = exclude_obs("zoom.exe");
        let result = evaluate_observation(&obs, &allowlist);
        // "zoom" != "zoom.exe" — should not match.
        assert!(!result.allowlist_matched);
        assert_eq!(result.rule_id, "R002");
    }
}
