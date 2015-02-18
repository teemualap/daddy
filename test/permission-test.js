import PermissionLayer  from '../lib/permission-layer';
import assert           from 'assert';

var validPermissionLayer = new PermissionLayer(/regex/, [function(){return 'foo';}]);

describe('Permission', function() {

  // 
  // Permission constructor
  // 
  describe('#constructor', function(){

    it('should throw when initialized with unsatisfying arguments', function() {

      assert.throws(
        function() {
          var pl = new PermissionLayer();
        }
      );

      assert.throws(
        function() {
          var pl = new PermissionLayer(/regex/);
        }
      );

      assert.throws(
        function() {
          var pl = new PermissionLayer([function(){}]);
        }
      );

      assert.throws(
        function() {
          var pl = new PermissionLayer('asd', [function() {}]);
        }
      );

      assert.throws(
        function() {
          var pl = new PermissionLayer(/regex/, ['fake function']);
        }
      );

      assert.throws(
        function() {
          var pl = new PermissionLayer(/regex/, [function(){}, 'fake function']);
        }
      );

    });

    it('should not throw when initialized with a regex and an array of one or more functions', function() {

      assert.doesNotThrow(
        function() {
          var pl = new PermissionLayer(/regex/, [function(){}]);
        }
      );

    });

  });

  // 
  // handlers
  // 
  describe('#handlers', function(){

    it('should return handlers as they were passed on initialization', function() {

      assert.equal(validPermissionLayer.handlers().length, 1);
      assert.equal(validPermissionLayer.handlers()[0](), 'foo');

    });

  });

  // 
  // match
  // 
  describe('#match', function(){

    it('should return a regexp execution result', function() {

      var result  = validPermissionLayer.match('regex');
      var result2 = validPermissionLayer.match('lol');

      assert.equal(result[0], 'regex');
      assert.equal(result2, null);

    });

  });

  // 
  // tostring
  // 
  describe('#tostring', function(){

    it('should return a string representation of the initialized regexp', function() {

      assert.equal(validPermissionLayer.toString(), '/regex/');

    });

  });

});
