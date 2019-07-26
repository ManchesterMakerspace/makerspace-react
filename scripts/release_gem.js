const path = require("path");
const fs = require("fs");
const simpleGit = require("simple-git/promise");
const exec = require("child_process").exec;

const gemName = "makerspace-react-rails";
const gemFolder = path.join(process.cwd(), gemName);

const gemRepo = {
  url: "https://github.com/ManchesterMakerspace/makerspace-react-rails.git",
  jsFolder: path.join(gemFolder, "vendor", "assets", "javascripts"),
  cssFolder: path.join(gemFolder, "vendor", "assets", "stylesheets"),
  versionFile: path.join(gemFolder, "lib", "makerspace", "react", "rails", "version.rb"),
}
const versionRegex = /\d+.\d+.\d+/;

const dist = path.join(process.cwd(), "dist");

const writeOptions = { encoding: "utf-8", flag: "w+" };
const jsRegex = /(makerspace-react.js).*/
const cssRegex = /(makerspace-react.css).*/

const writeFileToFolder = (folder) => (file) => {
  const sourcePath = path.join(dist, file);
  const targetPath = path.join(folder, file)
  fs.writeFileSync(targetPath, fs.readFileSync(sourcePath), writeOptions)
}

const packageGem = async (newVersion) => {
  if (!newVersion) {
    console.error("Cannot update gem, no version provided");
    return;
  }
  let git = simpleGit();

  if (!fs.existsSync(gemFolder)) {
    await git.clone(gemRepo.url);
  }

  // Read current version
  const currentVersion = fs.readFileSync(gemRepo.versionFile, { encoding: "utf-8" });
  const version = versionRegex.exec(currentVersion);
  if (version === newVersion) {
    throw new Error("Cannot tag gem, version already exists");
  }
  // Update version file
  const updatedVersion = currentVersion.replace(versionRegex, newVersion);
  console.log(`Updating gem to ${newVersion}`);
  fs.writeFileSync(gemRepo.versionFile, updatedVersion, writeOptions);

  // Copy react build to gem
  const build = fs.readdirSync(dist);
  const jsFiles = build.filter(file => jsRegex.test(file));
  const cssFiles = build.filter(file => cssRegex.test(file));

  console.log("Bundling assets...");
  jsFiles.forEach(writeFileToFolder(gemRepo.jsFolder));
  cssFiles.forEach(writeFileToFolder(gemRepo.cssFolder));

  await publishGem(newVersion);
}

const publishGem = async (version) => {
  console.log(`Publishing gem version ${version}...`);
  process.chdir(gemFolder);
  return new Promise(resolve => {
    exec("gem build makerspace-react-rails.gemspec", { shell: true }, (err) => {
      if (err) {
        console.error(`Error building gem: ${err}`);
        return;
      }
  
      exec(`echo ":rubygems_api_key: $GEM_HOST_API_KEY" >> ~/.gem/credentials; \
            chmod 0600 ~/.gem/credentials; \
            gem push makerspace-react-rails-${version}.gem`, { shell: true }, (err) => {
        if (err) {
          console.error(`Error publishing gem: ${err}`);
          return;
        }
        console.log("Gem published successfully");
        resolve();
      });
    });
  });
}

module.exports = packageGem;