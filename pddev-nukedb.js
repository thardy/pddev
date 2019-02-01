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
  // console.log(process.argv);
  const options = args.parse(process.argv);
  const databaseName = options.databaseName ? options.databaseName : postgratorConfig.database;

  //const sqlScripts = await sqlService.transformSqlScripts({ databaseName: databaseName }); //await require('./sqlScripts/sqlScriptService')({ databaseName: databaseName });

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
      connectionString: `Driver=SQL Server;Server=(local);Database=${databaseName};Trusted_Connection=true;`,
    };

    masterPool = await new sql.ConnectionPool(sqlMasterConnectionOptions).connect();
    console.log('connected to master using instance ${c}...');

    await sqlService.nukeDb(masterPool, sqlDbConnectionOptions, {databaseName: databaseName, username: config.username, password: config.password});
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

})();
