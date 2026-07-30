import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Mindmap, MindmapSummaryItem } from '@visualli/shared';
import { getDb } from './db';

interface MindmapRow {
  id: string;
  title: string;
  root_id: string;
  data: string;
  created_at: string;
}

export class MindmapRepository {
  private db: Database.Database;

  constructor(customDb?: Database.Database) {
    this.db = customDb || getDb();
  }

  create(mindmap: Mindmap): Mindmap {
    const id = mindmap.id || uuidv4();
    const createdAt = mindmap.createdAt || new Date().toISOString();

    const fullMindmap: Mindmap = {
      ...mindmap,
      id,
      createdAt,
    };

    const stmt = this.db.prepare(`
      INSERT INTO mindmaps (id, title, root_id, data, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, fullMindmap.title, fullMindmap.rootId, JSON.stringify(fullMindmap), createdAt);

    return fullMindmap;
  }

  update(id: string, mindmap: Mindmap): Mindmap {
    const stmt = this.db.prepare(`
      UPDATE mindmaps
      SET title = ?, root_id = ?, data = ?
      WHERE id = ?
    `);

    stmt.run(mindmap.title, mindmap.rootId, JSON.stringify(mindmap), id);
    return mindmap;
  }

  findAll(): MindmapSummaryItem[] {
    const stmt = this.db.prepare(`
      SELECT id, title, created_at
      FROM mindmaps
      ORDER BY created_at DESC
    `);

    const rows = stmt.all() as { id: string; title: string; created_at: string }[];

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
    }));
  }

  findById(id: string): Mindmap | null {
    const stmt = this.db.prepare(`
      SELECT id, title, root_id, data, created_at
      FROM mindmaps
      WHERE id = ?
    `);

    const row = stmt.get(id) as MindmapRow | undefined;
    if (!row) return null;

    try {
      const parsedData = JSON.parse(row.data) as Mindmap;
      return {
        ...parsedData,
        id: row.id,
        createdAt: row.created_at,
      };
    } catch {
      return null;
    }
  }

  deleteAll(): void {
    const stmt = this.db.prepare(`DELETE FROM mindmaps`);
    stmt.run();
  }
}
