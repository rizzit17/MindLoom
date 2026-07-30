import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config/env';
import { logger } from '../utils/logger';

let dbInstance: Database.Database | null = null;

export function getDb(dbPath = config.DATABASE_PATH): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const resolvedPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
  const dir = path.dirname(resolvedPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created database directory at ${dir}`);
  }

  dbInstance = new Database(resolvedPath);

  // Enable WAL mode for better concurrency
  dbInstance.pragma('journal_mode = WAL');

  // Initialize schema if not exists
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS mindmaps (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      root_id TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  logger.info(`Database connected and initialized at ${resolvedPath}`);
  return dbInstance;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
