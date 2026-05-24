import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "ValidationError",
      message: "Invalid request",
      issues: err.issues
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: "ApiError",
      message: err.message,
      details: err.details ?? null
    });
  }

  // eslint-disable-next-line no-console
  console.error("[backend] unhandled error", err);
  return res.status(500).json({ error: "InternalServerError", message: "Something went wrong" });
}

