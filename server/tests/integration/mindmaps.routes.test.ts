import request from 'supertest';
import { createApp } from '../../src/app';
import { closeDb } from '../../src/repositories/db';

const app = createApp();

afterAll(() => {
  closeDb();
});

describe('Mindmaps API Endpoints Integration', () => {
  describe('POST /api/mindmaps', () => {
    it('should return 400 when text payload is missing or empty', async () => {
      const response = await request(app).post('/api/mindmaps').send({ text: '' });
      expect(response.status).toBe(400);
      expect(response.body.error.toLowerCase()).toContain('text input is required');
    });

    it('should return 400 when text payload is too short (< 20 chars)', async () => {
      const response = await request(app).post('/api/mindmaps').send({ text: 'Too short text' });
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('too short to summarize meaningfully');
    });

    it('should return 201 and created mindmap object on valid text input', async () => {
      const response = await request(app)
        .post('/api/mindmaps')
        .send({
          text: 'Software architecture design involves microservices, databases, DevOps automation, and observability principles for modern applications.',
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBeDefined();
      expect(response.body.nodes.length).toBeGreaterThanOrEqual(5);
      expect(response.body.nodes.length).toBeLessThanOrEqual(9);
      expect(response.body.createdAt).toBeDefined();
    });
  });

  describe('GET /api/mindmaps', () => {
    it('should return 200 with list of stored mindmaps', async () => {
      const response = await request(app).get('/api/mindmaps');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/mindmaps/:id', () => {
    it('should return 404 for non-existent ID', async () => {
      const response = await request(app).get('/api/mindmaps/non-existent-uuid');
      expect(response.status).toBe(404);
      expect(response.body.error).toContain('was not found');
    });

    it('should return 200 and full mindmap for existing ID', async () => {
      // 1. Create a mindmap
      const createRes = await request(app)
        .post('/api/mindmaps')
        .send({
          text: 'Artificial Intelligence and Deep Learning systems power modern large language models and natural language processing applications.',
        });

      const mindmapId = createRes.body.id;

      // 2. Fetch created mindmap
      const getRes = await request(app).get(`/api/mindmaps/${mindmapId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.id).toBe(mindmapId);
      expect(getRes.body.nodes.length).toBeGreaterThanOrEqual(5);
    });
  });
});
