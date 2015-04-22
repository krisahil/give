//tests/tests.js
var assert = require('assert');

suite('Charges', function() {
  test('in the server', function(done, server) {
    server.eval(function() {
      Charges.insert({fname: 'George'});
      var docs = Charges.find().fetch();
      emit('docs', docs);
    });

    server.once('docs', function(docs) {
      assert.equal(docs.length, 1);
      done();
    });
  });
});