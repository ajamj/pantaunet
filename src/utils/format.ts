export function formatBytes(bytes: number): string {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  if (bytes >= GB) {
    return `${(bytes / GB).toFixed(2)} GB`;
  } else if (bytes >= MB) {
    return `${(bytes / MB).toFixed(2)} MB`;
  } else if (bytes >= KB) {
    return `${(bytes / KB).toFixed(2)} KB`;
  }
  return `${bytes} B`;
}

export function formatSpeed(bytesPerSec: number): string {
  const KB = 1024;
  const MB = KB * 1024;

  if (bytesPerSec >= MB) {
    return `${(bytesPerSec / MB).toFixed(1)} MB/s`;
  } else if (bytesPerSec >= KB) {
    return `${(bytesPerSec / KB).toFixed(1)} KB/s`;
  }
  return `${bytesPerSec} B/s`;
}
