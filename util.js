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

function log(message) {
  if (!config.log) return;
  console.log('jsdoc-vuedoc: ');
  console.log(message);
}

exports.config = config;
exports.log = log;
