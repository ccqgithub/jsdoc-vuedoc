const path = require('path');
const fs = require('fs');
const vuedoc = require('@vuedoc/md');
const compiler = require('vue-template-compiler');
const spawnSync = require('child_process').spawnSync;
const config = require('./util').config;
const log = require('./util').log;


// cache parsed md
const markdownCodes = {};

// handlers
exports.handlers = {
  beforeParse (e) {
    if (/\.vue$/.test(e.filename)) {
      log(`parse file begin: ${e.filename}`);

      // extract script
      const parsedComponent = compiler.parseComponent(e.source);
      const code = parsedComponent.script ? parsedComponent.script.content : '';

      // extract SFC info
      const options = Object.assign({}, config, {
        filecontent: e.source
      });

      try {
        // node parsed-md.js
        const md = spawnSync('node', [path.resolve(__dirname, './parse-md.js')], {
          cwd: process.cwd(),
          env: process.env,
          input: JSON.stringify(options)
        });

        // parse md error
        if (md.error && md.error.toString().trim())
          log('parse md error: ' + md.error.toString(), true);

        if (md.error && md.stderr.toString().trim())
          log('parse md error: ' + md.stderr.toString(), true);

        // extract data
        const result = md.stdout.toString();
        const matches = result.match(/JSDOC_VUEDOC_BEGIN([\s\S]*?)JSDOC_VUEDOC_END/);

        // cache md content
        markdownCodes[e.filename] = '';
        if (matches) {
          markdownCodes[e.filename] = matches[1].trim();
        }
      } catch(e) {
        log(`parse SFC info error: ${e.filename}`);
        log(e);
      }

      e.source = code;
    }
  },
  jsdocCommentFound(e) {
    const tag = '@' + config.tag;

    if (
      /\.vue$/.test(e.filename)
      && e.comment.indexOf(tag) != -1
    ) {
      let md = (markdownCodes[e.filename]) || '';
      e.comment = e.comment.replace(tag, md);
    }
  }
}

// defineTags
exports.defineTags = function (dictionary) {
  const tag = config.tag;

  dictionary.defineTag(tag, {
    mustHaveValue: false,
    onTagged (doclet, tag) {
      const componentName = doclet.meta.filename.split('.').slice(0, -1).join('.');

      doclet.scope = 'vue';
      doclet.kind = 'description';
      doclet.alias = 'vue-' + componentName;
    }
  });
}
