'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Store = undefined;

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Hivex = {
  Store: _store2.default
};

exports.default = Hivex;
exports.Store = _store2.default;