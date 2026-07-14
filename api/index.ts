import type { IncomingMessage, ServerResponse } from "http";
import app from "./app.js";

export const maxDuration = 60;

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
