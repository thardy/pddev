# pddev

> Helpful tools for developers.  Currently focused on SQL interaction from the command line.

## Getting Started
Globally install pddev from npm...
```
npm install -g pddev
```

Create a config.json file wherever your pddev got installed globally -   
usually C:\users\\&lt;username&gt;\AppData\Roaming\npm\node_modules\pddev

Paste in the below initial content, replacing whatever sql local user your dev team uses...
```json
{
  "host": "127.0.0.1",
  "port": 1433,
  "username": "theNameOfYourLocalSqlUser",
  "password": "thePasswordForYourLocalSqlUser"
}
```

## Commands

```
Commands:
    help          Display help
    migratedb, m  Migrate database using scripts in local sql folder
    nukedb, n     Nuke database (drop, then create empty)
    rebuilddb, r  Rebuild your database (drop, create, migrate)
    restoredb, s  Restore database from bak file
    test, t       Test cool new console stuffs
    version       Display version

  Options:
    -d, --databaseName  The database you want to act on
    -h, --help          Output usage information
    -v, --version       Output the version number
```

## Examples
****** The following can be executed anywhere ******

### NukeDb
Nuke will kill all existing connections on named database, drop the database, recreate the database (empty), then ensure your local 
sql user has the appropriate rights on the database.
```
pddev-nukedb -d databaseName
```
Equivalent to... 
```
pddev n -d databaseName
```

****** The following require a sql folder relative to where the commands are invoked ******

### RestoreDb
Restore will look for ./sql/restore.bak relative to where the command is invoked.  It will restore the restore.bak into the named database.   The name provided must match the name in the restore.bak file.
```
pddev-restoredb -d databaseName
```
Equivalent to... 
```
pddev s -d databaseName
```

****** The following also require a postgrator.json file where the commands are invoked, in addition to a sql folder ******

Create the following file.  The convention is that each repo has one database it is responsible for.  That database is configured 
for migrations here.  We are using postgrator - https://github.com/rickbergfalk/postgrator and postgrator-cli - https://github.com/MattiLehtinen/postgrator-cli for migrations.
```json
{
    "migrationDirectory": "sql",
    "driver": "mssql",
    "host": "127.0.0.1",
    "port": 1433,
    "database": "databaseNameForMigrations",
    "username": "theNameOfYourLocalSqlUser",
    "password": "thePasswordForYourLocalSqlUser",
    "schemaTable": "DbMigrationVersion"
}
```

Postgrator also requires the sql folder to hold the sequential list of sql scripts needed to migrate the database.  See https://github.com/rickbergfalk/postgrator for details. 

### MigrateDb
Migrate will execute whatever sql scripts in the sql folder have not been executed already against the provided database.

No database name is needed because the configuration info in postgrator.json is used to migrate the database.
```
pddev-migratedb
```
Equivalent to... 
```
pddev m
```

### RebuildDb
Rebuild will execute a full Nuke, then a Migrate
```
pddev-rebuilddb -d databaseName
```
Equivalent to... 
```
pddev r
```