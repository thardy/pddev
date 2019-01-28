#!/usr/bin/env node
'use strict';
const args = require('args');
const SqlMigrationService = require('./sqlMigrationService');

const sqlMigrationService = new SqlMigrationService();
sqlMigrationService.migrateSql();