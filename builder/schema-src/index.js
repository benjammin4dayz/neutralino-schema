const primary = require('./primary.json');
const { requireAllIndexed } = require('./utils');

module.exports = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $comment: 'THIS FILE WAS GENERATED ON ' + new Date().toISOString(),
    additionalProperties: primary.additionalProperties,
    properties: {
        $schema: { type: 'string' },
        ...primary.properties,
        ...require('./general.json').properties,
        ...requireAllIndexed(__dirname),
    },
    required: [...primary.required],
    type: primary.type,
};
