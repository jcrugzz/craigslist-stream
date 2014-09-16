var Craigslist = require('..');

var stream = new Craigslist();
stream. on('meta', function (meta) {
  console.log('meta',meta);
})
stream.on('data', function (data) {
  console.log('data', data);
})
