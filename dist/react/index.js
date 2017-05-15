'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listen = listen;

var _console = require('../misc/console');

var _console2 = _interopRequireDefault(_console);

var _component = require('../render/component');

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function listen(component, context, stateQuery) {
  // context is `this` in the Hivex Store
  var myHivex = context;

  var hivexComponent = new _component2.default({
    name: component.constructor.name,
    stateQuery: stateQuery,
    destination: component.state,
    reactComponent: component,
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


  component.componentWillMount = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    component.__hivex.rendered = true;
    component.__hivex.mounted = true;
    myHivex.listeners.set(component.__hivex.__id, hivexComponent);
    myHivex.updateListeners();
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
    component.__hivex.rendered = false;
    component.__hivex.mounted = false;
    myHivex.listeners.delete(component.__hivex.__id);
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
    component.__hivex.updating = true;
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
    component.__hivex.updating = false;
  };

  component.forceUpdate = function () {
    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    component.__hivex.updating = true;
    forceUpdateFunc.apply(component, args);
  };
}