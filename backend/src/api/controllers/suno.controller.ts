import { Request, Response } from 'express';
import { imgkitsService, SunoGenerationRequest } from '../../services/imgkits.service';

// ────────────────────────────────────────────────────────────────────────────────
// SUNO CONTROLLER - USANDO IMGKITS COMO PROXY
// ────────────────────────────────────────────────────────────────────────────────

export class SunoController {
  
  // ────────────────────────────────────────────────────────────────────────────────
  // GENERAR MÚSICA
  // ────────────────────────────────────────────────────────────────────────────────
  
  async generateMusic(req: Request, res: Response) {
    try {
      const {
        prompt,
        style,
        title,
        customMode,
        instrumental,
        lyrics,
        gender
      } = req.body;

      // Validar prompt requerido
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Prompt is required and must be a non-empty string'
        });
      }

      // Preparar request para imgkits
      const generationRequest: SunoGenerationRequest = {
        prompt: prompt.trim(),
        style: style || '',
        title: title || '',
        customMode: customMode || false,
        instrumental: instrumental || false,
        lyrics: lyrics || '',
        gender: gender || ''
      };

      console.log('🎵 Generating music with prompt:', prompt);

      // Generar música usando imgkits
      const result = await imgkitsService.generateMusic(generationRequest);

      if (result.status === 'failed') {
        return res.status(500).json({
          success: false,
          error: result.error || 'Music generation failed',
          taskId: result.taskId
        });
      }

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        taskId: result.taskId,
        status: result.status,
        message: 'Music generation started successfully'
      });

    } catch (error: any) {
      console.error('❌ Suno generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during music generation',
        details: error.message
      });
    }
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // VERIFICAR ESTADO DE GENERACIÓN
  // ────────────────────────────────────────────────────────────────────────────────
  
  async checkStatus(req: Request, res: Response) {
    try {
      const { taskId } = req.params;

      if (!taskId) {
        return res.status(400).json({
          success: false,
          error: 'Task ID is required'
        });
      }

      console.log('🔍 Checking status for task:', taskId);

      // Verificar estado usando imgkits
      const result = await imgkitsService.checkGenerationStatus(taskId);

      if (result.status === 'failed') {
        return res.status(500).json({
          success: false,
          error: result.error || 'Generation failed',
          taskId: result.taskId,
          status: result.status
        });
      }

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        taskId: result.taskId,
        status: result.status,
        audioUrl: result.audioUrl,
        imageUrl: result.imageUrl
      });

    } catch (error: any) {
      console.error('❌ Status check error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during status check',
        details: error.message
      });
    }
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // OBTENER ESTADÍSTICAS DEL SERVICIO
  // ────────────────────────────────────────────────────────────────────────────────
  
  async getStats(req: Request, res: Response) {
    try {
      const stats = imgkitsService.getServiceStats();
      
      res.status(200).json({
        success: true,
        stats
      });

    } catch (error: any) {
      console.error('❌ Stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error retrieving stats',
        details: error.message
      });
    }
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // GENERAR Y ESPERAR (POLLING AUTOMÁTICO)
  // ────────────────────────────────────────────────────────────────────────────────
  
  async generateAndWait(req: Request, res: Response) {
    try {
      const {
        prompt,
        style,
        title,
        customMode,
        instrumental,
        lyrics,
        gender,
        maxWaitTime = 120000, // 2 minutos por defecto
        pollInterval = 3000   // 3 segundos por defecto
      } = req.body;

      // Validar prompt requerido
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Prompt is required and must be a non-empty string'
        });
      }

      // Preparar request para imgkits
      const generationRequest: SunoGenerationRequest = {
        prompt: prompt.trim(),
        style: style || '',
        title: title || '',
        customMode: customMode || false,
        instrumental: instrumental || false,
        lyrics: lyrics || '',
        gender: gender || ''
      };

      console.log('🎵 Generating and waiting for music with prompt:', prompt);

      // Iniciar generación
      const initialResult = await imgkitsService.generateMusic(generationRequest);

      if (initialResult.status === 'failed') {
        return res.status(500).json({
          success: false,
          error: initialResult.error || 'Music generation failed',
          taskId: initialResult.taskId
        });
      }

      const taskId = initialResult.taskId;
      const startTime = Date.now();
      const maxWait = parseInt(maxWaitTime);
      const interval = parseInt(pollInterval);

      // Polling automático
      while (Date.now() - startTime < maxWait) {
        const statusResult = await imgkitsService.checkGenerationStatus(taskId);

        if (statusResult.status === 'completed') {
          return res.status(200).json({
            success: true,
            taskId: statusResult.taskId,
            status: statusResult.status,
            audioUrl: statusResult.audioUrl,
            imageUrl: statusResult.imageUrl,
            message: 'Music generation completed successfully'
          });
        }

        if (statusResult.status === 'failed') {
          return res.status(500).json({
            success: false,
            error: statusResult.error || 'Generation failed',
            taskId: statusResult.taskId,
            status: statusResult.status
          });
        }

        // Esperar antes del siguiente poll
        await new Promise(resolve => setTimeout(resolve, interval));
      }

      // Timeout
      return res.status(408).json({
        success: false,
        error: 'Generation timeout',
        taskId,
        status: 'timeout',
        message: 'Music generation took too long to complete'
      });

    } catch (error: any) {
      console.error('❌ Generate and wait error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during music generation',
        details: error.message
      });
    }
  }
}

// Instancia del controlador
export const sunoController = new SunoController();
