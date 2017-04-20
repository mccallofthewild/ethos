// @flow
import {
  objectForEach, 
} from './helpers'

type listenerType = {
  id:number,
  cb:(any)=>any,
}


class Queue {
  
  container:{ [prop]:true };
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
  has(prop:prop){
    // To check if property is in the queue
    return this.container.hasOwnProperty(prop)
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
  keys() : Array<string> {
    return Object.getOwnPropertyNames(this.container)
  }
  clear(){
    // Clears queue
    this.container = {}
  }
  remove(prop:prop){
    // Removes property from queue
    delete this.container[prop]
  }
  add(prop:prop){
    // Adds property to queue    
    // fires off listeners
    objectForEach(this.listeners, l=>l.cb(prop))

    this.container[prop] = true
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
