import Daddy    from '../lib/daddy';
import Bluebird from 'bluebird';
import assert   from 'assert';

//
// helper handlers
//
function positive() {
  return true;
}
function negative() {
  return 'Not allowed';
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
  // checks
  // 
  describe('#checks', function(){

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

    it('should always return a proper response object', function(done) {

      var syncResult = d.check('lol');

      assert.equal(typeof syncResult, 'object');
      assert.equal(typeof syncResult.granted, 'boolean');
      assert.equal(Object.keys(syncResult).length, 2);

      d.when('lol').then(function(result) {
        assert.equal(typeof result, 'object');
        assert.equal(typeof result.granted, 'boolean');
        assert.equal(Object.keys(result).length, 2);
        done();
      });

    });

    it('should grant unknown permissions by default', function(done) {

      assert.equal(d.check('lol').granted, true);

      d.when('lol').then(function(result) {
        assert.equal(result.granted, true);
        done();
      });

    });

    it('should deny unknown permissions if dad is mad', function(done) {

      var maddad = new Daddy(true);
      assert.equal(maddad.check('lol').granted, false);

      maddad.when('lol').catch(function(err) {
        assert.equal(err.granted, false);
        done();
      });

    });

    it('should support any number of arguments on handlers', function() {

      var d = new Daddy();

      d.permission('argumentsTest', function(arg1, arg2) {
        return arg1 === 'foo' && arg2 === 'works';
      });

      assert.equal(d.check('argumentsTest', 'foo', 'works').granted, true);

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

      assert.equal(d.check('paramtester','l','o').granted, true);

    });

    it('should not grant when any of the handlers in any order do not pass', function() {

      var d = new Daddy();

      d.defineParamsGetter(function(){
        return {
          name: 'Teemu',
          role: 'admin'
        };
      });

      d.permission('ensureAdmin',
        function(user) {
          return user.role === 'admin';
        },
        negative
      );

      d.permission('ensurePositive',
        negative, positive
      );

      assert.equal(d.check('ensureAdmin').granted, false);
      assert.equal(d.check('ensurePositive').granted, false);

    });

    it('should short circuit when a handler does not pass', function() {

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
  
  //
  // promise implementation
  // 
  describe('#promiseImplementation', function() {

    it('should change the promise implementation', function(done) {

      var d = new Daddy();

      d.permission('promise', positive);

      d.setPromiseImplementation(Bluebird).then(
        function(res) {

          d.when('promise')
          .then(
            function() {
              assert.ok(true);
              done();
            }
          );

        }
      );

    });

  });

});
