'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Map = require('./Map');

var _Map2 = _interopRequireDefault(_Map);

var _Array = require('./Array');

var _Array2 = _interopRequireDefault(_Array);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var specials = {
  Map: _Map2.default,
  Array: _Array2.default
};
exports.default = specials;