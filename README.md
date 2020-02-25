# dependency-list-to-markdown

https://img.shields.io/npm/l/@bonitasoft/dependency-list-to-markdown
https://img.shields.io/npm/v/@bonitasoft/dependency-list-to-markdown

This library is a dev-ops internal tooling for Bonita platform.  

## Usage 

This library parse a folder who contains your dependencies files and create a markdown file.

Compatible extensions:

* Json file (get it from npm [license-checker](https://www.npmjs.com/package/license-checker))
* Html file (for example, from maven-project-info-reports-plugin generate a report site)

Each extension get a Specific parser.

## Generate Markdown content

Run 
    
    node .src/generateMarkdownContent.js --folder ${FOLDER} --outputFile ${OUTPUT_FILE}
    
See [Options part](#Mandatory arguments)

### Mandatory arguments

| Arguments         | description            | Mandatory  
|--------------|--------------------|-------
| --outputFile (-o)        | Write Markdown file to create or update to list dependencies           | True 
| --folder  (-f)    | Folder who contains dependencies files            | True

### Optionals arguments

| Option         | description            | Mandatory  
|--------------|--------------------|------- 
| --frontend         | if true, run parse only `Node or Bower` dependencies           | False | 
| --backend         | if true, run parse only `Maven` dependencies            | False
| --header (-h)    | String to add on the top of generated file            | False 
| --description (-d)    | String to add just below the file title            | False 
| --help         | Display Usage for command            | False

