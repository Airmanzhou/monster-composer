/**
 * A tiny static file server for local development.
 *
 *   node tools/serve.mjs        -> http://127.0.0.1:4173
 *
 * ES modules cannot be loaded from a file:// URL, so the app needs a server
 * to run locally. No dependencies: node:http is enough.
 */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = Number(process.env.PORT || 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/index.html";
    const target = join(ROOT, normalize(pathname).replace(/^([/\\]|\.\.[/\\])+/, ""));
    if (!target.startsWith(ROOT)) {
      response.writeHead(403).end("forbidden");
      return;
    }
    const body = await readFile(target);
    response.writeHead(200, {
      "content-type": TYPES[extname(target)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    response.end(body);
  } catch (error) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("not found");
  }
}).listen(PORT, () => {
  console.log(`Monster Composer is running at http://127.0.0.1:${PORT}`);
});
