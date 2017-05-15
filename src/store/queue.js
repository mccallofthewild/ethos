// @flow
import {
  objectForEach, 
} from './helpers'

type id = number;

type listenerType = {
  id:id,
  cb:(any)=>any,
}


type listenerArgs = [anycb|string, ?anycb];

function listenerId() : number {
  return Math.random()*Date.now()*100000;
}


/**
 * Enables storage and interception of properties for reactive data.
 * Doubles as an event handler.
 * 
 * @class Queue
 */
class Queue {
  
  middleware:Map<id, anycb>;
  container:Set<prop>;
  listeners:Map< prop, Map<id, anycb> >;

  /**
   * Creates an instance of Queue.
   * 
   * @memberOf Queue
   */
  constructor(){
    // container holds all the properties in the queue
    this.container = new Set()

    /*
     listeners contain functions which, while active, are
     passed any property added to the queue.
    */
    
    this.listeners = new Map()

    this.middleware = new Map();
  }

  /**
   * checks if property is in the queue
   * 
   * @param {prop} prop 
   * @returns 
   * 
   * @memberOf Queue
   */
  has(prop:prop){
    // To check if property is in the queue
    return this.container.has(prop)
  }

  /**
   * checks if queue is populated
   * 
   * @readonly
   * @type {boolean}
   * @memberOf Queue
   */
  get isPopulated() : boolean {
    /*
     To check if queue is not empty. 
     Not neccessary to loop through entire object
     (Object.keys) to do this
    */

    return !!this.container.size;
  }
  
  /**
   * clears queue
   * 
   * 
   * @memberOf Queue
   */
  clear(){
    // Clears queue
    this.container.clear()
  }

  /**
   * removes specific property from queue
   * 
   * @param {prop} prop 
   * 
   * @memberOf Queue
   */
  remove(prop:prop){
    // Removes property from queue
    this.container.delete(prop)
  }

  /**
   * adds property to the queue
   * 
   * @param {prop} prop 
   * 
   * @memberOf Queue
   */
  add(prop:prop){
    // Adds property to queue    
    // fires off listeners
    
    this.middleware.forEach(
      (cb)=>{
        cb(prop);
      }
    )
    
    let listenerMap = this.listeners.get(prop);
    
    if(listenerMap){

      let listeners = listenerMap.values();

      for(let listener of listeners){
        listener(prop, listener)
      }

    }

    this.container.add(prop)
  }
  
  /**
   * adds middleware function
   * 
   * @param {anycb} cb 
   * @returns 
   * 
   * @memberOf Queue
   */
  use(cb:anycb){
    let id = listenerId();
    this.middleware.set(id, cb);
    return id;
  }

  /**
   * removes middleware function
   * 
   * @param {id} id 
   * 
   * @memberOf Queue
   */
  retire(id:id){
    this.middleware.delete(id);
  }

  /**
   * adds listener function for specific property
   * 
   * @param {prop} prop 
   * @param {anycb} cb 
   * @returns {number} 
   * 
   * @memberOf Queue
   */
  addListener(prop:prop, cb:anycb) : number {
    /*
      Listeners are functions 
    */

    let id = listenerId()

    let listenerMap = this.listeners.get(prop);

    if(!listenerMap){
      listenerMap = new Map();
      this.listeners.set(prop, listenerMap);
    }
    listenerMap.set(id, cb)
    return id;
  }
  
  /**
   * removes listener function for specific property
   * 
   * @param {prop} prop 
   * @param {id} id 
   * 
   * @memberOf Queue
   */
  removeListener(prop:prop, id:id){

    let listenerMap = this.listeners.get(prop)

    if(listenerMap) listenerMap.delete(id)

    else throw new Error(`no listeners exist for "${prop}"`)
    
  }

}

export default Queue
