var Readable = require('stream').Readable;
var url = require('url');
var util = require('util');
var http = require('http-https');
var FeedParser = require('feedparser');

var Craigslist = module.exports = function (options) {
  if (!(this instanceof Craigslist)) return new Craigslist(options);
  options = options || {};
  Readable.call(this, { objectMode: true, highWaterMark: options.hwm || 16 });

  this.url = options.url || 'http://newyork.craigslist.org/nfa/index.rss';
  this.parserOpts = options.parser || {};

  this.paused = false;

  this.parser = new FeedParser(this.parserOpts)
  this._request();
};

util.inherits(Craigslist, Readable);

Craigslist.prototype._request = function () {
  var opts = url.parse(this.url);
  opts.method = 'GET';
  opts.headers = {
    'connection': 'close',
    'content-type': 'application/xml'
  };

  this.request = http.request(opts);
  this.request.on('error', this.emit.bind(this, 'error'));
  this.request.on('response', this._onResponse.bind(this));
  this.request.end();
};

Craigslist.prototype._onResponse = function (res) {
  if (res.statusCode !== 200) return this.emit('error', new Error('Invalid statusCode '+ res.statusCode));

  var self = this;

  this.parser.on('meta', this.emit.bind(this, 'meta'));

  this.parser.on('readable', function () {
    var data;
    while (!self.paused
        && (data = this.read())) {
      self.push(data);
    }
  });

  res.pipe(this.parser);
};

// TODO: maybe implement
Craigslist.prototype._read = function () {
  this.paused = false;
};


