"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SetDictionary = function () {
  function SetDictionary(_ref) {
    _objectDestructuringEmpty(_ref);

    _classCallCheck(this, SetDictionary);

    this.data = {};
  }

  _createClass(SetDictionary, [{
    key: "has",
    value: function has(key) {
      return this.data.hasOwnProperty(key);
    }
  }, {
    key: "add",
    value: function add(key, value) {
      if (this.has(key)) this.data[key].add(value);else this.data[key] = new Set([value]);
    }
  }]);

  return SetDictionary;
}();