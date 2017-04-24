'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.hivexObserve = hivexObserve;
exports.observeProperties = observeProperties;

var _utils = require('./utils');

var _specials = require('./specials');

var _specials2 = _interopRequireDefault(_specials);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function hivexObserve(obj, getterCb, setterCb) {

    var descriptors = {};

    Object.getOwnPropertyNames(obj).forEach(function (prop) {
        return descriptors[prop] = getHivexDescriptor(obj, prop, [obj, prop, getterCb, setterCb]);
    });
    Object.defineProperties(obj, descriptors);
}

function observeProperties() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    var _args = _slicedToArray(args, 4),
        obj = _args[0],
        rootProp = _args[1],
        getterCb = _args[2],
        setterCb = _args[3];

    var blacklist = /(Map)/;

    var protoString = obj.__proto__.constructor.name;

    if (blacklist.test(protoString)) {
        obj = _specials2.default[protoString].apply(_specials2.default, _toConsumableArray(args));
    }

    var descriptors = {};

    Object.getOwnPropertyNames(obj).forEach(function (prop) {
        return descriptors[prop] = getHivexDescriptor(obj, prop, args);
    });

    Object.defineProperties(obj, descriptors);

    return obj;
}

function getHivexDescriptor(obj, prop, observerArgs) {
    var _observerArgs = _slicedToArray(observerArgs, 4),
        sameObj = _observerArgs[0],
        rootProp = _observerArgs[1],
        getterCb = _observerArgs[2],
        setterCb = _observerArgs[3];

    var descriptor = Object.getOwnPropertyDescriptor(obj, prop);

    var _descriptor$get = descriptor.get,
        originalGetter = _descriptor$get === undefined ? false : _descriptor$get,
        _descriptor$set = descriptor.set,
        originalSetter = _descriptor$set === undefined ? false : _descriptor$set,
        configurable = descriptor.configurable;


    if (!configurable) {
        return descriptor;
    }
    var checked = false;
    var value = obj[prop];

    return {

        configurable: true,

        get: function HivexGetter() {

            if (!checked) {
                observerArgs[0] = value;
                if ((0, _utils.isObject)(value)) observeProperties.apply(undefined, _toConsumableArray(observerArgs));
                checked = true;
            }

            getterCb(rootProp);

            return originalGetter ? originalGetter.call(obj) : value;
        },

        set: function HivexSetter(val) {

            if ((0, _utils.isObject)(val)) {
                observerArgs[0] = val;
                observeProperties.apply(undefined, _toConsumableArray(observerArgs));
            }

            setterCb(rootProp);

            value = val;

            if (originalSetter) return originalSetter.call(obj, value);

            return !!value;
        }

    };
}