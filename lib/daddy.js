"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };




/**
 * Daddy constructor
 *
 * @param {Boolean} mad   If mad, will deny unknown permissions.
 */
module.exports = Daddy;
var check = _interopRequire(require("check-types"));

var Permission = _interopRequire(require("./permission"));

var hastobe = check.assert;function Daddy(mad) {
  if (mad) {
    hastobe.boolean(mad);
  }

  var _permissions = [],
      _lookupTable = {},
      _lookupCache = {},
      _defaultParamsGetter = function () {
    return [];
  },
      _mad = mad;


  /**
   * Finds all satisfying permission layers, or an already cached list.
   * 
   * @param   {String} name
   * @return  {Array}
   */
  var _parsePermissionLayers = function (name) {
    var cachedIndices = _lookupCache[name],
        matches = !!cachedIndices ? cachedIndices.map(function (index) {
      return _permissions[index];
    }) : _permissions.filter(function (permission) {
      return !!permission.match(name);
    });

    // cache fresh and matching lookups
    if (matches.length && !cachedIndices) {
      _lookupCache[name] = matches.map(function (permission) {
        return _lookupTable[permission.toString()];
      });
    }

    return matches;
  };


  /**
   * Adds a permission handler to a daddy instance
   * 
   * @param {(String|RegExp)} pattern
   * @param {[Function]}      handlers
   */
  this.permission = function (pattern) {
    for (var _len = arguments.length, handlers = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      handlers[_key - 1] = arguments[_key];
    }

    hastobe.either.string(pattern).or.instance(pattern, RegExp, "A permission pattern must be string or regexp.");

    var regex = check.string(pattern) ? new RegExp("^" + pattern + "$") : new RegExp(pattern),
        lookupTableKey = regex.toString();

    hastobe.not.assigned(_lookupTable[lookupTableKey]);
    _lookupTable[lookupTableKey] = _permissions.length;

    _permissions.push(new Permission(regex, handlers));
  };


  /**
   * Returns _permissions
   * @return {Array}
   */
  this.permissions = function () {
    return _permissions;
  };


  /**
   * Run all handlers on each permission layer. Short circuit on false.
   * 
   * @param   {String}  name
   * @param   {[any]}   params
   * @return  {Boolean}
   * @api     public
   */
  this.check = function (name) {
    for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      params[_key - 1] = arguments[_key];
    }

    hastobe.string(name, "´name´ parameter must be a string at daddy.check.");

    var layers = _parsePermissionLayers(name);

    params = _defaultParamsGetter().concat(params);

    // unknown permissions are granted unless dad is mad
    if (!layers.length) return _mad ? false : true;

    return layers.every(function (layer) {
      return layer.handlers().every(function (handler) {
        return handler.apply(undefined, params);
      });
    });
  };


  /**
   * Register a param getter function in a daddy instance.
   * It set, will head its' return value in params passed to check.
   * This is especially useful for user authorization when you know for sure
   * that the current user is always needed in checks.
   * e.g ´daddy.setParamsGetter(getCurrentUser)´
   *
   * Note that you can also return multiple params as an array.
   *
   * @param {Function} fn
   */
  this.defineParamsGetter = function (fn) {
    hastobe["function"](fn);
    _defaultParamsGetter = !!check.array(fn()) ? fn : function () {
      return [fn()];
    };
  };

  return this;
}