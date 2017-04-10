"use strict";

function overwriteArrayMethod(name) {
  var myHivex = this;
  var alias = Array.prototype[name];
  delete Array.prototype.splice;
  Array.prototype[name] = function () {

    var descriptor = Object.getOwnPropertyDescriptor(this, 0);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var result = alias.apply(this, args);
    if (descriptor && descriptor.set && descriptor.set.name == "hivexSet") {
      var writeAll = !this.length;
      if (!writeAll) {
        this[0] = this[0];
      } else {
        myHivex.updateListeners({ writeAll: writeAll });
      }
    }
    return result;
  };
}