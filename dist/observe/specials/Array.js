'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = overwrite;

var _ = require('../');

var _utils = require('../utils');

var methods = {
  /*
  not necessary to overwrite getters because by the time the
  getter can be run, you have already accessed the object on state,
  and therefore already run the getter callback :)
  */

  setters: ['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift']
};

function overwrite() {
  for (var _len = arguments.length, observeArgs = Array(_len), _key = 0; _key < _len; _key++) {
    observeArgs[_key] = arguments[_key];
  }

  var _observeArgs = _slicedToArray(observeArgs, 4),
      obj = _observeArgs[0],
      rootProp = _observeArgs[1],
      getterCb = _observeArgs[2],
      setterCb = _observeArgs[3];

  // where the methods will be written to

  var dest = obj;
  console.log(obj, 'idkdude');
  methods.setters.forEach(function (setter) {
    var originalFn = dest[setter];
    if (!(typeof originalFn == 'function')) return;

    dest[setter] = function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      // `this` is scoped to whatever the array is
      args.forEach(function ($arg) {
        if ((0, _utils.isObject)($arg)) (0, _.observeProperties)($arg, rootProp, getterCb, setterCb);
      });
      console.log('running setter');
      var rtnVal = originalFn.apply(dest, args);

      // setterCb runs after all changes are made.
      setterCb(rootProp);

      return rtnVal;
    };
  });

  // methods.getters.forEach(
  //   (getter:string)=>{
  //     let originalFn = dest[getter]
  //     if( !(typeof originalFn == 'function') ) return;

  //     dest[getter] = function (...args){ 
  //       // `this` is scoped to whatever the array is
  //       console.log('running getter')
  //       getterCb(rootProp)
  //       return originalFn.apply(dest, args);
  //     }
  // })

  // recursive
  // observeProperties(obj, rootProp, getterCb, setterCb)
  console.log('watching stuff');
  return obj;
}