import exceptions from './exceptions'

function formatStateQuery(props) {
	/*

	  Formats array of state props into object with 
		  {
			[String displayKey]: String stateKey
		  }
	  if already object, leaves it alone.

	*/

	// Validates that first argument is either an object or an array
	exceptions.validateStateQuery(props)

	let formatted;
	if (Array.isArray(props)) {
		formatted = {}
		props.forEach(a => {
			formatted[a] = a
		})
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
	let statePiece = {}
	for (let name in statePropDictionary) {
		let stateProp = statePropDictionary[name]
		let value = state[stateProp]
		statePiece[name] = value
	}
	return statePiece;
}

function getStateUpdatesFromQuery(listener, state, queue) {

	let futureState = {}

	for (let propName in listener.hivexStateKeys) {

		let stateProp = listener.hivexStateKeys[propName]

		if (queue.has(stateProp)) {

			futureState[propName] = state[stateProp];

		}

	}

	return futureState;

}


function clearObject(obj){
	for (let prop in obj) {
		delete obj[prop]
	}
}

class SealedObject{
	constructor(obj){
		return new Proxy(obj, {
			get(target, prop){
				return target[prop]
			},
			set(target, prop, value){
				throw new Error(`Cannot mutate ${prop} inside Hivex sealed object.`)
			}
		})
	}
}

function moduleFromQuery(moduleQuery, store){

	/*
		takes in module query in the form of "mymodule.nestedmodule.deeplynestedmodule"
		and responds with the module.
	*/

	let module = store;
	let moduleNames = moduleQuery.split('.')

	/*
	 if there is no module query, module is always the root store
	*/
	let i = 0;
	while(!!moduleQuery.length && i<moduleNames.length){
		let name = moduleNames[i]
		module = module._modules[name]
		i++;
	}

	return module;

}

function getModuleState({
	moduleQuery="",
	stateQuery,
	component,
}, store){
	let module = moduleFromQuery(moduleQuery, store);
	let formattedQuery = formatStateQuery(stateQuery);
}

export default {
	formatStatePieceForComponent,
	formatStateQuery,
	getStateUpdatesFromQuery,
	getModuleState,
	clearObject,
	SealedObject,
}