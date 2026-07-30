import { Request, Response } from 'express';
import { validateCreateMindmapRequest } from '../validators/requestValidators';
import { MindmapService } from '../services/mindmap.service';
import { MindmapRepository } from '../repositories/mindmap.repository';
import { createLlmClient } from '../services/llm/llmClient';
import { NotFoundError } from '../middleware/errorHandler';

export class MindmapsController {
  private service: MindmapService;
  private repository: MindmapRepository;

  constructor(service?: MindmapService, repository?: MindmapRepository) {
    const llmClient = createLlmClient();
    this.service = service || new MindmapService(llmClient);
    this.repository = repository || new MindmapRepository();
  }

  generateMindmap = async (req: Request, res: Response): Promise<void> => {
    // 1. Validate inbound request body shape & edge cases (empty / too short)
    const { text } = validateCreateMindmapRequest(req.body);

    // 2. Generate and validate mindmap via service
    const generatedMindmap = await this.service.generateAndValidateMindmap(text);

    // 3. Persist to SQLite
    const savedMindmap = this.repository.create(generatedMindmap);

    // 4. Return 201 Created
    res.status(201).json(savedMindmap);
  };

  getMindmaps = async (_req: Request, res: Response): Promise<void> => {
    const mindmaps = this.repository.findAll();
    res.status(200).json(mindmaps);
  };

  getMindmapById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const mindmap = this.repository.findById(id);

    if (!mindmap) {
      throw new NotFoundError(`Mindmap with ID '${id}' was not found.`);
    }

    res.status(200).json(mindmap);
  };
}
