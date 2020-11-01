const fs = require('fs');

const tag = '@express-doc-generator';
const expressObject = 'app';
const requestObject = 'req';
const httpMethods = ['get', 'post', 'put', 'delete'];
const requestFields = ['body', 'params', 'query', 'user'];
const startTag = 'start';
const descriptionTag = 'description ';
const endTag = 'end';
const anyChar = '[\\s\\S]';
const files = [
    'C:\\Users\\cookc\\Desktop\\Code\\qplan\\back-end\\server\\routing\\coursesRouting.js',
    'C:\\Users\\cookc\\Desktop\\Code\\qplan\\back-end\\server\\routing\\gradRequirementsRouting.js'
];

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

        // Capture API information
        const descriptionMatch = api.match(descriptionRegex);
        if (descriptionMatch) {
            const {groups: {description}} = descriptionMatch;
            console.log(description);
        }

        const {groups: {method}} = api.match(methodRegex);
        console.log(method);

        // Capture API request fields
        Object.keys(requestFieldsRegexes).forEach(key => {
            const matches = [...api.matchAll(requestFieldsRegexes[key])];
            if (matches.length > 0) {
                for (const match of matches) {
                    console.log(`${key}: ${match.groups[key]}`);
                }
            }
        });

        console.log(api);
    }
});
