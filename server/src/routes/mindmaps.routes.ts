import { Router } from 'express';
import { MindmapsController } from '../controllers/mindmaps.controller';
import { asyncHandler } from '../middleware/asyncHandler';

export function createMindmapsRouter(controller?: MindmapsController): Router {
  const router = Router();
  const mindmapsController = controller || new MindmapsController();

  router.post('/', asyncHandler(mindmapsController.generateMindmap));
  router.get('/', asyncHandler(mindmapsController.getMindmaps));
  router.get('/:id', asyncHandler(mindmapsController.getMindmapById));
  router.post('/:id/expand', asyncHandler(mindmapsController.expandMindmapNode));
  router.delete('/', asyncHandler(mindmapsController.clearHistory));

  return router;
}
