import { Response } from 'express';

interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: number;
    details?: unknown;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string
): Response<SuccessResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  details?: unknown
): Response<ErrorResponse> {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: statusCode,
      ...(details && { details }),
    },
  });
}

export function sendCreated<T>(
  res: Response,
  data: T,
  message = 'Resource created successfully'
): Response<SuccessResponse<T>> {
  return sendSuccess(res, data, 201, message);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}
