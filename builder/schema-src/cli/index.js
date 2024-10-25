const { requireAll } = require('../utils');
const base = require('./cli.json');

module.exports = {
    additionalProperties: base.additionalProperties,
    description: base.description,
    properties: {
        ...base.properties,
        ...requireAll(__dirname),
    },
    required: [...base.required],
    type: base.type,
};
