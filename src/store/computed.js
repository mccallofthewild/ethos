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
  name:prop,
  getterQueue:Queue,
  setterQueue:Queue,
  destination:Object,
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
   *  
   * 
   * 
   * @memberOf Computed
   */

  getter:()=>any;
  name:prop;
  getterQueue:Queue;
  setterQueue:Queue;
  destination:Object;
  dependencies:Set<prop>;

  constructor({
    getter,
    name,
    getterQueue,
    setterQueue,
    destination,
    dictionary
  } : computedParams){
    
    this.getter = getter
    this.name = name
    this.getterQueue = getterQueue;
    this.setterQueue = setterQueue;
    this.destination = destination
    this.dependencies = new Set();
    this.initialize()
  }

  /**
   * 
   * 
   * 
   * @memberOf Computed
   * updates the @prop destination with whatever the getter returns
   * adds prop to the setterQueue because it has been updated
   */
  update():void{

    this.destination[this.name] = this.value
    this.setterQueue.add(this.name);

  }

  get value() : any {
    return this.getter(new SealedObject(this.destination))
  }

  initialize():void{
    /*
      This is essential to how Computed works.
      It adds the listener to the getterQueue to find out
      which properties it is dependent on.
      When property values change and, as a result,
      properties are added to the setterQueue,
      `setterListener` fires and checks if the property
      is in the dependencies. If it is, the computed is
      updated.
    */
    const getterListener = this.getterQueue.addListener(
      item=>{
        this.dependencies.add(item)
    })
    
    this.update()

    this.getterQueue.removeListener(getterListener)

    const setterListener = this.setterQueue.addListener(
      item=>{
        if(this.dependencies.has(item)) this.update()
      }
    )

  }
}

export default Computed


export {

}