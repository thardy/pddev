const path = require('path');
const fs = require("fs-extra");

// this is how to do an export an asynchronous/awaitable require
module.exports = (async () => {
  const cwd = process.cwd();
  const postgratorFilePath = path.resolve(cwd, 'postgrator.json');
  postgratorConfig = await fs.readFile(postgratorFilePath, "utf8");

  // this is what will be exported
  return JSON.parse(postgratorConfig);
})();

