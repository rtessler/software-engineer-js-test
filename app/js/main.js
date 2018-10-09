// NOTE: you can use CommonJS here, for instance:
// var foo = require("npm-dependency");
// var bar = require("./path/to/local/file_without_extension");
// module.exports = someVariable;

var AlbumPrinter = require('./albumPrinter');

var test = new AlbumPrinter(15, 10);
