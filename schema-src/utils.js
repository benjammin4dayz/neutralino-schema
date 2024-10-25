const fs = require('fs');
const path = require('path');

/**
 * Loads all JSON files in the specified directory, excluding files with the
 * same name as the directory, and returns them as an object with filename-based keys.
 *
 * @param {string} dir
 * @returns {Record<string, Object>}
 */
module.exports.requireAll = dir => {
  const jsonFiles = fs
    .readdirSync(dir)
    .filter(
      file =>
        file.endsWith('.json') &&
        path.basename(file, '.json') !== path.basename(dir)
    );

  return jsonFiles.reduce((acc, file) => {
    const filename = path.basename(file, '.json');
    acc[filename] = require(path.join(dir, file));
    return acc;
  }, {});
};

/**
 * Loads all directories that contain an index.js file and returns them as an
 * object with dirname-based keys
 *
 * @param {string} dir
 * @returns {Record<string, Object>}
 */
module.exports.requireAllIndexed = dir => {
  const files = fs.readdirSync(dir);
  const indexedDirs = files.filter(file => {
    const filePath = path.join(dir, file);
    return (
      fs.statSync(filePath).isDirectory() &&
      fs.existsSync(path.join(filePath, 'index.js'))
    );
  });

  return indexedDirs.reduce((acc, dirName) => {
    acc[dirName] = require(path.join(dir, dirName));
    return acc;
  }, {});
};

/**
 * Fetches all available tags from a given repo owned by Neutralinojs
 *
 * @param {string} repo
 * @returns {Promise<string[]>}
 */
module.exports.getNeutralinoTags = repoName => {
  console.log(`Fetching available tags from "neutralinojs/${repoName}"`);
  return fetch(`https://api.github.com/repos/neutralinojs/${repoName}/tags`)
    .then(response => response.json())
    .then(data => data.map(d => d.name))
    .then(tags => tags.map(tag => (tag.startsWith('v') ? tag.slice(1) : tag)))
    .catch(err => {
      console.error(
        `Failed to fetch tags from https://api.github.com/repos/neutralinojs/${repoName}/tags`,
        err
      );
      return [];
    });
};
