'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
// import HivexProxy from '../observe/proxy'


var _helpers = require('./helpers');

var helpers = _interopRequireWildcard(_helpers);

var _exceptions = require('./exceptions');

var _exceptions2 = _interopRequireDefault(_exceptions);

var _observe = require('../observe');

var _queue = require('./queue');

var _queue2 = _interopRequireDefault(_queue);

var _computed = require('./computed');

var _computed2 = _interopRequireDefault(_computed);

var _setdictionary = require('./setdictionary');

var _setdictionary2 = _interopRequireDefault(_setdictionary);

var _console = require('../misc/console');

var _console2 = _interopRequireDefault(_console);

var _react = require('../react');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Store = function () {
  function Store(_ref) {
    var _this = this;

    var _ref$state = _ref.state,
        state = _ref$state === undefined ? {} : _ref$state,
        _ref$getters = _ref.getters,
        getters = _ref$getters === undefined ? {} : _ref$getters,
        _ref$setters = _ref.setters,
        setters = _ref$setters === undefined ? {} : _ref$setters,
        _ref$actions = _ref.actions,
        actions = _ref$actions === undefined ? {} : _ref$actions,
        _ref$modules = _ref.modules,
        modules = _ref$modules === undefined ? {} : _ref$modules,
        _ref$computed = _ref.computed,
        computed = _ref$computed === undefined ? {} : _ref$computed,
        start = _ref.start;

    _classCallCheck(this, Store);

    var initialized = false;

    this.methodArgs = {
      /*
        Allows you to use object destructuring on methods
        without losing scope of `this`
      */
      access: this.access.bind(this),
      change: this.change.bind(this),
      send: this.send.bind(this)
    };

    this.listeners = new Map();

    this.queue = new _queue2.default();
    var getterQueue = new _queue2.default();

    var setterCb = function setterCb(prop) {
      _this.queue.add(prop);
    };

    var getterCb = function getterCb(prop) {
      if (!initialized) getterQueue.add(prop);
    };

    this._state = state;
    this._getters = getters;
    this._setters = setters;
    this._actions = actions;

    this._modules = {};
    this._computed = {};

    (0, _observe.hivexObserve)(this._state, getterCb, setterCb);

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

    helpers.objectForEach(computed, function (func, name) {
      var myHivex = _this;
      computedGetters[name] = {
        get: function get() {
          var val = func(myHivex._state);
          getterCb(name);
          return val;
        },

        configurable: true
      };
    });

    Object.defineProperties(this._state, computedGetters);

    helpers.objectForEach(computed, function (func, name) {

      _this._computed[name] = new _computed2.default({
        getter: func,
        name: name,
        getterQueue: getterQueue,
        setterQueue: _this.queue,
        destination: _this._state
      });
    });

    helpers.objectForEach(computed, function (func, name) {
      delete _this._state[name];
      _this._computed[name].observe();
    });

    /*
      `start` is a function that runs when the Store
      is first constructed. It is passed the Hivex
      methods
    */

    if (start && typeof start == 'function') start(this.methodArgs);

    /*
       modules are registered last to ensure that if
      any sub-modules traverse upwards in the module
      tree, everything will already be configured in
      its parent modules.
     */

    helpers.objectForEach(modules, function (module, prop) {
      _this._modules[prop] = new Store(module);
    });

    initialized = true;
  }

  _createClass(Store, [{
    key: 'getState',
    value: function getState() {
      return this._state;
    }
  }, {
    key: 'change',
    value: function change(setter, payload) {
      var func = this._setters[setter];
      if (!func) {
        throw new Error('Setter with name "' + setter + '" does not exist.');
      }
      var res = func(this._state, payload, this.methodArgs);

      this.updateListeners();
      return res;
    }
  }, {
    key: 'access',
    value: function access(getter) {
      var func = this._getters[getter];
      if (!func) {
        throw new Error('Getter with name "' + getter + '" does not exist.');
      }
      var res = func(this._state);
      return res;
    }
  }, {
    key: 'send',
    value: function send(action, payload) {
      var myHivex = this;
      var methods = _extends({}, this.methodArgs, {
        done: function done() {
          myHivex.updateListeners();
        }
      });
      var func = this._actions[action];
      if (!func) {
        throw new Error('Action with name "' + action + '" does not exist.');
      }
      var res = func(this._state, methods, payload);
      return res;
    }
  }, {
    key: 'module',
    value: function module(moduleQuery) {
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
      (0, _react.listen)(component, this, stateQuery);
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
    key: 'openSetters',
    value: function openSetters() {
      var myHivex = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var _helpers$parseOpenArg = helpers.parseOpenArgs(args),
          _helpers$parseOpenArg2 = _slicedToArray(_helpers$parseOpenArg, 3),
          moduleQuery = _helpers$parseOpenArg2[0],
          query = _helpers$parseOpenArg2[1],
          component = _helpers$parseOpenArg2[2];

      var module = helpers.moduleFromQuery(moduleQuery, this);

      /*
        If `module` is not the module we are currently in,
        open its setters instead.
      */

      if (module !== this) return module.openSetters(query, component);

      // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
      var formattedKeys = helpers.formatObjectQuery(query);

      var setters = {};

      var _loop = function _loop(alias) {
        var name = formattedKeys[alias];
        setters[alias] = function (payload) {
          return myHivex.change(name, payload);
        };
      };

      for (var alias in formattedKeys) {
        _loop(alias);
      }

      Object.assign(component, setters);
    }
  }, {
    key: 'openActions',
    value: function openActions() {
      var myHivex = this;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var _helpers$parseOpenArg3 = helpers.parseOpenArgs(args),
          _helpers$parseOpenArg4 = _slicedToArray(_helpers$parseOpenArg3, 3),
          moduleQuery = _helpers$parseOpenArg4[0],
          query = _helpers$parseOpenArg4[1],
          component = _helpers$parseOpenArg4[2];

      var module = helpers.moduleFromQuery(moduleQuery, this);

      /*
        If `module` is not the module we are currently in,
        open its actions instead.
      */
      if (module !== this) return module.openActions(query, component);

      // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
      var formattedKeys = helpers.formatObjectQuery(query);

      var actions = {};

      var _loop2 = function _loop2(alias) {
        var name = formattedKeys[alias];
        actions[alias] = function (payload) {
          return module.send(name, payload);
        };
      };

      for (var alias in formattedKeys) {
        _loop2(alias);
      }

      Object.assign(component, actions);
    }
  }, {
    key: 'openState',
    value: function openState() {
      var _this2 = this;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
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
      if (module !== this) return module.openState(query, component);

      // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
      var formattedKeys = helpers.formatObjectQuery(query);

      var hivexData = component.__hivex;

      var stateQuery = void 0;

      if (hivexData && hivexData.stateQuery) {
        stateQuery = Object.assign(component.__hivex.stateQuery, formattedKeys);
      } else stateQuery = formattedKeys;

      this.listen(component, stateQuery);

      var staticState = helpers.formatObjectPieceForComponent(module._state, formattedKeys);

      return helpers.getterProxy(staticState, function (obj, prop) {
        return _this2._state[prop];
      });
    }
  }]);

  return Store;
}();

exports.default = Store;