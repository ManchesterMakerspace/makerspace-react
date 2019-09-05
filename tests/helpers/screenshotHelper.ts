import * as fs from "fs";
import * as path from "path";
const mkdirp = require('mkdirp');
const tmpDir = path.resolve(__dirname, '../../tmp');
const screenshotDir = path.resolve(__dirname, '../../tmp/screenshots');

export async function takeScreenshot(filename: string, onFinish?: () => void) {
  try {
    const screenshot = await browser.takeScreenshot();
    const screenshotFilename = path.format({ dir: screenshotDir, name: filename, ext: '.png' });

    mkdirp.sync(screenshotDir);
    fs.writeFileSync(screenshotFilename, screenshot, 'base64');
    console.log("saved screenshot");
  } catch (e) {
    console.log("Error saving screenshot", e);
  } finally {
    onFinish && onFinish();
  }
}

export function cleanScreenshots() {
  if (!fs.existsSync(screenshotDir)) {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir)
    }
    fs.mkdirSync(screenshotDir)
  } else {
    const files = fs.readdirSync(screenshotDir);
    files.forEach((file) => fs.unlinkSync(path.join(screenshotDir, file)));
  }
}