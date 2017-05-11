'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
  /** 
   * Creates an instance of Computed.
   *     @callback {requestCallback} getter,
              * this getter should be computed based on properties in @param dictionary
   *     @prop {String} obj.name, 
   *     @param {Queue} queue,
            * A queue object which stores the root props which have been
            changed in the destination object
   *     @param {Object} destination,
   *  
   * 
   * 
   * @memberOf Computed
   */

  function Computed(_ref) {
    var getter = _ref.getter,
        name = _ref.name,
        getterQueue = _ref.getterQueue,
        setterQueue = _ref.setterQueue,
        destination = _ref.destination,
        dictionary = _ref.dictionary;

    _classCallCheck(this, Computed);

    this.getter = getter;
    this.name = name;
    this.getterQueue = getterQueue;
    this.setterQueue = setterQueue;
    this.destination = destination;
    this.dependencies = new Set();
    this.initialize();
  }

  /**
   * 
   * 
   * 
   * @memberOf Computed
   * updates the @prop destination with whatever the getter returns
   * adds prop to the setterQueue because it has been updated
   */


  _createClass(Computed, [{
    key: 'update',
    value: function update() {

      this.destination[this.name] = this.value;
      this.setterQueue.add(this.name);
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      /*
        This is essential to how Computed works.
        It adds the listener to the getterQueue to find out
        which properties it is dependent on.
        When property values change and, as a result,
        properties are added to the setterQueue,
        `setterListener` fires and checks if the property
        is in the dependencies. If it is, the computed is
        updated.
      */
      var getterListener = this.getterQueue.addListener(function (item) {
        _this.dependencies.add(item);
      });

      this.update();

      this.getterQueue.removeListener(getterListener);

      var setterListener = this.setterQueue.addListener(function (item) {
        if (_this.dependencies.has(item)) _this.update();
      });
    }
  }, {
    key: 'value',
    get: function get() {
      return this.getter(this.destination);
    }
  }]);

  return Computed;
}();

exports.default = Computed;