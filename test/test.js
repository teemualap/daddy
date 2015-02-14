var assert  = require('assert'),
    Daddy = require('../lib/daddy')
;

function positive() {
  return true;
}

function negative() {
  return false;
}

function noUser() {
  return null;
}

function getAdmin() {
  return {
    name: 'Teemu',
    role: 'admin'
  };
}

function getEditor() {
  return {
    name: 'Harri',
    role: 'editor'
  };
}

describe('Daddy', function() {


  // 
  // daddy constructor
  // 
  describe('#constructor', function(){

    it('should throw when identifier is not passed', function() {

      assert.throws(
        function(){
          var d = new Daddy();
        }
      );

    });


  });


  //
  // permission declaration
  // 
  describe('#permission', function(){

    var d = new Daddy(getAdmin);

    it('should throw when permission name is not passed', function() {

      assert.throws(
        function(){
          d.permission();
        }
      );

    });

    it('should throw when no handlers were passed', function() {

      assert.throws(
        function(){
          d.permission('a');
        }
      );

    });

    it('should allow multiple handlers to be set', function() {

      assert.doesNotThrow(
        function(){
          d.permission('b', positive, positive);
        }
      );

    });

    it('should allow only one handler to be set', function() {

      assert.doesNotThrow(
        function(){
          d.permission('c', positive);
        }
      );

    });

    it('should throw when at least one of the handlers is not a function', function() {

      assert.throws(
        function(){
          d.permission('d', positive, 'fake handler');
        }
      );

    });

    it('should throw when a handler with the same name is already registered', function() {

      assert.throws(
        function(){
          d.permission('e', positive);
          d.permission('e', positive);
        }
      );

    });

  });
  

  //
  // check
  // 
  describe('#check', function(){

    var d = new Daddy(getAdmin);

    it('should throw when permission name was not passed', function() {

      assert.throws(
        function(){
          d.check();
        }
      );

    });

    it('should throw when permission name was not a string', function() {

      assert.throws(
        function(){
          d.check(3);
        }
      );

    });

    it('should throw when the given permission has not been registered', function() {

      assert.throws(
        function(){
          d.check('lol');
        }
      );

    });

    it('should throw when user is not assigned while checking a permission', function() {

      var d = new Daddy(noUser);
      d.permission('task', positive);

      assert.throws(
        function(){
          d.check('task');
        }
      );

    });

    it('should return true when checking a valid permission against a valid user', function() {

      var d = new Daddy(getAdmin);
      d.permission('ensureAdmin', function(user) {
        return user.role === 'admin';
      });

      assert.equal(d.check('ensureAdmin'), true);

    });

    it('should return false when any of the handlers in any order return false', function() {

      var d = new Daddy(getAdmin);

      d.permission('ensureAdmin',
        function(user) {
          return user.role === 'admin';
        },
        negative
      );

      d.permission('ensurePositive',
        negative, positive
      );

      assert.equal(d.check('ensureAdmin'), false);
      assert.equal(d.check('ensurePositive'), false);

    });

    it('should short circuit when a handler returns false', function() {

      var importantVar = 'precious';
      var d = new Daddy(getAdmin);

      d.permission('someTask',
        negative,
        //malicious side effect
        function() {
          importantVar = 'trololol!';
        }
      );

      d.check('someTask');

      assert.equal(importantVar, 'precious');

    });

  });

});
