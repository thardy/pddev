const glob = require('glob');
const path = require('path');
const fs = require("fs-extra");

class SqlService {
  constructor() {
    // not really using this anymore, but it's nice to know how to do it...
    // dynamically look for all *.sql files in the sqlScripts folder
    const findSqlScripts = () =>
        glob.sync('/sqlScripts/*.sql', { root: __dirname })
          .sort()
          .map((file) => {
            const sqlScriptFilename = path.resolve(__dirname, file);
            return sqlScriptFilename;
          });

    this.sqlScriptFilenames = findSqlScripts();

    // this object just acts like an enum
    this.scriptNames = {
      createDatabase: 'createDatabase',
      createLocalUserIfNotExists: 'createLocalUserIfNotExists',
      dropDatabase: 'dropDatabase',
      getSqlFilePath: 'getSqlFilePath',
      initSecurityForLocalUser: 'initSecurityForLocalUser',
      restoreDatabase: 'restoreDatabase'
    };
  }

  // this isn't used anymore.  We load and transform scripts on demand instead of all at once
  async transformSqlScripts (data) {
    const scripts = {};

    for (const sqlScriptFilename of this.sqlScriptFilenames) {
      let friendlyName = sqlScriptFilename.replace('.sql', '');
      friendlyName = friendlyName.substring(friendlyName.lastIndexOf("\\") + 1);
      const sqlScriptTemplate = await this.loadScript(sqlScriptFilename);
      const scriptWithTemplateApplied = this.transformTemplate(sqlScriptTemplate, data);
      scripts[friendlyName] = scriptWithTemplateApplied;
    }

    // return an object with all the transformed scripts (templates applied with data) hanging off of it
    // e.g. {
    //   createDatabase: 'if not exists (select ...',
    //   dropDatabase: 'declare ...'
    // }
    return scripts;
  }

  async loadScript(scriptFileName) {
    let sqlScriptTemplate = '';

    try {
      sqlScriptTemplate = await fs.readFile(`${scriptFileName}`, "utf8");
    }
    catch (err) {
      console.log(err);
    }

    return sqlScriptTemplate;
  }

  async runScript(db, scriptName, message, data) {
    //const messageOutput = this.transformTemplate(message, data);
    if (message) {
      console.log(message);
    }

    const dataForTemplate = data ? data : {}; // if data is undefined, just use an empty object

    const scriptFilePath = this.getFilePathForScript(scriptName);
    const sqlScriptTemplate = await this.loadScript(scriptFilePath);
    const scriptWithTemplateApplied = this.transformTemplate(sqlScriptTemplate, dataForTemplate);
    let result = await db.request().query(scriptWithTemplateApplied);

    return result;
  }

  async restoreDatabase(db, data) {
    // expecting data.filePath to be relative to where we were called from
    const cwd = process.cwd();
    if (data.restoreFilePath) {
      data.restoreFilePath = path.resolve(cwd, data.restoreFilePath);
    }
    else {
      data.restoreFilePath = path.resolve(cwd, './sql/restore.bak');
    }
    const restoreScriptFilePath = this.getFilePathForScript(this.scriptNames.restoreDatabase);
    const sqlScriptTemplate = await this.loadScript(restoreScriptFilePath);
    const scriptWithTemplateApplied = this.transformTemplate(sqlScriptTemplate, data);
    let result = await db.request().query(scriptWithTemplateApplied);
    return result;
  }

  getFilePathForScript(scriptName) {
    const fullScriptFilePath = path.resolve(__dirname, `./sqlScripts/${scriptName}.sql`);
    return fullScriptFilePath;
  }

  transformTemplate(template, data) {
    let transformedTemplate = template;
    for (const key in data) {
      const regex = new RegExp('\\${' + key + '}', 'g');
      transformedTemplate = transformedTemplate.replace(regex, data[key]);
    }
    return transformedTemplate;
  }
}


module.exports = SqlService;