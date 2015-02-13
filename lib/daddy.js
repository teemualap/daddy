var check   = require('check-types'),
    hastobe = check.assert
;


/**
 * [Daddy description]
 * @param {[function]} identifier [the function that returns the current user]
 */
function Daddy(identifier) {

  hastobe.function(identifier, 'Identifier not passed');

  this._identifier = identifier;
  this._permissions = {};

  return this;
}


/**
 * [Adds a permission handler to a daddy instance]
 * @param  {[string]} name [permission name]
 */
Daddy.prototype.permission = function(name) {

  hastobe.string(name, 'Permission name must be a string');

  hastobe.not.assigned(
    this._permissions[name],
    'Permission ´' + name + '´ already defined'
  );

  var handlers =  [].slice.call(arguments, 1)
                  .map(function(x) {
                    hastobe.function(x, 'Permission handlers must be functions');
                    return x;
                  });

  hastobe.not.length(handlers, 0, 'A permission rule must have at least one handler');

  this._permissions[name] = { handlers: handlers };

};


/**
 * [Pass the current user through a handler stack]
 * @param  {[type]} name [permission name]
 * @return {[boolean]}
 */
Daddy.prototype.check = function(name) {

  hastobe.string(name);

  var p     = this._permissions[name],
      user  = this._identifier();

  hastobe.assigned(p, 'Permission ´'+ name +'´ is not registered in Daddy.');
  hastobe.assigned(user, 'No user found. Check your identifier function!');

  return p.handlers
          .every(function(handler) {
            return handler(user);
          });
};


module.exports = Daddy;