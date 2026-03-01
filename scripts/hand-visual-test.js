#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const REPO_ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const options = {
    host: "127.0.0.1",
    port: 4173,
    serve: "0",
    scenario: "",
    deck: "standard54-english",
    view: "hand",
    count: "13",
    card_size: "186",
    visibility_factor: "0.50",
    alpha_deg: "4.0",
    phi_deg: "40.0",
    browser_cmd: ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2).replace(/-/g, "_");
    const value = argv[index + 1];
    if (value && !value.startsWith("--")) {
      options[key] = value;
      index += 1;
    } else {
      options[key] = "1";
    }
  }

  return options;
}

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    default:
      return "application/octet-stream";
  }
}

function resolveRequestPath(urlPathname) {
  const decodedPath = decodeURIComponent(urlPathname.split("?")[0]);
  const relativePath = decodedPath === "/" ? "/index.html" : decodedPath;
  const absolutePath = path.resolve(REPO_ROOT, `.${relativePath}`);

  if (!absolutePath.startsWith(REPO_ROOT)) {
    return null;
  }

  return absolutePath;
}

function createStaticServer() {
  return http.createServer((request, response) => {
    const filePath = resolveRequestPath(request.url || "/");
    if (!filePath) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError) {
        response.writeHead(404);
        response.end("Not Found");
        return;
      }

      const effectivePath = stats.isDirectory()
        ? path.join(filePath, "index.html")
        : filePath;

      fs.readFile(effectivePath, (readError, payload) => {
        if (readError) {
          response.writeHead(500);
          response.end("Read error");
          return;
        }

        response.writeHead(200, {
          "Content-Type": getContentType(effectivePath),
          "Cache-Control": "no-store"
        });
        response.end(payload);
      });
    });
  });
}

function buildTestUrl(options) {
  const params = new URLSearchParams({
    test: "1",
    deck: options.deck,
    view: options.view,
    count: options.count,
    card_size: options.card_size,
    visibility_factor: options.visibility_factor,
    alpha_deg: options.alpha_deg,
    phi_deg: options.phi_deg
  });

  if (options.scenario) {
    params.set("scenario", options.scenario);
  }

  if (options.serve === "1") {
    return `http://${options.host}:${options.port}/index.html?${params.toString()}`;
  }

  const filePath = path.join(REPO_ROOT, "index.html");
  return `file://${filePath}?${params.toString()}`;
}

function maybeLaunchBrowser(browserCommand, url) {
  if (!browserCommand) {
    return null;
  }

  const parts = browserCommand.split(" ").filter(Boolean);
  if (parts.length === 0) {
    return null;
  }

  const child = spawn(parts[0], [...parts.slice(1), url], {
    cwd: REPO_ROOT,
    stdio: "inherit"
  });

  return child;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const url = buildTestUrl(options);

  console.log("Hand visual test harness ready.");
  console.log(`URL: ${url}`);
  console.log("");
  console.log("Recommended reproduction:");
  console.log("  1. Open the URL in a browser.");
  console.log("  2. Confirm the hand matches the requested test parameters.");
  console.log("  3. Inspect window.__CTP_TEST_REPORT__ or #ctp-test-report in DevTools.");
  if (options.scenario) {
    console.log(`  4. Scenario '${options.scenario}' will auto-run and append history snapshots.`);
  }
  console.log("");
  console.log("Current parameters:");
  console.log(
    JSON.stringify(
      {
        scenario: options.scenario || null,
        deck: options.deck,
        count: Number(options.count),
        cardSizePx: Number(options.card_size),
        visibilityFactor: Number(options.visibility_factor),
        alphaDeg: Number(options.alpha_deg),
        phiDeg: Number(options.phi_deg),
        serve: options.serve === "1"
      },
      null,
      2
    )
  );

  if (options.serve !== "1") {
    maybeLaunchBrowser(options.browser_cmd, url);
    return;
  }

  const server = createStaticServer();
  server.listen(Number(options.port), options.host, () => {
    const child = maybeLaunchBrowser(options.browser_cmd, url);
    if (child) {
      child.on("exit", () => {
        server.close();
      });
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
