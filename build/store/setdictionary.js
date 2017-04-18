'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _computed = require('./computed');

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