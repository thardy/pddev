#!/usr/bin/env node
'use strict';
const args = require('args');
// const SqlMigrationService = require('./sqlMigrationService');
//
// const sqlMigrationService = new SqlMigrationService();
// sqlMigrationService.migrateSql();

// do testy stuff here
args.option('testOption', 'something important');
const options = args.parse(process.argv);

console.log(`testy stuff!!! testOption is ${options.testOption}`);