var shoe = require('shoe');
var MuxDemux = require('mux-demux');
var inject = require('reconnect-core');
var through = require('through2');

var reconnect = inject(shoe);

var r = reconnect(function(wsStream) {
  var mdm = MuxDemux(function(stream) {

    var splitStreams = ['n1', 'n2', 'n3'].reduce(function(acc, k) {
      acc[k] = through.obj();  // pass through stream
      return acc;
    }, {});

    stream.on('data', function(data) {
      splitStreams[stream.meta].write(data);
    });


    Object.keys(splitStreams).forEach(function(k) {
      splitStreams[k].on('data', function(data) {
        document.querySelector('#'+k+' pre').innerHTML =
          JSON.stringify(data, null, 2);
      });
      document.querySelector('#'+k+' button.pause')
        .addEventListener('click', function(ev) {
          ev.preventDefault();
          splitStreams[k].pause();
        })
      ;
      document.querySelector('#'+k+' button.resume')
        .addEventListener('click', function(ev) {
          ev.preventDefault();
          splitStreams[k].resume();
        })
      ;
    });

  });
  wsStream.pipe(mdm).pipe(wsStream);
});

r.on('connect', function(con) {
  console.log('connect', con);
  document.querySelector('.status-connected').style.display = 'block';
  document.querySelector('.status-disconnected').style.display = 'none';
});

r.on('disconnect', function(err) {
  console.log('disconnect', err);
  document.querySelector('.status-connected').style.display = 'none';
  document.querySelector('.status-disconnected').style.display = 'block';
});

r.on('reconnect', function(n, delay) {
  console.log('reconnect', arguments);
});

document.getElementById('connect').addEventListener('click', function(ev) {
  ev.preventDefault();
  r.connect('/number');
});

document.getElementById('disconnect').addEventListener('click', function(ev) {
  ev.preventDefault();
  r.disconnect();
});
