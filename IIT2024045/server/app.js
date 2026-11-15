import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import express from "express";
import session from "express-session";

const assets = fileURLToPath(new URL("../dist/", import.meta.url));
const sessionName = "iit2024045.sid";
const cookie = { httpOnly: true, sameSite: "strict", path: "/" };
const securityPolicy = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "connect-src 'self'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join("; ");

export function createApp(users) {
  const app = express();
  app.disable("x-powered-by");
  app.use((_request, response, next) => {
    response.set({
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": securityPolicy,
    });
    next();
  });

  const api = express.Router();
  api.use((_request, response, next) => {
    response.set("Cache-Control", "no-store");
    next();
  });
  api.use(express.json({ limit: "4kb" }));
  api.use(session({
    name: sessionName,
    secret: randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: { ...cookie, maxAge: 30 * 60 * 1000 },
  }));

  api.post("/login", async (request, response, next) => {
    if (!request.is("application/json")) {
      return response.status(415).json({ error: "Send requests as JSON." });
    }
    const { username, password, mode = "secure" } = request.body ?? {};
    if (
      typeof username !== "string" || !username.trim() || username.length > 80 ||
      typeof password !== "string" || !password || password.length > 128
    ) {
      return response.status(400).json({ error: "Enter a valid username and password." });
    }
    if (mode !== "secure" && mode !== "vulnerable") {
      return response.status(400).json({ error: "Choose a valid login mode." });
    }

    const result = await users.authenticate(username, password, mode);
    if (!result.user) {
      return response.status(401).json({
        error: "Invalid username or password.",
        ...(mode === "vulnerable" ? { sql: result.sql } : {}),
      });
    }

    request.session.regenerate((error) => {
      if (error) return next(error);
      request.session.user = result.user;
      request.session.authenticatedBypass = result.bypassed;
      return response.json(mode === "vulnerable"
        ? { user: result.user, mode, sql: result.sql, authenticatedBypass: result.bypassed }
        : { user: result.user });
    });
  });

  api.get("/account", (request, response) => {
    const user = request.session.user;
    if (!user) return response.status(401).json({ error: "Sign in to view the account." });
    return response.json(request.session.authenticatedBypass === true
      ? { user, authenticatedBypass: true }
      : { user });
  });

  api.post("/logout", (request, response, next) => {
    if (!request.is("application/json")) {
      return response.status(415).json({ error: "Send requests as JSON." });
    }
    request.session.destroy((error) => {
      if (error) return next(error);
      response.clearCookie(sessionName, cookie).status(204).end();
    });
  });

  api.use((_request, response) => {
    response.status(404).json({ error: "API route not found." });
  });
  api.use((error, _request, response, next) => {
    if (response.headersSent) return next(error);
    if (error.type === "entity.too.large") {
      return response.status(413).json({ error: "Request is too large." });
    }
    if (error.type === "entity.parse.failed") {
      return response.status(400).json({ error: "Send valid JSON." });
    }
    return response.status(500).json({ error: "Could not complete the request." });
  });

  app.use("/api", api);
  app.use(express.static(assets));
  return app;
}
