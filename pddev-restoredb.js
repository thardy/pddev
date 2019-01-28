#!/usr/bin/env node
'use strict';
const sql = require('mssql/msnodesqlv8');
const args = require('args');
const SqlService = require('./sql/sqlService');
const SqlMigrationService = require('./sqlMigrationService');

args.option('databaseName', 'The database you want to act on');

(async () => {
  const sqlService = new SqlService();
  const options = args.parse(process.argv);

  //const sqlScripts = await sqlService.transformSqlScripts({ databaseName: options.databaseName }); //await require('./sqlScripts/sqlScriptService')({ databaseName: options.databaseName });

  let masterPool = {};

  try {
    // this was working, but could not set request timeout
    // const sqlMasterConnectionOptions = {
    //   connectionString: `Driver=SQL Server;Server=(local);Database=master;Trusted_Connection=true;`,
    // };
    const sqlMasterConnectionOptions = {
      driver: 'msnodesqlv8',
      server: '(local)',
      database: 'master',
      requestTimeout: 300000,
      options: {
        trustedConnection: true
      }
    };

    masterPool = await new sql.ConnectionPool(sqlMasterConnectionOptions).connect();
    console.log('connected to master...');

    // **** restore database
    console.log(`attempting to restore database ${options.databaseName}...`);
    //const sqlFilePathResult = await masterPool.request().query(sqlScripts.getSqlFilePath);
    const sqlFilePathResult = await sqlService.runScript(masterPool, sqlService.scriptNames.getSqlFilePath);
    const sqlFilePath = sqlFilePathResult.recordsets[0] && sqlFilePathResult.recordsets[0][0] ? sqlFilePathResult.recordsets[0][0].sqlFilePath : null;

    const result = await sqlService.restoreDatabase(masterPool,{databaseName: options.databaseName, restoreFilePath: './sql/restore.bak', sqlFilePath});

    console.log(`${options.databaseName} restored - DONE`);
  }
  catch (err) {
    console.log(err);
  }
  finally {
    if (masterPool && masterPool.close) {
      masterPool.close();
    }
  }

  //process.exit(0);

})();
