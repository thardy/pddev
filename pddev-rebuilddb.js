#!/usr/bin/env node
'use strict';
const sql = require('mssql/msnodesqlv8');
const args = require('args');
const SqlService = require('./sql/sqlService');
const SqlMigrationService = require('./sqlMigrationService');
const config = require('./config.json');

args.option('databaseName', 'The database you want to act on');

(async () => {
  const sqlService = new SqlService();
  const sqlMigrationService = new SqlMigrationService();
  // console.log(process.argv);
  const options = args.parse(process.argv);

  //const sqlScripts = await sqlService.transformSqlScripts({ databaseName: options.databaseName }); //await require('./sqlScripts/sqlScriptService')({ databaseName: options.databaseName });

  let masterPool = {};
  let dbPool = {};

  try {
    const sqlMasterConnectionOptions = {
      connectionString: `Driver=SQL Server;Server=(local);Database=master;Trusted_Connection=true;`,
    };
    // this wasn't working on all machines
    // const sqlMasterConnectionOptions = {
    //   driver: 'msnodesqlv8',
    //   server: '(local)',
    //   database: 'master',
    //   options: {
    //     trustedConnection: true
    //   }
    // };
    const sqlDbConnectionOptions = {
      connectionString: `Driver=SQL Server;Server=(local);Database=${options.databaseName};Trusted_Connection=true;`,
    };

    masterPool = await new sql.ConnectionPool(sqlMasterConnectionOptions).connect();
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
    masterPool.close();

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

    console.log(`migrating sql in local sql folder...`);
    sqlMigrationService.migrateSql();
  }
  catch (err) {
    console.log(err);
  }
  finally {
    if (masterPool && masterPool.close) {
      masterPool.close();
    }
    if (dbPool && dbPool.close) {
      dbPool.close();
    }
  }

  //process.exit(0);

})();
