CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT OR IGNORE INTO settings(key,value) VALUES ('limit','88');
INSERT OR IGNORE INTO settings(key,value) VALUES ('paused','0');
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL
);
