import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { MongoServerError } from 'mongodb';
import { HttpStatus } from '../common/constants/enums';
import { env } from '../config/env';
import { HttpError } from '../common/utils/httpError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof multer.MulterError) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      error: { message: err.message, code: 'MULTER_ERROR', details: { field: err.field } },
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: { message: err.message, code: err.code, details: err.details },
    });
  }

  if (err instanceof ZodError) {
    return res.status(HttpStatus.UNPROCESSABLE).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.flatten(),
      },
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    const castErr = err as mongoose.Error.CastError;
    return res.status(HttpStatus.BAD_REQUEST).json({
      error: {
        message: 'Invalid id or reference',
        code: 'BAD_REQUEST',
        details: { path: castErr.path },
      },
    });
  }

  if (err instanceof MongoServerError && err.code === 11000) {
    return res.status(HttpStatus.CONFLICT).json({
      error: { message: 'Duplicate key', code: 'CONFLICT', details: err.keyValue },
    });
  }

  console.error(err);
  return res.status(HttpStatus.INTERNAL).json({
    error: {
      message: env.isProd ? 'Internal server error' : err instanceof Error ? err.message : 'Unknown error',
      code: 'INTERNAL',
    },
  });
}
