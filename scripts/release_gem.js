const path = require("path");
const fs = require("fs");
const git = require("nodegit");
const exec = require("child_process").exec;

const gemName = "makerspace-react-rails";
const gemFolder = path.join(__dirname, "..", gemName);

const gemRepo = {
  url: "git@github.com:ManchesterMakerspace/makerspace-react-rails.git",
  jsFolder: path.join(gemFolder, "vendor", "assets", "javascripts"),
  cssFolder: path.join(gemFolder, "vendor", "assets", "stylesheets"),
  versionFile: path.join(gemFolder, "lib", "makerspace", "react", "rails", "version.rb"),
}

const dist = path.join(__dirname, "..", "dist");

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
  if (!fs.existsSync(gemFolder)) {
    await git.Clone.clone(gemRepo.url, gemFolder);
  }

  const build = fs.readdirSync(dist);
  const jsFiles = build.filter(file => jsRegex.test(file));
  const cssFiles = build.filter(file => cssRegex.test(file));

  console.log("Bundling assets...");
  jsFiles.forEach(writeFileToFolder(gemRepo.jsFolder));
  cssFiles.forEach(writeFileToFolder(gemRepo.cssFolder));

  await publishGem(newVersion);
}

const publishGem = async (version) => {
  console.log("Publishing gem...");
  process.chdir(gemFolder);
  return new Promise(resolve => {
    exec("gem build makerspace-react-rails.gemspec", { shell: true }, (err) => {
      if (err) {
        console.error(`Error building gem: ${err}`);
        return;
      }
  
      exec(`gem push makerspace-react-rails-${version}.gem`, { shell: true }, (err) => {
        if (err) {
          console.error(`Error publishing gem: ${err}`);
          return;
        }
        resolve();
      });
    });
  });
}

module.exports = {
  packageGem,
  gemFolder,
  gemRepo
};