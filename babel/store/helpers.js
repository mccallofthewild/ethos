import exceptions from './exceptions'

function formatObjectQuery(props) {
	/*

	  Formats array of object props into object with 
		  {
			[String aliasKey]: String actualKey
		  }
	  if props is already an object, it leaves it alone.

	*/

	// Validates that first argument is either an object or an array
	exceptions.validateObjectQuery(props)

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

function formatObjectPieceForComponent(obj, propDictionary) {
	/*
	  Loops through keys in formatted props passed to `openState`
	  and uses their values, the actual `state` properties,
	  to return a chunk of state with custom keys.
	*/
	let piece = {}
	for (let name in propDictionary) {
		let prop = propDictionary[name]
		let value = obj[prop]
		piece[name] = value
	}
	return piece;
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
		if(!module) throw new Error(`Hivex Store module with name "${name}" could not be found!`)
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
	let formattedQuery = formatObjectQuery(stateQuery);
}

function parseOpenArgs(args){
		/*
			- The purpose of this function is to
				take in an array of arguments passed to 
				an open function ( `openState`, `openActions`, etc.)
				and return an array of three items depicting
				the requested module, the query, and the component
				respectively.
		*/
		let [module, query, component] = [null, null, null]

		// if module is root module, first argument can be query.
		if(typeof args[0] == "string"){

			[module, query, component] = args

		}else{

			// defaults to blank module query (root store)
			[module, query, component] = ["", ...args]

		}
		return [
			module, 
			query, 
			component
		]
}

function objectForEach(obj, cb){
	for(let prop in obj){
		let val = obj[prop]
		cb(val, prop)
	}
}

export default {
	formatObjectPieceForComponent,
	formatObjectQuery,
	getStateUpdatesFromQuery,
	getModuleState,
	moduleFromQuery,
	clearObject,
	parseOpenArgs,
	objectForEach,
}