# express-doc-generator

This npm package generates documentation for Express applications.

## Usage

Run `express-doc-generator` in a directory with `expressDocGeneratorConfig.js` defined.
This will create a markdown file documenting your Express endpoints.

Routing blocks of code that need to be documented must be wrapped with
`@express-doc-genrator <description-for-route>` and `@express-doc-generator end`. These routing code blocks
must have consistent names for the express and request objects. Routing code can be split up across multiple files
in the project, but they need to keep the standard naming convention.

`expressDocGeneratorConfig.js` has required and optional parameters. Configuration documentation can be read below.

### Example

The below code uses `@express-doc-generator <description>` to indicate where to start parsing documentation,
and `@express-doc-generator end` to indicate where to stop parsing. This can be done multiple times in the same
file.

```javascript
    const routesObj = require('./routesObj');
    // @express-doc-generator description get an engineering discipline's graduation requirements
    //express object name is 'app', request object name is 'req'
    app.get(routesObj.keyForMyRoute, requireLogin, async function(req, res) {
        await util.executeRequest(req, res, async function() {
            return await controllers.api.get.engGradRequirements(req.params.discipline);
        });
    });
    // @express-doc-generator end
```

Resulting documentation:

```markdown
# API Project


## GET /my-route
description get an engineering discipline's graduation requirements

### Request params:
* discipline

Privilege required to access: unprivileged
```

## Configuration

`expressDocGeneratorConfig.js` must export an object using `module.exports = {...}`.

## Configuration

The following fields should be set in every configuration, unless the default value can be used.

|Field        |Default Value|Description                       |
|:-----------:|:-----------:|:---------------------------------|
|name         |'Api Project'|Name of the Express project.       |
|description  |blank        |Description of the Express project.|
|outputFile   |'API Documentation.md|The name of the markdown file that will be generated. Should end in `.md`.|
|expressObject|`app`        |Name of the Express object. For example, in `app.get(...)` the Express object name is `app`.|
|requestObject|`req`        |Name of the request object. For example, in `app.get('/',(req,res)=>{...})`, the request object name is `req`.|
|httpMethods  |\['get','post','put','delete'\]|Array of http methods to be included in documentation.|
|requestFields|\['body','params','query'\]|The request fields to include in documentation. For example, in `req.body`, the field is `body`.|
|files|`null`|The files to parse when generating documentation. This field can be a single file or [glob pattern](https://www.npmjs.com/package/glob), or an array of files and/or glob patterns. **This field is required**.|
|suppliers|See [Suppliers section](#Suppliers)|Functions that provide custom matching criteria for scraping documentation. See [Suppliers section](#Suppliers).|
|descriptions|`{}`|Object that supplies descriptions for request field values. For example, a descriptions value of `{name: 'the name'}` will supply a description in the documentation for `req.body.name`.|

### Suppliers

### Example
```javascript
const routes = require('./routes.js');
return {
    name: 'My project',
    description: 'My project',
    outputFile: 'my-file.md',
    expressObject: 'app',
    requestObject: 'req',
    httpMethods: ['get', 'post', 'put', 'delete'],
    requestFields: ['body', 'params', 'query'],
    files: ['./server/routing/coursesRouting.js', './server/routing/gradRequirementsRouting.js'],
    suppliers: {
        route: (api) => {
            // routing files use routes.the-route to reference the string literal, so match that pattern,
            // extract the key, and return the value in the routes object at that key.

            const regex = new RegExp(`routes\.(?<route>\\w*)`);
            const match = api.match(regex);
            const { groups: { route } } = match;
            return routes[route];
        },
        privilege: (api) => {
            // middleware that calls function 'requireLogin', 'requireAdmin', or nothing,
            // indicating level of privilege needed to access the route

            const unprivilegedSessionRegex = new RegExp('requireLogin', 'i');
            const privilegedSessionRegex = new RegExp('requireAdmin', 'i');

            if (unprivilegedSessionRegex.test(api)) {
                return 'unprivileged';
            }
            if (privilegedSessionRegex.test(api)) {
                return 'privileged';
            }
            
            return null;
        }
    },
    descriptions: {
        status: 'the status',
        name: 'the name'
    }
}
```
