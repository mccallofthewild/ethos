"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _queue = require("../store/queue.js");

var _queue2 = _interopRequireDefault(_queue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var helpers = {
  descriptorIsClean: function descriptorIsClean(descriptor) {
    /*
     - If the value is an object, check if it has an accessible descriptor. 
     - If it does, check that it is not already a Hivex Proxy.
     - return bool
    */
    return descriptor && !(descriptor.set && descriptor.set.name == "HivexSetter");
  },
  canAddProxy: function canAddProxy(obj, prop) {
    var value = obj[prop];
    var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    return (typeof value === "undefined" ? "undefined" : _typeof(value)) == "object" && helpers.descriptorIsClean(descriptor);
  }
};

var HivexProxy = function () {
  /*
    Takes in `obj` object, which is initially a store's state,
    and later is any object which is set or accessed in the state object.
  
    `rootStateProp` is the property directly on state which `obj` is a child of.
      if `rootStateProp` is undefined, we can infer that the proxy is on state itself,
      and the property being accessed ( `prop` ) is in fact the `rootStateProp`.
      When creating the initial Hivex `state` proxy, this should be `null`
    
    `cb` is the function that will be passed the `rootStateProp` every time a getter or
    setter is run. This was implemented to allow rootStateProps to be added to the queue.
  
  */

  function HivexProxy(obj, rootStateProp, cb) {
    _classCallCheck(this, HivexProxy);

    this.rootStateProp = rootStateProp;
    this.cb = cb;

    var _handler = this.handler,
        HivexGetter = _handler.HivexGetter,
        HivexSetter = _handler.HivexSetter;


    return new Proxy(obj, {

      get: HivexGetter,

      set: HivexSetter

    });
  }

  _createClass(HivexProxy, [{
    key: "handler",
    get: function get() {

      var rootStateProp = this.rootStateProp;
      var cb = this.cb;
      var checkedProps = new _queue2.default();
      return {
        HivexGetter: function HivexGetter(obj, prop) {

          var rootProp = rootStateProp || prop;

          /* 
           - Check if proxy can be added, and add one if it can.
           - We only need to to this once because from this point on,
            any changes will be tracked by HivexSetter, and we don't
            need to proxy the value more than once.
           - Because this is a Proxy for the entire object, and not 
            just a getter for this specific object, we can't simply 
            flip a boolean once and be done with it: there could be 
            more object properties which need to be proxied.
          */

          if (!checkedProps.has(prop)) {

            checkedProps.add(prop);
            var value = obj[prop];

            if (helpers.canAddProxy(obj, prop, value)) {
              obj[prop] = new HivexProxy(value, rootProp, cb);
            }
          }

          return obj[prop];
        },
        HivexSetter: function HivexSetter(obj, prop, value) {

          var rootProp = rootStateProp || prop;

          obj[prop] = (typeof value === "undefined" ? "undefined" : _typeof(value)) == "object" ? new HivexProxy(value, rootProp, cb) : value;

          cb(rootProp);

          return true;
        }
      };
    }
  }]);

  return HivexProxy;
}();

exports.default = HivexProxy;