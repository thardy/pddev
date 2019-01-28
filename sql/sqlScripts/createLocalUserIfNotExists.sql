IF NOT EXISTS (SELECT name FROM sys.syslogins WHERE name = '${username}')
    CREATE LOGIN localuser WITH PASSWORD = N'${password}'
