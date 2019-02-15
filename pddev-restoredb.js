#!/usr/bin/env node
'use strict';
const sql = require('mssql/msnodesqlv8');
const args = require('args');
const SqlService = require('./sql/sqlService');
const config = require('./config.json');

args.option('databaseName', 'The database you want to act on');

(async () => {
  const postgratorConfig = await require('./postgratorConfig');
  const sqlService = new SqlService();
  const options = args.parse(process.argv);
  const databaseName = options.databaseName ? options.databaseName : postgratorConfig.database;

  //const sqlScripts = await sqlService.transformSqlScripts({ databaseName: databaseName }); //await require('./sqlScripts/sqlScriptService')({ databaseName: databaseName });

  let masterPool = {};

  try {
    const sqlMasterConnectionOptions = {
      connectionString: `Driver=SQL Server;Server=(local);Database=master;Trusted_Connection=true;`,
    };
    // this wasn't working on all machines
    // const sqlMasterConnectionOptions = {
    //   driver: 'msnodesqlv8',
    //   server: '(local)',
    //   database: 'master',
    //   requestTimeout: 300000,
    //   options: {
    //     trustedConnection: true
    //   }
    // };
    const sqlDbConnectionOptions = {
      connectionString: `Driver=SQL Server;Server=(local);Database=${databaseName};Trusted_Connection=true;`,
    };

    masterPool = await new sql.ConnectionPool(sqlMasterConnectionOptions).connect();
    masterPool.config.requestTimeout = 600000; // 10 min
    console.log('connected to master...');

    // nuke database
    await sqlService.nukeDb(masterPool, sqlDbConnectionOptions, {databaseName: databaseName, username: config.username, password: config.password});

    // **** restore database
    console.log(`attempting to restore database ${databaseName}...`);
    //const sqlFilePathResult = await masterPool.request().query(sqlScripts.getSqlFilePath);
    const sqlFilePathResult = await sqlService.runScript(masterPool, sqlService.scriptNames.getSqlFilePath);
    const sqlFilePath = sqlFilePathResult.recordsets[0] && sqlFilePathResult.recordsets[0][0] ? sqlFilePathResult.recordsets[0][0].sqlFilePath : null;

    let result = await sqlService.restoreDatabase(masterPool,{databaseName: databaseName, restoreFilePath: './sql/restore.bak', sqlFilePath});

    console.log(`${databaseName} restored - DONE`);
    masterPool.close();
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
