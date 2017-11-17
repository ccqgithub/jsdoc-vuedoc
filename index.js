const path = require('path');
const fs = require('fs');
const vuedoc = require('@vuedoc/md');
const compiler = require('vue-template-compiler');
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

      const parseMD = async function() {
        let md;

        try {
          md = await vuedoc.md(options);
          markdownCodes[e.filename] = md;
        } catch(e) {
          log(`parse SFC info error: ${e.filename}`);
          log(e);
        }

        return md;
      }

      parseMD();

      e.source = code;
    }
  },
  jsdocCommentFound(e) {
    const tag = '@' + config.tag;

    if (
      /\.vue$/.test(e.filename)
      && e.comment.indexOf(tag) != -1
    ) {
      let md = markdownCodes[e.filename] || '';
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
      doclet.kind = 'module';
      doclet.alias = 'vue-' + componentName;
    }
  });
}
