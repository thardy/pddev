#!/usr/bin/env node
const args = require('args');

// When adding a command here, you have to add an entry to the bin node of package.json.
// Also, when developing locally, you have to run "npm link" for it to work from the command line.  When installing
//  this app from an npm package (assuming we make one), that part will be taken care of for you.
args
  .option('databaseName', 'The database you want to act on')
  .command('migratedb', 'Migrate database using scripts in local sql folder', ['m'])
  .command('nukedb', 'Nuke database (drop, then create empty)', ['n'])
  .command('rebuilddb', 'Rebuild your database (drop, create, migrate)', ['r'])
  .command('restoredb', 'Restore database from bak file', ['s'])
  .command('test', 'Test cool new console stuffs', ['t']);

global.options = args.parse(process.argv);

// (async () => {
//   global.sqlScripts = await sqlScripts.loadSqlScripts({ databaseName: flags.databaseName});
// })();

console.log('main finished');