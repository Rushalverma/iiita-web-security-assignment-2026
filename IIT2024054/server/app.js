import express from "express";
import { fileURLToPath } from "node:url";

const assets = fileURLToPath(new URL("../dist/", import.meta.url));
const maxQueryLength = 240;
const securityPolicy = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "connect-src 'self'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join("; ");

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("query parser", "simple");
  app.set("json escape", true);

  app.use((_request, response, next) => {
    response.set("X-Content-Type-Options", "nosniff");
    response.set("Content-Security-Policy", securityPolicy);
    next();
  });

  app.get("/api/search", (request, response) => {
    const query = request.query.q ?? "";
    response.set("Cache-Control", "no-store");

    if (typeof query !== "string" || query.length > maxQueryLength) {
      return response.status(400).json({
        error: "Enter a single search term of up to 240 characters.",
      });
    }

    return response.json({ query });
  });

  app.use(express.static(assets));
  return app;
}
