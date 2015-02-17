var assert  = require('assert'),
    Daddy   = require('../dist/daddy')
;


//
// helper functions
//
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

    it('should throw when mad is set and not boolean', function() {

      assert.throws(
        function(){
          var d = new Daddy('mad');
        }
      );

    });


  });


  //
  // permission declaration
  // 
  describe('#permission', function(){

    var d = new Daddy();

    it('should throw when permission name is not passed', function() {

      assert.throws(
        function(){
          d.permission();
        }
      );

    });

    it('should allow regexp as a name', function() {

      assert.doesNotThrow(
        function(){
          d.permission(/Comment$/, positive);
        }
      );

    });

    it('should allow only string or regexp as a name', function() {

      assert.doesNotThrow(
        function(){
          d.permission(/REGEXP$/, positive);
        }
      );

      assert.doesNotThrow(
        function(){
          d.permission('someString', positive);
        }
      );

      assert.throws(
        function(){
          d.permission(3, positive);
        }
      );

      assert.throws(
        function(){
          d.permission({}, positive);
        }
      );

      assert.throws(
        function(){
          d.permission([], positive);
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

    var d = new Daddy();

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

    it('should grant unknown permissions by default', function() {

      assert.equal(d.check('lol'), true);

    });

    it('should deny unknown permissions if dad is mad', function() {

      var maddad = new Daddy(true);
      assert.equal(maddad.check('lol'), false);

    });

    it('should support any number of arguments on handlers', function() {

      var d = new Daddy();

      d.permission('argumentsTest', function(arg1, arg2) {
        return arg1 === 'foo' && arg2 === 'works';
      });

      assert.equal(d.check('argumentsTest', 'foo', 'works'), true);

    });

    it('should support param getter and check params together', function() {

      var d       = new Daddy(),
          numbers = [];

      d.defineParamsGetter(function(){
        return ['h','e','l'];
      });

      d.permission('paramtester', function(a,b,c,d,e) {
        return a+b+c+d+e === 'hello';
      });

      assert.equal(d.check('paramtester','l','o'), true);

    });

    it('should return false when any of the handlers in any order return false', function() {

      var d = new Daddy();

      d.defineParamsGetter(getAdmin);

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
      var d = new Daddy();

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

    it('should run all available handlers (support possible namespaces)', function() {

      var d     = new Daddy(),
          count = 0
      ;

      d.permission(/^my:/, function() {
        count++;
        return true;
      });

      d.permission(/^my:great:/, function() {
        count++;
        return true;
      });

      d.permission('my:great:namespace', function() {
        count++;
        return true;
      });

      d.check('my:great:namespace');

      assert.equal(count, 3);

    });

    it('should cache layer lookups (2000 permissions)', function() {

      var t1 = {},
          t2 = {},
          d = new Daddy();

      for (var i = 0; i < 2000; i++) {
        d.permission('cachetest:'+i, positive);
      }

      t1.start = Date.now();
      t1.result = d.check('cachetest:1999');
      t1.end = Date.now();
      t1.elapsed = t1.end - t1.start;

      t2.start = Date.now();
      t2.result = d.check('cachetest:1999');
      t2.end = Date.now();
      t2.elapsed = t2.end - t2.start;

      assert.ok(t1.elapsed > t2.elapsed);

    });

  });

});
