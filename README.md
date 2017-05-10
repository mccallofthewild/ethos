# # Hivex Docs

 High performance state management, for humans.
 
----------
### Why Hivex?

Hivex is fast, easy and powerful. 

----------


### Getting Started

``` bash
	npm install hivex --save
```
or 
``` bash
	yarn add hivex
```

> The Hivex `Store` constructor takes one argument, an object.

## State
State is the most important property in the Hivex store. It holds all your data.
### Defining State
Defining state in Hivex is simple:
``` javascript
	// ./store.js
	
	import Hivex from 'hivex'
	
	const store = {
		state:{
			todos:[
				"take out the trash",
				"clean room",
				"feed dog"
			],
			time:Date.now()
		}
	}

	export default new Hivex(store);
```
### Accessing State
#### openState
> State is accessed in Hivex by using a method on the store called `openState`

- `store.openState` gives you access to a Hivex store's state from any component. 
	- `openState` requires the *object spread operator*. You will need to use the [transform-object-rest-spread](https://babeljs.io/docs/plugins/transform-object-rest-spread/) babel plugin in order for it to work.
- `openState` always goes into your component's state and takes in two arguments:
	1. The first argument tells Hivex which `state` properties you want, and what to call them. This can be an array or an object:
		-  With an *Array*, as in the example below, each string item represents both the name of your store's `state` prop and the property it will be injected into your component's state as. 
			- e.g. `...openState(['todos'])` can be used with `this.state.todos` inside your component.
	- With an  *Object*, you can alias a store's state properties with whatever you want by using a key of the alias property with a value of the actual property.
			- e.g. If you wanted `'todos'` to be aliased as `'myTodos'`, you could use  `...openState({ myTodos: 'todos' })`  then reference it as `this.state.myTodos` inside your component.
2. The second argument is always `this`.  It essentially tells Hivex to watch the component and update its state when something changes.

Example:

``` javascript 
	// ./my-component.js
	import store from './store.js'
	export default class GoalSetter extends Component {
		constructor(props){
		   super(props);
		    this.state = {
		      ...store.openState(['todos'], this),
		    }
		}
		/*
		SOME OTHER CODE
		*/
	}
```

### Setters
> This is great, but we should be able to change state too. In Hivex, state is mutated with setter functions.

Defining setters isn't much different than defining state, but there's a little more going on here:
``` javascript
	// ./store.js
	
	import Hivex from 'hivex'
	
	const store = {
		state:{
			todos:[
				"take out the trash",
				"clean room",
				"feed dog"
			],
			time:Date.now()
		},
		
		setters:{
			addTodo(state, payload){
				let todo = payload.data;
				state.todos.push(todo);
			},
			removeTodo(state, payload){
				let index = payload.data;
				state.todos.splice(index, 1);
			}
		}
	}

	export default new Hivex(store);
```
#### mySetter(state, payload)
Setter functions take in two arguments: state and payload.

- `state` is your store's state property, there for you to access and change it.
- `payload` is the data containing the data you pass to your setter. 
	- Generally speaking, this should always be an object.
#### Running Setters
The easiest way to run a setter is to use the `change` method, which takes in the function name and its payload:
``` javascript 
	// ./my-component.js
	import store from './store.js'
	export default class GoalSetter extends Component {
		constructor(props){
		   super(props);
		    this.state = {
		      ...store.openState(['todos'], this),
		    }
		}

		/* ===== THIS SECTION ===== */

		addTodo(text){
			store.change('addTodo', { data: text })
		}
		
		removeTodo(text){
			store.change('removeTodo', { data: text })
		}

		/* ==================== */

		/*
		render function, etc. down here
		*/
	}
```
### Actions
> Setters have one catch: they update your components synchronously. This means asynchronous changes ( made via  API calls, sockets, or `setTimeout`s, etc. ) may not have updated state by the time Hivex updates your components.

To solve this problem, we have actions. Hivex actions handle all asynchronous activity in the store.

Let's say you want to wash your car, but not for another hour. We'll use a `setTimeout` to add, "wash car" to the todo list in 60 minutes:
``` javascript
	// ./store.js
	
	import Hivex from 'hivex'
	
	const store = {
		state:{
			todos:[
				"take out the trash",
				"clean room",
				"feed dog"
			],
			time:Date.now()
		},
		
		setters:{
			addTodo(state, payload){
				let todo = payload.data;
				state.todos.push(todo);
			},
			removeTodo(state, payload){
				let index = payload.data;
				state.todos.splice(index, 1);
			}
		},
	
		/* ===== THIS SECTION ===== */
		
		actions:{
			delayTodo({ state, change }, payload){
				let delay = payload.delay;
				let todo = payload.todo;
				let timeout = setTimeout(()=>{
					change('addTodo', { data: todo });
				}, delay)
			}
		}
		
		/* ==================== */
	}

	export default new Hivex(store);
```
There's a lot going on here, but what’s really happening is quite simple. 
1. We extract the store’s `change` method
2. We run the timeout and execute a setter when it is complete.
The important thing  to know is what arguments are passed to actions.

The first argument is an object containing:
 * `state` : the store’s state
 * `change` : the store’s `change` method
 * `send` : the store’s `send` method (we’ll get to this in a moment)
 * `done` : a function to execute after any direct changes to state are made in the action (again, more on this in a moment)
The second argument is the payload. The payload, just like with setters, is an object containing any custom arguments you want to pass to the function.

### Modules



> To organize your stores, Hivex has modules.

Modules with `openState`
``` javascript
...openState("mymodule.nestedmodule.deeplynestedmodule", ['stateprop', 'stateprop2', 'stateprop3'])
```
