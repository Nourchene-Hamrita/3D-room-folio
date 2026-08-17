// Single screenshot from default angle
const puppeteer = require("puppeteer-core");
const CHROME = "/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome";
const URL = "http://localhost:5173/";
const OUT = process.argv[2] || "/workspace/final.png";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: [
      "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
      "--use-gl=angle", "--use-angle=swiftshader",
      "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader",
    ],
    defaultViewport: { width: 1600, height: 900 },
  });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 7000));
  try { await page.click("#enter-button", { timeout: 1500 }); } catch (e) {}
  await new Promise((r) => setTimeout(r, 3500));
  await page.screenshot({ path: OUT });
  console.log("saved", OUT);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
