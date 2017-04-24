"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function hivexObserve(obj) {}

function observeProperties(obj) {

  var props = {};
  Object.getOwnPropertyNames(obj).forEach(function (propName) {
    props[propName] = {
      get: function HivexGetter() {}
    };
  });
  Object.defineProperties();
}

function isObject(data) {
  return (typeof data === "undefined" ? "undefined" : _typeof(data)) === "object" && data !== null;
}