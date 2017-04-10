"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function formatStateQuery(props) {
	/*
   Formats array of state props into object with 
 	  {
 		[String displayKey]: String stateKey
 	  }
   if already object, leaves it alone.
 */
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

function formatStatePieceForComponent(state, statePropDictionary) {
	/*
   Loops through keys in formatted props passed to `openState`
   and uses their values, the actual `state` properties,
   to return a chunk of state with custom keys.
 */
	var statePiece = {};
	for (var name in statePropDictionary) {
		var stateProp = statePropDictionary[name];
		var value = state[stateProp];
		statePiece[name] = value;
	}
	return statePiece;
}

function getChangedStateFromQuery(listener, state, queue) {

	var futureState = {};

	for (var propName in listener.hivexStateProps) {

		var stateProp = listener.hivexStateProps[propName];

		if (queue[stateProp]) {

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
	var formattedQuery = formatStateQuery(stateQuery);
}

exports.default = {
	formatStatePieceForComponent: formatStatePieceForComponent,
	formatStateQuery: formatStateQuery,
	getFutureState: getFutureState,
	clearObject: clearObject,
	SealedObject: SealedObject
};