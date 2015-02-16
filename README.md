# Daddy

  Simple, powerful and fun permission checks for Javascript.
  
  [![NPM Version](https://img.shields.io/npm/v/daddy.svg)](https://www.npmjs.com/package/daddy)
  [![Coverage Status](https://coveralls.io/repos/teemualap/daddy/badge.svg?branch=master)](https://coveralls.io/r/teemualap/daddy?branch=master)
  [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/teemualap/daddy/master/LICENSE)


## Installation

```bash
$ npm install daddy
```


## Usage

  A common use case:

```js

// commonJS
var Daddy = require('daddy');

function getCurrentUser() {
  return {
    name: 'Teemu',
    role: 'admin'
  };
}

function ensureAdmin(user) {
  return user.role === 'admin';
}

//
// Daddy instance, not mad
var dad = new Daddy();

//
// set current user as the default parameter for checks
dad.defineParamsGetter(getCurrentUser);

//
// The permission to do stuff requires admin
dad.permission('doStuff', ensureAdmin);

dad.check('doStuff'); // true
dad.check('doUnknownAction'); // true, because dad is not mad

```



## API


#### new Daddy([mad:Boolean])
  *@param* **mad**  
  If set to true, will deny all unknown permissions.


#### Daddy.permission(name:String, handler:Function, ...)
  *@param* **name**  
  A unique permission name, throws on dupes. May be regexp for useful permission patterns such as:

```js

// for example, allow only admins to do remove actions. 
// Eg. 'removePost','removeComment'.
daddy.permission(/^remove/, ensureAdmin);

// or
// require a registered user to crud comments. 
// Eg. 'Comment','viewComment','createComment'...
daddy.permission(/Comment$/, ensureRegistered);

```

  *@param* **handler**  
  A handler function that gets called on Daddy.prototype.check with the result of the indentifier function as an argument. Supports multiple handlers.


#### Daddy.defineParamsGetter(fn:Function)
  *@param* **fn**  
  Register a param getter function in a daddy instance. It set, will head its' return value in params passed to check. This is especially useful for user authorization when you know for sure that the current user is always needed in checks.


#### Daddy.check(name:String, [param:any], ...)
  *@param* **name**  
  The permission layer to be looked up and called.

  Calls each handler in each satisfying permission layer, left to right, passing in the result of paramsGetter, if set, and <param>s as arguments. Short circuits as soon as any of the handlers return false.

  Lookups are cached, so subsequent calls with the same <name> are quaranteed to be as fast as accessing an array by a known index.


## More examples

  You may want to namespace permissions:

``` js

var daddy = new Daddy();

daddy.permission(/^core:/           , ensureRegistered);
daddy.permission(/^core:utils:/     , ensureDeveloper);
daddy.permission(/^core:utils:api/  , ensureAdmin);

```

  Or go crazy:

```js

var player  = { name: 'Teemu', type: 'player' },
    enemy   = { name: 'T Rex', type: 'dinosaur' },
    // dad is mad
    permissionManager = new Daddy(true);

//
// Only dinosaurs are allowed to eat anything
permissionManager.permission(/^eat/, function(x) {
  return x.type === 'dinosaur';
});

//
// But for some reason cars can only be interacted with by a player
permissionManager.permission(/Car$/, function(x) {
  return x.type === 'player';
});

permissionManager.check('eatBuilding', enemy); // true
permissionManager.check('eatStuff', enemy); // true

permissionManager.check('eatCar', enemy); // eat true, Car false -> false
permissionManager.check('eatCar', player); // eat false -> false
permissionManager.check('driveCar', player); // Car true -> true

permissionManager.check('idle', player); // dad is mad -> false

```


## Contributions

Use babel to compile src -> lib
```bash
$ npm install -g babel
$ make build
```

Test (install mocha first)
```bash
$ npm install
$ make test
```

## License
  
  [MIT](LICENSE)
