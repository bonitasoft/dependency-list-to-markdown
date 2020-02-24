const {promisify} = require('util');
const jsdom = require('jsdom').JSDOM;
const readdir = promisify(require('fs').readdir);
const stat = promisify(require('fs').stat);

/**
 * JavaDependencyRow is used to parse and store a line of html array
 */
class javaDependencyRow {
  init(cells) {
    this.groupId = cells[0].textContent.trim();
    this.artifactId = cells[1].textContent.trim();
    this.version = cells[2].textContent.trim();
    this.type = cells[3].textContent.trim();
    let tmp = [];
    Object.values(cells[4].querySelectorAll('a')).forEach(a => {
      tmp.push(a.textContent.replace(/\r?\n|\r/, "").trim())
    });
    this.licences = tmp.join(' ,').trim();
  }

  /**
   *
   * @returns {{groupId: *, artifactId: *, type: *, version: *, licences: string}}
   */
  toObject() {
    return {
      "groupId": this.groupId,
      "artifactId": this.artifactId,
      "version": this.version,
      "type": this.type,
      "licences": this.licences
    }
  }

  /**
   * Get id for dependencies
   *
   * @returns {} groupId.artifactId
   */
  getId() {
    return this.groupId.concat('.').concat(this.artifactId);
  }
}

class HTMLDependenciesFileParser {
  async readHtmlFile(fileName) {
    let dataToSave = {};
    await jsdom.fromFile(fileName).then(dom => {

      // Right dependencies is always in first table
      let table = dom.window.document.querySelector('table');

      // Remove first element of table (it's header)
      let rowsAsArrays = Object.values(table.rows);
      rowsAsArrays.shift();

      rowsAsArrays.forEach(row => {
        let depRow = new javaDependencyRow();
        depRow.init(row.cells);
        dataToSave[depRow.getId()] = depRow.toObject();
      });
    });
    return dataToSave;
  }

  async parseFolder(folder) {
    let allDependencies = {};
    let files = await readdir(folder);
    for (let file of files) {
      let absPathSubDirectory = `${folder}/${file}`;
      let stats = await stat(absPathSubDirectory);
      if (stats.isDirectory()) {
        // Parse file and add dependencies in global list
        await this.readHtmlFile(`${absPathSubDirectory}/dependencies.html`).then(data => {
          allDependencies = {...allDependencies, ...data};
        });
      }
    }
    let sorted = Object.values(allDependencies);
    sorted.sort((a, b) => {
      let x = a['groupId'];
      let y = b['groupId'];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
    return sorted;
  }
}

module.exports = new HTMLDependenciesFileParser();




