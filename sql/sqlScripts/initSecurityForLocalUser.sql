IF NOT EXISTS (SELECT * from sys.sysusers WHERE name = '${username}')
BEGIN
    create USER [${username}] from LOGIN [${username}]
    ALTER ROLE [db_owner] ADD MEMBER [${username}]
END

--================================================================
PRINT '<<< ${databaseName} Security set >>>'
--================================================================
