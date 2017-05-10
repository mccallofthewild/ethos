"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SealedObject = function SealedObject(obj) {
	_classCallCheck(this, SealedObject);

	return new Proxy(obj, {
		get: function get(target, prop) {
			return target[prop];
		},
		set: function set(target, prop, value) {
			throw new Error("Cannot mutate " + prop + " inside Hivex sealed object.");
		}
	});
};

exports.default = SealedObject;