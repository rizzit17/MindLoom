import path from 'path';
import fs from 'fs';
import { config } from '../config/env';
import { logger } from '../utils/logger';

let dbInstance: any = null;
let isFallbackMode = false;
const inMemoryStore = new Map<string, any>();

export function getDb(dbPath = config.DATABASE_PATH): any {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    // Attempt loading better-sqlite3 native bindings
    const Database = require('better-sqlite3');
    const resolvedPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
    const dir = path.dirname(resolvedPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created database directory at ${dir}`);
    }

    const sqliteDb = new Database(resolvedPath);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS mindmaps (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        root_id TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    logger.info(`SQLite Database connected and initialized at ${resolvedPath}`);
    dbInstance = sqliteDb;
    return dbInstance;
  } catch (error: any) {
    logger.warn('Failed to load native better-sqlite3 bindings. Falling back to in-memory store for cloud compatibility.', {
      error: error?.message || error,
    });
    isFallbackMode = true;
    dbInstance = {
      isFallback: true,
      store: inMemoryStore,
    };
    return dbInstance;
  }
}

export function isDbFallback(): boolean {
  return isFallbackMode;
}

export function closeDb(): void {
  if (dbInstance && typeof dbInstance.close === 'function') {
    dbInstance.close();
  }
  dbInstance = null;
  inMemoryStore.clear();
}
