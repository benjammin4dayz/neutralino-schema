const Ajv = require('ajv');
const fs = require('fs');
const http = require('http');
const path = require('path');
const process = require('process');
const { getBundle } = require('./schema-src');

(() => {
    const [flag, option] = process.argv.slice(2);

    switch (flag) {
        case '-w':
        case '--write':
            const outputPath = makeOutputPath('dist');
            writeSchemaFile(
                path.join(outputPath, 'neutralino.config.schema.json')
            );
            writeConfigFile(path.join(outputPath, 'neutralino.config.json'));
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

async function writeSchemaFile(filepath) {
    const schema = await getBundle();
    fs.writeFileSync(filepath, JSON.stringify(schema));
}

async function writeConfigFile(filepath) {
    const schemaToJSON = schema => {
        switch (schema.type) {
            case 'object':
                const obj = {};
                if (
                    schema.properties &&
                    typeof schema.properties === 'object'
                ) {
                    for (const [key, value] of Object.entries(
                        schema.properties
                    )) {
                        // Use default value or first enum if available; otherwise, infer one based on type
                        obj[key] =
                            value.default !== undefined
                                ? value.default
                                : value.enum && value.enum.length > 0
                                  ? value.enum[0]
                                  : schemaToJSON(value);
                    }
                }
                return obj;
            case 'array':
                return [];
            case 'string':
                return '';
            case 'number':
            case 'integer':
                return 0;
            case 'boolean':
                return false;
            case 'null':
                return null;
            default:
                throw new Error(`Unknown type: ${schema.type}`);
        }
    };

    const schema = await getBundle();
    const config = schemaToJSON(schema);

    config['$schema'] =
        'https://raw.githubusercontent.com/benjammin4dayz/neutralino-schema/refs/heads/schema/dist/neutralino.config.schema.json';

    fs.writeFileSync(filepath, JSON.stringify(config, null, 2));
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
    http.createServer(async (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        const schema = await getBundle();
        console.log(
            `[${new Date().toLocaleTimeString()}] Serving schema request!`
        );
        res.end(JSON.stringify(schema, null, 2));
    }).listen(port, () => {
        console.log(`Schema server started!\nhttp://localhost:${port}/\n`);
    });
}
