# SERVICE-INVENTORY.md

This file tracks the services, factories, and modules in the project. It is maintained by the orchestrator during orchestrated execution.

## Services

| Service | Responsibility | Status |
|---|---|---|
| `get_network_usage` (Rust) | Per-process network IO collection | Active |
| `AppState` (Rust) | Global state management | Active |
| `setup_tray` (Rust) | System tray management | Active |

## Frontend Components

| Component | Responsibility | Status |
|---|---|---|
| `App.tsx` | Main dashboard & settings | Active |
| `NetworkSpeedChart` | Real-time speed visualization | Active |
| `ProcessList` | Ranked process table | Active |

## Metadata

| Property | Value |
|---|---|
| **Language** | TypeScript / Rust |
| **Framework** | React / Tauri |
| **Persistence** | `tauri-plugin-store` |
| **Style** | Vanilla CSS / Tailwind |
