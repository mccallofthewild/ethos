'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sealed = require('./sealed');

var _sealed2 = _interopRequireDefault(_sealed);

var _queue = require('./queue');

var _queue2 = _interopRequireDefault(_queue);

var _setdictionary = require('./setdictionary');

var _setdictionary2 = _interopRequireDefault(_setdictionary);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 
 * 
 * @class Computed - For creating reactively updated properties
 */

var Computed = function () {
  function Computed(_ref) {
    var getter = _ref.getter,
        name = _ref.name,
        queue = _ref.queue,
        destination = _ref.destination,
        dictionary = _ref.dictionary;

    _classCallCheck(this, Computed);

    this.getter = getter;
    this.name = name;
    this.queue = queue;
    this.destination = destination;
    this.dictionary = dictionary;

    this.initialize();
  }

  /**
   * 
   * 
   * 
   * @memberOf Computed
   * updates the @prop destination with whatever the getter returns
   */

  /** 
   * Creates an instance of Computed.
   *     @callback {requestCallback} getter,
              * this getter should be computed based on properties in @param dictionary
   *     @prop {String} obj.name, 
   *     @param {Queue} queue,
            * A queue object which stores the root props which have been
            changed in the destination object
   *     @param {Object} destination,
   *     @param {SetDictionary} dictionary
   *  
   * 
   * 
   * @memberOf Computed
   */

  _createClass(Computed, [{
    key: 'update',
    value: function update() {

      this.destination[this.name] = this.value;
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      /*
        This is essential to how Computed works.
        It adds the listener to the queue, runs update,
        then catches any prop that is passed through
        and adds it to the dictionary along with 
        the computed itself (`this`)
      */
      var listener = this.queue.addListener(function (item) {
        if (item !== _this.name) _this.dictionary.add(item, _this);
      });
      var val = this.value;
      this.queue.removeListener(listener);

      this.update();
    }
  }, {
    key: 'value',
    get: function get() {
      return this.getter(new _sealed2.default(this.destination));
    }
  }]);

  return Computed;
}();

exports.default = Computed;