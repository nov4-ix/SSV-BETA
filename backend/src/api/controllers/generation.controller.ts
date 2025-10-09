import { Request, Response, NextFunction } from 'express';
import { musicGenerationService } from '@/services/music/generation.service';
import { asyncHandler } from '@/utils/async-handler';
import { sendSuccess, sendCreated } from '@/utils/responses';

export class GenerationController {
  create = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await musicGenerationService.initiateGeneration({
        userId: req.userId!,
        ...req.body,
      });
      
      sendCreated(res, result, 'Generation initiated successfully');
    }
  );
  
  getStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const generation = await musicGenerationService.getGenerationStatus(
        id,
        req.userId!
      );
      
      sendSuccess(res, generation);
    }
  );
  
  list = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await musicGenerationService.listUserGenerations(
        req.userId!,
        req.query as any
      );
      
      sendSuccess(res, result);
    }
  );
  
  cancel = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      await musicGenerationService.cancelGeneration(id, req.userId!);
      
      sendSuccess(res, null, 200, 'Generation cancelled successfully');
    }
  );
}

export const generationController = new GenerationController();
