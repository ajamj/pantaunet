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
| 10. Refactoring | 1/1 | Completed | 2026-04-13 |
| 11. Optimization | 1/1 | Completed | 2026-04-13 |
| 12. Maintenance | 1/1 | Completed | 2026-04-13 |
| 13. Advanced Monitoring | 1/1 | Completed | 2026-04-13 |
| 14. Data Analytics | 1/1 | Completed | 2026-04-13 |
| 15. App Control | 1/1 | Completed | 2026-04-13 |
| 16. Humorous Insights | 0/1 | Not started | - |

---

## Phase Details

### Phase 13: Advanced Monitoring (ETW)
**Goal**: Achieve 100% network-only monitoring accuracy on Windows
**Depends on**: Phase 12
**Success criteria**:
  1. Monitoring logic switched from sysinfo/disk-io to Windows ETW or IPHLPAPI
  2. Per-process network traffic excludes disk operations
  3. Accuracy verified against Windows Resource Monitor
**Plans**: TBD

### Phase 14: Data Analytics & History
**Goal**: Provide historical usage insights and long-term storage
**Depends on**: Phase 13
**Success criteria**:
  1. SQLite integration for local storage of hourly/daily usage
  2. Historical charts UI (7-day and 30-day views)
  3. Automated background data aggregation
**Plans**: TBD

### Phase 15: Application Control
**Goal**: Allow users to block internet access for specific apps
**Depends on**: Phase 14
**Success criteria**:
  1. Integration with Windows Filtering Platform (WFP) or Windows Firewall
  2. Block/Allow toggle UI in the process list
  3. Persistent firewall rules managed by the application
**Plans**: TBD
**UI hint**: yes

### Phase 16: Humorous Insights & Personality
**Goal**: Add engagement and humor via localized usage-based feedback
**Depends on**: Phase 14
**Success criteria**:
  1. Process categorization system (Games, Media, Work, etc.)
  2. Personality Engine that triggers humorous messages based on usage thresholds
  3. Support for English and Indonesian jokes via i18n
**Plans**: TBD
**UI hint**: yes

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
| 10. Refactoring | 1/1 | Completed | 2026-04-13 |
| 11. Optimization | 1/1 | Completed | 2026-04-13 |
| 12. Maintenance | 1/1 | Completed | 2026-04-13 |

---

*Last updated: 2026-04-13*
*Status: Roadmap expanded to v1.2*
