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
  private db: any;
  private memoryStore: Map<string, Mindmap> = new Map();
  private isFallback: boolean = false;

  constructor(customDb?: any) {
    this.db = customDb || getDb();
    if (this.db && this.db.isFallback) {
      this.isFallback = true;
      this.memoryStore = this.db.store;
    }
  }

  create(mindmap: Mindmap): Mindmap {
    const id = mindmap.id || uuidv4();
    const createdAt = mindmap.createdAt || new Date().toISOString();

    const fullMindmap: Mindmap = {
      ...mindmap,
      id,
      createdAt,
    };

    if (this.isFallback) {
      this.memoryStore.set(id, fullMindmap);
      return fullMindmap;
    }

    const stmt = this.db.prepare(`
      INSERT INTO mindmaps (id, title, root_id, data, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, fullMindmap.title, fullMindmap.rootId, JSON.stringify(fullMindmap), createdAt);

    return fullMindmap;
  }

  update(id: string, mindmap: Mindmap): Mindmap {
    if (this.isFallback) {
      this.memoryStore.set(id, mindmap);
      return mindmap;
    }

    const stmt = this.db.prepare(`
      UPDATE mindmaps
      SET title = ?, root_id = ?, data = ?
      WHERE id = ?
    `);

    stmt.run(mindmap.title, mindmap.rootId, JSON.stringify(mindmap), id);
    return mindmap;
  }

  findAll(): MindmapSummaryItem[] {
    if (this.isFallback) {
      return Array.from(this.memoryStore.values())
        .map((m) => ({
          id: m.id || uuidv4(),
          title: m.title,
          createdAt: m.createdAt || new Date().toISOString(),
        }))
        .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    }

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
    if (this.isFallback) {
      return this.memoryStore.get(id) || null;
    }

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
    if (this.isFallback) {
      this.memoryStore.clear();
      return;
    }

    const stmt = this.db.prepare(`DELETE FROM mindmaps`);
    stmt.run();
  }
}
