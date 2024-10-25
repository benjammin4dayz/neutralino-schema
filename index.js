const Ajv = require('ajv');
const fs = require('fs');
const http = require('http');
const instantiator = require('json-schema-instantiator');
const path = require('path');
const process = require('process');
const { getBundle } = require('./schema-src');

(() => {
  const [flag, option] = process.argv.slice(2);

  switch (flag) {
    case '-w':
    case '--write':
      getBundle().then(bundle => {
        const outputPath = makeOutputPath('dist');
        writeSchemaFile(
          bundle,
          path.join(outputPath, 'neutralino.schema.json')
        );
        writeConfigFile(
          bundle,
          path.join(outputPath, 'neutralino.config.json')
        );
      });
      break;
    case '-v':
    case '--validate':
      if (!option) {
        console.log('Missing argument: <path_to_config_file>');
        process.exit(1);
      }
      validateConfigFile(option, {
        allErrors: true, // if false, only shows the first conflict
        strict: 'log',
        keywords: ['x-intellij-enum-metadata'],
      });
      break;
    case '-s':
    case '--serve':
      startDevServer(option || 5000);
      break;
    default:
      console.log(`Unknown option: ${flag}`);
      process.exit(1);
  }
})();

function makeOutputPath(...pathParts) {
  const outputPath = path.join(__dirname, ...pathParts);
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
    'https://raw.githubusercontent.com/benjammin4dayz/neutralino-schema/refs/heads/schema/dist/neutralino.config.schema.json';

  fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
}

async function validateConfigFile(filepath, ajvOptions) {
  filepath = path.resolve(filepath);
  if (!fs.existsSync(filepath)) {
    console.log('File not found: ' + filepath);
    process.exit(1);
  }
  const configFile = require(filepath);

  const ajv = new Ajv(ajvOptions);
  const schema = await getBundle();
  const validate = await ajv.compile(schema);

  console.log(validate(configFile) ? 'Valid!' : validate.errors);
}

function startDevServer(port) {
  http
    .createServer(async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const schema = await getBundle();
      console.log(
        `[${new Date().toLocaleTimeString()}] Serving schema request!`
      );
      res.end(JSON.stringify(schema, null, 2));
    })
    .listen(port, () => {
      console.log(`Schema server started!\nhttp://localhost:${port}/\n`);
    });
}
