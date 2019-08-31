const ScreenshotReporter = require('./screenshotReporter');
jasmine.getEnv().addReporter(new ScreenshotReporter({ browser }));