const path = require('path');
const fs = require('fs');
const vuedoc = require('@vuedoc/md');
const config = require('./util').config;
const log = require('./util').log;

// cache parsed md
const markdownCodes = {};

// handlers
exports.handlers = {
  async beforeParse (e) {
    if (/\.vue$/.test(e.filename)) {
      log(`parse file begin: ${e.filename}`);

      const options = Object.assign({}, config, {
        filecontent: e.source
      });

      const md = await vuedoc.md(options);

      markdownCodes[e.filename] = md;

      e.source = code;
    }
  },
  jsdocCommentFound(e) {
    const tag = '@' + config.tag;

    if (
      /\.vue$/.test(e.filename)
      && e.comment.indexOf(tag) != -1
    ) {
      let md = markdownCodes[e.filename];
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
