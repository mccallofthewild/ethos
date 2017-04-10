"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  intro: function intro() {
    try {
      console.group("%c HIVEX.js \uD83D\uDC1D \t\t\t", "font-size:16px; background-color:black; color:white; padding:5px; width:100%;");
      console.groupEnd();
    } catch (error) {}
  },
  log: function log() {
    try {
      var _console;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      (_console = console).log.apply(_console, ["\uD83C\uDF6F "].concat(args));
    } catch (error) {}
  },
  error: function error() {
    try {
      var _console2;

      console.group("%c\uD83C\uDF6F Hivex Error", "font-size:12px;");
      (_console2 = console).error.apply(_console2, arguments);
      console.groupEnd();
    } catch (error) {}
  }
};