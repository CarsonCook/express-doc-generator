const fs = require('fs');
let configJson = {};
try {
    configJson = JSON.parse(fs.readFileSync('./express-doc-generator.json', 'utf8'));
} catch (e) {
    try {
        configJson = JSON.parse(fs.readFileSync('./package.json', 'utf8')).expressDocGenerator || {};
    } catch (e) {
        console.err(`Could not read configuration file: ${e}`);
    }
}

const projectName = 'QPlan Back End';
const projectDescription = 'My project';
const outputFile = 'API Documentation.md';
const tag = configJson.tag || '@express-doc-generator';
const expressObject = configJson.expressObject || 'asdf';
const requestObject = configJson.requestObject || 'asdf';
const httpMethods = ['get', 'post', 'put', 'delete']; // HTTP methods to parse out of routing of Express app
const requestFields = ['body', 'params', 'query']; // Request fields to parse out of routing of Express app
const startTag = configJson.startTag || 'start';
const descriptionTag = configJson.descriptionTag + ' ' || 'description '; // expect a space between 'description' and the text
const endTag = configJson.endTag || 'end';
const anyChar = '[\\s\\S]';
const files = configJson.files || [
    'C:\\Users\\cookc\\Desktop\\Code\\qplan\\back-end\\server\\routing\\coursesRouting.js',
    'C:\\Users\\cookc\\Desktop\\Code\\qplan\\back-end\\server\\routing\\gradRequirementsRouting.js',
];

fs.writeFileSync(outputFile, `#${projectName}\n${projectDescription}\n`); // Write to file instead of append to overwrite past data

files.forEach(file => {
    const fileContent = fs.readFileSync(file, 'utf8');

    const apiRegex = new RegExp(`${tag} ${startTag}(?<api>${anyChar}*?)${tag} ${endTag}`, 'ig');
    const descriptionRegex = new RegExp(`${tag} ${descriptionTag}(?<description>${anyChar}*?)$`, 'im');
    const methodRegex = new RegExp(`${expressObject}\.(?<method>${httpMethods.join('|')})`, 'i');
    const requestFieldsRegexes = {};
    requestFields.forEach(field => {
        requestFieldsRegexes[field] = (new RegExp(`${requestObject}\.${field}\.(?<${field}>[\\w\\d_\\-$]*)`, 'ig'));
    });

    // Capture all APIs
    const matches = fileContent.matchAll(apiRegex);
    for (const match of matches) {
        const {groups: {api}} = match;

        // Capture API endpoint
        const {groups: {method}} = api.match(methodRegex);
        const route = 'route';
        fs.appendFileSync(outputFile, `##${method.toUpperCase()} ${route}\n`);

        // Capture API description
        const descriptionMatch = api.match(descriptionRegex);
        if (descriptionMatch) {
            const {groups: {description}} = descriptionMatch;
            fs.appendFileSync(outputFile, `${description}\n`);
        }

        // Capture API request fields
        Object.keys(requestFieldsRegexes).forEach(key => {
            const matches = [...api.matchAll(requestFieldsRegexes[key])];
            if (matches.length > 0) {
                fs.appendFileSync(outputFile, `###Request ${key}:\n`);
                for (const match of matches) {
                    fs.appendFileSync(outputFile, `* ${match.groups[key]}\n`);
                }
                fs.appendFileSync(outputFile, '\n');
            }
        });

        console.log(api);
    }
});

//TODO get the route
//TODO handle directory locations and specific files
//TODO get privileges?
//TODO after @express-api-doc start allow setting express and request object names
//TODO handle no match cases
