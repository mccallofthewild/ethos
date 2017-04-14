'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _exceptions = require('./exceptions');

var _exceptions2 = _interopRequireDefault(_exceptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function formatObjectQuery(props) {
	/*
 	  Formats array of object props into object with 
 	  {
 		[String aliasKey]: String actualKey
 	  }
   if props is already an object, it leaves it alone.
 	*/

	// Validates that first argument is either an object or an array
	_exceptions2.default.validateObjectQuery(props);

	var formatted = void 0;
	if (Array.isArray(props)) {
		formatted = {};
		props.forEach(function (a) {
			formatted[a] = a;
		});
	} else {
		formatted = props;
	}
	return formatted;
}

function formatObjectPieceForComponent(obj, propDictionary) {
	/*
   Loops through keys in formatted props passed to `openState`
   and uses their values, the actual `state` properties,
   to return a chunk of state with custom keys.
 */
	var piece = {};
	for (var name in propDictionary) {
		var prop = propDictionary[name];
		var value = obj[prop];
		piece[name] = value;
	}
	return piece;
}

function getStateUpdatesFromQuery(listener, state, queue) {

	var futureState = {};

	for (var propName in listener.hivexStateKeys) {

		var stateProp = listener.hivexStateKeys[propName];

		if (queue.has(stateProp)) {

			futureState[propName] = state[stateProp];
		}
	}

	return futureState;
}

function clearObject(obj) {
	for (var prop in obj) {
		delete obj[prop];
	}
}

function moduleFromQuery(moduleQuery, store) {

	/*
 	takes in module query in the form of "mymodule.nestedmodule.deeplynestedmodule"
 	and responds with the module.
 */

	var module = store;
	var moduleNames = moduleQuery.split('.');

	/*
  if there is no module query, module is always the root store
 */
	var i = 0;
	while (!!moduleQuery.length && i < moduleNames.length) {
		var name = moduleNames[i];
		module = module._modules[name];
		if (!module) throw new Error('Hivex Store module with name "' + name + '" could not be found!');
		i++;
	}

	return module;
}

function getModuleState(_ref, store) {
	var _ref$moduleQuery = _ref.moduleQuery,
	    moduleQuery = _ref$moduleQuery === undefined ? "" : _ref$moduleQuery,
	    stateQuery = _ref.stateQuery,
	    component = _ref.component;

	var module = moduleFromQuery(moduleQuery, store);
	var formattedQuery = formatObjectQuery(stateQuery);
}

function parseOpenArgs(args) {
	/*
 	- The purpose of this function is to
 		take in an array of arguments passed to 
 		an open function ( `openState`, `openActions`, etc.)
 		and return an array of three items depicting
 		the requested module, the query, and the component
 		respectively.
 */
	var module = null,
	    query = null,
	    component = null;

	// if module is root module, first argument can be query.

	if (typeof args[0] == "string") {
		var _args = _slicedToArray(args, 3);

		module = _args[0];
		query = _args[1];
		component = _args[2];
	} else {
		var _ref2 = [""].concat(_toConsumableArray(args));

		// defaults to blank module query (root store)


		module = _ref2[0];
		query = _ref2[1];
		component = _ref2[2];
	}
	return [module, query, component];
}

function objectForEach(obj, cb) {
	for (var prop in obj) {
		var val = obj[prop];
		cb(val, prop);
	}
}

exports.default = {
	formatObjectPieceForComponent: formatObjectPieceForComponent,
	formatObjectQuery: formatObjectQuery,
	getStateUpdatesFromQuery: getStateUpdatesFromQuery,
	getModuleState: getModuleState,
	moduleFromQuery: moduleFromQuery,
	clearObject: clearObject,
	parseOpenArgs: parseOpenArgs,
	objectForEach: objectForEach
};