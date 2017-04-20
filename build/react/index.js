'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listen = listen;

var _console = require('../misc/console');

var _console2 = _interopRequireDefault(_console);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function listen(component, context) {
  // context is `this` in the Hivex Store
  var myHivex = context;

  var mountFunc = component.componentDidMount,
      unmountFunc = component.componentWillUnmount,
      willUpdateFunc = component.componentWillUpdate,
      didUpdateFunc = component.componentDidUpdate,
      forceUpdateFunc = component.forceUpdate;


  component.componentDidMount = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    component._hivex_has_rendered = true;
    component._hivex_id = component.constructor.name + '/timestamp/' + Date.now() + '/id/' + Math.round(Math.random() * 10000000);
    component._hivex_mounted = true;
    component._hivex_mounted_at = new Date();
    myHivex.listeners[component._hivex_id] = component;
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
    component._hivex_has_rendered = false;
    component._hivex_mounted = false;
    delete myHivex.listeners[component._hivex_id];
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
    component._hivex_is_updating = true;
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
    component._hivex_is_updating = false;
  };

  component.forceUpdate = function () {
    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    component._hivex_is_updating = true;
    forceUpdateFunc.apply(component, args);
  };
}