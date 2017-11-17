const vuedoc = require('@vuedoc/md');

let options = '';

process.stdin.on('data', function(chunk) {
  options += chunk;
});

process.stdin.on('end', function() {
  vuedoc.md(JSON.parse(options))
    .then(data => {
      console.log('JSDOC_VUEDOC_BEGIN')
      console.log(data)
      console.log('JSDOC_VUEDOC_END')
      process.exit(0);
    })
    .catch(e => {
      console.error(e);
      process.exit(1);
    });
});
