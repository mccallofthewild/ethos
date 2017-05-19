(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Hivex"] = factory();
	else
		root["Hivex"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = __webpack_require__(5);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function listenerId() {
  return Math.random() * Date.now() * 100000;
}

/**
 * Enables storage and interception of properties for reactive data.
 * Doubles as an event handler.
 * 
 * @class Queue
 */

var Queue = function () {

  /**
   * Creates an instance of Queue.
   * 
   * @memberOf Queue
   */
  function Queue() {
    _classCallCheck(this, Queue);

    // container holds all the properties in the queue
    this.container = new Set();

    /*
     listeners contain functions which, while active, are
     passed any property added to the queue.
    */

    this.listeners = new Map();

    this.middleware = new Map();
  }

  /**
   * checks if property is in the queue
   * 
   * @param {prop} prop 
   * @returns 
   * 
   * @memberOf Queue
   */


  _createClass(Queue, [{
    key: 'has',
    value: function has(prop) {
      // To check if property is in the queue
      return this.container.has(prop);
    }

    /**
     * checks if queue is populated
     * 
     * @readonly
     * @type {boolean}
     * @memberOf Queue
     */

  }, {
    key: 'clear',


    /**
     * clears queue
     * 
     * 
     * @memberOf Queue
     */
    value: function clear() {
      // Clears queue
      this.container.clear();
    }

    /**
     * removes specific property from queue
     * 
     * @param {prop} prop 
     * 
     * @memberOf Queue
     */

  }, {
    key: 'remove',
    value: function remove(prop) {
      // Removes property from queue
      this.container.delete(prop);
    }

    /**
     * adds property to the queue
     * 
     * @param {prop} prop 
     * 
     * @memberOf Queue
     */

  }, {
    key: 'add',
    value: function add(prop) {
      // Adds property to queue    
      // fires off listeners

      this.middleware.forEach(function (cb) {
        cb(prop);
      });

      var listenerMap = this.listeners.get(prop);

      if (listenerMap) {

        var listeners = listenerMap.values();

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = listeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var listener = _step.value;

            listener(prop, listener);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      this.container.add(prop);
    }

    /**
     * adds middleware function
     * 
     * @param {anycb} cb 
     * @returns 
     * 
     * @memberOf Queue
     */

  }, {
    key: 'use',
    value: function use(cb) {
      var id = listenerId();
      this.middleware.set(id, cb);
      return id;
    }

    /**
     * removes middleware function
     * 
     * @param {id} id 
     * 
     * @memberOf Queue
     */

  }, {
    key: 'retire',
    value: function retire(id) {
      this.middleware.delete(id);
    }

    /**
     * adds listener function for specific property
     * 
     * @param {prop} prop 
     * @param {anycb} cb 
     * @returns {number} 
     * 
     * @memberOf Queue
     */

  }, {
    key: 'addListener',
    value: function addListener(prop, cb) {
      /*
        Listeners are functions 
      */

      var id = listenerId();

      var listenerMap = this.listeners.get(prop);

      if (!listenerMap) {
        listenerMap = new Map();
        this.listeners.set(prop, listenerMap);
      }
      listenerMap.set(id, cb);
      return id;
    }

    /**
     * removes listener function for specific property
     * 
     * @param {prop} prop 
     * @param {id} id 
     * 
     * @memberOf Queue
     */

  }, {
    key: 'removeListener',
    value: function removeListener(prop, id) {

      var listenerMap = this.listeners.get(prop);

      if (listenerMap) listenerMap.delete(id);else throw new Error('no listeners exist for "' + prop + '"');
    }
  }, {
    key: 'isPopulated',
    get: function get() {
      /*
       To check if queue is not empty. 
       Not neccessary to loop through entire object
       (Object.keys) to do this
      */

      return !!this.container.size;
    }
  }]);

  return Queue;
}();

exports.default = Queue;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
// import HivexProxy from '../observe/proxy'


var _helpers = __webpack_require__(5);

var helpers = _interopRequireWildcard(_helpers);

var _exceptions = __webpack_require__(9);

var _exceptions2 = _interopRequireDefault(_exceptions);

var _events = __webpack_require__(10);

var events = _interopRequireWildcard(_events);

var _observe = __webpack_require__(2);

var _queue = __webpack_require__(0);

var _queue2 = _interopRequireDefault(_queue);

var _computed = __webpack_require__(4);

var _computed2 = _interopRequireDefault(_computed);

var _setdictionary = __webpack_require__(6);

var _setdictionary2 = _interopRequireDefault(_setdictionary);

var _console = __webpack_require__(8);

var _console2 = _interopRequireDefault(_console);

var _react = __webpack_require__(15);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Source = function () {
  function Source(_ref, ancestry) {
    var _this = this;

    var _ref$truth = _ref.truth,
        truth = _ref$truth === undefined ? {} : _ref$truth,
        _ref$writers = _ref.writers,
        writers = _ref$writers === undefined ? {} : _ref$writers,
        _ref$runners = _ref.runners,
        runners = _ref$runners === undefined ? {} : _ref$runners,
        _ref$children = _ref.children,
        children = _ref$children === undefined ? {} : _ref$children,
        _ref$thoughts = _ref.thoughts,
        thoughts = _ref$thoughts === undefined ? {} : _ref$thoughts,
        _ref$watchers = _ref.watchers,
        watchers = _ref$watchers === undefined ? {} : _ref$watchers,
        _ref$founder = _ref.founder,
        founder = _ref$founder === undefined ? function () {} : _ref$founder;

    _classCallCheck(this, Source);

    var _ref2 = ancestry || {},
        _ref2$parent = _ref2.parent,
        parent = _ref2$parent === undefined ? this : _ref2$parent,
        _ref2$origin = _ref2.origin,
        origin = _ref2$origin === undefined ? this : _ref2$origin;

    this.parent = parent;
    this.origin = origin;

    var initialized = false;
    /*
      makes runners, getters and writers easily accessable on the `#runners`
      and `#writers` properties.
    */

    this.runners = {};

    var _loop = function _loop(_prop) {
      _this.runners[_prop] = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _this.run(_prop, args, true);
      };
    };

    for (var _prop in runners) {
      _loop(_prop);
    }this.writers = {};

    var _loop2 = function _loop2(_prop2) {
      _this.writers[_prop2] = function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return _this.write(_prop2, args, true);
      };
    };

    for (var _prop2 in writers) {
      _loop2(_prop2);
    } // this.getters = {}
    // for(let prop in getters) this.getters[prop] = (payload)=>this.access(prop, payload)


    this.listeners = new Map();

    this.queue = new _queue2.default();
    var getterQueue = new _queue2.default();

    var writerCb = function writerCb(prop) {
      _this.queue.add(prop);
    };

    var getterCb = function getterCb(prop) {
      if (!initialized) getterQueue.add(prop);
    };

    this._state = truth;
    // this._getters = getters;
    this._writers = writers;
    this._runners = runners;

    this._modules = {};
    this._computed = {};

    (0, _observe.hivexObserve)(this._state, getterCb, writerCb);

    /*
      Initially, we will define computed properties
      as getters in `state`. This is vital for making
      interdependent computeds to work.
       Additionally, these getters will each call
      getterCb, passing it the name of the computed.
      This ensures that computed properties can be 
      added to other computeds' dependencies.
       After clearing the descriptor, getterCb will no
      longer run on computed properties. 
        Once all the computeds are initialized and have 
      registered their dependencies, we iterate over each
      computed, clearing the original getter on state and
      running `#update`, setting its property
      in state to be the return value of its getter function.
       Because the `#update`s run one at a time, there are never
      any undefined dependencies during this process.
       ** Simply using getters on state is inefficient
      because it requires the process to run every time
      the computed is asked for, as opposed to every time the
      computed changes.
    */

    var computedGetters = {};

    helpers.objectForEach(thoughts, function (func, name) {
      var alias = _this;
      computedGetters[name] = {
        get: function get() {
          var val = func.apply(alias.methodArgs);
          getterCb(name);
          return val;
        },

        configurable: true
      };
    });

    Object.defineProperties(this._state, computedGetters);

    this.methodArgs = {
      /*
        Allows you to use object destructuring on methods
        without losing scope of `this`
      */
      // access: this.access.bind(this),
      write: this.write.bind(this),
      run: this.run.bind(this),
      // getters: this.getters,
      writers: this.writers,
      runners: this.runners,

      truth: this._state,

      parent: this.parent,
      origin: this.origin,
      child: this.child.bind(this)

    };

    helpers.objectForEach(thoughts, function (func, name) {
      var alias = _this;
      _this._computed[name] = new _computed2.default({
        getter: function getter() {
          return func.bind(alias.methodArgs);
        },
        name: name,
        getterQueue: getterQueue,
        setterQueue: _this.queue,
        destination: _this._state
      });
    });

    // letting computed properties just be reactive getters
    helpers.objectForEach(thoughts, function (func, name) {
      // delete this._state[name];
      _this._computed[name].observe();
    });

    /*
      `founder` is a function that runs when the Source
      is first constructed. It is passed the Hivex
      methods
    */

    var founder_accessor = this.methodArgs;

    if (founder && typeof founder == 'function') founder.apply(founder_accessor);

    /*
       modules are registered last to ensure that if
      any sub-modules traverse upwards in the module
      tree, everything will already be configured in
      its parent modules.
     */

    helpers.objectForEach(children, function (module, prop) {
      _this._modules[prop] = new Source(module, {
        parent: _this,
        origin: _this.origin
      });
    });

    // setting watchers to run whenever their property updates

    helpers.objectForEach(watchers, function (watcher, prop) {
      _this.queue.addListener(prop, function () {
        watcher.apply(_this.methodArgs);
      });
    });

    initialized = true;
  }
  // _getters:ObjectType<anycb>;


  _createClass(Source, [{
    key: 'getState',
    value: function getState() {
      return this._state;
    }
  }, {
    key: 'write',
    value: function write(writer, payload) {
      var spread = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var func = this._writers[writer];
      var accessor = this.methodArgs;
      if (!func) {
        throw new Error('Writer with name "' + writer + '" does not exist.');
      }
      var args = spread ? payload : [payload];

      var res = func.apply(accessor, args);

      this.updateListeners();
      return res;
    }
  }, {
    key: 'run',
    value: function run(runner, payload) {
      var spread = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var myHivex = this;

      var usingPromise = false;
      var promise = void 0;
      var resolver = void 0,
          rejecter = void 0;

      var generatePromise = function generatePromise() {

        promise = new Promise(function (resolve, reject) {
          resolver = resolve;
          rejecter = reject;
        });
        usingPromise = true;
      };

      var accessor = _extends({
        done: function done() {
          myHivex.updateListeners();
        },


        truth: this._state,

        async: function async() {
          generatePromise();
        },
        resolve: function resolve() {
          return resolver.apply(undefined, arguments);
        },
        reject: function reject() {
          return rejecter.apply(undefined, arguments);
        }
      }, this.methodArgs);

      var func = this._runners[runner];

      if (!func) {
        throw new Error('Action with name "' + runner + '" does not exist.');
      }

      var args = spread ? payload : [payload];

      var res = func.apply(accessor, args);

      if (usingPromise) res = promise;

      return res;
    }
  }, {
    key: 'child',
    value: function child(moduleQuery) {
      /*
        to give users access to a module,
        good for when someone chooses to 
        have modules, but not use openers
      */
      return helpers.moduleFromQuery(moduleQuery, this);
    }
  }, {
    key: 'listen',
    value: function listen(component, stateQuery) {
      var _this2 = this;

      var dependencies = [];

      for (var _prop3 in stateQuery) {
        dependencies.push(stateQuery[_prop3]);
      }var listener = (0, _react.listen)(component, this, dependencies);

      var middleware = this.queue.use(function () {
        return listener.check.apply(listener, arguments);
      });

      this.listeners.set(listener.__id, listener);

      listener.on(events.listener.MOUNT, function () {

        middleware = _this2.queue.use(function () {
          return listener.check.apply(listener, arguments);
        });
        _this2.listeners.set(listener.__id, listener);
      });

      listener.on(events.listener.UNMOUNT, function () {

        _this2.queue.retire(middleware);
        _this2.listeners.delete(listener.__id);
      });
    }
  }, {
    key: 'updateListeners',
    value: function updateListeners() {

      // if queue is empty, return.
      if (!this.queue.isPopulated) return;

      this.listeners.forEach(function (listener) {
        listener.update();
      });

      this.queue.clear();
    }
  }, {
    key: 'openWriters',
    value: function openWriters() {
      var myHivex = this;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      var _helpers$parseOpenArg = helpers.parseOpenArgs(args),
          _helpers$parseOpenArg2 = _slicedToArray(_helpers$parseOpenArg, 3),
          moduleQuery = _helpers$parseOpenArg2[0],
          query = _helpers$parseOpenArg2[1],
          component = _helpers$parseOpenArg2[2];

      var module = helpers.moduleFromQuery(moduleQuery, this);

      /*
        If `module` is not the module we are currently in,
        open its writers instead.
      */

      if (module !== this) return module.openWriters(query, component);

      // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
      var formattedKeys = helpers.formatObjectQuery(query);

      var writers = {};

      var _loop3 = function _loop3(alias) {
        var name = formattedKeys[alias];
        writers[alias] = function (payload) {
          return myHivex.write(name, payload);
        };
      };

      for (var alias in formattedKeys) {
        _loop3(alias);
      }

      Object.assign(component, writers);
    }
  }, {
    key: 'openActions',
    value: function openActions() {
      var myHivex = this;

      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      var _helpers$parseOpenArg3 = helpers.parseOpenArgs(args),
          _helpers$parseOpenArg4 = _slicedToArray(_helpers$parseOpenArg3, 3),
          moduleQuery = _helpers$parseOpenArg4[0],
          query = _helpers$parseOpenArg4[1],
          component = _helpers$parseOpenArg4[2];

      var module = helpers.moduleFromQuery(moduleQuery, this);

      /*
        If `module` is not the module we are currently in,
        open its runners instead.
      */
      if (module !== this) return module.openActions(query, component);

      // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
      var formattedKeys = helpers.formatObjectQuery(query);

      var runners = {};

      var _loop4 = function _loop4(alias) {
        var name = formattedKeys[alias];
        runners[alias] = function (payload) {
          return module.run(name, payload);
        };
      };

      for (var alias in formattedKeys) {
        _loop4(alias);
      }

      Object.assign(component, runners);
    }
  }, {
    key: 'getTruth',
    value: function getTruth() {
      var _this3 = this;

      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      var _helpers$parseOpenArg5 = helpers.parseOpenArgs(args),
          _helpers$parseOpenArg6 = _slicedToArray(_helpers$parseOpenArg5, 3),
          moduleQuery = _helpers$parseOpenArg6[0],
          query = _helpers$parseOpenArg6[1],
          component = _helpers$parseOpenArg6[2];

      var module = helpers.moduleFromQuery(moduleQuery, this);

      /*
        If `module` is not the module we are currently in,
        open its state instead. The module's state will not
        be reactive otherwise.
      */
      if (module !== this) return module.getTruth(query, component);

      // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
      var formattedKeys = helpers.formatObjectQuery(query);

      var hivexData = component.__hivex;

      var stateQuery = void 0;

      if (hivexData && hivexData.stateQuery) {
        /* truth queries only exist on a per-listener basis, so if the properties overlap,
        it's not our problem. */
        stateQuery = Object.assign(component.__hivex.stateQuery, formattedKeys);
      } else stateQuery = formattedKeys;

      this.listen(component, stateQuery);

      var staticState = helpers.formatObjectPieceForComponent(module._state, formattedKeys);

      return helpers.getterProxy(staticState, function (obj, prop) {
        return _this3._state[prop];
      });
    }
  }, {
    key: 'truth',
    get: function get() {
      return this._state;
    }
  }]);

  return Source;
}();

exports.default = Source;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.hivexObserve = hivexObserve;
exports.observeProperties = observeProperties;

var _utils = __webpack_require__(3);

var _specials = __webpack_require__(14);

var _specials2 = _interopRequireDefault(_specials);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * for properties on the root of the observed object (typically state)
 * ( no root prop passed )
 * 
 * @export
 * @param {Object} obj 
 * @param {anycb} getterCb 
 * @param {anycb} setterCb 
 */
function hivexObserve(obj, getterCb, setterCb) {

    var descriptors = {};

    Object.getOwnPropertyNames(obj).forEach(function (prop) {
        return descriptors[prop] = getHivexDescriptor(obj, prop, [obj, prop, getterCb, setterCb]);
    });
    Object.defineProperties(obj, descriptors);
}

/**
 * for nested properties in the observed object (requires root prop)
 * 
 * @export
 * @param {...observeArgs} args 
 * @returns {Object} 
 */
function observeProperties() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    var _args = _slicedToArray(args, 4),
        obj = _args[0],
        rootProp = _args[1],
        getterCb = _args[2],
        setterCb = _args[3];

    var descriptors = {};

    Object.getOwnPropertyNames(obj).forEach(function (prop) {
        return descriptors[prop] = getHivexDescriptor(obj, prop, args);
    });

    Object.defineProperties(obj, descriptors);

    /*
     Define properties first to avoid applying unnecessary getters/setters to
     methods overwritten on blacklisted objects
    */
    var blacklist = /(Map|Array)/;

    var protoString = obj.__proto__.constructor.name;

    var isBlacklisted = blacklist.test(protoString);

    if (isBlacklisted) {
        obj = _specials2.default[protoString].apply(_specials2.default, _toConsumableArray(args));
    }

    return obj;
}

function getHivexDescriptor(obj, prop, observerArgs) {
    var _observerArgs = _slicedToArray(observerArgs, 4),
        sameObj = _observerArgs[0],
        rootProp = _observerArgs[1],
        getterCb = _observerArgs[2],
        setterCb = _observerArgs[3];

    var descriptor = Object.getOwnPropertyDescriptor(obj, prop);

    var _descriptor$get = descriptor.get,
        originalGetter = _descriptor$get === undefined ? false : _descriptor$get,
        _descriptor$set = descriptor.set,
        originalSetter = _descriptor$set === undefined ? false : _descriptor$set,
        configurable = descriptor.configurable,
        enumerable = descriptor.enumerable;


    if (!configurable) {
        return descriptor;
    }
    var checked = false;
    var value = obj[prop];

    return {

        configurable: true,

        get: function HivexGetter() {

            if (!checked) {
                observerArgs[0] = value;
                if ((0, _utils.isObject)(value)) observeProperties.apply(undefined, _toConsumableArray(observerArgs));
                checked = true;
            }

            getterCb(rootProp);

            return originalGetter ? originalGetter.call(obj) : value;
        },

        set: function HivexSetter(val) {

            if ((0, _utils.isObject)(val)) {
                observerArgs[0] = val;
                observeProperties.apply(undefined, _toConsumableArray(observerArgs));
            }

            value = val;

            /*
             setterCb must run AFTER the value is set,
             or it will be updating on an old value
            */
            setterCb(rootProp);

            if (originalSetter) return originalSetter.call(obj, value);

            return value;
        }

    };
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.isObject = isObject;
function isObject(data) {
  return (typeof data === "undefined" ? "undefined" : _typeof(data)) == "object" && data !== null;
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _queue = __webpack_require__(0);

var _queue2 = _interopRequireDefault(_queue);

var _setdictionary = __webpack_require__(6);

var _setdictionary2 = _interopRequireDefault(_setdictionary);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 
 * 
 * @class Computed - For creating reactively updated properties
 */

var Computed = function () {
  /** 
   * Creates an instance of Computed.
   *     @callback {requestCallback} getter,
              * this getter should be computed based on properties in @param dictionary
   *     @prop {String} obj.name, 
   *     @param {Queue} queue,
            * A queue object which stores the root props which have been
            changed in the destination object
   *     @param {Object} destination,
   *  
   * 
   * 
   * @memberOf Computed
   */

  function Computed(_ref) {
    var getter = _ref.getter,
        name = _ref.name,
        getterQueue = _ref.getterQueue,
        setterQueue = _ref.setterQueue,
        destination = _ref.destination,
        dictionary = _ref.dictionary;

    _classCallCheck(this, Computed);

    this.getter = getter;
    this.name = name;
    this.getterQueue = getterQueue;
    this.setterQueue = setterQueue;
    this.destination = destination;
    this.dependencies = new Set();
    this.initialize();
  }

  /**
   * 
   * 
   * 
   * @memberOf Computed
   * updates the @prop destination with whatever the getter returns
   * adds prop to the setterQueue because it has been updated
   */


  _createClass(Computed, [{
    key: 'update',
    value: function update() {

      this.destination[this.name] = this.value;
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      /*
        This is essential to how Computed works.
        It adds the listener to the getterQueue to find out
        which properties it is dependent upon.
        When property values change and, as a result,
        properties are added to the setterQueue,
        `setterListener` fires and checks if the property
        is in the dependencies. If it is, the computed updates.
      */
      var getterListener = this.getterQueue.use(function (item) {
        _this.dependencies.add(item);
      });

      /*
       simply gets the value without updating state.
      */
      var value = this.value;

      this.getterQueue.retire(getterListener);
    }
  }, {
    key: 'observe',
    value: function observe() {
      var _this2 = this;

      // adds an event listener for each prop in `this.dependencies`
      this.dependencies.forEach(function (item) {

        _this2.setterQueue.addListener(item, function () {
          _this2.setterQueue.add(_this2.name);
        });
      });
    }
  }, {
    key: 'value',
    get: function get() {
      return this.getter(this.destination);
    }
  }]);

  return Computed;
}();

exports.default = Computed;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.formatObjectQuery = formatObjectQuery;
exports.formatObjectPieceForComponent = formatObjectPieceForComponent;
exports.updateAllComputedInSet = updateAllComputedInSet;
exports.clearObject = clearObject;
exports.moduleFromQuery = moduleFromQuery;
exports.parseOpenArgs = parseOpenArgs;
exports.objectForEach = objectForEach;
exports.hasAProperty = hasAProperty;
exports.getOwnPropertyDescriptors = getOwnPropertyDescriptors;
exports.clearDescriptor = clearDescriptor;
exports.clearDescriptors = clearDescriptors;
exports.getterProxy = getterProxy;

var _exceptions = __webpack_require__(9);

var _exceptions2 = _interopRequireDefault(_exceptions);

var _queue = __webpack_require__(0);

var _queue2 = _interopRequireDefault(_queue);

var _index = __webpack_require__(1);

var _index2 = _interopRequireDefault(_index);

var _setdictionary = __webpack_require__(6);

var _setdictionary2 = _interopRequireDefault(_setdictionary);

var _computed = __webpack_require__(4);

var _computed2 = _interopRequireDefault(_computed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function formatObjectQuery(props) {
	/*
 	  Formats array of object props into object with 
 	  {
 		[String aliasKey]: String actualKey
 	  }
   if props is already an object, it leaves it alone.
 	*/

	// Validates that first argument is either an object or an array
	_exceptions2.default.validateObjectQuery(props);

	var formatted = void 0;
	if (Array.isArray(props)) {
		formatted = {};
		props.forEach(function (a) {
			formatted[a] = a;
		});
	} else {
		formatted = props;
	}
	return formatted;
}

/**
 * Returns an object of getters;
 * 
 * @export
 * @param {Object} obj 
 * @param {Object} propDictionary 
 * @returns 
 */
function formatObjectPieceForComponent(obj, propDictionary) {
	/*
   Loops through keys in formatted props passed to `openState`
   and uses their values, the actual `state` properties,
   to return a chunk of state with custom keys.
 */
	var piece = {};
	for (var name in propDictionary) {
		var _prop = propDictionary[name];
		var value = obj[_prop];
		piece[name] = value;
	}
	return piece;
}

function updateAllComputedInSet(computedSet) {

	computedSet.forEach(function (c) {
		return c.update();
	});
}

/**
 * 
 * 
 * @param {Object} listener 
 * @param {Object} state 
 * @param {Queue} queue 
 * @returns {Object} 
 * 
 * 
 */

function clearObject(obj) {
	for (var _prop2 in obj) {
		delete obj[_prop2];
	}
}

function moduleFromQuery(moduleQuery, store) {

	/*
 	takes in module query in the form of "mymodule.nestedmodule.deeplynestedmodule"
 	and responds with the module.
 */

	var module = store;
	var moduleNames = moduleQuery.split('.');

	/*
  if there is no module query, module is always the root store
 */
	var i = 0;
	while (!!moduleQuery.length && i < moduleNames.length) {
		var name = moduleNames[i];
		module = module._modules[name];
		if (!module) throw new Error('Hivex Store module with name "' + name + '" could not be found!');
		i++;
	}

	return module;
}

function getModuleState(_ref, store) {
	var _ref$moduleQuery = _ref.moduleQuery,
	    moduleQuery = _ref$moduleQuery === undefined ? "" : _ref$moduleQuery,
	    stateQuery = _ref.stateQuery,
	    component = _ref.component;

	var module = moduleFromQuery(moduleQuery, store);
	var formattedQuery = formatObjectQuery(stateQuery);
}

function parseOpenArgs(args) {
	/*
 	- The purpose of this function is to
 		take in an array of arguments passed to 
 		an open function ( `openState`, `openActions`, etc.)
 		and return an array of three items depicting
 		the requested module, the query, and the component
 		respectively.
 */
	var module = void 0,
	    query = void 0,
	    component = void 0;

	// if module is root module, first argument can be query.
	if (typeof args[0] == "string") {
		var _args = _slicedToArray(args, 3);

		module = _args[0];
		query = _args[1];
		component = _args[2];
	} else {
		var _ref2 = [""].concat(_toConsumableArray(args));

		// defaults to blank module query (root store)


		module = _ref2[0];
		query = _ref2[1];
		component = _ref2[2];
	}
	return [module, query, component];
}

function objectForEach(obj, cb) {
	for (var _prop3 in obj) {
		var val = obj[_prop3];
		cb(val, _prop3);
	}
}

function hasAProperty(obj) {
	var result = false;
	for (var _prop4 in obj) {
		result = true;
		break;
	}
	return result;
}
/*

	Flow bug fix for Object#getOwnPropertyDescriptors

*/

function getOwnPropertyDescriptors(obj) {
	var descriptors = {};
	for (var _prop5 in obj) {
		descriptors[_prop5] = Object.getOwnPropertyDescriptor(obj);
	}
	return descriptors;
}

function clearDescriptor(obj, prop) {
	var value = obj[prop];

	var _Object$getOwnPropert = Object.getOwnPropertyDescriptor(obj, prop),
	    enumerable = _Object$getOwnPropert.enumerable;

	var descriptor = {
		value: value,
		writeable: true,
		enumerable: enumerable,
		configurable: true
	};

	Object.defineProperty(obj, prop, descriptor);
}

function clearDescriptors(obj, properties) {
	var descriptors = {};
	var originalDescriptors = getOwnPropertyDescriptors(obj);
	var length = properties.length;
	properties.forEach(function (prop) {
		var value = obj[prop];
		var _originalDescriptors$ = originalDescriptors[prop],
		    writeable = _originalDescriptors$.writeable,
		    enumerable = _originalDescriptors$.enumerable;


		descriptors[prop] = {
			value: value,
			writeable: writeable,
			enumerable: enumerable,
			configurable: true
		};
	});

	Object.defineProperties(obj, descriptors);
}

function getterProxy(obj, getter) {
	var destination = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	var descriptors = {};
	var properties = Object.getOwnPropertyNames(obj) || [];
	var length = properties.length;
	properties.forEach(function (prop) {

		descriptors[prop] = {
			configurable: false,
			get: function get() {
				return getter(obj, prop);
			}
		};
	});

	Object.defineProperties(destination, descriptors);
	return destination;
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _computed = __webpack_require__(4);

var _computed2 = _interopRequireDefault(_computed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SetDictionary = function () {
  function SetDictionary() {
    _classCallCheck(this, SetDictionary);

    this.data = {};
  }
  /**
   * 
   * 
   * @param {String} key 
   * @returns {Boolean}
   * 
   * @memberOf SetDictionary
   */

  /**
   * Creates an instance of SetDictionary.
   * @param {any} {
   *     } 
   * 
   * @memberOf SetDictionary
   */


  _createClass(SetDictionary, [{
    key: 'has',
    value: function has(key) {
      return this.data.hasOwnProperty(key);
    }
    /**
     * 
     * 
     * @param {String} key 
     * @param {any} value 
     * 
     * @memberOf SetDictionary
     */

  }, {
    key: 'add',
    value: function add(key, value) {
      if (this.has(key)) this.data[key].add(value);else this.data[key] = new Set([value]);
    }
  }, {
    key: 'access',
    value: function access(key) {
      return this.data[key];
    }
  }]);

  return SetDictionary;
}();

exports.default = SetDictionary;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var UNMOUNT = exports.UNMOUNT = 'UNMOUNT';
var MOUNT = exports.MOUNT = 'MOUNT';

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var HivexConsole = {
  intro: function intro() {
    try {
      console.group("%c HIVEX.js \uD83D\uDC1D \t\t\t", "font-size:16px; background-color:black; color:white; padding:5px; width:100%;");
      console.groupEnd();
    } catch (error) {}
  },
  log: function log() {
    try {
      var _console;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      (_console = console).log.apply(_console, ["\uD83C\uDF6F "].concat(_toConsumableArray(args)));
    } catch (error) {}
  },
  error: function error() {
    try {
      var _console2;

      console.group("%c\uD83C\uDF6F Hivex Error", "font-size:12px;");
      (_console2 = console).error.apply(_console2, arguments);
      console.groupEnd();
    } catch (error) {}
  }
};
exports.default = HivexConsole;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function validateObjectQuery(props) {
  if ((typeof props === "undefined" ? "undefined" : _typeof(props)) != "object") {
    throw new Error("first argument to object query must be an object or an array");
  }
}

exports.default = {
  validateObjectQuery: validateObjectQuery
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listener = undefined;

var _listener = __webpack_require__(7);

var listener = _interopRequireWildcard(_listener);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.listener = listener;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _store = __webpack_require__(1);

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  Source: _store2.default
};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = overwrite;

var _ = __webpack_require__(2);

var _utils = __webpack_require__(3);

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

      var rtnVal = originalFn.apply(dest, args);

      // setterCb runs after all changes are made.
      setterCb(rootProp);

      return rtnVal;
    };
  });

  return obj;
}

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _ = __webpack_require__(2);

var _utils = __webpack_require__(3);

var proto = {
  setters: ['delete', 'clear']
};

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

      var rtnVal = originalFn.call.apply(originalFn, [obj].concat(args));
      setterCb(rootProp);
      return rtnVal;
    };
  });

  var originalSet = obj.set;
  obj.set = function (key, value) {

    if ((0, _utils.isObject)(value)) {
      (0, _.observeProperties)(value, rootProp, getterCb, setterCb);
    }

    try {
      var rtnVal = originalSet.apply(originalSet, [key, value]);

      setterCb(rootProp);

      return rtnVal;
    } catch (error) {}
  };

  obj.forEach(function (value, key, map) {
    if ((0, _utils.isObject)(value)) {
      (0, _.observeProperties)(value, rootProp, getterCb, setterCb);
    }
  });

  return obj;
};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Map = __webpack_require__(13);

var _Map2 = _interopRequireDefault(_Map);

var _Array = __webpack_require__(12);

var _Array2 = _interopRequireDefault(_Array);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var specials = {
  Map: _Map2.default,
  Array: _Array2.default
};
exports.default = specials;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listen = listen;

var _console = __webpack_require__(8);

var _console2 = _interopRequireDefault(_console);

var _listener = __webpack_require__(16);

var _listener2 = _interopRequireDefault(_listener);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function listen(component, context, dependencies) {
  // context is `this` in the Hivex Store
  var myHivex = context;

  var hivexComponent = new _listener2.default({
    name: component.constructor.name,
    dependencies: dependencies,
    destination: component.state,
    render: function render() {
      component.forceUpdate();
    }
  }, context);

  component.__hivex = hivexComponent;

  var mountFunc = component.componentDidMount,
      unmountFunc = component.componentWillUnmount,
      willUpdateFunc = component.componentWillUpdate,
      didUpdateFunc = component.componentDidUpdate,
      forceUpdateFunc = component.forceUpdate;


  component.componentDidMount = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    hivexComponent.rendered = true;
    hivexComponent.mounted = true;
    try {
      if (mountFunc) mountFunc.apply(component, args);
    } catch (error) {
      _console2.default.error(error);
    }
  };

  /**
   * runs original `componentWillUnmount` function, if one was there
   * sets _hivex_mounted to false and removes component from
   * the store's listeners
   * 
   * @param {any} args 
   */
  component.componentWillUnmount = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    try {
      if (unmountFunc) unmountFunc.apply(component, args);
    } catch (error) {
      _console2.default.error(error);
    }
    hivexComponent.rendered = false;
    hivexComponent.mounted = false;
  };

  component.componentWillUpdate = function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    try {
      if (willUpdateFunc) willUpdateFunc.apply(component, args);
    } catch (error) {
      _console2.default.error(error);
    }
    hivexComponent.updating = true;
  };

  component.componentDidUpdate = function () {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    try {
      if (didUpdateFunc) didUpdateFunc.apply(component, args);
    } catch (error) {
      _console2.default.error(error);
    }
    hivexComponent.updating = false;
  };

  component.forceUpdate = function () {
    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    hivexComponent.updating = true;
    forceUpdateFunc.apply(component, args);
  };

  return hivexComponent;
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = __webpack_require__(5);

var helpers = _interopRequireWildcard(_helpers);

var _queue = __webpack_require__(0);

var _queue2 = _interopRequireDefault(_queue);

var _store = __webpack_require__(1);

var _store2 = _interopRequireDefault(_store);

var _listener = __webpack_require__(7);

var listener_events = _interopRequireWildcard(_listener);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function hivexId(name) {
  var rnd = Math.random() * 10000000;
  return name + '/timestamp/' + Date.now() + '/id/' + Math.round(rnd);
}

// willMount, didMount, willUpdate, didUpdate, render

var Listener = function () {
  function Listener(_ref, store) {
    var _ref$name = _ref.name,
        name = _ref$name === undefined ? "AnonymousComponent" : _ref$name,
        _ref$rendered = _ref.rendered,
        rendered = _ref$rendered === undefined ? true : _ref$rendered,
        _ref$mounted = _ref.mounted,
        mounted = _ref$mounted === undefined ? true : _ref$mounted,
        _ref$updating = _ref.updating,
        updating = _ref$updating === undefined ? false : _ref$updating,
        dependencies = _ref.dependencies,
        render = _ref.render;

    _classCallCheck(this, Listener);

    this.__id = hivexId(name);
    this.mounted = mounted;
    this.rendered = rendered;
    this.updating = updating;

    this.dependencies = new Set(dependencies);
    this.store = store;

    this.events = new _queue2.default();

    if (typeof render !== 'function') {
      throw new Error('render function not defined for hivex component');
    }

    this.dirty = true;

    this.render = render;
  }

  _createClass(Listener, [{
    key: 'emit',
    value: function emit(event) {
      this.events.add(event);
    }
  }, {
    key: 'on',
    value: function on(event, cb) {
      switch (event) {
        case listener_events[event]:
          this.events.addListener(event, cb);
          break;
        default:
          throw new Error('Event ' + event + ' does not exist!');
      }
    }
  }, {
    key: 'check',
    value: function check(prop) {
      switch (true) {
        case this.dependencies.has(prop):
          this.dirty = true;
          break;
      }
    }
  }, {
    key: 'defineLifecycleMethod',
    value: function defineLifecycleMethod(methodName, fn, context) {
      // defining in object container to retain function name
      var container = _defineProperty({}, methodName, function () {});
    }
  }, {
    key: 'mount',
    value: function mount() {
      this.mounted = true;
      this.rendered = true;
      this.update();
      this.emit(listener_events.MOUNT);
    }
  }, {
    key: 'unmount',
    value: function unmount() {
      this.mounted = false;
      this.rendered = false;
      this.emit(listener_events.UNMOUNT);
    }
  }, {
    key: 'update',
    value: function update() {
      if (!this.updating && this.rendered && this.mounted && this.dirty) this.render();
    }
  }]);

  return Listener;
}();

exports.default = Listener;

/***/ })
/******/ ]);
});