const fs = require('fs');
const glob = require('glob');

const fsFileFormat = 'utf8';

const configFileName = 'expressDocGeneratorConfig.js';
let configJson = {};
try {
    configJson = require(process.cwd() + `/${configFileName}`);
} catch (e) {
    throw new Error(`Could not read ${configFileName} file: ${e}`);
}

const projectName = configJson.projectName;
const projectDescription = configJson.projectDescription;
const outputFile = configJson.outputFile || 'API Documentation.md';
const tag = configJson.tag || '@express-doc-generator';
const expressObject = configJson.expressObject || 'app';
const requestObject = configJson.requestObject || 'req';
const httpMethods = ['get', 'post', 'put', 'delete']; // HTTP methods to parse out of routing of Express app
const requestFields = ['body', 'params', 'query']; // Request fields to parse out of routing of Express app
const endTag = configJson.endTag || 'end';

const globs = setGlob();
const suppliersConfig = configJson.suppliers || {};

const routeRegex = new RegExp(`'(?<route>/.*?)'`, 'im');
const routeSupplier = suppliersConfig.route ? suppliersConfig.route : api => {
    const match = api.match(routeRegex);
    if (match) {
        const {groups: {route}} = match;
        return route;
    }
    return null;
};

const privilegeSupplier = suppliersConfig.privilege ? suppliersConfig.privilege : _ => {
    return null;
};

const anyChar = '[\\s\\S]';

fs.writeFileSync(outputFile, `#${projectName}\n${projectDescription}\n`); // Write to file instead of append to overwrite past data

const apiRegex = new RegExp(`(?<api>${tag}${anyChar}*?${tag} ${endTag})`, 'ig');
const methodRegex = new RegExp(`${expressObject}\.(?<method>${httpMethods.join('|')})`, 'i');
const descriptionRegex = new RegExp(`${tag} (?<description>${anyChar}*?)$`, 'im');
const requestFieldsRegexes = {};
requestFields.forEach(field => {
    requestFieldsRegexes[field] = (new RegExp(`${requestObject}\.${field}\.(?<${field}>[\\w\\d_\\-$]*)`, 'ig'));
});

globs.forEach(path => {
    const files = glob.sync(path);

    files.forEach(file => {
        const fileContent = fs.readFileSync(file, fsFileFormat);
        const matches = fileContent.matchAll(apiRegex);

        for (const match of matches) {
            const {groups: {api}} = match;
            captureEndpoint(api);
            captureDescription(api);
            captureRequestFields(api);
            captureSuppliedFields(api);
        }
    });
});

function captureEndpoint(api) {
    const methodMatch = api.match(methodRegex);
    const route = routeSupplier(api);
    if (methodMatch) {
        const {groups: {method}} = methodMatch;
        fs.appendFileSync(outputFile, `##${method.toUpperCase()} ${route}\n`);
    } else {
        throw new Error(`Could not read HTTP method from Express Object '${expressObject}' for API:
        ${api}
        `);
    }
}

function captureDescription(api) {
    const descriptionMatch = api.match(descriptionRegex);
    if (descriptionMatch) {
        const {groups: {description}} = descriptionMatch;
        fs.appendFileSync(outputFile, `${description}\n\n`);
    }
}

function captureRequestFields(api) {
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
}

function captureSuppliedFields(api) {
    const privilege = privilegeSupplier(api);
    if (privilege !== undefined && privilege !== null) {
        fs.appendFileSync(outputFile, `Privilege required to access: ${privilege}\n`);
    }
}

function setGlob() {
    const globs = configJson.files;
    if (!globs) {
        throw new Error('Cannot generate documentation. No glob patterns provided');
    }
    if (!Array.isArray(globs)) {
        return [globs];
    }
    return globs;
}

//TODO be able to inject explanation of a chosen request field - e.g. req.body.status needs an explanation that it is clear, saved, etc. - not mandatory since some names are obvious enough
//TODO make this a cmd line command
//TODO keep file strings, output only after no errors in parsing it out
