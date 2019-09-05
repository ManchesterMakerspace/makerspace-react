import { cleanScreenshots, takeScreenshot } from '../helpers/screenshotHelper';

export class ScreenshotReporter {
  constructor({ browser }) {
    this.browser = browser;
    cleanScreenshots();
  }

  specDone(result) {
    return new Promise( async (resolve) => {
      if (result.status === 'failed') {
        this.browser.manage().logs().get("browser")
          .then(function(entries) {
              entries.forEach(function(entry) {
                console.log('[%s] %s', entry.level.name, entry.message);
              });
          });
        
        await takeScreenshot(result.fullName, resolve);
      }
    });
  }
}

module.exports = ScreenshotReporter;