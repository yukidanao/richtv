const fs = require("fs");
const { run } = require("../node_modules/react-snap/index.js");

const pkg = JSON.parse(fs.readFileSync(require("path").join(process.cwd(), "package.json"), "utf8"));
const config = pkg.reactSnap || {};

function findLocalBrowser() {
    if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;

    const candidates = process.platform === "win32"
        ? [
              "C:/Program Files/Google/Chrome/Application/chrome.exe",
              "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
              "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
              "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
              process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe` : "",
          ]
        : [
              "/usr/bin/google-chrome",
              "/usr/bin/google-chrome-stable",
              "/usr/bin/chromium",
              "/usr/bin/chromium-browser",
              "/opt/google/chrome/chrome",
          ];

    return candidates.filter(Boolean).find((p) => fs.existsSync(p));
}

(async () => {
    // On Linux/CI (e.g. Cloudflare Pages) use @sparticuz/chromium, a headless
    // Chromium that runs without the X11 libraries puppeteer's bundled build needs.
    if (process.platform !== "win32") {
        try {
            const chromium = require("@sparticuz/chromium");
            const { executablePath, args, headless } = chromium.default || chromium;
            config.puppeteerExecutablePath = await executablePath();
            if (Array.isArray(args)) config.puppeteerArgs = args;
            if (headless !== undefined) config.headless = headless;
        } catch (e) {
            console.warn("⚠️  Could not load @sparticuz/chromium:", e.message);
        }
    }

    // Fall back to a locally installed browser (Edge/Chrome on Windows, system Chrome on Linux).
    if (!config.puppeteerExecutablePath) {
        const local = findLocalBrowser();
        if (local) config.puppeteerExecutablePath = local;
    }

    if (process.platform !== "win32" && !config.puppeteerArgs) {
        config.puppeteerArgs = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"];
    }

    try {
        await run(config);
    } catch (error) {
        const isLaunchFailure = /Failed to launch|cannot open shared object|no such file/i.test(
            String((error && error.message) || error)
        );

        if (isLaunchFailure) {
            // No usable Chrome/Chromium in this build environment. Not fatal: the
            // site deploys as a client-rendered SPA and the static index.html still
            // ships all meta/OG/JSON-LD tags.
            console.warn(
                "⚠️  react-snap could not launch a browser in this build environment, so static pre-rendering was skipped. " +
                "The site will deploy as a client-rendered SPA (fine for Google, which executes JS)."
            );
            process.exitCode = 0;
        } else {
            console.error("react-snap failed:", error);
            process.exitCode = 1;
        }
    }
})();