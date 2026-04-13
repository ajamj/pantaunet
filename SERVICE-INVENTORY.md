# SERVICE-INVENTORY.md

This file tracks the services, factories, and modules in the project. It is maintained by the orchestrator during orchestrated execution.

## Services

| Service | Responsibility | Status |
|---|---|---|
| `WindowsMonitor` (Rust) | OS-specific monitoring implementation | Active |
| `MonitoringTrait` (Rust) | Decoupled monitoring interface | Active |
| `AppState` (Rust) | Global state management | Active |
| `appStore` (Zustand) | Centralized frontend state management | Active |
| `setup_tray` (Rust) | System tray management | Active |

## Frontend Components

| Component | Responsibility | Status |
|---|---|---|
| `App.tsx` | Main dashboard & settings | Active |
| `Widget.tsx` | Floating desktop speed indicator | Active |
| `MetricCard` | Primary metric visualization | Active |
| `SpeedDisplay` | Unified download/upload speed UI | Active |
| `Toggle` | Shared setting switch component | Active |
| `StatusBadge` | Real-time connectivity status | Active |
| `ProcessTable` | Ranked process traffic list | Active |
## Metadata

| Property | Value |
|---|---|
| **Language** | TypeScript / Rust |
| **Framework** | React / Tauri |
| **Persistence** | `tauri-plugin-store` |
| **Style** | Vanilla CSS / Tailwind |
