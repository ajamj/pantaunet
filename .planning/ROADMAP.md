# ROADMAP.md - Pantaunet Development Roadmap

## Overview

| Metric | Value |
|--------|-------|
| **Phases** | 20 |
| **Requirements** | 31 (v1, v1.1, v1.2, v2.1) |
| **Current Milestone** | v2.1 (Issue Resolution & Stability) |

---

## Phases

- [x] **Phase 1: Project Setup** - Establish development environment with Tauri scaffold
- [x] **Phase 2: Core Monitoring** - Implement per-application network usage monitoring in Rust
- [x] **Phase 3: UI & Display** - Build dashboard, system tray, and theme support
- [x] **Phase 4: Distribution** - Build installers and landing page website
- [x] **Phase 5: Export & Polish** - Data export and final polish   
- [x] **Phase 6: Research & Scaffolding** - Dynamic icon & multi-window research
- [x] **Phase 7: Tray Enhancements** - Enhanced tray icon & tooltip 
- [x] **Phase 8: Desktop Widget** - Floating desktop mini-window    
- [x] **Phase 9: Settings & Integration** - UI toggles & final audit
- [x] **Phase 10: Refactoring & Technical Debt** - Rust backend cleanup and unit tests
- [x] **Phase 11: UI Component Optimization** - Shared components & performance tuning
- [x] **Phase 12: Maintenance & Dependency Sync** - Update crates and npm packages
- [x] **Phase 13: Advanced Monitoring** - Accurate network-only matching via TCP/UDP
- [x] **Phase 14: Data Analytics** - SQLite integration for historical usage
- [x] **Phase 15: App Control** - Windows Firewall integration
- [x] **Phase 16: Humorous Insights** - Personality engine & localized jokes
- [ ] **Phase 17: Bug Resolution (Core Stability)** - Resolve issues #4 and #6
- [ ] **Phase 18: Code Quality & Theme Refinement** - Resolve issues #1 and #5
- [ ] **Phase 19: Dashboard & Widget Enhancements** - Resolve issues #2 and #3
- [ ] **Phase 20: CI/CD Infrastructure Hardening** - Resolve issue #7

---

## Phase Details

### Phase 17: Bug Resolution (Core Stability)
**Goal**: Resolve prioritized bugs affecting widget usability and tab navigation.
**Depends on**: Phase 16
**Success criteria**:
  1. Desktop widget is draggable from all regions (#4).
  2. "History" and "Dashboard" tabs are visually and functionally distinct (#6).
  3. Pull Requests created, CI passes, and issues closed.
**Plans**: `.planning/phases/17-PLAN.md`

### Phase 18: Code Quality & Theme Refinement
**Goal**: Clean up backend technical debt and implement requested theme changes.
**Depends on**: Phase 17
**Success criteria**:
  1. Zero compiler warnings in `src-tauri` (#1).
  2. Theme colors updated to absolute white/black (#5).
  3. Pull Requests created, CI passes, and issues closed.
**Plans**: `.planning/phases/18-PLAN.md`

### Phase 19: Dashboard & Widget Enhancements
**Goal**: Improve data density and user control in the primary UI elements.
**Depends on**: Phase 18
**Success criteria**:
  1. Desktop widget size optimized and scrollbars removed (#2).
  2. Process list includes total usage columns and interactive sorting (#3).
  3. Pull Requests created, CI passes, and issues closed.
**Plans**: `.planning/phases/19-PLAN.md`

### Phase 20: CI/CD Infrastructure Hardening
**Goal**: Establish a proactive security and stability gate via GitHub Actions.
**Depends on**: Phase 19
**Success criteria**:
  1. `ci.yml` successfully running build/test on all PRs (#7).
  2. Dependency caching implemented for faster builds.
  3. Pull Request created, CI passes, and issue closed.
**Plans**: `.planning/phases/20-PLAN.md`

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1-16 | 16/16 | Completed | 2026-04-13 |
| 17. Bug Resolution | 0/1 | Not started | - |
| 18. Code Quality | 0/1 | Not started | - |
| 19. UI Enhancements | 0/1 | Not started | - |
| 20. CI Hardening | 0/1 | Not started | - |

---

*Last updated: 2026-04-13*
*Status: Milestone v2.1 Initialized*
