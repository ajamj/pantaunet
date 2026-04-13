use rusqlite::{params, Connection, Result};
use std::path::Path;
use chrono::Utc;

pub struct Database {
    conn: Connection,
}

#[derive(Debug, PartialEq)]
pub struct ProcessHistory {
    pub name: String,
    pub download_bytes: u64,
    pub upload_bytes: u64,
    pub timestamp: i64,
}

impl Database {
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self> {
        let conn = Connection::open(path)?;
        Self::init(&conn)?;
        Ok(Self { conn })
    }

    pub fn new_in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        Self::init(&conn)?;
        Ok(Self { conn })
    }

    fn init(conn: &Connection) -> Result<()> {
        conn.execute(
            "CREATE TABLE IF NOT EXISTS process_history (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                download_bytes INTEGER NOT NULL,
                upload_bytes INTEGER NOT NULL,
                timestamp INTEGER NOT NULL
            )",
            [],
        )?;
        Ok(())
    }

    pub fn insert_stats(&self, name: &str, download: u64, upload: u64) -> Result<()> {
        let now = Utc::now().timestamp();
        self.conn.execute(
            "INSERT INTO process_history (name, download_bytes, upload_bytes, timestamp) VALUES (?1, ?2, ?3, ?4)",
            params![name, download as i64, upload as i64, now],
        )?;
        Ok(())
    }

    pub fn get_history(&self, since_timestamp: i64) -> Result<Vec<ProcessHistory>> {
        let mut stmt = self.conn.prepare(
            "SELECT name, SUM(download_bytes), SUM(upload_bytes), timestamp
             FROM process_history
             WHERE timestamp >= ?1
             GROUP BY name
             ORDER BY SUM(download_bytes) + SUM(upload_bytes) DESC",
        )?;

        let history_iter = stmt.query_map(params![since_timestamp], |row| {
            Ok(ProcessHistory {
                name: row.get(0)?,
                download_bytes: row.get::<_, i64>(1)? as u64,
                upload_bytes: row.get::<_, i64>(2)? as u64,
                timestamp: row.get(3)?,
            })
        })?;

        let mut history = Vec::new();
        for h in history_iter {
            history.push(h?);
        }
        Ok(history)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_database_init_and_insert() {
        let db = Database::new_in_memory().expect("Failed to create in-memory db");
        
        db.insert_stats("chrome.exe", 1024, 512).unwrap();
        db.insert_stats("chrome.exe", 2048, 1024).unwrap();
        db.insert_stats("steam.exe", 5000, 0).unwrap();

        let history = db.get_history(0).unwrap();
        
        assert_eq!(history.len(), 2);
        
        // chrome should be aggregated, but actually my query groups by name.
        // total chrome: 3072 down, 1536 up
        // total steam: 5000 down, 0 up
        // Steam has more total (5000) than chrome (4608), so steam is first.
        
        assert_eq!(history[0].name, "steam.exe");
        assert_eq!(history[0].download_bytes, 5000);
        
        assert_eq!(history[1].name, "chrome.exe");
        assert_eq!(history[1].download_bytes, 3072);
        assert_eq!(history[1].upload_bytes, 1536);
    }
}
