IF EXISTS (SELECT * from sys.sysusers WHERE name = 'localuser')
BEGIN
   DROP USER localuser
END

create USER localuser from LOGIN localuser
ALTER ROLE [db_owner] ADD MEMBER localuser

--================================================================
PRINT '<<< ${databaseName} Security set >>>'
--================================================================
