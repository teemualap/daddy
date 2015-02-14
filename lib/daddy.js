var check   = require('check-types'),
    hastobe = check.assert
;


/**
 * [Daddy constructor]
 * @param {[any]} The value that gets passed to checks. 
 *                If a function, called on each check.
 *                The resulting value is never cached.
 */
function Daddy(identifier) {

  hastobe.assigned(identifier, 'Identifier not passed');

  var _identifier = !!check.function(identifier)
                    ? identifier
                    : function() { return identifier; },
                    
      _permissions = {};


  /**
   * [Adds a permission handler to a daddy instance]
   * @param  {[string]} name [permission name]
   */
  this.permission = function(name) {

    hastobe.string(name, 'Permission name must be a string');

    hastobe.not.assigned(
      _permissions[name],
      'Permission ´' + name + '´ already defined'
    );

    var handlers =  [].slice.call(arguments, 1)
                    .map(function(x) {
                      hastobe.function(x, 'Permission handlers must be functions');
                      return x;
                    });

    hastobe.not.length(handlers, 0, 'A permission rule must have at least one handler');

    _permissions[name] = { handlers: handlers };

  };


  /**
   * Returns the result of _identifier
   */
  this.who = function() {
    return _identifier();
  };


  /**
   * [Pass the current identity through a handler stack]
   * @param  {[type]} name [permission name]
   * @return {[boolean]}
   */
  this.check = function(name) {

    hastobe.string(name);

    var permission  = _permissions[name],
        identity    = _identifier();

    hastobe.assigned(permission, 'Permission ´'+ name +'´ is not registered in Daddy.');
    hastobe.assigned(identity, 'Nothing to check against. Refer to your identifier!');

    return permission
            .handlers
            .every(function(handler) {
              return handler(identity);
            });
  };

  return this;
}

module.exports = Daddy;