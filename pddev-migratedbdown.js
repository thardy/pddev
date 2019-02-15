#!/usr/bin/env node
'use strict';
const args = require('args');
const sql = require('mssql/msnodesqlv8');
const SqlService = require('./sql/sqlService');
const SqlMigrationService = require('./sqlMigrationService');

(async () => {
  const postgratorConfig = await require('./postgratorConfig');
  const sqlService = new SqlService();
  const sqlMigrationService = new SqlMigrationService();
  const options = args.parse(process.argv);

  // this is whatever is typed just after this subcommand: pddev-migratedbdown 5 u
  const version = args.sub[0]; // would be 5 from above example
  // this is whatever is typed as second parameter after this subcommand: pddev-migratedbdown 5 u
  const migrateUp = args.sub[1]; // would be u from above example

  let dbPool = {};

  try {
    const sqlDbConnectionOptions = {
      connectionString: `Driver=SQL Server;Server=(local);Database=${postgratorConfig.database};Trusted_Connection=true;`,
    };

    dbPool = await new sql.ConnectionPool(sqlDbConnectionOptions).connect();
    console.log(`connected to ${postgratorConfig.database}...`);

    let result = await sqlService.runScript(dbPool, sqlService.scriptNames.migrateDown, `migrating down to version ${version}...`, {version: version});

    if (migrateUp && migrateUp === 'u') {
      sqlMigrationService.migrateSql();
    }
  }
  catch (err) {
    console.log(err);
  }
  finally {
    if (dbPool && dbPool.close) {
      dbPool.close();
    }
  }

})();
