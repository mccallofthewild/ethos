'use strict';

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