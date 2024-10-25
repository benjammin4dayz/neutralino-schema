# Neutralino Schema Builder

This builder implements a flat-keyed design where nested properties are displayed within directories.

-   All JSON files within a subdirectory are:
    -   Nested under a key matching the dirname
    -   Automatically included in the local index.js
-   All directories that contain an index.js are:
    -   Automatically included in the final schema

### Commands

**npm run build**

-   Bundle the schema and write it `neutralino.config.schema.json`
-   Generate a full config file based on the schema and write it to `neutralino.config.json`

**npm run validate <NEUTRALINO_CONFIG_PATH>**

-   Use [AJV](https://github.com/ajv-validator/ajv) to validate a local Neutralino config file against a freshly-bundled schema.

**npm start**

-   Serve a freshly-bundled JSON schema to each request on any route.

## Updating Schema

Locate the JSON schema file for the config key that you intend to modify.

For example, to add a new config option to `frontendLibrary`

1. Open schema-src/cli/frontendLibrary.json
2. Add a key with a description and type
3. Rebuild

## Adding Schema

Create a JSON schema file in the directory that it should be nested within

For example, to add a new mode named `foo`

1. Create a new JSON schema file at schema-src/modes/foo.json
2. Fill out the schema according to the specification
3. Rebuild - no need to require anything as it happens automatically.

## Testing Schema

1. Start the development server with `npm start`
2. Add `"$schema": "<SCHEMA_URL>"` to a `neutralino.config.json` file
    - Aggressive cache-busting techniques may be required for the schema URL
3. Check autocompletion and code hints in your IDE
