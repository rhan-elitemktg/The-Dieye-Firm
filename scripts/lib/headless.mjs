/* Minimal Chrome DevTools Protocol driver — no dependencies.
   Node 22+ ships a global WebSocket, which is the only piece that would
   otherwise require Playwright or Puppeteer. */

import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findChrome() {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      `No Chrome found. Set CHROME_PATH, or install Chrome.\nLooked in:\n  ${CHROME_CANDIDATES.join("\n  ")}`,
    );
  }
  return found;
}

/* Port 0 lets Chrome pick a free one and write it to DevToolsActivePort in
   the profile dir, so concurrent runs never collide. */
async function readPort(profileDir) {
  for (let i = 0; i < 80; i++) {
    try {
      const file = await readFile(join(profileDir, "DevToolsActivePort"), "utf8");
      const port = file.split("\n")[0].trim();
      if (port) return port;
    } catch {}
    await sleep(125);
  }
  throw new Error("Chrome never reported a debugging port");
}

/**
 * Launch headless Chrome and open a page.
 * Returns { evaluate, send, close } — always call close().
 */
export async function launch({ width = 1440, height = 900 } = {}) {
  const profileDir = await mkdtemp(join(tmpdir(), "dieye-cdp-"));
  const chrome = spawn(findChrome(), [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDir}`,
    `--window-size=${width},${height}`,
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ]);

  const port = await readPort(profileDir);

  let target;
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find((t) => t.type === "page");
      if (target) break;
    } catch {}
    await sleep(125);
  }
  if (!target) throw new Error("Chrome exposed no page target");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error("CDP socket failed to open"));
  });

  let id = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const n = ++id;
      pending.set(n, resolve);
      ws.send(JSON.stringify({ id: n, method, params }));
    });

  const evaluate = async (expression) => {
    const res = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.result?.exceptionDetails) {
      throw new Error(
        res.result.exceptionDetails.exception?.description ??
          res.result.exceptionDetails.text,
      );
    }
    return res.result?.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");

  /* Chrome clamps its window to ~500px wide on macOS, so --window-size alone
     silently reports 500 when you ask for 375 or 430 — every "phone width"
     check would really be running at 500. Overriding the device metrics gives
     a true viewport independent of the OS window. */
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });

  return {
    send,
    evaluate,

    async goto(url) {
      await send("Page.navigate", { url });
      await sleep(1500);
    },

    /* A screenshot of half-loaded art proves nothing, so force every lazy
       image to fetch and wait for fonts and decodes before capturing. */
    async settle() {
      await evaluate(`
        (async () => {
          document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
          await document.fonts.ready;
          await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
          return true;
        })()
      `);

      /* A lazy <iframe> below the fold is never even given a frame by Chrome —
         flipping its loading attribute after parse doesn't retroactively start
         one. It has to actually enter the viewport. Screenshots stay at scroll
         0 (so the fixed header can't paint over a clipped element), so walk the
         page to the bottom to trigger everything, then return to the top. */
      const hasFrames = await evaluate(`document.querySelectorAll('iframe').length > 0`);
      if (hasFrames) {
        await evaluate(`
          (async () => {
            const step = innerHeight * 0.9;
            for (let y = 0; y < document.body.scrollHeight; y += step) {
              window.scrollTo(0, y);
              await new Promise(r => setTimeout(r, 120));
            }
            window.scrollTo(0, 0);
            return true;
          })()
        `);
        // Third-party frames need longer than a decode to paint.
        await sleep(2200);
      }

      await sleep(600);
    },

    async close() {
      try { ws.close(); } catch {}

      // Wait for the process to actually exit before touching the profile —
      // Chrome keeps writing to it on the way down, and rm races the flush.
      const exited = new Promise((resolve) => chrome.once("exit", resolve));
      chrome.kill();
      await Promise.race([exited, sleep(3000)]);

      // Cleanup is a courtesy; a leftover temp dir must never fail a run.
      for (let i = 0; i < 3; i++) {
        try {
          await rm(profileDir, { recursive: true, force: true });
          return;
        } catch {
          await sleep(200);
        }
      }
    },
  };
}
