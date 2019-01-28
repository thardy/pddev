-- kill any existing connections
declare @databaseName nvarchar(50)
set @databaseName = N'${databaseName}'
declare @SQL varchar(max)
select @SQL = coalesce(@SQL,'') + 'Kill ' + Convert(varchar, SPId) + ';'
from master..SysProcesses
where DBId = DB_ID(@databaseName) AND SPId <> @@SPId
exec(@sql)


RESTORE DATABASE [${databaseName}] FROM DISK = '${restoreFilePath}' WITH FILE = 1,
MOVE '${databaseName}' TO '${sqlFilePath}${databaseName}.mdf',
MOVE '${databaseName}' TO '${sqlFilePath}${databaseName}.ldf',
REPLACE
