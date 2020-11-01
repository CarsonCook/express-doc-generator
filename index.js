const fs = require('fs');

const projectName = 'QPlan Back End';
const projectDescription = 'My project';
const tag = '@express-doc-generator';
const expressObject = 'app';
const requestObject = 'req';
const httpMethods = ['get', 'post', 'put', 'delete'];
const requestFields = ['body', 'params', 'query'];
const startTag = 'start';
const descriptionTag = 'description ';
const endTag = 'end';
const anyChar = '[\\s\\S]';
const files = [
    'C:\\Users\\cookc\\Desktop\\Code\\qplan\\back-end\\server\\routing\\coursesRouting.js',
    'C:\\Users\\cookc\\Desktop\\Code\\qplan\\back-end\\server\\routing\\gradRequirementsRouting.js',
];

const outputFile = 'API Documentation.md';
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

        const {groups: {method}} = api.match(methodRegex);
        const route = 'route';
        fs.appendFileSync(outputFile, `##${method.toUpperCase()} ${route}\n`);

        // Capture API information
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
//TODO config for app, request body, files, matching route
//TODO get privileges?
