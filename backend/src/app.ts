import express from "express";
import path from "path";
import type { AiProvider } from "./ai/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { requestContextMiddleware } from "./middleware/request-context.js";
import { problemsRouter } from "./routes/problems.js";
import { healthRouter } from "./routes/health.js";
import { createReviewRouter } from "./routes/review.js";
import { createHintRouter } from "./routes/hint.js";
import { createChatRouter } from "./routes/chat.js";

export interface CreateAppOptions {
  aiProvider?: AiProvider;
  staticFilesPath?: string;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();

  app.use(requestContextMiddleware);
  app.use(express.json());

  // API routes
  app.use("/health", healthRouter);
  app.use("/problems", problemsRouter);
  app.use("/review", createReviewRouter({ aiProvider: options.aiProvider }));
  app.use("/hint", createHintRouter({ aiProvider: options.aiProvider }));
  app.use("/chat", createChatRouter({ aiProvider: options.aiProvider }));

  // Serve static files from frontend build
  const staticPath = options.staticFilesPath || path.join(process.cwd(), "../frontend/dist");
  app.use(express.static(staticPath));

  // For SPA routing, serve index.html for any non-API route
  app.get("*", (req, res, next) => {
    // Skip API routes
    if (
      req.path.startsWith("/health") ||
      req.path.startsWith("/problems") ||
      req.path.startsWith("/review") ||
      req.path.startsWith("/hint") ||
      req.path.startsWith("/chat") ||
      req.path.startsWith("/api")
    ) {
      return next();
    }
    
    // Serve index.html for all other routes
    res.sendFile(path.join(staticPath, "index.html"));
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
