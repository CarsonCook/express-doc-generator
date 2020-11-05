#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

const fsFileFormat = 'utf8';
const anyChar = '[\\s\\S]';

const tag = '@express-doc-generator';
const endTag = 'end';
const configFileName = 'expressDocGeneratorConfig.js';
let configJson = {};

try {
    configJson = require(process.cwd() + `/${configFileName}`);
} catch (e) {
    throw new Error(`Could not read ${configFileName} file: ${e}`);
}

const projectName = configJson.name || 'API Project';
const projectDescription = configJson.description || '';
const outputFile = configJson.outputFile || 'API Documentation.md';
const expressObject = configJson.expressObject || 'app';
const requestObject = configJson.requestObject || 'req';
const httpMethods = configJson.httpMethods || ['get', 'post', 'put', 'delete'];
const requestFields = configJson.requestFields || ['body', 'params', 'query'];
const fieldDescriptions = configJson.descriptions || {};

const globs = setGlob();
const suppliersConfig = configJson.suppliers || {};

const defaultRouteRegex = new RegExp(`'(?<route>/.*?)'`, 'im');
const routeSupplier = suppliersConfig.route ? suppliersConfig.route : (api) => {
    const match = api.match(defaultRouteRegex);
    if (match) {
        const {groups: {route}} = match;
        return route;
    }
    throw Error(`Could not parse route using default method for API:\n${api}\n`);
};

const privilegeSupplier = suppliersConfig.privilege ? suppliersConfig.privilege : (_) => {
    return null;
};

const outputLines = [];

const apiRegex = new RegExp(`(?<api>${tag}${anyChar}*?${tag} ${endTag})`, 'ig');
const methodRegex = new RegExp(`${expressObject}.(?<method>${httpMethods.join('|')})`, 'i');
const descriptionRegex = new RegExp(`${tag} (?<description>${anyChar}*?)$`, 'im');
const requestFieldsRegexes = {};
requestFields.forEach((field) => {
    requestFieldsRegexes[field] = (new RegExp(`${requestObject}\.${field}.(?<${field}>[\\w\\d_\\-$]*)`, 'ig'));
});

globs.forEach((path) => {
    const files = glob.sync(path);

    files.forEach((file) => {
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

outputToFile();

function captureEndpoint(api) {
    const methodMatch = api.match(methodRegex);
    const route = routeSupplier(api);
    if (methodMatch) {
        const {groups: {method}} = methodMatch;
        outputLines.push(`##${method.toUpperCase()} ${route}\n`);
    } else {
        outputLines.push(`## ${route}\n`);
        console.warn(`Did not read API method for API:\n${api}`);
    }
}

function captureDescription(api) {
    const descriptionMatch = api.match(descriptionRegex);
    if (descriptionMatch) {
        const {groups: {description}} = descriptionMatch;
        outputLines.push(`${description}\n\n`);
    }
}

function captureRequestFields(api) {
    Object.keys(requestFieldsRegexes).forEach((key) => {
        const matches = [...api.matchAll(requestFieldsRegexes[key])];
        if (matches.length > 0) {
            outputLines.push(`###Request ${key}:\n`);
            for (const match of matches) {
                const field = match.groups[key];
                const description = fieldDescriptions[field];
                let output = `* ${field}`;
                output += description ? ` - ${description}\n` : '\n';
                outputLines.push(output);
            }
            outputLines.push('\n');
        }
    });
}

function captureSuppliedFields(api) {
    const privilege = privilegeSupplier(api);
    if (privilege !== undefined && privilege !== null) {
        outputLines.push(`Privilege required to access: ${privilege}\n`);
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

function outputToFile() {
    try {
        fs.writeFileSync(outputFile, `#${projectName}\n${projectDescription}\n`); // Write to file instead of append to overwrite past data
        for (const line of outputLines) {
            fs.appendFileSync(outputFile, line);
        }
    } catch (e) {
        throw new Error(`Could not output documentation to ${outputFile}. Error: ${e}`);
    }
}

// TODO consider implementing algo so don't need end tag
