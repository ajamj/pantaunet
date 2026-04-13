# ROADMAP.md - Pantaunet Development Roadmap

## Overview

| Metric | Value |
|--------|-------|
| **Phases** | 9 |
| **Requirements** | 24 (v1 + v1.1) |
| **Timeline** | ~12-14 weeks |

---

## Phases

- [x] **Phase 1: Project Setup** - Establish development environment with Tauri scaffold
- [ ] **Phase 2: Core Monitoring** - Implement per-application network usage monitoring in Rust
- [ ] **Phase 3: UI & Display** - Build dashboard, system tray, and theme support
- [ ] **Phase 4: Distribution** - Build installers and landing page website     
- [ ] **Phase 5: Export & Polish** - Data export and final polish
- [x] **Phase 6: Research & Scaffolding** - Dynamic icon & multi-window research
- [ ] **Phase 7: Tray Enhancements** - Enhanced tray icon & tooltip
- [ ] **Phase 8: Desktop Widget** - Floating desktop mini-window
- [ ] **Phase 9: Settings & Integration** - UI toggles & final audit

---

## Phase Details

### Phase 1: Setup âœ“
**Goal**: Establish development environment with Tauri scaffold
**Depends on**: Nothing
**Success criteria**:
1. Tauri app scaffolded with `npm create tauri-app@latest`
2. React 18 + TypeScript + Vite frontend runs
3. Rust backend compiles without errors
4. Dev server starts and shows blank window
5. `npm run build` produces Windows .exe
**Plans**:
- [x] 01-01-PLAN.md â€” Initial Project Structure

### Phase 2: Core Monitoring
**Goal**: Implement per-application network usage monitoring in Rust
**Depends on**: Phase 1
**Requirements**: MON-01, MON-02, MON-03, MON-04, MON-05
**Success criteria**:
1. Enumerate all running processes
2. Collect network bytes sent/received per process
3. Calculate real-time download speed (bytes/sec)
4. Calculate real-time upload speed (bytes/sec)
5. Show total session bandwidth (up + down)
6. Rank applications by bandwidth usage
7. Update every 1 second (configurable)
**Plans**: TBD

### Phase 3: UI & Display
**Goal**: Build dashboard, system tray, settings, and theme support
**Depends on**: Phase 2
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, NOT-01, NOT-02, NOT-03, CFG-01, CFG-02, CFG-03, CFG-04
**Success criteria**:
1. Main dashboard with speed meters
2. Application list sorted by usage
3. Real-time charts for speed history
4. System tray icon with tooltip showing current speed
5. Dark theme UI
6. Light theme UI
7. Theme toggle in settings
8. Notification when usage exceeds threshold
9. Notification when speed exceeds threshold
10. Settings panel with threshold configuration
11. Settings persist between sessions (tauri-plugin-store)
12. Theme selection in settings panel
13. Update interval configuration
**Plans**: TBD
**UI hint**: yes

### Phase 4: Distribution
**Goal**: Build installers and landing page website
**Depends on**: Phase 3
**Requirements**: DIST-01, DIST-02, DIST-03, DIST-04
**Success criteria**:
1. Windows .exe installer works
2. Windows .msi installer works
3. Linux .AppImage works
4. macOS .dmg works
5. Landing page deployed to GitHub Pages
**Plans**: TBD

### Phase 5: Export & Polish
**Goal**: Data export and final polish
**Depends on**: Phase 4
**Requirements**: EXP-01, EXP-02
**Success criteria**:
1. Export usage data to CSV
2. Export usage data to JSON
3. Final testing on all platforms
4. Version 1.0.0 release
**Plans**: TBD

### Phase 6: Research & Scaffolding âœ“
**Goal**: Research dynamic icon generation and multi-window widget scaffolding  
**Depends on**: Phase 5
**Requirements**: None
**Success Criteria**:
1. Technical approach for dynamic icon generation using `image` and `ab_glyph` implemented
2. Prototype of a secondary, undecorated window (widget base) functional        
3. Positioning logic and persistence for floating widgets completed
4. Performance baseline for frequent tray icon updates established
**Plans**:
- [x] 06-01-PLAN.md â€” Icon Rendering Research & Prototyping
- [ ] 06-02-PLAN.md â€” Multi-Window Scaffolding & Widget UI
- [ ] 06-03-PLAN.md â€” Window Events & Persistence

### Phase 7: Tray Enhancements
**Goal**: Implement dynamic tray icons and enhanced tooltips
**Depends on**: Phase 6
**Requirements**: EXP-03, EXP-05
**Success Criteria**:
1. System tray icon displays real-time speed numbers as an image (EXP-03)       
2. Tooltip displays top 3 apps by bandwidth usage on hover (EXP-05)
3. Dynamic icon color-coding (e.g. green for low, red for high usage)
4. Smooth transitions between icon updates without flickering
**Plans**:
- [ ] 07-01-PLAN.md â€” Enhanced Icon Generation
- [ ] 07-02-PLAN.md â€” Tray Monitoring Integration
- [ ] 07-03-PLAN.md â€” Dynamic Tooltips & Status
**UI hint**: yes

### Phase 8: Desktop Widget
**Goal**: Create a floating, always-on-top monitoring widget
**Depends on**: Phase 7
**Requirements**: EXP-04
**Success Criteria**:
1. Floating "Widget" window can be moved by dragging (EXP-04)
2. Widget shows real-time upload/download speeds (EXP-04)
3. Widget can be pinned "Always on Top" or made semi-transparent
4. Widget window is excluded from taskbar and Alt+Tab switcher
**Plans**: TBD
**UI hint**: yes

### Phase 9: Settings & Integration
**Goal**: Finalize feature toggles and perform integration audit
**Depends on**: Phase 8
**Requirements**: EXP-06
**Success Criteria**:
1. Settings panel includes toggles for "Show Desktop Widget" and "Dynamic Tray Icon" (EXP-06)
2. Widget visibility state persists across application restarts (EXP-06)        
3. Tray context menu includes quick-toggle for the widget
4. Final performance audit confirms <1% CPU impact from dynamic updates
**Plans**: TBD
**UI hint**: yes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Setup | 1/1 | Completed | 2026-04-12 |
| 2. Core Monitoring | 0/1 | Not started | - |
| 3. UI & Display | 0/1 | Not started | - |
| 4. Distribution | 0/1 | Not started | - |
| 5. Export & Polish | 0/1 | Not started | - |
| 6. Research & Scaffolding | 3/3 | Planned | 2026-04-13 |
| 7. Tray Enhancements | 0/3 | Not started | - |
| 8. Desktop Widget | 0/1 | Not started | - |
| 9. Settings & Integration | 0/1 | Not started | - |

---

*Created: 2026-04-12*
*Last updated: 2026-04-13*
