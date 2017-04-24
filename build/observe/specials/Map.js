'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _ = require('../');

var _utils = require('../utils');

var proto = {
  getters: ['get', 'has', 'entries', 'keys', 'values', 'forEach'],

  setters: ['delete', 'clear']
};

// export  (...args:any)=>args


exports.default = function () {
  for (var _len = arguments.length, observeArgs = Array(_len), _key = 0; _key < _len; _key++) {
    observeArgs[_key] = arguments[_key];
  }

  var _observeArgs = _slicedToArray(observeArgs, 4),
      obj = _observeArgs[0],
      rootProp = _observeArgs[1],
      getterCb = _observeArgs[2],
      setterCb = _observeArgs[3];

  proto.setters.forEach(function (setter) {
    var originalFn = obj[setter];
    if (!(typeof originalFn == 'function')) return;

    obj[setter] = function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      originalFn.call.apply(originalFn, [obj].concat(args));
      setterCb(rootProp);
    };
  });

  var originalSet = obj.set;
  obj.set = function (key, value) {
    console.log(value, 'set');
    if ((0, _utils.isObject)(value)) {
      (0, _.observeProperties)(value, rootProp, getterCb, setterCb);
    }
    try {
      originalSet.apply(originalSet, [key, value]);
    } catch (error) {}
  };

  proto.getters.forEach(function (getter) {
    var originalFn = obj[getter];
    if (!(typeof originalFn == 'function')) return;

    obj[getter] = function () {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      originalFn.apply(obj, args);
      getterCb(rootProp);
    };
  });

  obj.forEach(function (value, key, map) {
    if ((0, _utils.isObject)(value)) (0, _.observeProperties)(value, rootProp, getterCb, setterCb);
  });

  return obj;
};