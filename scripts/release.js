// Bump
// Pull and package gem
// Update gem w/ this packages version
// Publish gem

/**
 * 1. Tag and commit React package
 * 3. Tag and commit gem
 * 3. Package and publish gem
 */

const { tagNpmRepo, tagRubyRepo } = require("./tag");
const { packageGem } = require("./release_gem");

const main = async () => {
  const nextTag = await tagNpmRepo();
  if (nextTag) {
    await tagRubyRepo(nextTag);
    await packageGem(nextTag);
  }
};

main();
