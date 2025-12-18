import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { handleAudioRequest, getAvailableTones } from "./audio";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/audio/tones", getAvailableTones);
  app.get("/api/audio/:toneId", handleAudioRequest);

  const httpServer = createServer(app);

  return httpServer;
}
