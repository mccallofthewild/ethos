// @flow
import SealedObject from './sealed'
import Queue from './queue'
import SetDictionary from './setdictionary'
/**
 * 
 * 
 * @class Computed - For creating reactively updated properties
 */

type computedParams = {
  getter:(any)=>any,
  name:string,
  queue:Queue,
  destination:Object,
  dictionary:SetDictionary<Computed>,
}

class Computed {
  /** 
   * Creates an instance of Computed.
   *     @callback {requestCallback} getter,
              * this getter should be computed based on properties in @param dictionary
   *     @prop {String} obj.name, 
   *     @param {Queue} queue,
            * A queue object which stores the root props which have been
            changed in the destination object
   *     @param {Object} destination,
   *     @param {SetDictionary} dictionary
   *  
   * 
   * 
   * @memberOf Computed
   */

  getter:()=>any;
  name:string;
  queue:Queue;
  destination:Object;
  dictionary:SetDictionary<Computed>;


  constructor({
    getter,
    name,
    queue,
    destination,
    dictionary
  } : computedParams){
    this.getter = getter
    this.name = name
    this.queue = queue
    this.destination = destination
    this.dictionary = dictionary;

    this.initialize()
  }

  /**
   * 
   * 
   * 
   * @memberOf Computed
   * updates the @prop destination with whatever the getter returns
   */
  update():void{

    this.destination[this.name] = this.value

  }
  get value() : any {
    return this.getter(new SealedObject(this.destination))
  }
  initialize():void{
    /*
      This is essential to how Computed works.
      It adds the listener to the queue, runs update,
      then catches any prop that is passed through
      and adds it to the dictionary along with 
      the computed itself (`this`)
    */
    let listener = this.queue.addListener(
      item=>{
        if(item!==this.name) this.dictionary.add(item, this)
    })
    let val = this.value
    this.queue.removeListener(listener)

    this.update()
  }
}

export default Computed


export {

}