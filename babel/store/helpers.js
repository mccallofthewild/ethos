// @flow

import exceptions from './exceptions'
import Queue from './queue'
import Store from './index'
import SetDictionary from './setdictionary'
import Computed from './computed'

function formatObjectQuery(props:Object | Array<string>) {
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

function formatObjectPieceForComponent(obj:Object, propDictionary:Object) {
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

function updateAllComputedInSet(computedDictionary:Set<Computed>){
	computedDictionary.forEach(c=>c.update())
}

/**
 * 
 * 
 * @param {Object} listener 
 * @param {Object} state 
 * @param {Queue} queue 
 * @param {SetDictionary<Computed>} computedDictionary 
 * @returns {Object} 
 * 
 * 
 */
function getStateUpdatesFromQuery(listener:Object, state:Object, queue:Queue, computedDictionary:SetDictionary<Computed>) : Object {

	let futureState = {}

	for (let propName in listener.hivexStateKeys) {

		let stateProp = listener.hivexStateKeys[propName]

		if (queue.has(stateProp)) {
				
				console.log(queue)
					if(stateProp == "todos" || propName == "todos"){
						console.log(stateProp)
						console.log("BONZNNANANNANANNA")
					}
				if(computedDictionary.has(stateProp)){
					// Too intertwined/assumes too much knowledge of each other. Refactor.
					updateAllComputedInSet( computedDictionary.access(stateProp) )

				}

				futureState[propName] = state[stateProp];

		}

	}

	return futureState;

}


function clearObject(obj:Object){
	for (let prop in obj) {
		delete obj[prop]
	}
}


function moduleFromQuery(moduleQuery:string, store:Store){

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

type getModuleStateParams = {
	moduleQuery:string,
	stateQuery:Object,
	component:Object,
}

function getModuleState({
	moduleQuery="",
	stateQuery,
	component,
}:getModuleStateParams, store:Store){
	let module = moduleFromQuery(moduleQuery, store);
	let formattedQuery = formatObjectQuery(stateQuery);
}

function parseOpenArgs(args:any){
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

function objectForEach(obj:Object, cb:(...any:any)=>any){
	for(let prop in obj){
		let val = obj[prop]
		cb(val, prop)
	}
}

function hasAProperty(obj:Object){
	let result : boolean = false;
	for(let prop in obj){
		result = true;
		break;
	}
	return result;
}

export {
	formatObjectPieceForComponent,
	formatObjectQuery,
	getStateUpdatesFromQuery,
	getModuleState,
	moduleFromQuery,
	clearObject,
	parseOpenArgs,
	objectForEach,
	hasAProperty,
}