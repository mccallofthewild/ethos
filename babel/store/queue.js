// @flow
import {
  objectForEach, 
} from './helpers'

type listenerType = {
  id:number,
  cb:(any)=>any,
}


class Queue {
  
  container:{ [string]:true };
  listeners:{ [number]:listenerType };

  constructor(){
    // container holds all the properties in the queue
    this.container = {}

    /*
     listeners contain functions which, while active, are
     passed any property added to the queue.
    */
    this.listeners = {}
  }
  has(str:string){
    // To check if property is in the queue
    if(!(typeof str == "string")) throw new Error("argument to `remove` method on Queue must be string")
    return this.container.hasOwnProperty(str)
  }
  get isPopulated():boolean {
    /*
     To check if queue is not empty. 
     Not neccessary to loop through entire object
     (Object.keys) to do this
    */
    let populated = false;
    for( let prop in this.container ){
      populated = true;
      break;
    }
    return populated;
  }
  clear(){
    // Clears queue
    this.container = {}
  }
  remove(str:string){
    // Removes property from queue
    if( !(typeof str == "string") ) throw new Error("argument to `remove` method on Queue must be string")
    delete this.container[str]
  }
  add(str:string){
    // Adds property to queue
    if( !(typeof str == "string") ) throw new Error("argument to `add` method on Queue must be string")
    
    // fires off listeners
    objectForEach(this.listeners, l=>l.cb(str))

    this.container[str] = true
  }
  addListener(cb:(any)=>any) : listenerType {
    /*
      Listeners are functions 
    */
    let id = Math.random()*Date.now()*100000
    let listener : listenerType  = {
      id,
      cb
    }

    this.listeners[id] = listener;
    return listener;
  }
  removeListener(listener:listenerType){
    delete this.listeners[listener.id]
  }

}

export default Queue
