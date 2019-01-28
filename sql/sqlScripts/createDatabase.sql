if not exists (select name from sys.databases where name = N'${databaseName}')
begin
    create database ${databaseName}
end
