# ROADMAP.md - Pantaunet Development Roadmap

## Overview

| Metric | Value |
|--------|-------|
| **Phases** | 12 |
| **Requirements** | 24 (v1 + v1.1) |
| **Current Milestone** | v1.2 (Maintenance & Refactor) |

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
- [ ] **Phase 10: Refactoring & Technical Debt** - Rust backend cleanup and unit tests
- [ ] **Phase 11: UI Component Optimization** - Shared components & performance tuning
- [ ] **Phase 12: Maintenance & Dependency Sync** - Dependency updates & prep for v2.0

---

## Phase Details

### Phase 10: Refactoring & Technical Debt
**Goal**: Clean up Rust backend and improve code quality
**Depends on**: Phase 9
**Requirements**: N/A
**Success criteria**:
  1. Monitoring logic abstracted for easier expansion (consolidated PDH calls)
  2. Centralized error handling for OS-specific monitoring APIs
  3. Unit test coverage for core monitoring logic exceeds 70%
**Plans**: TBD

### Phase 11: UI Component Optimization
**Goal**: Improve frontend performance and component reusability
**Depends on**: Phase 10
**Requirements**: N/A
**Success criteria**:
  1. Main dashboard and floating widget share a unified component library
  2. Frontend render cycles optimized for high-frequency (1s) updates
  3. Memory usage profile for the tray icon rendering engine remains < 20MB
**Plans**: TBD
**UI hint**: yes

### Phase 12: Maintenance & Dependency Sync
**Goal**: Update dependencies and prepare for v2.0
**Depends on**: Phase 11
**Requirements**: N/A
**Success criteria**:
  1. All Rust crates and NPM packages updated to latest stable versions
  2. Full build & installer generation verified on Windows, Linux, and macOS
  3. CHANGELOG and internal documentation updated for v1.2 release
**Plans**: TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Setup | 1/1 | Completed | 2026-04-12 |
| 2. Core Monitoring | 1/1 | Completed | 2026-04-12 |
| 3. UI & Display | 1/1 | Completed | 2026-04-12 |
| 4. Distribution | 1/1 | Completed | 2026-04-12 |
| 5. Export & Polish | 1/1 | Completed | 2026-04-13 |
| 6. Research & Scaffolding | 3/3 | Completed | 2026-04-13 |
| 7. Tray Enhancements | 3/3 | Completed | 2026-04-13 |
| 8. Desktop Widget | 2/2 | Completed | 2026-04-13 |
| 9. Settings & Integration | 1/1 | Completed | 2026-04-13 |
| 10. Refactoring | 0/1 | Not started | - |
| 11. Optimization | 0/1 | Not started | - |
| 12. Maintenance | 0/1 | Not started | - |

---

*Last updated: 2026-04-13*
*Status: Roadmap expanded to v1.2*
