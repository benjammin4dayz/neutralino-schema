const primary = require('./primary.json');
const { getNeutralinoTags, requireAllIndexed } = require('./utils');

const bundleCache = {};
module.exports.getBundle = async () => {
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $comment: 'THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.',
    additionalProperties: primary.additionalProperties,
    properties: {
      $schema: { type: 'string' },
      ...primary.properties,
      ...require('./general.json').properties,
      ...require('./windows.json').properties,
      ...requireAllIndexed(__dirname),
    },
    required: [...primary.required],
    type: primary.type,
  };

  if (!bundleCache.binaryVersion) {
    bundleCache.binaryVersion = await getNeutralinoTags('neutralinojs');
  }
  if (!bundleCache.clientVersion) {
    bundleCache.clientVersion = await getNeutralinoTags('neutralino.js');
  }

  // include all known versions in the respective enum
  schema.properties.cli.properties.binaryVersion.enum =
    bundleCache.binaryVersion;
  schema.properties.cli.properties.clientVersion.enum =
    bundleCache.clientVersion;

  return schema;
};
