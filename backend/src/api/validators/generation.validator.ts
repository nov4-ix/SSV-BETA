import { z } from 'zod';
import { GenerationStatus } from '@prisma/client';

export const createGenerationSchema = z.object({
  body: z.object({
    prompt: z
      .string()
      .min(10, 'Prompt must be at least 10 characters')
      .max(500, 'Prompt must be at most 500 characters'),
    duration: z
      .number()
      .int()
      .min(5, 'Duration must be at least 5 seconds')
      .max(300, 'Duration must be at most 300 seconds'),
    genre: z.string().max(50).optional(),
    mood: z.string().max(50).optional(),
    tempo: z.number().int().min(60).max(200).optional(),
    key: z.string().max(10).optional(),
    instruments: z.array(z.string().max(50)).max(10).optional(),
    style: z.string().max(100).optional(),
  }),
});

export const listGenerationsSchema = z.object({
  query: z.object({
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
    offset: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
    status: z.nativeEnum(GenerationStatus).optional(),
  }),
});

export const generationIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});
