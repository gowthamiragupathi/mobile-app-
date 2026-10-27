const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// maxWorkers <= 1 runs the transformer in-process (in-band) in the main Node thread,
// avoiding any child_process.fork/spawn issues on Windows.
config.maxWorkers = 1;

module.exports = config;
