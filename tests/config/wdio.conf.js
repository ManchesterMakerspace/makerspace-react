const { mkdirSync } = require("fs");
const { resolve } = require("path");

const screenshotDir = resolve(process.cwd(), "tmp", "screenshots");

const domain = process.env.APP_DOMAIN || "localhost";
const port = process.env.PORT || (!process.env.APP_DOMAIN && "3035");
const rootURL = `http://${domain}${port ? `:${port}` : ""}`;

exports.config = {
    baseUrl: rootURL,
    framework: "mocha",
    maxInstances: 1,
    reporters: ['spec'],
    waitForTimeout: 5 * 1000,
    mochaOpts: {
        ui: "bdd",
        retries: 3,
        timeout: 2 * 60 * 1000,
        require: [
            "tsconfig-paths/register"
        ],
        ...process.env.NO_ONLY && { forbidOnly: true }
    },
    runner: "local",
    reports: ["spec"],
    logLevel: "info",
    bail: 0,
    connectionRetryTimeout: 90 * 1000,
    connectionRetryCount: 3,
    services: [
        "selenium-standalone", 
        "devtools", 
        ...process.env.STATIC_SERVER ? [
            ['static-server', {
                folders: [
                    { mount: '/', path: './dist' },
                ],
                middleware:[
                    { mount: "/*", middleware: (req, res) => {
                        res.sendFile(process.cwd() + '/dist/index.html');
                      }
                    }
                ],
                port
            }]
        ] : []
    ],
    capabilities: [{
        browserName: "chrome",
        "goog:chromeOptions": {
            args: [
                "--disable-features=IsolateOrigins,site-per-process",
                "--auto-open-devtools-for-tabs",
                "--disable-dev-shm-usage",
                ...process.env.HEADLESS ? [
                    "--headless",
                    "--disable-gpu",
                    "--hide-scrollbars",
                    "--mute-audio",
                ] : []
            ]
        }
    }],
    before() {
        require('ts-node').register({
            project: "./tsconfig.wdio.json",
            files: true
        });
        mkdirSync(screenshotDir, { recursive: true });
        require("./customCommands");
    },
    async beforeHook() {
        if (process.env.SIZE === "mobile") {
            // Set to a width of 900 b/c the dev tools panel is open and included in this size
            await browser.setWindowSize(900, 1136)
        } else {
            await browser.maximizeWindow()
        }
    },
    async afterTest(
        { title },
        context,
        { passed }
    ) {
        if (!passed) {
            try {
                await browser.saveScreenshot(resolve(screenshotDir, `${title}.png`));
            } catch {}
        }
    }
}