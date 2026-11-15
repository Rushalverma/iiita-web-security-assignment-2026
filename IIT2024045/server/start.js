import { existsSync } from "node:fs";
import { createApp } from "./app.js";
import { createUserStore } from "./database.js";

if (!existsSync(new URL("../dist/index.html", import.meta.url))) {
  console.error("Build the React frontend first with npm run build.");
  process.exit(1);
}

const host = "127.0.0.1";
const port = Number(process.env.PORT ?? 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("Set PORT to an integer between 1 and 65535.");
  process.exit(1);
}

const users = createUserStore();
const server = createApp(users).listen(port, host, () => {
  console.log(`SQL authentication lab available at http://${host}:${port}`);
});

server.on("error", (error) => {
  users.close();
  console.error(error.code === "EADDRINUSE"
    ? `Port ${port} is already in use. Set PORT to a different port.`
    : error.message);
  process.exitCode = 1;
});
