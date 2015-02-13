# Daddy

Simple and fun permission checks.

## Usage

``` js

var Daddy = require('daddy');

// identifier function passed to handlers
function getCurrentUser() {
  //return mySessionStore.user;
  return {
    name: 'Teemu',
    role: 'admin'
  };
}

// some handlers
function ensureAdmin(user) {
  return user.role === 'admin';
}
function ensureAwesome(user) {
  return user.name === 'Teemu';
}

//
// daddy instance
//
var dad = new Daddy(getCurrentUser);

//
// a permission to do stuff requires admin and awesome
//
dad.permission('doStuff', ensureAdmin, ensureAwesome);

dad.check('doStuff'); // true

```


## API

#### new Daddy([indentifier:function])
**@param identifier**  
a function that returns the current user

#### Daddy.prototype.permission([name:string, [handler:function, ...]])
**@param name**  
an unique permission name, throws on dupes

**@param handler**  
a handler function that gets called on Daddy.prototype.check with the result of the indentifier function as an argument. Supports multiple handlers.

#### Daddy.prototype.check([name:string])
**@param name**  
The permission handler stack to be called

Calls each handler in the stack, left to right, passing in the result of the indentifier function. Short circuits as soon as any of the handlers return false.

## License
MIT

