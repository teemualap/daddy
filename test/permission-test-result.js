import PermissionTestResult   from '../lib/permission-test-result';
import assert                 from 'assert';

describe('PermissionTestResult', function() {

  // 
  // Result constructor
  // 
  describe('#constructor', function(){

    it('should throw when initialized with unsatisfying arguments', function() {

      assert.throws(
        function() {
          var r = new PermissionTestResult();
        }
      );

      assert.throws(
        function() {
          var r = new PermissionTestResult('asd');
        }
      );

      assert.throws(
        function() {
          var r = new PermissionTestResult('true');
        }
      );

    });

  });

});
