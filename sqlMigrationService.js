'use strict';
// const args = require('args');
const {spawn} = require('child_process');

class SqlMigrationService {
  constructor() {
  }

  async migrateSql() {
    const shellCmd = spawn('cmd', ['/c', 'postgrator']);

    shellCmd.stdout.on('data', data => process.stdout.write(`${data}`));
    shellCmd.stderr.on('data', data => process.stdout.write(`${data}`));
    shellCmd.on('close', code => console.log(`child process exited with code ${code}`) );
    shellCmd.on('error', (err) => console.log('shellCmd error', err) );
  }

}

module.exports = SqlMigrationService;

