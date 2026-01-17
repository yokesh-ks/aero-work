/**
 * SQLite database setup using better-sqlite3
 */
import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'node:path'

let db: Database.Database | null = null

/**
 * Get the database file path
 */
function getDatabasePath(): string {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'aero-work.db')
}

/**
 * Initialize the database connection and create tables
 */
export function initializeDatabase(): Database.Database {
  if (db) {
    return db
  }

  const dbPath = getDatabasePath()
  db = new Database(dbPath)

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL')

  // Create projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      github_owner TEXT NOT NULL,
      github_repo TEXT NOT NULL,
      github_repo_id INTEGER NOT NULL UNIQUE,
      local_path TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'linked' CHECK(status IN ('linked', 'cloning', 'error')),
      is_private INTEGER NOT NULL DEFAULT 0,
      default_branch TEXT NOT NULL DEFAULT 'main',
      created_at TEXT NOT NULL,
      last_opened_at TEXT
    )
  `)

  // Create index for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_projects_github_repo_id ON projects(github_repo_id);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_projects_last_opened ON projects(last_opened_at);
  `)

  return db
}

/**
 * Get the database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    return initializeDatabase()
  }
  return db
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}

export { db }
