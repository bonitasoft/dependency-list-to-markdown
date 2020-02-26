const fs = require('fs');

class JsonDependenciesFileParser {
  /**
   * Parse JsonFile to return an object with good format
   * @param fileName filename load
   * @return {key : {'name': my-name, 'licence': 'MIT', 'version': 1.2.3}}
   */
  readJsonFile(fileName) {
    let dataToSave = {};
    let dependencies = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    Object.keys(dependencies).forEach(function (key) {
      let licence = dependencies[key].licenses;
      if (Array.isArray(licence)) {
        licence = licence.join(', ');
      }
      let separatorLastIndex = key.lastIndexOf('@');
      dataToSave[key] = {'name': key.substr(0, separatorLastIndex), 'license': licence, 'version': key.substr(separatorLastIndex + 1)};
    });
    return dataToSave;
  }

  /**
   * Parse all json files
   * @param folder
   * @returns [] Sorted array with all unique dependency
   */
  async parseFolder(folderToParse) {
    let allDependencies = {};
    fs.readdirSync(folderToParse).filter(name => name.includes('.json')).forEach(file => {
      let content = this.readJsonFile(folderToParse + '/' + file);
      allDependencies = {...allDependencies, ...content};
    });
    let sorted = Object.values(allDependencies);
    sorted.sort((a, b) => {
      let x = a['name'];
      let y = b['name'];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
    return sorted;
  }
}

module.exports = new JsonDependenciesFileParser();
