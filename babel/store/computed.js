// @flow
import SealedObject from './sealed'
import Queue from './queue'
import SetDictionary from './setdictionary'
/**
 * 
 * 
 * @class Computed - For creating reactively updated properties
 */
type myParams = {
  getter:(...args:Args)=>any,
  name:string,
  queue:Queue,
  destination:object,
  dictionary:SetDictionary,
}
class Computed {
  /** 
   * Creates an instance of Computed.
   *     @callback {requestCallback} getter,
   *     @prop {String} obj.name, 
   *     @param {Queue} queue,
   *     @param {Object} destination,
   *     @param {SetDictionary} dictionary
   *  
   * 
   * 
   * @memberOf Computed
   */
  getter:(...args:Args)=>any;
  name:string;
  queue:Queue;
  destination:object;
  dictionary:SetDictionary;


  constructor({
    getter,
    name,
    queue,
    destination,
    dictionary
  }:myParams){
    this.getter = getter
    this.name = name
    this.queue = queue
    this.destination = destination
    this.dictionary = dictionary;

    this.initialize()
  }

  update(){
    this.destination[this.name] = this.getter(new SealedObject(this.destination))
  }
  initialize(){
    /*
      This is essential to how Computed works.
      It adds the listener to the queue, runs update,
      then catches any prop that is passed through
    */
    let listener = this.queue.addListener(
      item=>{
        this.dictionary.add(item, this)
    })
    this.update()
    this.queue.removeListener(listener)
  }
}

let a : Computed = new Computed({
  getter:function(){},
  name:"idk",
  queue:new Queue(),
  destination:{},
  dictionary:new SetDictionary()
});

export default Computed