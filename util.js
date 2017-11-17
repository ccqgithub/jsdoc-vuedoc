let config = {
  log: true,
  tag: 'vuedoc',
}

try {
  const env = require('jsdoc/env')
  config = Object.assign({}, config, env.conf['jsdoc-vuedoc']);
} catch (e) {
  // console.log(e);
}

function log(message, isError) {
  if (!config.log) return;

  const log = isError ? console.error : console.log;

  log('jsdoc-vuedoc: ');
  log(message);
}

exports.config = config;
exports.log = log;
