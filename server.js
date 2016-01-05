var http = require('http');
var shoe = require('shoe');
var stream = require('stream');
var ecstatic = require('ecstatic')(__dirname+'/public');
var MuxDemux = require('mux-demux');

function createStream(name) {

  var rs = new stream.Readable({ objectMode: true });
  rs._read = function() {
    setTimeout(function() {
      rs.push({
        name: name,
        number: Math.random(500)
      });
    }, 250);
  };
  return rs;
}

var server = http.createServer(ecstatic);
server.listen(8000);
console.log('listening on :8000');

var sock = shoe(function(stream) {
  var mdm = MuxDemux();
  stream.pipe(mdm).pipe(stream);
  var wsOne = mdm.createWriteStream('n1');
  var wsTwo = mdm.createWriteStream('n2');
  var wsThree = mdm.createWriteStream('n3');
  createStream('ham').pipe(wsOne);
  createStream('foo').pipe(wsTwo);
  createStream('bla').pipe(wsThree);
});
sock.install(server, '/number')
