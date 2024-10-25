const general = require('../general.json');
const { requireAll } = require('../utils');
const base = require('./modes.json');

const modes = requireAll(__dirname);

module.exports = {
    additionalProperties: base.additionalProperties,
    description: base.description,
    properties: {
        ...base.properties,
        ...Object.keys(modes).reduce((acc, mode) => {
            acc[mode] = {
                additionalProperties: modes[mode].additionalProperties,
                description: modes[mode].description,
                properties: {
                    ...general.properties,
                    ...modes[mode].properties,
                },
                type: modes[mode].type,
            };
            return acc;
        }, {}),
    },
    required: [...base.required],
    type: base.type,
};
