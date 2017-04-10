'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _exceptions = require('./exceptions');

var _exceptions2 = _interopRequireDefault(_exceptions);

var _proxy = require('../observe/proxy');

var _proxy2 = _interopRequireDefault(_proxy);

var _queue = require('./queue');

var _queue2 = _interopRequireDefault(_queue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Store = function () {
  function Store(store) {
    var _this = this;

    _classCallCheck(this, Store);

    this.listeners = {};
    this.queue = new _queue2.default();
    /*
     queue is formatted as
       {
        stateprop:true,
        otherstateprop:true
      }
     */

    var add = function add(prop) {
      return _this.queue.add(prop);
    };

    this._state = new _proxy2.default(store.state, null, add);
    this._getters = store.getters;
    this._setters = store.setters;
    this._actions = store.actions;
    this._modules = store.modules;
  }

  _createClass(Store, [{
    key: 'access',
    value: function access(getter) {
      var res = this._getters[getter](this._state);
      return res;
    }
  }, {
    key: 'change',
    value: function change(setter, payload) {
      var res = this._setters[setter](this._state, payload, this.methodArgs);
      this.updateListeners();
      return res;
    }
  }, {
    key: 'send',
    value: function send(action, payload) {
      var myHivex = this;
      var arg = _extends({}, this.methodArgs, {
        state: this._state,
        done: function done() {
          myHivex.updateListeners();
        }
      });
      this._actions[action](arg, payload);
    }
  }, {
    key: 'listen',
    value: function listen(component) {

      var myHivex = this;

      var mountFunc = component.componentDidMount,
          unmountFunc = component.componentWillUnmount;


      var idKey = "_hivex_id";

      component.componentDidMount = function () {
        try {
          if (mountFunc) mountFunc.bind(component).apply(undefined, arguments);
        } catch (error) {
          Hivex.error(error);
        }
        component[idKey] = component.constructor.name + '/timestamp/' + Date.now() + '/id/' + Math.round(Math.random() * 10000000);
        component._hivex_mounted = true;
        component._hivex_mounted_at = new Date();
        myHivex.listeners[component[idKey]] = component;
        myHivex.updateListeners();
      };

      component.componentWillUnmount = function () {

        try {
          if (unmountFunc) unmountFunc.bind(component).apply(undefined, arguments);
          myHivex.listeners[component[idKey]]._hivex_mounted = false;
          component._hivex_mounted = false;
        } catch (error) {
          Hivex.error(error);
        }
        delete myHivex.listeners[component[idKey]];
      };
    }
  }, {
    key: 'updateListeners',
    value: function updateListeners() {

      // if queue is empty, return.
      if (!this.queue.isPopulated) return;

      for (var listenerKey in this.listeners) {

        var listener = this.listeners[listenerKey];

        if (listener._hivex_mounted && listener.state) {

          var futureState = _helpers2.default.getStateUpdatesFromQuery(listener, this._state, this.queue);

          /* 
            If futureState is not empty, run setState (react method) on component
            (update listener)
          */

          if (!!Object.keys(futureState).length) {
            listener.setState(futureState);
          }
        }
      }

      this.queue.clear();
    }
  }, {
    key: 'openState',
    value: function openState() {
      var module = null,
          stateQuery = null,
          component = null;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (typeof args[0] == "string") {
        module = args[0];
        stateQuery = args[1];
        component = args[2];
      } else {
        var _ref = [""].concat(args);
        // defaults to blank module query (root store)


        module = _ref[0];
        stateQuery = _ref[1];
        component = _ref[2];
      }
      // 


      // `listenerKeys` are the user-defined keys which alias properties on state 
      var formattedlistenerKeys = _helpers2.default.formatStateQuery(stateQuery);

      component.hivexStateKeys = formattedlistenerKeys;

      this.listen(component);

      return _helpers2.default.formatStatePieceForComponent(this._state, formattedlistenerKeys);
    }
  }, {
    key: 'methodArgs',
    get: function get() {
      return {
        access: this.access.bind(this),
        change: this.change.bind(this),
        send: this.send.bind(this)
      };
    }
  }]);

  return Store;
}();

exports.default = Store;