import { Router, Request, Response } from "express";
import { version } from "../../package.json";

const healthRouter = Router();

/**
 * GET /health
 * Liveness probe endpoint — returns basic runtime information.
 */
healthRouter.get("/", (_: Request, response: Response) => {
  response.status(200).json({
    status: "ok",
    version,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
