# Pantaunet - Internet Usage Monitor

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-yellow)
![Version](https://img.shields.io/badge/version-2.0.0-emerald)

**Pantaunet** is a professional cross-platform desktop application for monitoring and controlling per-application internet usage. Built with a high-performance Rust backend and a modern React frontend.

## Key Features (v2.0)

- **High Accuracy Monitoring** - Uses Windows IPHLPAPI/TCP-Table filtering to ensure stats reflect actual network traffic, excluding local disk I/O.
- **Long-Term History** - Integrated SQLite database to track your network usage over days, weeks, and months.
- **Application Control** - Built-in firewall integration to block/allow internet access for specific applications with a single click.
- **Floating Desktop Widget** - An "always-on-top" mini widget to keep an eye on your speeds without opening the main window.
- **Dynamic Tray Icon** - Real-time numeric speed display directly in your system tray.
- **Humorous Insights** - A personality-driven engine that provides witty (and sometimes sarcastic) feedback based on your usage patterns (English & Indonesian support).
- **Advanced Dashboard** - Beautiful charts, real-time speed meters, and a ranked process list.

## Tech Stack

- **Framework**: [Tauri v2](https://tauri.app/) - Lightweight Rust-based desktop framework.
- **Backend**: Rust (windows-rs, sysinfo, rusqlite).
- **Frontend**: React 18 + TypeScript + Vite.
- **State Management**: Zustand (Centralized Store).
- **Styling**: Tailwind CSS (Academic Dark Aesthetic).
- **Database**: SQLite (Local persistence).
- **Charts**: Recharts.

## Screenshots

The application features a clean, high-density "Academic Dark" dashboard:
- **Dashboard**: Real-time meters and session charts.
- **History**: Aggregated long-term usage data.
- **Widget**: Compact floating speed indicator.
- **Settings**: Comprehensive control over integration and notifications.

## Installation

### Pre-built Binaries

Download the latest release from [GitHub Releases](https://github.com/ajamj/pantaunet/releases):

- **Windows**: `.exe` or `.msi` installer.
- **Linux**: `.AppImage` or `.deb`.
- **macOS**: `.dmg`.

### Build from Source

#### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.75+
- [npm](https://www.npmjs.com/)

#### Build

```bash
# Clone the repository
git clone https://github.com/ajamj/pantaunet.git
cd pantaunet

# Install dependencies
npm install

# Build the application (Production)
npm run tauri build
```

The installers will be generated in `src-tauri/target/release/bundle/`.

## Development

```bash
# Start development server
npm run tauri dev
```

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

This project is licensed under the [MIT License](LICENSE).

---

Made with ♥ by [ajamj](https://github.com/ajamj)