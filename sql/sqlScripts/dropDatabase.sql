-- kill any existing connections
declare @databaseName nvarchar(50)
set @databaseName = N'${databaseName}'
declare @SQL varchar(max)
select @SQL = coalesce(@SQL,'') + 'Kill ' + Convert(varchar, SPId) + ';'
from master..SysProcesses
where DBId = DB_ID(@databaseName) AND SPId <> @@SPId
exec(@sql)


IF (EXISTS (SELECT name FROM master.dbo.sysdatabases
    WHERE ('[' + name + ']' = @databaseName
    OR name = @databaseName)))
BEGIN
    drop database ${databaseName}
END
