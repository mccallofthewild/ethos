// @flow
import type Store from '../store'

function moduleFromQuery(moduleQuery:string, store:Store){

	/*
		takes in module query in the form of "mymodule.nestedmodule.deeplynestedmodule"
		and responds with the module.
	*/

	let module : Store = store;
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