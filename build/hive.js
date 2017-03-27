"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Hivex = function () {
  function Hivex(store) {
    _classCallCheck(this, Hivex);

    Hivex.intro();
    this._state = store.state;
    this._store = store;
    this.deepListen({ obj: this._state });
    // this.overwriteArrayMethods()

    this._getters = store.getters;
    this._setters = store.setters;
    this._destroyers = store.destroyers;
    this._actions = store.actions;
    this._computed = store.computed;

    // this.injectComputedProps()

    this.listeners = {};
    this.queue = {};
  }

  _createClass(Hivex, [{
    key: "injectComputedProps",
    value: function injectComputedProps() {
      var computed = this._computed;
      var builder = {};
      for (var prop in computed) {
        builder[prop] = {
          get: computed[prop]
        };
      }
      Object.defineProperties(this._state, builder);
    }
  }, {
    key: "overwriteArrayMethods",
    value: function overwriteArrayMethods() {
      var myHivex = this;
      var _splice = Array.prototype.splice;
      delete Array.prototype.splice;
      Array.prototype.splice = function splice() {

        var descriptor = Object.getOwnPropertyDescriptor(this, 0);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var result = _splice.apply(this, args);
        if (descriptor && descriptor.set && descriptor.set.name == "hivexSet") {
          var _writeAll = !this.length;
          if (!_writeAll) {
            this[0] = this[0];
          } else {
            myHivex.updateListeners({ writeAll: _writeAll });
          }
        }
        return result;
      };
    }

    // Attaches Hivex-specific setter to a property

  }, {
    key: "defineBoth",
    value: function defineBoth(_ref) {
      var obj = _ref.obj,
          prop = _ref.prop,
          rootProp = _ref.rootProp;

      var myHivex = this;
      var val = obj[prop];
      // debugger
      if (Object.getOwnPropertyDescriptor(obj, prop).configurable) {

        Object.defineProperty(obj, prop, {
          configurable: true,
          set: function hivexSet(nextVal) {
            val = nextVal;
            myHivex.queue[rootProp] = true;
            // Hivex.log("running setter for " + prop)
            var descriptor = Object.getOwnPropertyDescriptor(obj, prop);

            if ((typeof val === "undefined" ? "undefined" : _typeof(val)) == "object" && descriptor && descriptor.set.name == "hivexSet") (function () {
              var obj = val;
              myHivex.deepListen({ obj: obj }, rootProp);
            })();
          },
          get: function hivexGet() {
            return val;
          }
        });
      }
    }
  }, {
    key: "defineForEach",
    value: function defineForEach(obj, cb, depth, rootProp) {
      try {
        cb = cb.bind(this);
        var isRoot = !rootProp;
        depth = depth || 0;
        depth++;
        if (depth > 5) return;
        for (var prop in obj) {
          var val = obj[prop];
          rootProp = isRoot ? prop : rootProp;
          if (!!Object.getOwnPropertyDescriptor(obj, prop)) {
            this.defineBoth({ obj: obj, prop: prop, rootProp: rootProp });
            if ((typeof val === "undefined" ? "undefined" : _typeof(val)) == "object" && !Array.isArray(val)) cb(val, cb, depth, rootProp); // !Array.isArray(val) Doesn't listen to arrays... ? idk
          }
        }
      } catch (error) {
        Hivex.error(error);
      }
    }
  }, {
    key: "deepListen",
    value: function deepListen(_ref2, rootProp) {
      var obj = _ref2.obj;

      this.defineForEach(obj, this.defineForEach, 0, rootProp);
    }
  }, {
    key: "access",
    value: function access(getter) {
      try {
        var res = this._getters[getter](this._state);
        return res;
      } catch (error) {
        Hivex.error(error);
      }
    }
  }, {
    key: "change",
    value: function change(setter, payload) {
      var res = this._setters[setter](this._state, payload, this.methodArgs);
      this.updateListeners();
    }
  }, {
    key: "send",
    value: function send(action, payload) {
      var _this = this;

      var myHivex = this;
      return new Promise(function (resolve, reject) {
        var arg = _extends({
          resolve: resolve,
          reject: reject
        }, _this.methodArgs, {
          state: _this.state
        });
        _this._actions[action](arg, payload);
      }).then(function () {
        myHivex.updateListeners.apply(myHivex, _toConsumableArray(args));
        var resolveArgs = args;
        return new Promise(function (resolve, reject) {
          try {
            resolve.apply(undefined, _toConsumableArray(resolveArgs));
          } catch (error) {
            if (!reject) throw new Error(error);
            reject(error);
          }
        });
      });
    }
  }, {
    key: "destroy",
    value: function destroy(destroyer, payload) {
      var res = this._destroyers[action](this.methodArgs, payload, this._state);
      myHivex.updateListeners({ writeAll: writeAll });
    }
  }, {
    key: "listen",
    value: function listen(context) {
      var _this2 = this;

      var _context$componentDid = context.componentDidMount,
          mountFunc = _context$componentDid === undefined ? function () {} : _context$componentDid,
          _context$componentWil = context.componentWillUnmount,
          unmountFunc = _context$componentWil === undefined ? function () {} : _context$componentWil;


      context.componentDidMount = function () {
        try {
          mountFunc.bind(context)();
        } catch (error) {
          Hivex.error(error);
        }
        context.id = context.constructor.name + "/timestamp/" + Date.now() + "/id/" + Math.round(Math.random() * 10000000);
        context._mounted = true;
        context._mounted_at = new Date();
        _this2.listeners[context.id] = context;
        _this2.updateListeners();
      };

      context.componentWillUnmount = function () {
        try {
          unmountFunc.bind(context)();
          _this2.listeners[context.id]._mounted = false;
          context._mounted = false;
        } catch (error) {
          Hivex.error(error);
        }
        delete _this2.listeners[context.id];
      };
    }
  }, {
    key: "updateListeners",
    value: function updateListeners() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _options$writeAll = options.writeAll,
          writeAll = _options$writeAll === undefined ? false : _options$writeAll;


      for (var prop in this.listeners) {
        var l = this.listeners[prop];
        if (l._mounted && l.state) {
          var futureState = {};
          for (var propName in l.hivexStateProps) {
            var stateProp = l.hivexStateProps[propName];
            if (this.queue[stateProp] || writeAll) {
              futureState[propName] = this._state[stateProp];
            }
          }
          Hivex.log(futureState);
          if (!!Object.keys(futureState).length) {
            if (l.beforeStateChange) l.beforeStateChange();
            l.setState(futureState); // Only updates if there is something to update
            Hivex.log(l.constructor.name + " updated");
          }
        }
      }
      for (var _prop in this.queue) {
        delete this.queue[_prop];
      }
    }
  }, {
    key: "openState",
    value: function openState() {
      var _ref3;

      var props = arguments.length <= 0 ? undefined : arguments[0];
      var context = (_ref3 = arguments.length - 1, arguments.length <= _ref3 ? undefined : arguments[_ref3]);
      if ((typeof props === "undefined" ? "undefined" : _typeof(props)) != "object") return;
      var obj = void 0;
      if (Array.isArray(props)) {
        // if the first argument is an array, turn it into an object
        obj = {};
        props.forEach(function (a) {
          obj[a] = a;
        });
      } else {
        obj = props;
      }
      context.hivexStateProps = obj;
      this.listen(context);
      var statePiece = {};
      for (var name in obj) {
        var stateProp = obj[name];
        var val = this._state[stateProp];
        statePiece[name] = val;
      }
      return statePiece;
    }
  }, {
    key: "methodArgs",
    get: function get() {
      return {
        access: this.access.bind(this),
        change: this.change.bind(this),
        send: this.send.bind(this)
      };
    }
  }], [{
    key: "intro",
    value: function intro() {
      try {
        console.group("%c HIVE.js \uD83D\uDC1D \t\t\t", "font-size:16px; background-color:black; color:white; padding:5px; width:100%;");
        console.groupEnd();
      } catch (error) {}
    }
  }, {
    key: "log",
    value: function log() {
      try {
        var _console;

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        (_console = console).log.apply(_console, ["\uD83C\uDF6F "].concat(args));
      } catch (error) {}
    }
  }, {
    key: "error",
    value: function error() {
      try {
        var _console2;

        console.group("%c\uD83C\uDF6F Hivex Error", "font-size:12px;");
        (_console2 = console).error.apply(_console2, arguments);
        console.groupEnd();
      } catch (error) {}
    }
  }]);

  return Hivex;
}();

exports.default = Hivex;
