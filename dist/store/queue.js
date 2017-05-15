'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = require('./helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function listenerId() {
  return Math.random() * Date.now() * 100000;
}

/**
 * Enables storage and interception of properties for reactive data.
 * Doubles as an event handler.
 * 
 * @class Queue
 */

var Queue = function () {

  /**
   * Creates an instance of Queue.
   * 
   * @memberOf Queue
   */
  function Queue() {
    _classCallCheck(this, Queue);

    // container holds all the properties in the queue
    this.container = new Set();

    /*
     listeners contain functions which, while active, are
     passed any property added to the queue.
    */

    this.listeners = new Map();

    this.middleware = new Map();
  }

  /**
   * checks if property is in the queue
   * 
   * @param {prop} prop 
   * @returns 
   * 
   * @memberOf Queue
   */


  _createClass(Queue, [{
    key: 'has',
    value: function has(prop) {
      // To check if property is in the queue
      return this.container.has(prop);
    }

    /**
     * checks if queue is populated
     * 
     * @readonly
     * @type {boolean}
     * @memberOf Queue
     */

  }, {
    key: 'clear',


    /**
     * clears queue
     * 
     * 
     * @memberOf Queue
     */
    value: function clear() {
      // Clears queue
      this.container.clear();
    }

    /**
     * removes specific property from queue
     * 
     * @param {prop} prop 
     * 
     * @memberOf Queue
     */

  }, {
    key: 'remove',
    value: function remove(prop) {
      // Removes property from queue
      this.container.delete(prop);
    }

    /**
     * adds property to the queue
     * 
     * @param {prop} prop 
     * 
     * @memberOf Queue
     */

  }, {
    key: 'add',
    value: function add(prop) {
      // Adds property to queue    
      // fires off listeners

      this.middleware.forEach(function (cb) {
        cb(prop);
      });

      var listenerMap = this.listeners.get(prop);

      if (listenerMap) {

        var listeners = listenerMap.values();

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = listeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var listener = _step.value;

            listener(prop, listener);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      this.container.add(prop);
    }

    /**
     * adds middleware function
     * 
     * @param {anycb} cb 
     * @returns 
     * 
     * @memberOf Queue
     */

  }, {
    key: 'use',
    value: function use(cb) {
      var id = listenerId();
      this.middleware.set(id, cb);
      return id;
    }

    /**
     * removes middleware function
     * 
     * @param {id} id 
     * 
     * @memberOf Queue
     */

  }, {
    key: 'retire',
    value: function retire(id) {
      this.middleware.delete(id);
    }

    /**
     * adds listener function for specific property
     * 
     * @param {prop} prop 
     * @param {anycb} cb 
     * @returns {number} 
     * 
     * @memberOf Queue
     */

  }, {
    key: 'addListener',
    value: function addListener(prop, cb) {
      /*
        Listeners are functions 
      */

      var id = listenerId();

      var listenerMap = this.listeners.get(prop);

      if (!listenerMap) {
        listenerMap = new Map();
        this.listeners.set(prop, listenerMap);
      }
      listenerMap.set(id, cb);
      return id;
    }

    /**
     * removes listener function for specific property
     * 
     * @param {prop} prop 
     * @param {id} id 
     * 
     * @memberOf Queue
     */

  }, {
    key: 'removeListener',
    value: function removeListener(prop, id) {

      var listenerMap = this.listeners.get(prop);

      if (listenerMap) listenerMap.delete(id);else throw new Error('no listeners exist for "' + prop + '"');
    }
  }, {
    key: 'isPopulated',
    get: function get() {
      /*
       To check if queue is not empty. 
       Not neccessary to loop through entire object
       (Object.keys) to do this
      */

      return !!this.container.size;
    }
  }]);

  return Queue;
}();

exports.default = Queue;