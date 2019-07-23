const git = require("nodegit");
const path = require("path");
const fs = require("fs");
const { gemRepo, gemFolder } = require("./release_gem");
const methodRegex = /#(patch|minor|major)$/m;
const writeOptions = { encoding: "utf-8", flag: "w+" };
const versionRegex = /\d+.\d+.\d+/;

const getLastTag = async (repo) => {
  const tags = await git.Tag.list(repo);
  return tags.length ? tags[tags.length - 1] : "0.0.0";
}

const parseCommitForMethod = async (repo) => {
  const lastCommit = await repo.getHeadCommit();
  const commitMsg = lastCommit.message();
  // Parse commit for tagging method
  const methodMatches = methodRegex.exec(commitMsg);
  return Array.isArray(methodMatches) && methodMatches[1];
}

const getCommitByTag = async (repo, tagName) => {
  const tagRef = await git.Reference.lookup(repo, `refs/tags/${tagName}`);
  const tagCommitRef = await tagRef.peel(git.Object.TYPE.COMMIT);
  return git.Commit.lookup(repo, tagCommitRef.id());
}

const applyMethodToTag = (method, tagName) => {
  const [major, minor, patch] = tagName.split(".");
  if (method === "patch") {
    nextTag = `${major}.${minor}.${Number(patch)+1}`;
  } else if (method === "minor") {
    nextTag = `${major}.${Number(minor)+1}.0`;
  } else if (method === "major") {
    nextTag = `${Number(major)+1}.0.0`;
  }
  return nextTag;
}

const tagRepo = async (repo, tag) => {
  let nextTag = tag;
  const lastCommit = await repo.getHeadCommit();
  console.log("lastCommit", await lastCommit.message());

  const masterCommit = await repo.getMasterCommit();
  console.log("master commit", await masterCommit.message());

  const tagName = await getLastTag(repo);
  const taggedCommit = await getCommitByTag(repo, tagName);
  if (taggedCommit.sha() === lastCommit.sha()) {
    console.log(`Branch already tagged with: ${tagName}`);
    return;
  }

  if (!nextTag) {
    const method = await parseCommitForMethod(repo);
    if (!method) {
      console.log("No tagging for this commit");
      return;
    }
    nextTag = applyMethodToTag(method, tagName);
  }

  // Create new tag
  if (nextTag) {
    console.log(`Tagging repo: ${nextTag}`)
    await git.Tag.createLightweight(repo, nextTag, lastCommit, 0);
  }

  return nextTag;
}

const pushRepo = async (repo) => {
  const remote = await repo.getRemote('origin');
  await remote.push(
    ['refs/heads/master:refs/heads/master'],
    {
      callbacks: {
        credentials: async (url, username) => await git.Cred.sshKeyMemoryNew(
          username,
          process.env.PUBLIC_KEY,
          process.env.PRIVATE_KEY,
          process.env.PASSPHRASE,
        )
      }
    },
    repo.defaultSignature(),
    "Push to master"
  )
}

const tagNpmRepo = async () => {
  console.log("Bumping NPM Package");
  const reactRepo = await git.Repository.open(path.join(__dirname, ".."));
  const nextTag = await tagRepo(reactRepo);

  if (nextTag) {
    const packaageFilePath = path.join(__dirname, "..", "package.json");
    const currentPackage = fs.readFileSync(packaageFilePath, { encoding: "utf-8" });
    const packageJson = JSON.parse(currentPackage);
    const newPackage = {
      ...packageJson,
      version: nextTag,
    }

    console.log(`Updating package to ${nextTag}`);
    fs.writeFileSync(packaageFilePath, JSON.stringify(newPackage, null, 2), writeOptions);
    await pushRepo(reactRepo);
  }

  return nextTag;
}

const tagRubyRepo = async (newVersion) => {
  if (newVersion) {
    console.log("Bumping Gem");
    if (!fs.existsSync(gemFolder)) {
      await git.Clone.clone(gemRepo.url, gemFolder, {
        fetchOpts: {
          callbacks: {
            credentials: async (url, username) => await git.Cred.sshKeyMemoryNew(
              username,
              process.env.PUBLIC_KEY,
              process.env.PRIVATE_KEY,
              process.env.PASSPHRASE,
            )
          }
        }
      });
    }

    const rubyRepo = await git.Repository.open(gemFolder);

    await tagRepo(rubyRepo, newVersion);

    const currentVersion = fs.readFileSync(gemRepo.versionFile, { encoding: "utf-8" });
    const version = versionRegex.exec(currentVersion);
    if (version === currentVersion) {
      throw new Error("Cannot tag gem, version already exists");
    }

    const updatedVersion = currentVersion.replace(versionRegex, newVersion);

    console.log(`Updating gem to ${newVersion}`);
    fs.writeFileSync(gemRepo.versionFile, updatedVersion, writeOptions);
    await pushRepo(rubyRepo);
  }

  return newVersion;
}

module.exports = {
  tagNpmRepo,
  tagRubyRepo,
};
