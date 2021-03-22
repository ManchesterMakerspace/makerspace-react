const path = require("path");
const fs = require("fs");
const simpleGit = require("simple-git/promise");
// const exec = require("child_process").exec;
const spawn = require("child_process").spawn;

const port = process.env.PORT || 3002;
const reactFolder = path.join(__dirname, "..");
const railsName = "makerspace-rails";
const tmp = path.join(process.cwd(), "tmp");
const railsFolder = path.join(tmp, railsName);
const screenshotsDir = path.join(tmp, "screenshots");
// Weird to put it in a screenshots folder but this is the folder that gets uploaded
const railsLogFile = path.join(screenshotsDir, "rails.log");
const reactLogFile = path.join(screenshotsDir, "react.log");

const railsRepo = {
  url: "https://github.com/ManchesterMakerspace/makerspace-rails.git",
}

const integrationTest = async () => {
  if (!fs.existsSync(tmp)) {
    fs.mkdirSync(tmp);
  }

  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }


  let git = simpleGit();
  if (!fs.existsSync(railsFolder)) {
    await git.clone(railsRepo.url, railsFolder);

    if (process.env.RAILS_VERSION) {
      await git.checkout(process.env.RAILS_VERSION);
    }
  }

  const railsLogs = fs.createWriteStream(railsLogFile, { flags: 'a' });
  const reactLogs = fs.createWriteStream(reactLogFile, { flags: 'a' });

  return new Promise((resolve, reject) => {
    const runCmd = (cmd, logsFile, callback) => {
      const cmdProcess = spawn(cmd, undefined, { shell: true });
      cmdProcess.stdout.on('data', (data) => {
        logsFile.write(data);
      });
      cmdProcess.stderr.on('data', (data) => {
        logsFile.write(data);
      });
      cmdProcess.on('error', (error) => {
        logsFile.write(error);
      });
      cmdProcess.on("close", code => {
        if (!code) {
          callback();
        } else {
          endProcess(code);
        }
      });

      return cmdProcess;
    }

    const startTest = () => {
      process.chdir(reactFolder);
      console.log(`Starting test`);
      runCmd(`RAILS_DIR=${railsFolder} PORT=${port} yarn e2e`, reactLogs, endProcess);
    };
    const startRails = () => {
      process.chdir(railsFolder);
      console.log(`Starting Rails...`);
      runCmd(`LOG_TESTS=true RAILS_ENV=test bundle exec rake db:db_reset && RAILS_ENV=test rails s -b 0.0.0.0 -p ${port} -d`, railsLogs, startTest);
    };
    const bundle = () => {
      process.chdir(railsFolder);
      console.log(`Installing Rails...`);
      runCmd("bundle install", railsLogs, startRails);
    };
    const endProcess = (code = 0) => {
      // Close logs
      railsLogs.end();
      reactLogs.end();

      // Find the server PID and kill it
      const pidFile = path.join(railsFolder, "tmp", "pids", "server.pid");
      if (fs.existsSync(pidFile)) {
        fs.readFile(pidFile, 'utf8', function(err, data) {
          if (err) throw err;
          const pid = Number(data);
          if (pid != NaN) {
            process.kill(pid);
          }
        });
      }

      // Exist this process
      process.exit(code);
    };

    bundle();
  });
};

integrationTest();
