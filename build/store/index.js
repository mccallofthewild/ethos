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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Store = function () {
  function Store(store) {
    _classCallCheck(this, Store);

    this._state = store.state;
    this._getters = store.getters;
    this._setters = store.setters;
    this._actions = store.actions;
    this._modules = store.modules;

    this.listeners = {};
    this.queue = {};
  }

  _createClass(Store, [{
    key: 'access',
    value: function access(getter) {
      try {
        var res = this._getters[getter](this._state);
        return res;
      } catch (error) {
        Hivex.error(error);
      }
    }
  }, {
    key: 'change',
    value: function change(setter, payload) {
      var res = this._setters[setter](this._state, payload, this.methodArgs);
      this.updateListeners();
    }
  }, {
    key: 'send',
    value: function send(action, payload) {
      var myHivex = this;
      var arg = _extends({}, this.methodArgs, {
        state: this.state,
        done: function done() {
          this.updateListeners();
        }
      });
      this._actions[action](arg, payload);
    }
  }, {
    key: 'listen',
    value: function listen(component) {
      var _this = this;

      var mountFunc = component.componentDidMount,
          unmountFunc = component.componentWillUnmount;


      component.componentDidMount = function () {
        try {
          if (mountFunc) mountFunc.bind(component)();
        } catch (error) {
          Hivex.error(error);
        }
        component.id = component.constructor.name + '/timestamp/' + Date.now() + '/id/' + Math.round(Math.random() * 10000000);
        component._mounted = true;
        component._mounted_at = new Date();
        _this.listeners[component.id] = component;
        _this.updateListeners();
      };

      component.componentWillUnmount = function () {
        try {
          if (unmountFunc) unmountFunc.bind(component)();
          _this.listeners[component.id]._mounted = false;
          component._mounted = false;
        } catch (error) {
          Hivex.error(error);
        }
        delete _this.listeners[component.id];
      };
    }
  }, {
    key: 'updateListeners',
    value: function updateListeners() {

      for (var listenerId in this.listeners) {

        var listener = this.listeners[listenerId];

        if (listener._mounted && listener.state) {

          var futureState = _helpers2.default.getFutureState(listener, this._state, this.queue);

          /* 
            If futureState is not empty, run setState (react method) on component
            (update listener)
          */
          if (!!Object.keys(futureState).length) {
            listener.setState(futureState);
          }
        }
      }

      _helpers2.default.clearObject(this.queue);
    }
  }, {
    key: 'openState',
    value: function openState() {
      var _ref;

      _exceptions2.default.validateStateQuery();

      var component = (_ref = arguments.length - 1, arguments.length <= _ref ? undefined : arguments[_ref]);

      var formattedlistenerIds = _helpers2.default.formatStateQuery(listenerIds);

      component.hivexStatelistenerIds = formattedlistenerIds;

      this.listen(component);

      return _helpers2.default.formatStatePieceForComponent(this._state, formattedlistenerIds);
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