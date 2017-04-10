"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function validateStateQuery(props) {
  if ((typeof props === "undefined" ? "undefined" : _typeof(props)) != "object") {
    throw new Error("first argument to openState must be an object or an array");
  }
}

exports.default = {
  validateStateQuery: validateStateQuery
};