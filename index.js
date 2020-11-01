const tag = '@express-doc-generator';
const expressObject = 'app';
const requestObject = 'req';
const httpMethods = ['get', 'post', 'put', 'delete'];
const requestFields = ['body', 'params', 'query', 'user'];
const startTag = 'start';
const descriptionTag = 'description';
const endTag = 'end';
const anyChar = '[\\s\\S]';

const str = `
    // @express-doc-generator start
    // @express-doc-generator description add or update a custom course
    app.put(R.api.customCourse, util.isLoggedIn, async function(req, res) {
        await util.executeRequest(req, res, async function() {
            return await controllers.api.set.customCourse(req.user.email, req.body.year, req.body.code, req.body.prefix, req.body.name,
                req.body.term, req.body.description, req.body.credits, req.body.math, req.body.natSci,
                req.body.complStudies, req.body.engSci, req.body.engDesign, req.body.status);
        });
    });
    // @express-doc-generator end
    
    // @express-doc-generator start
    // @express-doc-generator description remove a custom course
    app.delete(R.api.specificCustomCourse, util.isLoggedIn, async function(req, res) {
        await util.executeRequest(req, res, async function() {
            return await controllers.api.delete.customCourse(req.user.email, req.params.prefix, req.params.code, req.params.year);
        });
    });
    // @express-doc-generator end

    // @express-doc-generator start
    // @express-doc-generator description get all courses
    app.get(R.api.courses, util.isLoggedIn, async function(req, res) {
        await util.executeRequest(req, res, async function() {
            return await controllers.api.get.courses(req.user.email);
        });
    });
    // @express-doc-generator end
`;

const apiRegex = new RegExp(`${tag} ${startTag}(?<api>${anyChar}*?)${tag} ${endTag}`, 'ig');
const descriptionRegex = new RegExp(`${tag} ${descriptionTag}(?<description>${anyChar}*?)$`, 'im');
const methodRegex = new RegExp(`${expressObject}\.(?<method>${httpMethods.join('|')})`, 'i');
const requestFieldsRegexes = {};
requestFields.forEach(field => {
    requestFieldsRegexes[field] = (new RegExp(`${requestObject}\.${field}\.(?<${field}>[\\w\\d_\\-$]*)`, 'ig'));
});

// Capture all APIs
const matches = str.matchAll(apiRegex);
for (const match of matches) {
    const {groups: {api}} = match;

    // Capture API information
    const {groups: {description}} = api.match(descriptionRegex);
    console.log(description);

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
