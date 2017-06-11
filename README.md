# Ethos
Intuitive state management.
 
- - - -
### Why Ethos?

* **Intuitive**
	* Ethos is easy to learn and incrementally adoptable.
* **Fast**
	* Not only can Ethos dramatically speed up your development process, it also beats Flux on benchmarks such as script evaluation, compile time and  lifecycle iteration.
* **Powerful**
	* Ethos gives your data leverage with responsive features such as computed properties (`thoughts`) and watcher functions.
- - - -

### Getting Started
This tutorial will walk you through using Ethos with React.

### Installation

``` bash
	npm install ethos --save
```
or 
``` bash
	yarn add ethos
```

## Principles
Ethos is built on the principle of a [Single Source of Truth](https://en.wikipedia.org/wiki/Single_source_of_truth).
To keep users mindful of this ideology, we’ve chosen to rename the popular `Store` and `state` to `Source` and `truth`. 

## Truth
Truth is the most important property in the Ethos `Source`. It holds all the data.

### Defining Truth
Defining truth in Ethos is simple:
``` javascript
	// ./source.js

import { Source } from 'ethos'

let count = 0;
function id(){
	count++
	return count;
}
const source = {
	truth:{
		todos:[
			{
				text:"take out the trash",
				id:id(), //1
				complete:false,
			},
			{
				text:"clean room",
				id:id(), //2
				complete:false,
			},
			{
				text:"feed dog",
				id:id(), //3
				complete:false,
			}
		],
		time:Date.now()
	}
}

export default new Source(source);
```
### Accessing Truth

#### source.getTruth()
> Truth is accessed outside the source by using a `Source` prototype method called `getTruth`  

- `getTruth`  takes in two arguments:
	1. The first argument is a query for which `truth` properties you want. This can be an array or an object:
		-  With an *Array*, as in the example below, each string item represents both the name of your source's `truth` prop and the property it will be returned as. 
			- e.g. `let localTruth = getTruth(['todos'], this)` can be used as `localtruth.todos` .
		- With an  *Object*, you can alias a source's truth properties with whatever you want by using a key of your custom name with a value of the actual property name.
			- e.g. If you wanted `'todos'` to be aliased as `'myTodos'`, you could use  `let localTruth = getTruth({ myTodos: 'todos' })`  then reference it as `localTruth.myTodos` .
2. The second argument is the component itself, `this`.  It essentially tells Ethos to watch the component and update it when something changes.

Full Example:

``` javascript 
// ./my-component.js
import React from 'react';
import source from './source.js';

export default class TodoList extends React.Component {
	constructor(props){
			super(props);
			this.truth = source.getTruth(['todos'], this);
	}
	
	render(){
		return (
			<ul id="todo-list">
				{this.truth.todos.map(
					(todo, index)=> (
						<li
							key={todo.id}
						>
						{todo.text}
						</li>
					)
				)}
			</ul>

		)
	}
}
```
> Note that `getTruth` returns an object of getters, so `Object.assign` and the *object rest spread operator* will not work with the returned object.  

## Writers
> This is great, but `truth`  is constantly changing. In Ethos, truth is updated with `writers`.  

The formatting for `writers` isn't much different than `truth`, but there's a bit more going on here:
``` javascript
	// ./source.js
	
	import { Source } from 'ethos'

  let count = 0;
  function id(){
    count++;
    return count;
  }
	const source = {
		truth:{...}, // Same as above

		writers:{
			addTodo(text){
				let todo = { 
					text:text, 
					id:id(),
					complete:false,
				}
				this.truth.todos.push(todo);
			},
			completeTodo(index){
				let todo = this.truth.todos[index];
				todo.complete = true;
			}
		},
	}

	export default new Source(source);
```

### What’s `this`?
> To avoid some pains of other systems, Ethos binds your `writers` to a snapshot of your `Source`. This makes it possible for writer functions to accept as many arguments as necessary.   

- `this.truth` is your `Source`’s `truth` property, there for you to access and change it as you please.
- `this.writers` are your `Source`’s writers. 
- `this.runners` are your `Source`’s runners.  (more on this in a bit)
- `this.write` is your `Source`’s  `write` method. 〃                    〃
- `this.run` is your `Source`’s `run` method.          〃                    〃

### Running Writers

The easiest way to invoke a writer is to access it  in `source.writers`.

``` javascript 
	// ./my-component.js
	import React from 'react';
	import source from './source.js';

	export default class TodoList extends React.Component {
		constructor(props){
		   super(props);
		    this.truth = source.getTruth(['todos'], this)
		}

		addTodo(text){
			source.writers.addTodo(text)
		}
		
		completeTodo(index){
			source.writers.completeTodo(index)
		}

		render(){
			return (

			<ul id="todo-list">
				{this.truth.todos.map((todo, index)=> (
					<li
						key={todo.id}
						onClick={()=>this.completeTodo(index)}
					>
					{todo.text}
				</li>
				))}
			</ul>

			)
		}
	}
```

There’s another way to invoke a writer: the `write` method. 
`source.write`  takes in two arguments. The first is the writer’s name and the second is the argument you want to pass to the writer. 

Hence,  `addTodo`  above could be rewritten as
``` javascript
...
		addTodo(text){
			source.write('addTodo', text)
		}
...
```

Both methods provide the same functionality. Using `write`, however, limits you to one argument.  The latter method may look a bit more familiar if you’re coming from flux/redux.

## Runners
> Writers have one catch: they update your components synchronously. This means asynchronous changes ( made via  API calls, WebSockets, or `setTimeout`s, etc. ) may not have updated `truth` by the time Ethos updates your components.  

To solve this problem, we have `runners`. Ethos `runners` handle all asynchronous activity in the `source`. Put simply, `runners` *run* other functions.

You may have noticed we already have a `time` property in the `truth` of our example. Let’s make it update once per second. 
``` javascript
	// ./source.js
	
	import { Source } from 'ethos'
	
	const source = {
		truth:{
			todos:[...], // Same as above
			time:Date.now()
		},
		
		writers:{
			... // Same as above
			updateTime(){
				this.truth.time = Date.now();
			}
		},
			
		runners:{
			initTime(){
				let timeout = setInterval(()=>{
					/* this will run once per second */
					this.writers.updateTime();
				}, 1000)
			}
		}
		
	}

	export default new Source(source);
```

### What’s `this`?
> Similarly to `writers`, `runners` are bound to a snapshot representing functionality in your `Source`. Runners’ snapshot is slightly different, however.  

- `this.writers` are your `Source`’s writers. 
- `this.runners` are your `Source`’s runners. 
- `this.write` is your `Source`’s  `write` method.
- `this.run` is your `Source`’s  `run` method. ( we’ll get to this in a second )

#### Truth & Done
> While runners also have access to `truth` , any mutations made to truth will not sync without use of the `done` method.  
*  `this.truth` is your `Source`’s `truth`.
*  `this.done` is a method which tells your source that you mutated `truth`, and the `source` needs to update accordingly. 

This enables you to avoid writing tedious `writers` which simply change a value. 

See an example of `this.done()` in **Examples** below.
> `this.done` is an experimental feature and disabling it will be possible with the upcoming `strict` mode.  

#### Promise Wrappers
> Ethos also gives you the ability to wrap any runner in an ES6 Promise using `this.async()`, `this.resolve()` and `this.reject()`.  
Promises can get quite verbose. Promise wrappers aim to fix that. 
* `this.async()`  is the method which initializes the Promise wrapper. It must be invoked *outside* your asynchronous code.
* `this.resolve()` is the Promise’s *resolve* function.
* `this.reject()` is the Promise’s *reject* function.
See an example of Promise wrappers in **Examples** below.

### Running Runners
Now, our `initTime` function won’t run itself. (though technically, it could 🙃)  

The easiest way to invoke a runner is to access it  in `source.runners`.
``` javascript 
	source.runners.initTime()
```

Just like with writers, there’s another way to invoke a runner: the `run` method. 
`source.run`  takes in two arguments. The first is the function name and the second is the payload, a lone object. 

Hence,  the above code could also be written as
``` javascript
...
	source.run('initTime')
...
```
The same principles apply for `run` as those for `write`.

#### Examples 

Mutating truth with `this.done()`
``` javascript 
	...
		runners:{
			initTime(){
				let timeout = setInterval(()=>{
					/* this will run once per second */
					this.truth.time = Date.now();
					this.done()
				}, 1000)
			}
		}
	...
```

Using **Promise Wrappers**
> This example handles a simple GET request to the [Giphy API](https://github.com/Giphy/GiphyAPI)  using the popular HTTP client, [Axios](https://github.com/mzabriskie/axios).  
``` javascript 
	...
	runners:{
		getRandomGifUrl(){
        /*
        1. Initialize the Promise wrapper *outside* the
           asynchronous code.
        */
        this.async();

        let baseUrl = 'http://api.giphy.com/v1/gifs/random';

		  axios.get(baseUrl + '?api_key=dc6zaTOxFJmzC&tag=ethos')
		  .then((res)=>{
            let imageUrl = res.data.data.image_url;
            // resolves promise
            this.resolve(imageUrl);
		  })
        .catch((error)=>{
          // rejects promise
          this.reject(error);
        })
		}
	}
	...
```
Now when `getRandomGifUrl` runs, it will return a Promise. The following will be possible:
``` javascript
	let defaultImageUrl = 'https://media.giphy.com/media/UbQs9noXwuSFa/giphy.gif?response_id=591ccaaaecadb1fa9e03044c'
	source.runners.getRandomGifUrl()
	.then((imageUrl)=>{
		/* 
		imagine you have a function which changes the 
		source of an image
		*/
		setImageSrc(imageUrl)
	})
	.catch((error)=>{
		setImageSrc(defaultImageUrl)
	})
```
In many cases, using `async` and `await` is the optimal path, but Promise wrappers are nice for when your asynchronous code doesn’t already utilize promises.

## Watchers
A `watcher` is a function that is invoked whenever a property on `truth` changes.
Watchers are defined like so: 
``` javascript
	// ./source.js
	
	import { Source } from 'ethos'
	
	const source = {
		truth:{
			todos:[...], // Same as above
			time:Date.now()
		},
		
		writers:{...}, // Same as above
			
		runners:{...}, // Same as above
		
		watchers:{
			todos(){
				/* 
				this will run every time 
				something changes in `truth.todos`
				*/
				console.log('Todos changed!')
			}
		}
	}

	export default new Source(source);
```

### What’s `this`?
> `this` for `watchers` is the same as `this` for `writers`  
- `this.truth` is your `Source`’s truth property. 
	- It’s not suggested that you directly mutate `truth` from watchers.
- `this.writers` are your `Source`’s writers. 
- `this.runners` are your `Source`’s runners.
- `this.write` is your `Source`’s  `write` method.
- `this.run` is your `Source`’s `run` method.

## Thoughts
> Thoughts observe one or more pieces of `truth`, combine it with some custom logic, and return a new piece of `truth`. When a piece of `truth` a thought is observing changes, the thought will update its value.  
Let’s say we have two numbers, `a` and `b`, in our `truth`.

``` javascript
...
      truth:{
        a:1,
        b:2,
      },
      writers:{
        addOneToA(){
          this.truth.a = this.truth.a+1;
        }
      },
      thoughts:{
        sum(){
          return this.truth.a + this.truth.b;
        }
      }
...

```

at this point, we can access `sum` like so:
```javascript
	// ./my-component.js
...

	let localTruth = source.getTruth(['sum', 'a', 'b'], this)
	// localTruth.a is 1
	// localTruth.b is 2
	// localTruth.sum is 3
	if( localTruth.sum == (localTruth.a + localTruth.b) ){
		console.log('Ethos is legit.')
	}

...
	
```
but if we changed `truth.a`…
``` javascript
	// ./my-component.js
...

	source.writers.addOneToA()
	// localTruth.a is 2
	// localTruth.b is 2
	// localTruth.sum is 4

	if( localTruth.sum == (localTruth.a + localTruth.b) ){
		console.log('Redux who?')
	}

...
```

### What’s `this`?
> `this` for `thoughts` is the same as `this` for `writers`  
- `this.truth` is your `Source`’s truth property. 
	- It’s not suggested that you directly mutate `truth` from `thoughts`
- `this.writers` are your `Source`’s writers. 
- `this.runners` are your `Source`’s runners.
- `this.write` is your `Source`’s  `write` method.
- `this.run` is your `Source`’s `run` method.

## Founder Function
> In an Ethos Source, the `founder` function is a function that is instantly invoked once the store is built. It can be used to initialize a lot of store functionality an avoid contaminating your view layer with store logic.  

Example:
```javascript 
...

    truth:{...},
    writers:{...},
		runners:{...},
    thoughts:{...},

		founder(){
			this.runners.authenticateUser();
			this.runners.openSockets();
		}

...
```

### What’s `this`?
> `this` for the `founder` function is the same as `this` for `writers`  
- `this.truth` is your `Source`’s truth property. 
	- It’s not suggested that you directly mutate `truth` from the `founder` function.
- `this.writers` are your `Source`’s writers. 
- `this.runners` are your `Source`’s runners.
- `this.write` is your `Source`’s  `write` method.
- `this.run` is your `Source`’s `run` method.

## Children
> To organize your sources, Ethos has `children`. Each child is its own independent source.  

Child sources are defined like so:
``` javascript
import {
	Source,
} from 'ethos'

const source = {
		truth:{...},
		writers:{...},

		children:{
		// children are named by the property they are nested under
				users:{ // a source just for your users

						truth:{
							currentUser:{
								email:'',
								firstname:'',
								lastname:'',
								id:''
							}
						},

						thoughts:{
							fullName(){
								let user = this.truth.currentUser;
								return user.firstname + user.lastname;
							}
						},
						
						children:{ // nested children
							friends:{...}
						}

				}
		}
}

export default new Source(source);
```

Access children on a source like so:
``` javascript
	let userSource = source.child('users')
	let userTruth = userSource.getTruth(['currentUser'], this)
```

Access nested children one of two ways:
1. chaining `child` methods
	``` javascript
	source.child('users').child('friends')
	```
2. Query string
	``` javascript
	source.child('users.friends')
	```

Runners, writers, thoughts, watchers and the founder function all have additional properties on  `this`  to access parent and child sources.
* `this.child()` is the source’s child method, same as above.
* `this.parent` is the source’s parent source.
* `this.origin` is the source’s origin source ( the one directly constructed with `new Source`)