const Ajv = require('ajv');
const fs = require('fs');
const http = require('http');
const instantiator = require('json-schema-instantiator');
const path = require('path');
const process = require('process');
const { getBundle } = require('./schema-src');

module.exports = () => {
  const [flag, option] = process.argv.slice(2);

  switch (flag) {
    case 'build':
      getBundle({ fetchTags: true }).then(async bundle => {
        await compileSchema(bundle, { strict: true });
        const outputPath = makeOutputPath(option || 'dist');
        writeSchemaFile(
          bundle,
          path.join(outputPath, 'neutralino.config.schema.json')
        );
        writeConfigFile(
          bundle,
          path.join(outputPath, 'neutralino.config.json')
        );
      });
      break;
    case 'validate':
      if (!option) {
        console.log('Missing argument: <path_to_config_file>');
        process.exit(1);
      }
      validateConfigFile(option);
      break;
    case 'serve':
      startDevServer(option || 5000);
      break;
    default:
      console.log(`Unknown option: ${flag}`);
      process.exit(1);
  }
};

function makeOutputPath(...pathParts) {
  const outputPath = path.resolve(path.join(...pathParts));
  if (fs.existsSync(outputPath)) fs.rmSync(outputPath, { recursive: true });
  fs.mkdirSync(outputPath);
  return outputPath;
}

function writeSchemaFile(schema, outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(schema));
}

function writeConfigFile(schema, outputPath) {
  const config = instantiator.instantiate(schema);
  config.$schema =
    'https://raw.githubusercontent.com/benjammin4dayz/neutralino-schema/refs/heads/main/dist/neutralino.config.schema.json';

  fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
}

async function compileSchema(schema, ajvOptions = {}) {
  const ajv = new Ajv({
    allErrors: true, // If false, only shows the first conflict
    strict: 'log',
    keywords: ['x-intellij-enum-metadata'],
    ...ajvOptions,
  });
  const validate = await ajv.compile(schema);
  return validate;
}

async function validateConfigFile(filepath) {
  filepath = path.resolve(filepath);
  if (!fs.existsSync(filepath)) {
    console.log('File not found: ' + filepath);
    process.exit(1);
  }
  const configFile = require(filepath);

  const schema = await getBundle();
  const validate = await compileSchema(schema);

  console.log(validate(configFile) ? 'Valid!' : validate.errors);
}

function startDevServer(port) {
  http
    .createServer(async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const schema = await getBundle({ fetchTags: true });
      console.log(
        `[${new Date().toLocaleTimeString()}] Serving schema request!`
      );
      res.end(JSON.stringify(schema, null, 2));
    })
    .listen(port, () => {
      console.log(`Schema server started!\nhttp://localhost:${port}/\n`);
    });
}
