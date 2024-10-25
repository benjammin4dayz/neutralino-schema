# Neutralino Schema Builder

Add this key in `neutralino.config.json`:

```json
"$schema": "https://raw.githubusercontent.com/benjammin4dayz/neutralino-schema/refs/heads/main/dist/neutralino.config.schema.json"
```

## Commands

**build [output_path='dist/']**

- Bundle the schema and write it to `neutralino.config.schema.json`
- Generate a full config file using the schema and write it to `neutralino.config.json`

**validate <neutralino_config_path>**

- Use [AJV](https://github.com/ajv-validator/ajv) to validate a local Neutralino config file against a freshly-bundled schema.

**serve [port=5000]**

- Serve a freshly-bundled JSON schema to each request on any route.

## Development

1. Start the development server with `npm start`
2. Add `"$schema": "<SCHEMA_URL>"` to a `neutralino.config.json` file
   - Aggressive cache-busting techniques may be required for the schema URL
3. Check autocompletion and code hints in your IDE

### Add Properties to Existing Keys

Locate the JSON schema file for the config key that you intend to modify.

- [Primary keys](./schema-src/primary.json)
- [General keys](./schema-src/general.json)
- [CLI](./schema-src/cli/cli.json)
  - [Frontend Library](./schema-src/cli/frontendLibrary.json)
  - [Host Project](./schema-src/cli/hostProject.json)
- [Modes](./schema-src/modes/modes.json)
  - [Browser](./schema-src/modes/browser.json)
  - [Chrome](./schema-src/modes/chrome.json)
  - [Cloud](./schema-src/modes/cloud.json)
  - [Window](./schema-src/modes/window.json)

### Create New Properties

Create a JSON schema file in the directory that it should be nested within

For example, to add a new mode named `foo`

1. Create a new JSON schema file at schema-src/modes/foo.json
2. Fill out the schema according to the specification
3. Rebuild - no need to require anything as it happens automatically.
