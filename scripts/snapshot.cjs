const fs = require("fs");
const { run } = require("../node_modules/react-snap/index.js");

const pkg = JSON.parse(fs.readFileSync(require("path").join(process.cwd(), "package.json"), "utf8"));
const config = pkg.reactSnap || {};

function findLocalBrowser() {
    if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
    if (process.platform !== "win32") return undefined;

    const candidates = [
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
        "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
        "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
        "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
        process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe` : "",
    ].filter(Boolean);

    return candidates.find((p) => fs.existsSync(p));
}

(async () => {
    const local = findLocalBrowser();
    if (local) config.puppeteerExecutablePath = local;

    try {
        await run(config);
    } catch (error) {
        // If no Chrome/Chromium is available react-snap cannot prerender.
        // Failing hard is better than silently shipping an empty shell.
        console.error("react-snap failed:", error);
        process.exitCode = 1;
    }
})();