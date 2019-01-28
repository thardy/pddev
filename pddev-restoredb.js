#!/usr/bin/env node
'use strict';
const sql = require('mssql/msnodesqlv8');
const args = require('args');
const SqlService = require('./sql/sqlService');
const config = require('./config.json');

args.option('databaseName', 'The database you want to act on');

(async () => {
  const sqlService = new SqlService();
  const options = args.parse(process.argv);

  //const sqlScripts = await sqlService.transformSqlScripts({ databaseName: options.databaseName }); //await require('./sqlScripts/sqlScriptService')({ databaseName: options.databaseName });

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
      connectionString: `Driver=SQL Server;Server=(local);Database=${options.databaseName};Trusted_Connection=true;`,
    };

    let dbPool = {};
    masterPool = await new sql.ConnectionPool(sqlMasterConnectionOptions).connect();
    masterPool.config.requestTimeout = 300000;
    console.log('connected to master...');

    // **** drop database
    let result = await sqlService.runScript(
        masterPool,
        sqlService.scriptNames.dropDatabase,
        `attempting to drop database ${options.databaseName}...`,
        {databaseName: options.databaseName});

    // **** create database
    result = await sqlService.runScript(
        masterPool,
        sqlService.scriptNames.createDatabase,
        `creating database ${options.databaseName}...`,
        {databaseName: options.databaseName});

    // **** create local user if not exists
    result = await sqlService.runScript(
        masterPool,
        sqlService.scriptNames.createLocalUserIfNotExists,
        `ensuring localuser exists...`,
        {
          username: config.username, password: config.password
        });

    // **** initialize security
    dbPool = await new sql.ConnectionPool(sqlDbConnectionOptions).connect();
    console.log(`connected to ${options.databaseName}...`);

    result = await sqlService.runScript(
        dbPool,
        sqlService.scriptNames.initSecurityForLocalUser,
        `initializing security for localuser on database ${options.databaseName}...`,
        {
          databaseName: options.databaseName,
          username: config.username,
          password: config.password,
        });

    console.log(`${options.databaseName} dropped and created - DONE`);
    dbPool.close();

    // **** restore database
    console.log(`attempting to restore database ${options.databaseName}...`);
    //const sqlFilePathResult = await masterPool.request().query(sqlScripts.getSqlFilePath);
    const sqlFilePathResult = await sqlService.runScript(masterPool, sqlService.scriptNames.getSqlFilePath);
    const sqlFilePath = sqlFilePathResult.recordsets[0] && sqlFilePathResult.recordsets[0][0] ? sqlFilePathResult.recordsets[0][0].sqlFilePath : null;

    result = await sqlService.restoreDatabase(masterPool,{databaseName: options.databaseName, restoreFilePath: './sql/restore.bak', sqlFilePath});

    console.log(`${options.databaseName} restored - DONE`);
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
