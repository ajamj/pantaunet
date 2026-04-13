# Pantaunet - Internet Usage Monitor

## What This Is

**Pantaunet** (from Indonesian: "pantau" = monitor + "net" = internet) is a cross-platform desktop application for monitoring per-application internet usage. The core value proposition is helping users understand which applications consume their internet bandwidth, with real-time monitoring, usage alerts, and optional app blocking.

## Problem Statement

Users frequently experience unexpected internet quota exhaustion without knowing which applications are responsible. Current tools either show only aggregate network stats (not per-app) or require complex setup. There is a need for a simple, user-friendly tool that:

1. Shows which applications are using internet and how much data
2. Provides real-time speed monitoring (numbers + graphics)
3. Alerts users when usage exceeds defined thresholds
4. Optionally allows blocking specific apps from internet access

## Target Users

- Home users with limited internet quotas (especially in regions with metered connections)
- Power users who want detailed network visibility
- Small business users monitoring employee internet usage
- Developers debugging network-intensive applications

## Context

- **Platform**: Cross-platform (Windows primary, Linux/macOS secondary)
- **Distribution**: Open source (GitHub)
- **License**: MIT License
- **Target audience**: General consumers and power users worldwide
- **Support**: English as primary language (with i18n framework)

## Requirements

### Active

- [x] **REQ-01**: Display per-application network usage (upload/download bytes per app)
- [x] **REQ-02**: Real-time internet speed monitoring (download/upload speeds in UI)
- [x] **REQ-03**: Taskbar/system tray speed display (numbers, not just graphs)
- [x] **REQ-04**: Configurable usage notifications (alert when X GB used in Y hours)
- [ ] **REQ-05**: Visualize network usage over time (graphs/charts) - *Planned for v2*
- [x] **REQ-06**: System tray residence with quick-access menu
- [x] **REQ-07**: Dark/light theme support
- [x] **REQ-08**: Landing page website (deployment to GitHub Pages)
- [ ] **REQ-09**: Application allow/block list (optional firewall integration) - *Deferred to v2*
- [x] **REQ-10**: Export usage data (CSV/JSON for analysis)

### Table Stakes (Must Have)

- Per-process network monitoring (Windows: via system APIs like PDH, Linux/macOS: /proc or libpcap)
- Real-time speed in numbers (taskbar tray: "↓ 5.2 MB/s ↑ 1.1 MB/s")        
- Usage notifications (system notifications when threshold exceeded)
- Cross-platform binary builds

### Differentiators

- **Per-app usage**: Unlike Traffic Monitor (Windows-only) or Netdata (server-focused), Pantaunet focuses on end-user per-app visibility
- **Taskbar numbers**: Most tools only show graphs, not numeric speeds in taskbar
- **Simple UX**: Unlike Wireshark/TCPview which are technical, Pantaunet is consumer-friendly

### Out of Scope

- [ ] **Deep packet inspection** — Out of scope: Uses aggregate network stats per process, not packet-level analysis ([security and complexity])
- [ ] **VPN/firewall application blocking** — Out of scope: Basic block list only ([requires admin elevation, adds complexity])
- [ ] **Mobile (iOS/Android)** — Out of scope: Desktop-only for v1 ([different architecture])
- [ ] **Server monitoring** — Out of scope: Single-user desktop focus ([enterprise needs differ])

## Key Decisions

| Decision | Rationale | Outcome |
|---------|---------|--------|
| Tauri with React/TypeScript | Modern cross-platform with small binaries (~10MB vs 150MB Electron). Rust backend for OS API access. | Cross-platform support | 
| Per-app monitoring via Windows PDH API | Windows Performance Data Helpers (PDH) provide accurate per-process counters without admin rights. | Reliable Windows stats |    
| MIT License | Permissive for maximum adoption, easier for commercial use. | Open source friendly |
| GitHub Pages for landing | Free hosting, integrates with GitHub workflow. | Single deployment pipeline |
| Image/ab_glyph for Tray Icon | Allows rendering dynamic text (speed) into a tray icon bitmap. | Real-time tray numbers |

## Dependencies

### Technical Stack

- **Framework**: Tauri v2 (Rust backend + WebView2 frontend)
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts or Chart.js
- **Icons**: Lucide React
- **i18n**: react-i18next

### Research References

- **Sniffnet**: 33K stars, Rust + iced GUI, good reference for cross-platform Rust UI
- **Traffic Monitor**: 35K stars, Windows taskbar integration reference
- **Process monitor**: Sysinternals reference for process APIs

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

*Last updated: 2026-04-13*
*Milestone: v2.1.0 (Released)*
