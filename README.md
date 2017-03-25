# Hivex

 The minimalist state management system for React Native. 
 
----------

### Getting Started

`npm install hivex`

> Your Hivex store will be a single, all-encapsulating object with the properties `state`, `setters`, and `actions`. 

#### State
State is the most important property in the Hivex store. It holds all your data.
To implement it in your store:
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
Our data here is kind of pointless if we can't access it. Accessing Hivex state from a React Component is simple:
``` babel 
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
`store.openState` allows you to access your store's state as if it were inside your component. 
e.g. `this.state.todos`
The second argument is always `this`.  It essentially tells Hivex to watch our component and update its state upon change. 
#### Setters
This is great, but we should be able to change state too. In Hivex, state is mutated with setter functions.
Defining setters isn't much different than defining state:
``` babel
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
`payload` is the object which contains all the data you would like to pass to your setter.
To run a setter function, use the `change` method, which takes in the function name and its payload: 
``` babel 
	// ./my-component.js
	import store from './store.js'
	export default class GoalSetter extends Component {
		constructor(props){
		   super(props);
		    this.state = {
		      ...store.openState(['todos'], this),
		    }
		}
		sendTodo(text){
			store.change('addTodo', { data: text })
		}
		
		deleteTodo(text){
			store.change('removeTodo', { data: text })
		}
		/*
		SOME OTHER CODE 
		*/
	}
```

#### Actions
Setters are great, but they update your components synchronously. This means if changing your data asynchronously e.g.  API calls, sockets, or setTimeouts, your component could be updated before your state changes.

To solve this problem, we have actions. Hivex actions handle all asynchronous activity in the store.

Let's say you someone has to feed their dog, but not for another hour. We'll use a `setTimeout` to add this todo to the list in 45 minutes: 
``` babel
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
		
		actions:{
			waitToAddTodo({change, access, resolve, reject}, payload){
				let waitTime = payload.waitTime;
				let todo = payload.todo;
				let timeout = setTimeout(()=>{
				
				})
			}
		}
	}

	export default new Hivex(store);
```
