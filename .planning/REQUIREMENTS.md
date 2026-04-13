# REQUIREMENTS.md - Pantaunet Requirements

## v1 Requirements

### Network Monitoring
- [x] **MON-01**: Display per-application network usage (upload/download bytes in MB/GB)
- [x] **MON-02**: Show real-time download speed (e.g., "↓ 5.2 MB/s")
- [x] **MON-03**: Show real-time upload speed (e.g., "↓ 1.1 MB/s")
- [x] **MON-04**: Display total session bandwidth used (upload + download)
- [x] **MON-05**: Rank applications by bandwidth consumption       

### User Interface
- [x] **UI-01**: Main dashboard with speed meters and app list     
- [x] **UI-02**: System tray icon with quick stats in tooltip      
- [x] **UI-03**: Dark theme support (dark mode)
- [x] **UI-04**: Light theme support
- [x] **UI-05**: Responsive layout for different window sizes      

### Notifications
- [x] **NOT-01**: System notification when total usage exceeds threshold
- [x] **NOT-02**: System notification when speed exceeds threshold 
- [x] **NOT-03**: Configurable notification thresholds in settings 

### Configuration
- [x] **CFG-01**: Settings panel for notification thresholds       
- [x] **CFG-02**: Settings panel for theme selection
- [x] **CFG-03**: Settings panel for update interval (1s default)  
- [x] **CFG-04**: Persist settings between sessions

### Distribution
- [x] **DIST-01**: Windows .exe/.msi installer
- [x] **DIST-02**: Linux .AppImage portable
- [x] **DIST-03**: macOS .dmg installer
- [x] **DIST-04**: Landing page website (GitHub Pages)

### Export
- [x] **EXP-01**: Export usage data to CSV
- [x] **EXP-02**: Export usage data to JSON

---

## v1.1 Advanced Windows Integration

- [x] **EXP-03**: Real-time dynamic tray icon showing download/upload speed as a number or mini-graph
- [x] **EXP-04**: Floating desktop widget (mini-window) for constant "always-on-top" monitoring
- [x] **EXP-05**: Enhanced tray tooltip showing the top 3 bandwidth-consuming applications in real-time
- [x] **EXP-06**: User toggles in Settings for dynamic tray icon and desktop widget features

---

## v1.2 Maintenance & Refactor

- [x] **REF-01**: Refactor Rust monitoring logic to use trait-based provider pattern
- [x] **OPT-01**: Consolidate shared React components between dashboard and widget
- [x] **OPT-02**: Optimize tray icon rendering to reduce CPU usage below 0.5%

---

## v2.1 Issue Resolution & Stability

- [ ] **ISS-01**: Fix: Desktop widget is not draggable (#4)
- [ ] **ISS-02**: Fix: Distinguish dashboard and history views (#6)
- [ ] **ISS-03**: Refactor: Fix dead code and unused variable warnings in Rust backend (#1)
- [ ] **ISS-04**: Refactor: Update theme colors to pure white (light) and pure black (dark) (#5)
- [ ] **ISS-05**: UI: Optimize desktop widget sizing and remove scrollbars (#2)
- [ ] **ISS-06**: Feat: Add total usage columns and sorting to process list (#3)
- [ ] **ISS-07**: CI: Audit and harden GitHub Actions workflows (#7)

---

## v2 Requirements (Deferred)
- [ ] **BLK-01**: Block application internet access (firewall integration)
- [ ] **ALW-02**: Allow specific apps only
- [ ] **HIS-03**: Historical usage data (daily/weekly/monthly)     
- [ ] **REP-04**: Usage reports with charts
- [ ] **HUM-01**: Process categorization (Games, Work, Media, etc.)
- [ ] **HUM-02**: Threshold-based personality engine (triggers jokes)
- [ ] **HUM-03**: Localized humorous insights (English & Indonesian)

---

## Out of Scope
- **Deep packet inspection** — Uses aggregate per-process stats, not packet-level ([security, complexity])
- **VPN-based blocking** — Requires admin, adds significant complexity ([scope])
- **Mobile (iOS/Android)** — Desktop-only for v1 ([different architecture])
- **Server monitoring** — Focus on single-user desktop ([scope]) 
- **Multi-user network monitoring** — Complex, enterprise-focused ([scope])

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MON-01 through MON-05 | Phase 2 | Complete |
| UI-01 through UI-05 | Phase 3 | Complete |
| NOT-01 through NOT-03 | Phase 3 | Complete |
| CFG-01 through CFG-04 | Phase 3 | Complete |
| DIST-01 through DIST-04 | Phase 4 | Complete |
| EXP-01, EXP-02 | Phase 5 | Complete |
| EXP-03 | Phase 7 | Complete |
| EXP-04 | Phase 8 | Complete |
| EXP-05 | Phase 7 | Complete |
| EXP-06 | Phase 9 | Complete |
| REF-01 | Phase 10 | Complete |
| OPT-01 | Phase 11 | Complete |
| OPT-02 | Phase 11 | Complete |
| BLK-01, ALW-02 | Phase 15 | Pending |
| HIS-03, REP-04 | Phase 14 | Pending |
| HUM-01 through HUM-03 | Phase 16 | Pending |
| ISS-01, ISS-02 | Phase 17 | Complete |
| ISS-03, ISS-04 | Phase 18 | Complete |
| ISS-05, ISS-06 | Phase 19 | Complete |
| ISS-07 | Phase 20 | Complete |

---

*Created: 2026-04-12*
*Last updated: 2026-04-13*
