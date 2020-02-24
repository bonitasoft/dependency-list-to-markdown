const fs = require('fs');
const commandLineArgs = require('command-line-args');
const json2md = require('json2md');

// Custom Parser for dependency report
// Maven dependencies
const nodeParser = require('./nodeDependenciesParser');
// Npm/Yarn/Bower dependencies
const mavenParser = require('./mavenDependenciesParser');

const optionDefinitions = [
    {name: 'header', alias: 'h', type: String},
    {name: 'description', alias: 'd', type: String},
    {name: 'folder', alias: 'f', type: String},
    {name: 'outputFile', alias: 'o', type: String},
    {name: 'frontend', type: Boolean},
    {name: 'backend', type: Boolean},
    {name: 'help', type: Boolean}
];


const options = commandLineArgs(optionDefinitions);

if (options.help) {
    console.info(`\n Usage:`);
    console.info(`         node updateDocumentation --folder myFolder --outputFile dependencies.md`);
    console.info(`\n Mandatory parameters \n`);
    console.info(`    > --folder`, 'Folder who contains file to parse');
    console.info(`    > --outputFile`, 'File where generate the markdown dependencies list');
    console.info(``);
    console.info(`\n Optionals parameters \n`);
    console.info(`    > --header`, 'Header to add on the start of the file');
    console.info(`    > --descriptor`, 'Header to add on the start of the file');
    console.info(`    > --frontend`, 'Parse frontend dependencies');
    console.info(`    > --backend`, ' Parse backend dependencies');
    process.exit(0);
}


const folder = options.folder || exitWithError("--folder");
const outputFile = options.outputFile || exitWithError("--outputFile");
const header = options.header || 'Dependencies';
const desc = options.description || '';

console.info(`Parsing dependencies from ${options.folder}`);

let dependencies = [];

if (isFrontendRequired()) {
    let a = nodeParser.parseFolder(folder).then(data => ({data: data, name: 'frontend'}));
    dependencies.push(a);
}

if (isBackendRequired()) {
    let b = mavenParser.parseFolder(folder).then(data => ({data: data, name: 'backend'}));
    dependencies.push(b);
}

// This treatment is asynchrone, we need to wait all to write only one time in file
Promise.all(dependencies).then(values => {
    // write into files here
    console.info('Successfully parsing dependencies files');
    let finalMd = {};
    values.forEach(promise => {
        let data = promise.data;
        if (promise.name === 'backend') {
            finalMd[promise.name] = generateBackPart(data);

        } else if (promise.name === 'frontend') {
            finalMd[promise.name] = generateFrontPart(data);
        }
    });

    let md = json2md([{h1: header}, {p : desc}, Object.values(finalMd)]);
    // Create or write file and push content
    fs.writeFileSync(`${outputFile}`, md, function (err) {
        if (err) throw err;
    });
    console.info("File is updated !");
});

/**
 * Create frontPart for documentation site
 * @param data
 * @returns {*[]}
 */
function generateFrontPart(data) {
    return [{h3: `Frontend`}, {
        table: {
            headers: ["name", "version", "license"],
            rows: data
        }
    }];
}

/**
 * Create backPart for documentation site
 * @param data
 * @returns {*[]}
 */
function generateBackPart(data) {
    return [{h3: `Backend`}, {
        table: {
            headers: ["groupId", "artifactId", "version", "type", "licences"],
            rows: data
        }
    }];
}

function isFrontendRequired() {
    return options.frontend || (!options.frontend && !options.backend);
}

function isBackendRequired() {
    return options.backend || (!options.frontend && !options.backend);
}

function exitWithError(parameterName) {
    console.error(`${parameterName} is mandatory. You can run --help to get more information`);
    process.exit(1);
}
