## Bug Fix: AI Cheating Detection Now Works Correctly

### What was broken
The native Rust window scanner was returning ~294 empty window objects with no process names. The old code immediately returned these empty results, completely skipping the keyword-based detection for AI cheating tools like Copilot, ChatGPT, etc. This is why the dashboard always showed "Clear / No Anomalies" even when cheating tools were running.

### What is fixed
- tasklist process scanner now always runs FIRST as the primary detection layer
- Native scanner is now supplemental only (used only if it returns actual process names)
- Added more detection keywords: claude, gemini, gpt, openai, screenpipe, perplexity
- Added console logging so you can see detection results in the agent terminal window

### What you will now see
- When copilotapp.exe or any AI assistant is running during an interview, the dashboard will show High Risk Detected
- The Window Focus tab will list all running windowed processes with names and titles
- Suspicious apps trigger suspicious_window_flagged events with severity: high
