'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Component = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = require('../store/index.js');

var _index2 = _interopRequireDefault(_index);

var _helpers = require('../store/helpers.js');

var helpers = _interopRequireWildcard(_helpers);

var _queue = require('../store/queue.js');

var _queue2 = _interopRequireDefault(_queue);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function hivexId(name) {
  var rnd = Math.random() * 10000000;
  return name + '/timestamp/' + Date.now() + '/id/' + Math.round(rnd);
}

// willMount, didMount, willUpdate, didUpdate, render

var Component = exports.Component = function () {
  function Component(_ref, store) {
    var _ref$name = _ref.name,
        name = _ref$name === undefined ? "AnonymousComponent" : _ref$name,
        _ref$stateQuery = _ref.stateQuery,
        stateQuery = _ref$stateQuery === undefined ? {} : _ref$stateQuery,
        _ref$rendered = _ref.rendered,
        rendered = _ref$rendered === undefined ? true : _ref$rendered,
        _ref$mounted = _ref.mounted,
        mounted = _ref$mounted === undefined ? true : _ref$mounted,
        _ref$updating = _ref.updating,
        updating = _ref$updating === undefined ? false : _ref$updating,
        _ref$destination = _ref.destination,
        destination = _ref$destination === undefined ? {} : _ref$destination,
        render = _ref.render;

    _classCallCheck(this, Component);

    this.__id = hivexId(name);
    this.mounted = mounted;
    this.rendered = rendered;
    this.updating = updating;
    this.stateQuery = stateQuery;

    this.destination = destination;
    this.store = store;

    if (typeof render !== 'function') {
      throw new Error('render function not defined for hivex component');
    }

    this.render = render;
  }

  _createClass(Component, [{
    key: 'defineLifecycleMethod',
    value: function defineLifecycleMethod(methodName, fn, context) {
      // defining in object container to retain function name
      var container = _defineProperty({}, methodName, function () {});
    }
  }, {
    key: 'mount',
    value: function mount() {
      this.store.listeners.set(this.__id, this);
      this.update();
      this.mounted = true;
    }
  }, {
    key: 'unmount',
    value: function unmount() {
      this.mounted = false;
      this.store.listeners.delete(this.__id, this);
    }
  }, {
    key: 'queryState',
    value: function queryState() {

      var futureState = {};
      var state = this.store.getState();

      for (var propName in this.stateQuery) {

        var stateProp = this.stateQuery[propName];

        if (this.store.queue.has(stateProp)) {

          futureState[propName] = state[stateProp];
        }
      }

      return futureState;
    }
  }, {
    key: 'hydrate',
    value: function hydrate() {

      if (this.mounted && this.destination) {

        var futureState = this.queryState();

        if (helpers.hasAProperty(futureState)) {

          Object.assign(this.destination, futureState);
        }
      }
    }
  }, {
    key: 'update',
    value: function update() {
      this.hydrate();
      if (!this.updating && this.rendered) this.render();
    }
  }]);

  return Component;
}();